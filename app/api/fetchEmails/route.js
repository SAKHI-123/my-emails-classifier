import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route.ts"; 
import axios from 'axios';
import { NextResponse } from 'next/server';
// 💡 1. Import the OpenAI client
import OpenAI from 'openai';

// Base Gmail API endpoint
const GMAIL_API_BASE_URL = 'https://gmail.googleapis.com/gmail/v1/users/me/messages';

// 💡 2. Initialize the OpenAI client using the environment variable
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Helper function to extract key headers from the raw Gmail message data
const parseEmailHeaders = (headers) => {
    const headerMap = {};
    headers.forEach(header => {
        headerMap[header.name] = header.value;
    });
    return {
        Subject: headerMap['Subject'] || 'No Subject',
        From: headerMap['From'] || 'Unknown Sender',
        Date: headerMap['Date'] || 'Unknown Date',
    };
};

// Helper function to decode the body (assumes base64url encoding)
const decodeBody = (payload) => {
    if (!payload.parts) {
        return payload.body && payload.body.data ? Buffer.from(payload.body.data, 'base64url').toString() : '';
    }

    const part = payload.parts.find(p => p.mimeType === 'text/plain' && p.body && p.body.data);
    
    if (part) {
        return Buffer.from(part.body.data, 'base64url').toString();
    }
    
    for (const part of payload.parts) {
        const decoded = decodeBody(part);
        if (decoded) return decoded;
    }

    return 'No recognizable text body.';
};

// 💡 3. New function to classify the email content using OpenAI
async function classifyEmail(emailContent) {
    const prompt = `Classify the following email into one of these categories: 'Important', 'Promotions', 'Social', 'Marketing', 'Spam', or 'General'. Respond ONLY with a JSON object like {"category": "ClassificationName"}.

    Email Subject: ${emailContent.Subject}
    Email Sender: ${emailContent.From}
    Email Body Snippet: ${emailContent.body.substring(0, 1000)}...
    `;

    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo", // Fast and efficient model for classification
            messages: [{ role: "user", content: prompt }],
            max_tokens: 50,
            response_format: { type: "json_object" }, // Forces JSON output for reliable parsing
        });

        const jsonString = response.choices[0].message.content;
        const result = JSON.parse(jsonString);
        return result.category || 'Unclassified (Error)';
        
    } catch (error) {
        console.error("OpenAI Classification Error:", error.message);
        // This is important in case the API key is invalid or the network fails
        return 'Unclassified (API Error)';
    }
}


// Define the GET method handler
export async function GET(req) {
    const session = await getServerSession(authOptions);

    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Not Authenticated. Please sign in." }, { status: 401 });
    }

    const accessToken = session.accessToken;
    if (session.error === 'RefreshAccessTokenError') {
         return NextResponse.json({ error: "Authentication error: Token refresh failed. Please sign in again." }, { status: 401 });
    }

    const headers = { Authorization: `Bearer ${accessToken}` };
    
    try {
        // 1. Get the list of message IDs (max 5 unread)
        const listResponse = await axios.get(GMAIL_API_BASE_URL, {
            params: { maxResults: 5, q: 'is:unread' },
            headers: headers,
        });

        const messageIds = listResponse.data.messages || [];
        if (messageIds.length === 0) {
            return NextResponse.json({ success: true, message: "No unread emails found.", count: 0, emails: [] });
        }

        // 2. Fetch full content for all messages concurrently
        const emailPromises = messageIds.map(message => 
            axios.get(`${GMAIL_API_BASE_URL}/${message.id}`, { headers: headers, params: { format: 'full' } })
        );
        const emailResponses = await Promise.all(emailPromises);

        // 3. Process the raw email data and prepare for classification
        const rawEmails = emailResponses.map(response => {
            const rawMessage = response.data;
            const payload = rawMessage.payload;
            const parsedHeaders = parseEmailHeaders(payload.headers);
            const bodyText = decodeBody(payload);

            return {
                id: rawMessage.id,
                ...parsedHeaders,
                body: bodyText,
            };
        });

        // 4. Classify all emails concurrently
        const classificationPromises = rawEmails.map(email => classifyEmail(email));
        const classifications = await Promise.all(classificationPromises);

        // 5. Combine the classification with the email data
        const classifiedEmails = rawEmails.map((email, index) => ({
            ...email,
            classification: classifications[index],
        }));


        // Success: Return the list of classified email objects
        return NextResponse.json({
            success: true,
            message: `Successfully fetched, parsed, and classified ${classifiedEmails.length} unread emails.`,
            count: classifiedEmails.length,
            emails: classifiedEmails
        });

    } catch (error) {
        console.error("Critical API Process Error:", error.message);
        
        if (error.response && error.response.status === 403) {
            return NextResponse.json({
                error: "Permission denied by Google. Check your scopes or token expiry."
            }, { status: 403 });
        }

        // Catch all remaining errors, including OpenAI initialization/authentication errors
        return NextResponse.json({
            error: "An unexpected error occurred during processing.",
            details: error.message
        }, { status: 500 });
    }
}
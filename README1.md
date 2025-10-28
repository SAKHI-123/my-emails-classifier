# MagicSlides Email Classifier

This is the submission for the Full-Stack Engineer Intern Assignment for MagicSlides.app.

##  Known Blockers and Status

The application's code is structurally complete but is currently blocked from end-to-end execution due to the following dependencies:

1.  **OpenAI API Key Inactive (External Blocker):** The core email classification function is disabled due to a **Quota Exceeded** error, as the required initial credit purchase failed due to an external payment/banking issue.
   

##  How to Set Up and Run Locally

Follow these steps to get the application running on your local machine.

### Prerequisites
* Node.js (v18 or later)
* npm (or yarn/pnpm)
* Access to Google Cloud Console (for OAuth setup)
* An active OpenAI API Key

### Installation

1.  Clone the repository:
    ```bash
    git clone [https://github.com/SAKHI-123/my-emails-classifier.git](https://github.com/SAKHI-123/my-emails-classifier.git)
    cd my-emails-classifier
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Configuration (Environment Variables)

Create a file named **`.env.local`** in the root of the project and add the following keys. **(You must insert your own active keys for the app to function.)**
Google OAuth Credentials:
GOOGLE_CLIENT_ID="[YOUR_GOOGLE_CLIENT_ID]" GOOGLE_CLIENT_SECRET="[YOUR_GOOGLE_CLIENT_SECRET]" 
NEXTAUTH_URL="http://localhost:3000" 
NEXTAUTH_SECRET="[A RANDOM, LONG STRING FOR SECURITY]"

OpenAI API Key (Required for Classification)
OPENAI_API_KEY="[YOUR_OPENAI_API_KEY]"
## Running the Application

1.  Start the development server:
    ```bash
    npm run dev
    ```
2.  Open your browser and navigate to: **`http://localhost:3000`**

## 🔐 Google Test User Setup

As per the assignment instructions, the user **`theindianappguy@gmail.com`** has been added as a **Test User** in the Google Cloud Console to bypass the "unverified app" security screen during login.

---

### Final Steps to Update GitHub



1.  Stage the changes:
    ```bash
    git add README.md
    ```
2.  Commit the change:
    ```bash
    git commit -m "Feat: Add comprehensive README1 file"
    ```
3.  Push the update to GitHub:
    ```bash
    git push
    ```

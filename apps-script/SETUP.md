# Caribou Health - Job Application to ClickUp Integration

This script bridges the website's job application form to your ClickUp Candidate Pipeline.

## How It Works

```
Website Form → Google Form (data backup) → Apps Script → ClickUp Task
                                              ↑
                                    Also triggered by direct POST
```

## Setup Steps

### Step 1: Create the Google Apps Script Project
1. Go to [script.google.com](https://script.google.com)
2. Click **New Project**
3. Delete the default code in `Code.gs`
4. Copy-paste the entire contents of `ClickUpBridge.gs` into the editor
5. Press **Ctrl+S** (or Cmd+S) to save
6. Rename the project to "Caribou Job Applications"

### Step 2: Run setupForm() to Create the Google Form
1. In the function dropdown (top toolbar), select **setupForm**
2. Click **Run** (play button)
3. You'll be asked to authorize - click through the prompts
4. After it runs, click **Execution log** to see the output
5. **Copy the Response URL and Entry IDs** - you'll need them for Step 5

### Step 3: Add Your ClickUp API Token
1. In Apps Script, click the **gear icon** (Project Settings)
2. Scroll down to **Script Properties**
3. Click **Add Script Property**
4. Property name: `CLICKUP_API_TOKEN`
5. Value: Your ClickUp personal API token
   - Get it from: ClickUp → Settings → Apps → API Token → Copy

### Step 4: Deploy as Web App
1. Click **Deploy** → **New Deployment**
2. Click the gear icon → select **Web app**
3. Set "Execute as" to **Me**
4. Set "Who has access" to **Anyone**
5. Click **Deploy**
6. **Copy the Web App URL**

### Step 5: Update the Website JavaScript
Open `js/app.js` and find the `APPLICATION_FORM_CONFIG` object (near line 976).
Fill in the values from Steps 2 and 4:

```javascript
const APPLICATION_FORM_CONFIG = {
    formUrl: 'https://docs.google.com/forms/d/e/YOUR_FORM_ID/formResponse',
    fields: {
        name: 'entry.XXXXXXXXX',
        email: 'entry.XXXXXXXXX',
        role: 'entry.XXXXXXXXX',
        coverLetter: 'entry.XXXXXXXXX',
        deadline: 'entry.XXXXXXXXX',
        howHeard: 'entry.XXXXXXXXX'
    },
    appsScriptUrl: 'https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec'
};
```

### Step 6: Test
1. Submit a test application through the website
2. Check your Google Form responses spreadsheet for the data
3. Check ClickUp's Candidate Pipeline list for the new task

## What Gets Created in ClickUp

Each form submission creates a task in **People & Hiring → Hiring → Candidate Pipeline** with:
- **Task name**: Applicant's full name
- **Description**: Role, email, source, cover letter
- **Custom fields**: Candidate Email, Open Role, Cover Letter, Candidate Source, Recruiter Notes
- **Status**: Default (pool)

## Troubleshooting

- **No ClickUp task created?** Check that CLICKUP_API_TOKEN is set in Script Properties
- **Google Form not receiving data?** Verify the formUrl and entry IDs are correct
- **Apps Script errors?** Check the Execution Log in the Apps Script editor
- **File uploads?** Files can't be sent via Google Forms from external sites. Users are prompted to email documents to team@caribouhealth.ca

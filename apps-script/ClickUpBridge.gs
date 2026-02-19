/**
 * Caribou Health - Job Application to ClickUp Bridge
 * Google Apps Script Web App
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com and create a new project
 * 2. Paste this entire file into Code.gs
 * 3. First, run setupForm() to create the Google Form
 *    - Click the function dropdown (says "setupForm") and click Run
 *    - Authorize when prompted
 *    - Check the Execution Log for the form URL and entry IDs
 * 4. Go to Project Settings (gear icon) > Script Properties
 *    - Add property: CLICKUP_API_TOKEN = your ClickUp API token
 *    - Get your token from: ClickUp > Settings > Apps > API Token
 * 5. Deploy as Web App:
 *    - Click Deploy > New Deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy and copy the URL
 * 6. Update APPS_SCRIPT_URL in your website's js/app.js
 * 7. Update the GOOGLE_FORM entry IDs in js/app.js with the ones
 *    from the setupForm() execution log
 */

// ClickUp Configuration
var CLICKUP_LIST_ID = '901709118212'; // Candidate Pipeline list

// Custom field IDs from ClickUp
var CUSTOM_FIELDS = {
  candidateEmail: 'f4d12959-b6b9-40d6-99c9-6e5522dbabac',
  openRole: '046b50b3-ce7d-487b-83af-5f5ac7e36f3d',
  coverLetter: 'b27ccfb8-f7cd-485a-b12f-2ef96e08cbc7',
  candidateSource: 'b8dee4b5-df0f-4293-a879-f3ee73f5723d',
  recruiterNotes: 'f76855fe-e276-4682-9a45-b0aa19faa17f'
};

// Role mapping: Google Form value -> ClickUp dropdown option ID
var ROLE_MAP = {
  'Tech Lead': '616b9772-ae19-4ec8-a3d1-756242ce3b45',
  'Public Health Practicum': '548ab690-8696-457c-9e94-f41762b22d03',
  'Software Development Intern': '2fa053e5-4999-4ced-9b03-9299dbb87e0b',
  'Creative Intern': 'faac4e9d-6162-460d-9e73-540f37df9944'
};

// Source mapping: Google Form value -> ClickUp dropdown option index
var SOURCE_MAP = {
  'LinkedIn': 6,
  'University/College': 0,
  'Friend/Referral': 1,
  'Job Board': 0,
  'Social Media': 2,
  'Other': 3,
  'Company Website': 3
};


/**
 * RUN THIS FIRST - Creates the Google Form and logs its details
 */
function setupForm() {
  var form = FormApp.create('Caribou Health - Job Application');
  form.setDescription('Application form for open positions at Caribou Health');
  form.setConfirmationMessage('Thank you for applying! We will review your application and be in touch.');

  // Q1: Full Name (required)
  form.addTextItem()
    .setTitle('Full Name')
    .setRequired(true);

  // Q2: Email (required)
  form.addTextItem()
    .setTitle('Email Address')
    .setRequired(true);

  // Q3: Open Role (required dropdown)
  form.addListItem()
    .setTitle('Open Role')
    .setChoiceValues(['Creative Intern', 'Software Development Intern', 'Public Health Practicum', 'Tech Lead'])
    .setRequired(true);

  // Q4: Cover Letter (optional paragraph)
  form.addParagraphTextItem()
    .setTitle('Cover Letter');

  // Q5: Application Deadline (optional date)
  form.addDateItem()
    .setTitle('Application Deadline');

  // Q6: How did you hear about us? (optional dropdown)
  form.addListItem()
    .setTitle('How did you hear about us?')
    .setChoiceValues(['LinkedIn', 'University/College', 'Friend/Referral', 'Job Board', 'Social Media', 'Other']);

  // Get form details
  var formUrl = form.getPublishedUrl();
  var editUrl = form.getEditUrl();
  var formId = form.getId();

  // Extract entry IDs for each question
  var items = form.getItems();
  var entryIds = {};
  for (var i = 0; i < items.length; i++) {
    var item = items[i];
    entryIds[item.getTitle()] = 'entry.' + item.getId();
  }

  Logger.log('========================================');
  Logger.log('FORM CREATED SUCCESSFULLY!');
  Logger.log('========================================');
  Logger.log('');
  Logger.log('Form URL (public): ' + formUrl);
  Logger.log('Edit URL: ' + editUrl);
  Logger.log('');
  Logger.log('Response URL (for website POST):');
  Logger.log('https://docs.google.com/forms/d/e/' + formId + '/formResponse');
  Logger.log('');
  Logger.log('Entry IDs (copy these to app.js):');
  for (var title in entryIds) {
    Logger.log('  ' + title + ': ' + entryIds[title]);
  }
  Logger.log('');
  Logger.log('========================================');
  Logger.log('NEXT STEPS:');
  Logger.log('1. Copy the Response URL and Entry IDs above');
  Logger.log('2. Update APPLICATION_FORM_CONFIG in js/app.js');
  Logger.log('3. Add your ClickUp API token to Script Properties');
  Logger.log('4. Deploy this script as a Web App');
  Logger.log('========================================');

  // Set up form submit trigger for ClickUp integration
  ScriptApp.newTrigger('onFormSubmit')
    .forForm(form)
    .onFormSubmit()
    .create();

  Logger.log('Form submit trigger created - new submissions will auto-create ClickUp tasks.');
}


/**
 * Triggered when the Google Form receives a submission
 * Creates a task in ClickUp Candidate Pipeline
 */
function onFormSubmit(e) {
  var responses = e.response.getItemResponses();
  var data = {};
  for (var i = 0; i < responses.length; i++) {
    data[responses[i].getItem().getTitle()] = responses[i].getResponse();
  }

  var name = data['Full Name'] || '';
  var email = data['Email Address'] || '';
  var role = data['Open Role'] || '';
  var coverLetter = data['Cover Letter'] || '';
  var deadline = data['Application Deadline'] || '';
  var howHeard = data['How did you hear about us?'] || '';

  // Log to sheet for backup
  logToSheet(name, email, role, coverLetter, deadline, howHeard, 0);

  // Create ClickUp task
  try {
    var token = PropertiesService.getScriptProperties().getProperty('CLICKUP_API_TOKEN');
    if (token) {
      var result = createClickUpTask(token, name, email, role, coverLetter, deadline, howHeard);
      Logger.log('ClickUp task created: ' + result.url);
    } else {
      Logger.log('No CLICKUP_API_TOKEN set in Script Properties. Submission logged to sheet only.');
    }
  } catch (err) {
    Logger.log('ClickUp error: ' + err.message);
  }
}


/**
 * Web App endpoint - handles direct POST from website
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var name = data.name || '';
    var email = data.email || '';
    var role = data.role || '';
    var coverLetter = data.coverLetter || '';
    var deadline = data.deadline || '';
    var howHeard = data.howHeard || '';
    var files = data.files || []; // Array of {name, type, size, data} objects

    logToSheet(name, email, role, coverLetter, deadline, howHeard, files.length);

    var token = PropertiesService.getScriptProperties().getProperty('CLICKUP_API_TOKEN');
    if (token) {
      var result = createClickUpTask(token, name, email, role, coverLetter, deadline, howHeard);

      // Upload files as attachments to the ClickUp task
      if (files.length > 0 && result.id) {
        var attachmentResults = [];
        for (var i = 0; i < files.length; i++) {
          try {
            var attachResult = uploadFileToClickUp(token, result.id, files[i]);
            attachmentResults.push({ name: files[i].name, success: true });
          } catch (attachErr) {
            Logger.log('File attachment error for ' + files[i].name + ': ' + attachErr.message);
            attachmentResults.push({ name: files[i].name, success: false, error: attachErr.message });
          }
        }
        return ContentService.createTextOutput(JSON.stringify({
          success: true, taskId: result.id, taskUrl: result.url, attachments: attachmentResults
        })).setMimeType(ContentService.MimeType.JSON);
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true, taskId: result.id, taskUrl: result.url
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true, message: 'Logged to sheet (no ClickUp token configured)'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doPost error: ' + err.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Upload a file attachment to a ClickUp task
 */
function uploadFileToClickUp(token, taskId, fileObj) {
  // Decode base64 file data
  var fileBlob = Utilities.newBlob(
    Utilities.base64Decode(fileObj.data),
    fileObj.type,
    fileObj.name
  );

  // ClickUp attachment API requires multipart form data
  var boundary = '----WebKitFormBoundary' + Utilities.getUuid();

  var payload = Utilities.newBlob(
    '--' + boundary + '\r\n' +
    'Content-Disposition: form-data; name="attachment"; filename="' + fileObj.name + '"\r\n' +
    'Content-Type: ' + fileObj.type + '\r\n\r\n'
  ).getBytes();

  payload = payload.concat(fileBlob.getBytes());
  payload = payload.concat(Utilities.newBlob('\r\n--' + boundary + '--\r\n').getBytes());

  var options = {
    method: 'post',
    contentType: 'multipart/form-data; boundary=' + boundary,
    headers: {
      'Authorization': token
    },
    payload: payload,
    muteHttpExceptions: true
  };

  var response = UrlFetchApp.fetch(
    'https://api.clickup.com/api/v2/task/' + taskId + '/attachment',
    options
  );

  if (response.getResponseCode() !== 200) {
    throw new Error('ClickUp attachment API error: ' + response.getContentText());
  }

  return JSON.parse(response.getContentText());
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'ok', message: 'Caribou Health Application API'
  })).setMimeType(ContentService.MimeType.JSON);
}


/**
 * Create a task in ClickUp Candidate Pipeline
 */
function createClickUpTask(token, name, email, role, coverLetter, deadline, howHeard) {
  var customFields = [
    { id: CUSTOM_FIELDS.candidateEmail, value: email },
    { id: CUSTOM_FIELDS.coverLetter, value: coverLetter || '' },
    { id: CUSTOM_FIELDS.recruiterNotes, value: 'Applied via website ' + new Date().toISOString().split('T')[0] + (howHeard ? '. Source: ' + howHeard : '') }
  ];

  if (ROLE_MAP[role]) {
    customFields.push({ id: CUSTOM_FIELDS.openRole, value: ROLE_MAP[role] });
  }
  if (howHeard && SOURCE_MAP[howHeard] !== undefined) {
    customFields.push({ id: CUSTOM_FIELDS.candidateSource, value: SOURCE_MAP[howHeard] });
  }

  var desc = 'Role: ' + role + '\nEmail: ' + email;
  if (deadline) desc += '\nDeadline: ' + deadline;
  if (howHeard) desc += '\nSource: ' + howHeard;
  if (coverLetter) desc += '\n\n--- Cover Letter ---\n' + coverLetter;

  var payload = {
    name: name,
    description: desc,
    custom_fields: customFields
  };

  if (deadline) {
    payload.due_date = new Date(deadline).getTime();
  }

  var resp = UrlFetchApp.fetch('https://api.clickup.com/api/v2/list/' + CLICKUP_LIST_ID + '/task', {
    method: 'post',
    contentType: 'application/json',
    headers: { Authorization: token },
    payload: JSON.stringify(payload),
    muteHttpExceptions: true
  });

  var result = JSON.parse(resp.getContentText());
  if (resp.getResponseCode() !== 200) {
    throw new Error('ClickUp API error: ' + resp.getContentText());
  }
  return result;
}


/**
 * Log submission to a Google Sheet for backup
 */
function logToSheet(name, email, role, coverLetter, deadline, howHeard, fileCount) {
  var ss;
  try {
    ss = SpreadsheetApp.getActive();
  } catch (e) {
    ss = null;
  }
  if (!ss) {
    ss = SpreadsheetApp.create('Caribou Job Applications Log');
    ss.getActiveSheet().appendRow(['Timestamp', 'Name', 'Email', 'Role', 'Cover Letter', 'Deadline', 'How Heard', 'Files Uploaded']);
  }
  var sheet = ss.getActiveSheet();
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['Timestamp', 'Name', 'Email', 'Role', 'Cover Letter', 'Deadline', 'How Heard', 'Files Uploaded']);
  }
  sheet.appendRow([new Date(), name, email, role, coverLetter, deadline, howHeard, fileCount || 0]);
}

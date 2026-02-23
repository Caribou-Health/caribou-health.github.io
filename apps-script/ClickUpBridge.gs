/**
 * Caribou Health - Job Application to ClickUp Bridge
 * Google Apps Script Web App
 * Deployed under: curahealthteam@gmail.com
 *
 * NOTE: Google Apps Script 302 redirects convert POST to GET, so this
 * script uses doGet() with a ?data= query parameter for all submissions.
 * File attachments are handled separately via doPost() which works when
 * called from Apps Script itself (not from browser fetch).
 *
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com (logged in as curahealthteam@gmail.com)
 * 2. Open the "Caribou ClickUp Bridge" project (or create new and paste this)
 * 3. Go to Project Settings (gear icon) > Script Properties
 *    - Add property: CLICKUP_API_TOKEN = your ClickUp API token
 *    - Get your token from: ClickUp > Settings > Apps > API Token
 * 4. Deploy as Web App:
 *    - Click Deploy > New Deployment
 *    - Type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 *    - Click Deploy and copy the URL
 * 5. Update appsScriptUrl in website's js/app.js with the new URL
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

// Role mapping: form value -> ClickUp dropdown option UUID
// These must match the ROLE_LABELS values sent from app.js
var ROLE_MAP = {
  'Tech Lead': '616b9772-ae19-4ec8-a3d1-756242ce3b45',
  'Public Health Practicum': '548ab690-8696-457c-9e94-f41762b22d03',
  'Software Development Intern': '2fa053e5-4999-4ced-9b03-9299dbb87e0b',
  'Creative Intern': 'faac4e9d-6162-460d-9e73-540f37df9944',
  'Clinical Advisor': null,
  'Business Development Lead': null,
  'Community & Content Manager': null
};

// Source mapping: form value -> ClickUp dropdown option orderindex
// ClickUp options: 0=Job Board, 1=Referral, 2=Social Media, 3=Company Website,
// 4=Recruitment Agency, 5=Networking Event, 6=LinkedIn, 7=Google Forms, 8=Email
var SOURCE_MAP = {
  'LinkedIn': 6,
  'University/College': 3,
  'Friend/Referral': 1,
  'Job Board': 0,
  'Social Media': 2,
  'Other': 3,
  'Company Website': 3
};


/**
 * Web App GET endpoint - handles application submissions via ?data= parameter
 * Google Apps Script redirects convert POST to GET, so we use GET for everything.
 * The frontend sends JSON-encoded form data as a URL query parameter.
 */
function doGet(e) {
  // If no data parameter, return API status
  if (!e.parameter.data) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'ok', message: 'Caribou Health Application API'
    })).setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var data = JSON.parse(e.parameter.data);
    var name = data.name || '';
    var email = data.email || '';
    var role = data.role || '';
    var coverLetter = data.coverLetter || '';
    var deadline = data.deadline || '';
    var howHeard = data.howHeard || '';

    logToSheet(name, email, role, coverLetter, deadline, howHeard, 0);

    var token = PropertiesService.getScriptProperties().getProperty('CLICKUP_API_TOKEN');
    if (token) {
      var result = createClickUpTask(token, name, email, role, coverLetter, deadline, howHeard);

      return ContentService.createTextOutput(JSON.stringify({
        success: true, taskId: result.id, taskUrl: result.url
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      success: true, message: 'Logged to sheet (no ClickUp token configured)'
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log('doGet error: ' + err.message);
    return ContentService.createTextOutput(JSON.stringify({
      success: false, error: err.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}


/**
 * Web App POST endpoint - kept for backwards compatibility
 * Note: Browser fetch POST requests get converted to GET by Google's 302 redirect.
 * This handler still works when called from server-side contexts (e.g. other Apps Scripts).
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
    var files = data.files || [];

    logToSheet(name, email, role, coverLetter, deadline, howHeard, files.length);

    var token = PropertiesService.getScriptProperties().getProperty('CLICKUP_API_TOKEN');
    if (token) {
      var result = createClickUpTask(token, name, email, role, coverLetter, deadline, howHeard);

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
  var fileBlob = Utilities.newBlob(
    Utilities.base64Decode(fileObj.data),
    fileObj.type,
    fileObj.name
  );

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


/**
 * Test function - run this to verify authorization and ClickUp connection
 */
function testAuth() {
  var token = PropertiesService.getScriptProperties().getProperty('CLICKUP_API_TOKEN');
  Logger.log('Token exists: ' + (token ? 'yes' : 'no'));
  var response = UrlFetchApp.fetch('https://api.clickup.com/api/v2/team', {
    headers: { Authorization: token },
    muteHttpExceptions: true
  });
  Logger.log('ClickUp response: ' + response.getResponseCode());
}

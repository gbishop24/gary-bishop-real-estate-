/**
 * Lead recorder for garybishoprealestate.com
 *
 * Paste this whole file into one Apps Script project, then deploy it once
 * as a web app: Execute as me, Who has access: Anyone.
 * Setup steps: google-apps-script/README.md
 *
 * Seller leads  → spreadsheet "Selling a Home Form Responses"
 * Buyer leads   → spreadsheet "Buying a Home Form Responses"
 *
 * The first tab is used. Row 1 is the header row. A new lead is appended
 * under it. Column headers do not have to be created by hand; see the README.
 */
var SHEET_BY_FORM = {
  seller: "Selling a Home Form Responses",
  buyer: "Buying a Home Form Responses",
};

// Matched after lowercasing and removing spaces and punctuation.
var TIMESTAMP_HEADERS = [
  "timestamp",
  "date",
  "datetime",
  "submitted",
  "submittedat",
  "submissiontime",
  "submissiondate",
  "created",
  "createdat",
  "datecreated",
  "time",
];

// Extra header names that should receive a field when the label differs
// from an older Squarespace column.
var FIELD_ALIASES = {
  firstName: ["firstname", "fname", "givenname"],
  lastName: ["lastname", "lname", "surname", "familyname"],
  email: ["emailaddress", "emailaddr"],
  phone: ["phonenumber", "telephone", "tel", "mobile", "cell", "cellphone"],
  address1: ["address", "addressline1", "street", "streetaddress"],
  address2: ["addressline2", "apt", "unit", "apartment"],
  state: ["province", "region"],
  zip: ["zipcode", "postalcode", "postal", "zippostalcode"],
  timeline: ["whenareyoulookingtosell", "sellingtimeline", "selltimeline"],
  notes: ["message", "comments", "comment"],
  consent: ["agreement", "optin", "permission"],
  areas: ["areasofinterest", "preferredareas", "location", "locations"],
  priceRange: ["pricerange", "budget", "price"],
  timeframe: ["buyingtimeframe", "whentobuy"],
  preapproved: ["preapproval"],
  comments: ["comment", "message", "notes"],
};

var MAX_FIELDS = 40;
var MAX_TEXT = 10000;
var MAX_LABEL = 200;

function doGet() {
  var lines = ["Lead recorder is running."];
  Object.keys(SHEET_BY_FORM).forEach(function (key) {
    var name = SHEET_BY_FORM[key];
    try {
      var count = findSpreadsheetFiles(name).length;
      if (count === 0) lines.push(name + ": NOT FOUND");
      else if (count === 1) lines.push(name + ": found");
      else lines.push(name + ": found " + count + " files (new leads go to the most recently updated one)");
    } catch (err) {
      lines.push(name + ": error (" + err + ")");
    }
  });
  lines.push("If a sheet says NOT FOUND, the file name must match exactly and this script must be deployed from the Google account that owns the files (garybishoprealestate@gmail.com).");
  return ContentService.createTextOutput(lines.join("\n")).setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  try {
    var payload = readPayload(e);
    var formType = String(payload.formType || "").toLowerCase().replace(/\s+/g, "");
    var spreadsheetName = SHEET_BY_FORM[formType];
    if (!spreadsheetName) {
      return jsonResponse({ ok: false, error: 'Unknown formType. Use "seller" or "buyer".' });
    }

    var fields = sanitizeFields(fieldsFromPayload(payload));
    var lock = LockService.getScriptLock();
    lock.waitLock(15000);
    try {
      return jsonResponse(writeLead(spreadsheetName, fields));
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: String(err && err.message ? err.message : err) });
  }
}

function writeLead(spreadsheetName, fields) {
  var matches = findSpreadsheetFiles(spreadsheetName);
  if (!matches.length) {
    throw new Error(
      'No Google Sheet named "' + spreadsheetName + '" was found in this Google account. Check the file name and deploy from the account that owns the file.',
    );
  }

  var file = matches[0];
  var spreadsheet = SpreadsheetApp.open(file);
  var sheet = spreadsheet.getSheets()[0];
  if (!sheet) throw new Error('The spreadsheet "' + spreadsheetName + '" has no tabs.');

  var timestamp = Utilities.formatDate(new Date(), "America/New_York", "yyyy-MM-dd HH:mm:ss");
  appendLead(sheet, fields, timestamp);
  SpreadsheetApp.flush();

  var result = {
    ok: true,
    spreadsheet: file.getName(),
    sheet: sheet.getName(),
    row: sheet.getLastRow(),
  };
  if (matches.length > 1) {
    result.warning = 'More than one Google Sheet is named "' + spreadsheetName + '". The row was added to the most recently updated file.';
  }
  return result;
}

function appendLead(sheet, fields, timestamp) {
  var lastRow = sheet.getLastRow();
  var lastCol = sheet.getLastColumn();
  var headers;

  if (lastRow === 0 || lastCol === 0) {
    headers = ["Timestamp"];
    for (var i = 0; i < fields.length; i++) headers.push(fields[i].label || fields[i].name);
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.getRange(2, 1, 1, headers.length).setValues([buildRow(headers, fields, timestamp)]);
    return;
  }

  headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0].map(function (cell) {
    return cell == null ? "" : String(cell);
  });

  if (findTimestampIndex(headers) === -1) {
    headers.push("Timestamp");
    sheet.getRange(1, headers.length).setValue("Timestamp");
  }

  for (var f = 0; f < fields.length; f++) {
    if (findFieldIndex(headers, fields[f]) === -1) {
      var title = fields[f].label || fields[f].name;
      headers.push(title);
      sheet.getRange(1, headers.length).setValue(title);
    }
  }

  var row = buildRow(headers, fields, timestamp);
  sheet.getRange(lastRow + 1, 1, 1, row.length).setValues([row]);
}

function buildRow(headers, fields, timestamp) {
  var row = [];
  for (var i = 0; i < headers.length; i++) row.push("");
  var timestampIndex = findTimestampIndex(headers);
  if (timestampIndex !== -1) row[timestampIndex] = timestamp;
  for (var f = 0; f < fields.length; f++) {
    var index = findFieldIndex(headers, fields[f]);
    if (index === -1 || row[index] !== "") continue;
    row[index] = asCell(fields[f].value);
  }
  return row;
}

function findTimestampIndex(headers) {
  var normalized = headers.map(normalize);
  for (var i = 0; i < TIMESTAMP_HEADERS.length; i++) {
    var idx = normalized.indexOf(TIMESTAMP_HEADERS[i]);
    if (idx !== -1) return idx;
  }
  return -1;
}

function findFieldIndex(headers, field) {
  var keys = fieldMatchKeys(field);
  var timestampIndex = findTimestampIndex(headers);
  var normalized = headers.map(normalize);
  for (var i = 0; i < keys.length; i++) {
    for (var c = 0; c < normalized.length; c++) {
      if (c === timestampIndex) continue;
      if (normalized[c] === keys[i]) return c;
    }
  }
  return -1;
}

function fieldMatchKeys(field) {
  var keys = [];
  function add(value) {
    var key = normalize(value);
    if (key && keys.indexOf(key) === -1) keys.push(key);
  }
  add(field.label);
  add(field.name);
  var aliases = FIELD_ALIASES[field.name] || [];
  for (var i = 0; i < aliases.length; i++) add(aliases[i]);
  return keys;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\(required\)/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function asCell(value) {
  var text = value == null ? "" : String(value);
  if (/^[=+\-@]/.test(text)) return "'" + text;
  return text;
}

function readPayload(e) {
  var raw = e && e.postData && e.postData.contents ? String(e.postData.contents) : "";
  if (raw) {
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === "object") return parsed;
    } catch (ignore) {}
  }
  return (e && e.parameter) || {};
}

function fieldsFromPayload(payload) {
  if (payload.fields && Object.prototype.toString.call(payload.fields) === "[object Array]") {
    return payload.fields.map(function (field) {
      var name = field && field.name ? String(field.name) : "";
      var label = field && field.label ? String(field.label) : name;
      var value = field && field.value != null ? String(field.value) : "";
      return { name: name, label: label, value: value };
    });
  }

  var fields = [];
  Object.keys(payload || {}).forEach(function (key) {
    if (key === "formType" || key.charAt(0) === "_") return;
    var value = payload[key];
    if (value && typeof value === "object") return;
    fields.push({ name: key, label: key, value: value == null ? "" : String(value) });
  });
  return fields;
}

function sanitizeFields(fields) {
  var clean = [];
  for (var i = 0; i < fields.length && clean.length < MAX_FIELDS; i++) {
    var name = clip(String(fields[i].name || "").trim(), MAX_LABEL);
    if (!name || name.charAt(0) === "_") continue;
    var label = clip(String(fields[i].label || name).trim(), MAX_LABEL) || name;
    var value = clip(fields[i].value == null ? "" : String(fields[i].value), MAX_TEXT);
    clean.push({ name: name, label: label, value: value });
  }
  return clean;
}

function clip(text, max) {
  text = String(text || "");
  return text.length > max ? text.substring(0, max) : text;
}

function findSpreadsheetFiles(name) {
  var matches = [];
  var files = DriveApp.getFilesByName(name);
  while (files.hasNext()) {
    var file = files.next();
    if (isSheetFile(file)) matches.push(file);
  }

  if (!matches.length) {
    var wanted = looseName(name);
    var scanned = 0;
    var search = DriveApp.searchFiles('mimeType = "' + MimeType.GOOGLE_SHEETS + '" and trashed = false');
    while (search.hasNext() && scanned < 400) {
      scanned++;
      var candidate = search.next();
      if (!isSheetFile(candidate)) continue;
      if (looseName(candidate.getName()) === wanted) matches.push(candidate);
    }
  }

  matches.sort(function (a, b) {
    return b.getLastUpdated().getTime() - a.getLastUpdated().getTime();
  });
  return matches;
}

function isSheetFile(file) {
  return file && !file.isTrashed() && file.getMimeType() === MimeType.GOOGLE_SHEETS;
}

function looseName(value) {
  return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
}

function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

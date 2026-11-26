import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";

// One configuration value: the Netlify environment variable
// GOOGLE_SHEETS_WEB_APP_URL (the Apps Script web app URL, ending in /exec).
// When it is unset, this function does nothing and the form still emails
// through FormSubmit.

const UPSTREAM_BUDGET_MS = 7000;

export async function handler(event) {
  if (event.httpMethod === "OPTIONS") {
    return json(204, {});
  }
  if (event.httpMethod !== "POST") {
    return json(405, { ok: false, error: "Use POST." });
  }

  const url = String(process.env.GOOGLE_SHEETS_WEB_APP_URL || "").trim();
  if (!url) {
    return json(200, { ok: true, skipped: true });
  }
  if (!url.startsWith("https://")) {
    return json(500, { ok: false, error: "GOOGLE_SHEETS_WEB_APP_URL must start with https://" });
  }
  if (url.endsWith("/dev")) {
    return json(500, {
      ok: false,
      error: "Use the deployed web app URL ending in /exec, not the /dev test URL.",
    });
  }

  let payload;
  try {
    payload = sanitize(parseBody(event));
  } catch (error) {
    return json(400, { ok: false, error: error.message });
  }

  try {
    const result = await postToAppsScript(url, payload);
    if (result && result.warning) console.warn(result.warning);
    return json(200, { ok: true });
  } catch (error) {
    console.error(`Google Sheets lead (${payload.formType}) was not saved:`, error.message);
    return json(502, { ok: false, error: "Could not save the lead to Google Sheets." });
  }
}

function parseBody(event) {
  if (!event.body) throw new Error("Missing request body.");
  const raw = event.isBase64Encoded
    ? Buffer.from(event.body, "base64").toString("utf8")
    : event.body;
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Request body must be JSON.");
  }
}

function sanitize(payload) {
  const formType = String(payload?.formType || "").trim().toLowerCase();
  if (formType !== "seller" && formType !== "buyer") {
    throw new Error('formType must be "seller" or "buyer".');
  }
  if (!Array.isArray(payload.fields)) throw new Error("fields must be a list.");

  const fields = [];
  for (const field of payload.fields) {
    if (fields.length >= 40) break;
    const name = String(field?.name || "").trim().slice(0, 200);
    if (!name || name.startsWith("_")) continue;
    const label = String(field?.label || name).trim().slice(0, 200) || name;
    const value = String(field?.value ?? "").slice(0, 10000);
    fields.push({ name, label, value });
  }
  return { formType, fields };
}

// Apps Script web apps answer the first POST with a redirect. Browser and
// Node fetch turn that redirect into a GET and drop the body, so re-POST
// the same JSON to each redirect target.
async function postToAppsScript(url, payload) {
  const body = JSON.stringify(payload);
  const deadline = Date.now() + UPSTREAM_BUDGET_MS;
  let current = url;
  let cookie = "";

  for (let hop = 0; hop < 5; hop += 1) {
    const remaining = deadline - Date.now();
    if (remaining <= 250) throw new Error("Google Sheets request timed out");

    const response = await postOnce(current, body, remaining, cookie);
    cookie = mergeCookies(cookie, response.headers["set-cookie"]);
    if (response.status === 301 || response.status === 302 || response.status === 303 || response.status === 307 || response.status === 308) {
      const location = response.headers.location;
      if (!location || Array.isArray(location)) {
        throw new Error("Apps Script redirect had no Location header");
      }
      current = new URL(String(location).trim(), current).href;
      continue;
    }
    return interpret(response);
  }

  throw new Error("Apps Script redirected too many times");
}

function mergeCookies(current, setCookie) {
  const jar = new Map();
  for (const part of String(current || "").split(";")) {
    const piece = part.trim();
    if (!piece) continue;
    const eq = piece.indexOf("=");
    if (eq === -1) continue;
    jar.set(piece.slice(0, eq), piece.slice(eq + 1));
  }
  const list = Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [];
  for (const item of list) {
    const pair = String(item).split(";")[0].trim();
    const eq = pair.indexOf("=");
    if (eq === -1) continue;
    jar.set(pair.slice(0, eq), pair.slice(eq + 1));
  }
  return [...jar.entries()].map(([name, value]) => `${name}=${value}`).join("; ");
}

function postOnce(targetUrl, body, timeoutMs, cookie) {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body),
    Accept: "application/json, text/plain;q=0.9",
    "User-Agent": "gary-bishop-real-estate/1.0",
  };
  if (cookie) headers.Cookie = cookie;

  return new Promise((resolve, reject) => {
    const url = new URL(targetUrl);
    const transport = url.protocol === "http:" ? httpRequest : httpsRequest;
    const req = transport(
      url,
      {
        method: "POST",
        headers,
      },
      (res) => {
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => {
          resolve({
            status: res.statusCode || 0,
            headers: res.headers,
            body: Buffer.concat(chunks).toString("utf8"),
          });
        });
      },
    );
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("Google Sheets request timed out"));
    });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function interpret(response) {
  const text = response.body || "";
  let parsed = null;
  try {
    parsed = JSON.parse(text);
  } catch {
    parsed = null;
  }

  if (response.status < 200 || response.status >= 300) {
    const detail = parsed?.error || text.slice(0, 300);
    throw new Error(`Google Sheets web app returned HTTP ${response.status}: ${detail}`);
  }
  if (parsed && parsed.ok === false) {
    throw new Error(parsed.error || "Google Sheets web app rejected the lead");
  }
  if (!parsed || parsed.ok !== true) {
    throw new Error(
      "Google Sheets web app did not return a success response. Use the deployed URL that ends in /exec, with access set to Anyone.",
    );
  }
  return parsed;
}

function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    },
    body: JSON.stringify(body),
  };
}

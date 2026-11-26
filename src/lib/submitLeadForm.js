const SHEETS_ENDPOINT = "/api/lead";
const SHEETS_TIMEOUT_MS = 8000;

// Copy the lead to Google Sheets, then let the browser POST the original
// form to FormSubmit. A sheets failure, a missing URL, or a slow response
// never blocks the email.
export function submitLeadForm(event, formType) {
  event.preventDefault();
  const form = event.currentTarget;
  if (!(form instanceof HTMLFormElement)) return;
  if (form.dataset.sending === "true") return;
  form.dataset.sending = "true";

  const button = form.querySelector('button[type="submit"]');
  const originalLabel = button ? button.textContent : "";
  if (button) {
    button.disabled = true;
    button.textContent = "Sending…";
  }

  const finish = () => {
    try {
      form.submit();
    } catch {
      form.dataset.sending = "false";
      if (button) {
        button.disabled = false;
        button.textContent = originalLabel;
      }
    }
  };

  let payload = null;
  try {
    payload = readLead(form, formType);
  } catch {
    payload = null;
  }

  if (!payload) {
    finish();
    return;
  }

  saveLead(payload).then(finish);
}

function saveLead(payload) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), SHEETS_TIMEOUT_MS);
  return fetch(SHEETS_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    signal: controller.signal,
  })
    .catch(() => {})
    .finally(() => clearTimeout(timer));
}

function readLead(form, formType) {
  const fields = [];
  const seen = new Set();

  for (const el of form.elements) {
    if (!el.name || el.name.startsWith("_")) continue;
    if (el.disabled) continue;
    const type = String(el.type || "").toLowerCase();
    if (type === "submit" || type === "button" || type === "reset" || type === "file") continue;
    if ((type === "checkbox" || type === "radio") && !el.checked) continue;
    if (seen.has(el.name)) continue;
    seen.add(el.name);

    fields.push({
      name: el.name,
      label: labelFor(el),
      value: typeof el.value === "string" ? el.value.trim() : String(el.value ?? ""),
    });
  }

  return { formType, fields };
}

function labelFor(el) {
  if (el.name === "consent") return "Consent";

  const groupLabel = el.closest(".field")?.querySelector(":scope > .field-label");
  if (groupLabel) return cleanLabel(groupLabel.textContent);

  if (el.id && el.form) {
    const explicit = el.form.querySelector(`label[for="${escapeId(el.id)}"]`);
    if (explicit) return cleanLabel(explicit.textContent);
  }

  const wrapping = el.closest("label");
  if (wrapping) return cleanLabel(wrapping.textContent);
  return el.name;
}

function cleanLabel(text) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .replace(/\(required\)/gi, "")
    .trim();
}

function escapeId(id) {
  if (typeof CSS !== "undefined" && typeof CSS.escape === "function") return CSS.escape(id);
  return String(id).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

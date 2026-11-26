function formatBody(fields) {
  return Object.entries(fields)
    .filter(([, value]) => value != null && String(value).trim() !== "")
    .map(([key, value]) => `${key}: ${value}`)
    .join("\n");
}

export function submitLead({ subject, fields }) {
  const body = formatBody(fields);
  const mailto = `mailto:GBishop24@icloud.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  // Best-effort open the visitor's email client with a prefilled message.
  const link = document.createElement("a");
  link.href = mailto;
  link.rel = "noopener";
  document.body.appendChild(link);
  link.click();
  link.remove();

  return { ok: true };
}

/** Submit a form to Netlify Forms from a React SPA (urlencoded POST). */
export async function submitNetlifyForm(form) {
  const data = new FormData(form);
  // Ensure form-name is present for Netlify's SPA POST handler
  if (!data.get("form-name") && form.getAttribute("name")) {
    data.set("form-name", form.getAttribute("name"));
  }

  const body = new URLSearchParams(data).toString();
  const response = await fetch("/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    throw new Error(`Form submission failed (${response.status})`);
  }

  return { ok: true };
}

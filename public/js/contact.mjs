// Progressive-enhancement contact form. Works without JS (server validates and
// redirects with a status query). With JS: inline validation + fetch submit.

export function initContact() {
  const form = document.querySelector("[data-contact-form]");

  // Surface server-side status from the no-JS redirect path (?status=&message=).
  const params = new URLSearchParams(window.location.search);
  const statusEl = document.querySelector("[data-form-status]");
  if (statusEl && params.get("status")) {
    statusEl.textContent = params.get("message") || "";
    statusEl.setAttribute(
      "data-kind",
      params.get("status") === "success" ? "success" : "error",
    );
    history.replaceState(
      null,
      "",
      window.location.pathname + window.location.hash,
    );
  }

  if (!form) return () => {};

  const setError = (name, msg) => {
    const el = form.querySelector(`[data-error-for="${name}"]`);
    if (el) el.textContent = msg || "";
  };

  const validate = () => {
    let ok = true;
    const name = form.elements.namedItem("name");
    const email = form.elements.namedItem("email");
    const message = form.elements.namedItem("message");
    setError("name", "");
    setError("email", "");
    setError("message", "");
    if (name && name.value.trim().length < 2) {
      setError("name", "Please enter your name.");
      ok = false;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      setError("email", "Please enter a valid email.");
      ok = false;
    }
    if (message && message.value.trim().length < 10) {
      setError("message", "A little more detail, please (10+ characters).");
      ok = false;
    }
    return ok;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (statusEl) {
      statusEl.textContent = "";
      statusEl.removeAttribute("data-kind");
    }
    if (!validate()) return;

    const submitBtn = form.querySelector("[data-submit]");
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";
    }

    try {
      const res = await fetch(form.action, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(Object.fromEntries(new FormData(form).entries())),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        form.reset();
        if (statusEl) {
          statusEl.textContent = "Thanks — your message has been sent.";
          statusEl.setAttribute("data-kind", "success");
        }
      } else {
        const issues = data && data.error && data.error.issues;
        if (Array.isArray(issues)) {
          for (const issue of issues) setError(issue.path, issue.message);
        }
        if (statusEl) {
          statusEl.textContent =
            (data && data.error && data.error.message) ||
            "Something went wrong. Please try again.";
          statusEl.setAttribute("data-kind", "error");
        }
      }
    } catch {
      if (statusEl) {
        statusEl.textContent = "Network error. Please try again.";
        statusEl.setAttribute("data-kind", "error");
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = "Send message";
      }
    }
  };

  form.addEventListener("submit", onSubmit);
  return () => form.removeEventListener("submit", onSubmit);
}

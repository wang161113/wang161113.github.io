(() => {
  const storageKey = "onepeak.language";
  const current = new URL(window.location.href);
  const pageLanguage = document.documentElement.lang === "en" ? "en" : "zh";

  // Language links carry the choice even when browser storage is unavailable.
  if (current.searchParams.get("lang") === pageLanguage) {
    try {
      localStorage.setItem(storageKey, pageLanguage);
      current.searchParams.delete("lang");
      history.replaceState(history.state, "", current);
    } catch {
      // Keep the explicit language parameter if the choice could not be saved.
    }
    return;
  }

  // Visiting /en/ directly is also an explicit language choice for that visit.
  if (pageLanguage === "en") return;

  function showEnglish() {
    const english = new URL("./en/", current);
    english.search = current.search;
    english.hash = current.hash;
    window.location.replace(english);
  }

  let preference;
  try {
    preference = localStorage.getItem(storageKey);
  } catch {
    // Region detection still works when browser storage is disabled.
  }

  if (preference === "zh") return;
  if (preference === "en") {
    showEnglish();
    return;
  }

  async function applyRegionDefault() {
    try {
      const response = await fetch("https://api.country.is/", {
        credentials: "omit",
        referrerPolicy: "no-referrer",
        signal: AbortSignal.timeout(3000),
      });
      if (!response.ok) return;

      const { country } = await response.json();
      if (typeof country === "string" && /^[A-Z]{2}$/.test(country) && !["CN", "XX", "ZZ"].includes(country)) {
        showEnglish();
      }
    } catch {
      // The Chinese page remains usable if region detection fails or times out.
    }
  }

  applyRegionDefault();
})();

const GA_MEASUREMENT_ID = "G-Z1R3F1Y8C5";
const CLARITY_PROJECT_ID = "viza42872j";

function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;
  if (window.__gaInitialized) return;
  const hasExistingGtag = !!document.querySelector(
    `script[src*="googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}"]`
  );
  if (hasExistingGtag && typeof window.gtag === "function") {
    window.__gaInitialized = true;
    return;
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag() {
      window.dataLayer.push(arguments);
    };

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID);
  window.__gaInitialized = true;
}

function initMicrosoftClarity() {
  if (!CLARITY_PROJECT_ID) return;
  if (window.__clarityInitialized) return;

  (function (c, l, a, r, i, m, s) {
    c[a] =
      c[a] ||
      function clarity() {
        (c[a].q = c[a].q || []).push(arguments);
      };
    m = l.createElement(r);
    m.async = 1;
    m.src = `https://www.clarity.ms/tag/${i}`;
    s = l.getElementsByTagName(r)[0];
    s.parentNode.insertBefore(m, s);
  })(window, document, "clarity", "script", CLARITY_PROJECT_ID);

  window.__clarityInitialized = true;
}

document.addEventListener("DOMContentLoaded", () => {
  initGoogleAnalytics();
  initMicrosoftClarity();

  const tables = document.querySelectorAll(".table-wrap table");

  tables.forEach((table) => {
    const headers = Array.from(table.querySelectorAll("thead th")).map((th) =>
      th.textContent.trim()
    );

    if (!headers.length) return;

    table.querySelectorAll("tbody tr").forEach((row) => {
      Array.from(row.children).forEach((cell, index) => {
        if (cell.tagName !== "TD") return;
        if (cell.hasAttribute("data-label")) return;
        cell.setAttribute("data-label", headers[index] || "항목");
      });
    });
  });
});

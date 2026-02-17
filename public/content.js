const GA_MEASUREMENT_ID = "G-Z1R3F1Y8C5";

function initGoogleAnalytics() {
  if (!GA_MEASUREMENT_ID) return;
  if (window.__gaInitialized) return;

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

document.addEventListener("DOMContentLoaded", () => {
  initGoogleAnalytics();

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

document.addEventListener("DOMContentLoaded", () => {
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

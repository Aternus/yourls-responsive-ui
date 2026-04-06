///////////////////////////////////////////////////////////
// Plugin-owned Link / Click Counters
///////////////////////////////////////////////////////////

// Replacements for stripped YOURLS core globals:
//   decrement_counter, decrease_total_clicks

/**
 * Recompute the total-links counter from visible table rows and
 * toggle the #nourl_found empty-state row.
 */
export function recomputeTotalLinks() {
  const rows = document.querySelectorAll(
    "#main_table tbody tr:not(#nourl_found)",
  );
  const visibleRows = Array.from(rows).filter(
    (row) => row.style.display !== "none",
  );

  const countEl = document.querySelector("#overall_tracking .total_links");
  if (countEl instanceof HTMLElement) {
    countEl.textContent = String(visibleRows.length);
  }

  const noUrlRow = document.querySelector("#nourl_found");
  if (noUrlRow instanceof HTMLElement) {
    noUrlRow.style.display = visibleRows.length === 0 ? "" : "none";
  }
}

/**
 * Recompute the total-clicks counter by summing click values from
 * visible table rows.
 */
export function recomputeTotalClicks() {
  const rows = document.querySelectorAll(
    "#main_table tbody tr:not(#nourl_found)",
  );
  let total = 0;

  for (const row of rows) {
    if (row.style.display === "none") {
      continue;
    }

    const clicksCell = row.querySelector("td.clicks");
    if (clicksCell) {
      total += parseInt(clicksCell.textContent?.trim() ?? "0", 10) || 0;
    }
  }

  const clicksEl = document.querySelector("#overall_tracking .total_clicks");
  if (clicksEl instanceof HTMLElement) {
    clicksEl.textContent = String(total);
  }
}

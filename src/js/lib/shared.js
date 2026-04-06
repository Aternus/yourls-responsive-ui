export function openShareWindow(
  destination,
  shareText,
  shortUrl,
  destinationUrl,
) {
  const text = encodeURIComponent(shareText || shortUrl);
  const encodedShortUrl = encodeURIComponent(shortUrl);
  const encodedDestinationUrl = encodeURIComponent(destinationUrl || "");

  if (destination === "tw") {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${text}`;
    window.open(twitterUrl, "tw", "toolbar=no,width=800,height=550");
    return;
  }

  if (destination === "fb") {
    const targetUrl = encodedDestinationUrl || encodedShortUrl;
    const facebookUrl = `https://www.facebook.com/share.php?u=${targetUrl}`;
    window.open(facebookUrl, "fb", "toolbar=no,width=1000,height=550");
  }
}

export function createMaterialIcon(iconName, extraClass = "") {
  const icon = document.createElement("span");
  setMaterialIcon(icon, iconName, extraClass);
  return icon;
}

export function setMaterialIcon(icon, iconName, extraClass = "") {
  icon.className = `material-icons${extraClass ? ` ${extraClass}` : ""}`;
  icon.setAttribute("aria-hidden", "true");
  icon.textContent = iconName;
}

function fallbackCopyText(value) {
  const textarea = document.createElement("textarea");
  textarea.value = value;
  textarea.setAttribute("readonly", "true");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  textarea.style.pointerEvents = "none";
  document.body.appendChild(textarea);
  textarea.select();

  let copied = false;
  try {
    copied = document.execCommand("copy");
  } catch (_error) {
    copied = false;
  }

  textarea.remove();
  return copied;
}

export async function copyToClipboard(value) {
  const text = String(value ?? "").trim();
  if (!text) {
    return false;
  }

  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_error) {
      // Fall back to document.execCommand below.
    }
  }

  return fallbackCopyText(text);
}

export function replaceRowFromHtml(id, rowHtml) {
  const currentRow = document.querySelector(`#id-${id}`);
  if (!(currentRow instanceof HTMLElement)) {
    return false;
  }

  if (typeof rowHtml !== "string" || rowHtml.trim() === "") {
    return false;
  }

  const tempBody = document.createElement("tbody");
  tempBody.innerHTML = rowHtml.trim();

  const nextRow = tempBody.querySelector("tr[id^='id-']");
  if (!(nextRow instanceof HTMLElement)) {
    return false;
  }

  currentRow.replaceWith(nextRow);
  return true;
}

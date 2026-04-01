function extractNonceFromHref(href) {
    if (typeof href !== "string" || href.trim() === "") {
        return "";
    }

    try {
        const parsed = new URL(href, window.location.origin);
        return parsed.searchParams.get("nonce") ?? "";
    } catch (_error) {
        return "";
    }
}

export function getRowData(id) {
    const row = document.querySelector(`#id-${id}`);
    if (!(row instanceof HTMLElement)) {
        return null;
    }

    const shortLink =
        row.querySelector(`#keyword-${id} a.responsive-shorturl-link`) ??
        row.querySelector(
            `#keyword-${id} a:not(.responsive-delete-metadata-link)`,
        );
    const destinationLink =
        row.querySelector(`#url-${id} a.responsive-destination-raw-link`) ??
        row.querySelector(`#url-${id} a:not(.responsive-delete-metadata-link)`);
    const titleNode = row.querySelector(
        `#url-${id} .responsive-destination-title`,
    );
    const keywordInput = document.querySelector(`#keyword_${id}`);
    const editButton = document.querySelector(`#edit-button-${id}`);

    const shortUrl =
        shortLink instanceof HTMLAnchorElement
            ? (shortLink.getAttribute("href") ?? "")
            : "";
    const destinationUrl =
        destinationLink instanceof HTMLAnchorElement
            ? (destinationLink.getAttribute("href") ?? "")
            : "";
    const title =
        titleNode instanceof HTMLElement
            ? (titleNode.getAttribute("title") ?? titleNode.textContent ?? "")
            : destinationLink instanceof HTMLAnchorElement
              ? (destinationLink.getAttribute("title") ?? "")
              : "";
    const keyword =
        keywordInput instanceof HTMLInputElement ? keywordInput.value : "";
    const nonce =
        editButton instanceof HTMLAnchorElement
            ? extractNonceFromHref(editButton.getAttribute("href"))
            : "";

    return {
        id: String(id),
        shortUrl,
        destinationUrl,
        title: title.trim(),
        keyword,
        nonce,
    };
}

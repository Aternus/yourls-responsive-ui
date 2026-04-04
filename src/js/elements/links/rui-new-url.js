import { defineCustomElement, onMounted, ref } from "vue";
import { apiRequest } from "../../lib/api.js";
import { showFeedback, addLoading, endLoading } from "../../lib/feedback.js";
import {
    recomputeTotalLinks,
    recomputeTotalClicks,
} from "../../lib/counters.js";
import { replaceRowFromHtml } from "../../lib/shared.js";

export const RuiNewUrl = defineCustomElement(
    {
        name: "RuiNewUrl",
        setup() {
            const formSlot = ref(null);
            const feedbackSlot = ref(null);
            const ready = ref(false);

            onMounted(() => {
                const container = document.querySelector("#new_url");
                const form = container?.querySelector("#new_url_form");
                const feedback = container?.querySelector("#feedback");

                if (
                    !(container instanceof HTMLElement) ||
                    !(form instanceof HTMLFormElement) ||
                    !(feedback instanceof HTMLElement) ||
                    container.dataset.ruiNewUrlEnhanced === "true"
                ) {
                    return;
                }

                const host = container.querySelector("rui-new-url");
                if (
                    host instanceof HTMLElement &&
                    container.firstElementChild !== host
                ) {
                    container.insertBefore(host, container.firstElementChild);
                }

                const legacyWrapper =
                    container.querySelector("#new_url_form_wrap");
                ready.value = true;
                container.dataset.ruiNewUrlEnhanced = "true";

                requestAnimationFrame(() => {
                    formSlot.value?.append(form);
                    feedbackSlot.value?.append(feedback);

                    if (
                        legacyWrapper instanceof HTMLElement &&
                        legacyWrapper.childElementCount === 0
                    ) {
                        legacyWrapper.remove();
                    }
                });

                // Plugin-owned add-URL submission (replaces core add_link).
                let addInProgress = false;

                form.addEventListener("submit", (event) => {
                    event.preventDefault();

                    if (addInProgress) {
                        return;
                    }

                    const urlInput = form.querySelector("#add-url");
                    const keywordInput = form.querySelector("#add-keyword");
                    const nonceInput = form.querySelector(
                        'input[name="nonce"]',
                    );
                    const submitButton = form.querySelector("#add-button");

                    const url =
                        urlInput instanceof HTMLInputElement
                            ? urlInput.value.trim()
                            : "";
                    const keyword =
                        keywordInput instanceof HTMLInputElement
                            ? keywordInput.value.trim()
                            : "";
                    const nonce =
                        nonceInput instanceof HTMLInputElement
                            ? nonceInput.value
                            : "";

                    if (!url) {
                        showFeedback("Please enter a URL to shorten.", "fail");
                        return;
                    }

                    if (submitButton instanceof HTMLElement) {
                        addLoading(submitButton);
                    }

                    addInProgress = true;

                    apiRequest({
                        action: "add",
                        url,
                        keyword,
                        nonce,
                    }).then((response) => {
                        addInProgress = false;

                        if (submitButton instanceof HTMLElement) {
                            endLoading(submitButton);
                        }

                        if (response?.status === "success") {
                            if (urlInput instanceof HTMLInputElement) {
                                urlInput.value = "";
                            }
                            if (keywordInput instanceof HTMLInputElement) {
                                keywordInput.value = "";
                            }

                            // Show share boxes if response includes the short URL.
                            if (response?.shorturl || response?.url?.keyword) {
                                showShareBoxes(container, response);
                            }

                            // Insert the new row into the table.
                            if (response?.html) {
                                insertNewRow(response.html);
                                recomputeTotalLinks();
                                recomputeTotalClicks();
                            }
                        }

                        if (response?.message) {
                            showFeedback(response.message, response.status);
                        }
                    });
                });
            });

            return {
                formSlot,
                feedbackSlot,
                ready,
            };
        },
        template: `
            <section v-if="ready" class="rui-new-url__surface">
                <div ref="formSlot"></div>
                <div ref="feedbackSlot"></div>
            </section>
        `,
    },
    { shadowRoot: false },
);

function showShareBoxes(container, response) {
    const shareboxes = container.querySelector("#shareboxes");
    if (!(shareboxes instanceof HTMLElement)) {
        return;
    }

    const copylink = shareboxes.querySelector("#copylink");
    const origlink = shareboxes.querySelector("#origlink");
    const statlink = shareboxes.querySelector("#statlink");
    const tweetBody = shareboxes.querySelector("#tweet_body");

    const shortUrl = response.shorturl ?? "";
    const keyword = response.url?.keyword ?? "";
    const longUrl = response.url?.url ?? "";
    const title = response.url?.title ?? "";

    if (copylink instanceof HTMLInputElement && shortUrl) {
        copylink.value = shortUrl;
    }

    if (origlink instanceof HTMLElement && longUrl) {
        origlink.innerHTML = "";
        const a = document.createElement("a");
        a.href = longUrl;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = longUrl;
        origlink.append(a);
    }

    if (statlink instanceof HTMLElement && keyword) {
        statlink.innerHTML = "";
        const a = document.createElement("a");
        a.href = `${shortUrl}+`;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "stats";
        statlink.append(a);
    }

    if (tweetBody instanceof HTMLTextAreaElement) {
        tweetBody.value = title ? `${title} ${shortUrl}` : shortUrl;
    }

    shareboxes.style.display = "";
}

function insertNewRow(rowHtml) {
    const tbody = document.querySelector("#main_table tbody");
    if (!(tbody instanceof HTMLElement)) {
        return;
    }

    const temp = document.createElement("tbody");
    temp.innerHTML = rowHtml.trim();
    const newRow = temp.querySelector("tr[id^='id-']");
    if (!(newRow instanceof HTMLElement)) {
        return;
    }

    const firstRow = tbody.querySelector("tr");
    if (firstRow) {
        tbody.insertBefore(newRow, firstRow);
    } else {
        tbody.append(newRow);
    }
}

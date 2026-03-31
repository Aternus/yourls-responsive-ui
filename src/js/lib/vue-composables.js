import { onBeforeUnmount, onMounted, ref } from "vue";

export function usePrimaryControlFocus(controlRef) {
    const focusPrimaryControl = () => {
        window.requestAnimationFrame(() => {
            const control = controlRef?.value;
            if (
                !(
                    control instanceof HTMLInputElement ||
                    control instanceof HTMLTextAreaElement
                )
            ) {
                return;
            }

            control.focus();
            if (typeof control.select === "function") {
                control.select();
            }
        });
    };

    onMounted(() => {
        focusPrimaryControl();
    });

    return {
        focusPrimaryControl,
    };
}

export function useCopyFeedback(options = {}) {
    const {
        defaultIcon = "content_copy",
        defaultLabel = "Copy short URL",
        copiedIcon = "check",
        copiedLabel = "Copied",
        resetAfterMs = 1200,
    } = options;

    const iconName = ref(defaultIcon);
    const label = ref(defaultLabel);
    let resetTimer = 0;

    const clearResetTimer = () => {
        if (!resetTimer) {
            return;
        }

        window.clearTimeout(resetTimer);
        resetTimer = 0;
    };

    const reset = () => {
        clearResetTimer();
        iconName.value = defaultIcon;
        label.value = defaultLabel;
    };

    const markCopied = () => {
        clearResetTimer();
        iconName.value = copiedIcon;
        label.value = copiedLabel;

        resetTimer = window.setTimeout(() => {
            iconName.value = defaultIcon;
            label.value = defaultLabel;
            resetTimer = 0;
        }, resetAfterMs);
    };

    onBeforeUnmount(() => {
        clearResetTimer();
    });

    return {
        iconName,
        label,
        markCopied,
        reset,
    };
}

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

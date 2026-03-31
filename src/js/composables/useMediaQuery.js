import { onBeforeUnmount, onMounted, ref } from "vue";

export function useMediaQuery(query) {
    const matches = ref(false);
    let mediaQuery = null;

    const syncMatches = () => {
        matches.value = Boolean(mediaQuery?.matches);
    };

    onMounted(() => {
        mediaQuery = window.matchMedia(query);
        syncMatches();

        if (typeof mediaQuery.addEventListener === "function") {
            mediaQuery.addEventListener("change", syncMatches);
            return;
        }

        if (typeof mediaQuery.addListener === "function") {
            mediaQuery.addListener(syncMatches);
        }
    });

    onBeforeUnmount(() => {
        if (!mediaQuery) {
            return;
        }

        if (typeof mediaQuery.removeEventListener === "function") {
            mediaQuery.removeEventListener("change", syncMatches);
            return;
        }

        if (typeof mediaQuery.removeListener === "function") {
            mediaQuery.removeListener(syncMatches);
        }
    });

    return matches;
}

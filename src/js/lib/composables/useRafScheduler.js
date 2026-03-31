import { onBeforeUnmount } from "vue";

export function useRafScheduler(run) {
    let rafId = 0;

    const schedule = () => {
        if (rafId) {
            return;
        }

        rafId = window.requestAnimationFrame(() => {
            rafId = 0;
            run();
        });
    };

    onBeforeUnmount(() => {
        if (rafId) {
            window.cancelAnimationFrame(rafId);
            rafId = 0;
        }
    });

    return schedule;
}

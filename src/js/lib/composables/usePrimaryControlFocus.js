import { onMounted } from "vue";

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

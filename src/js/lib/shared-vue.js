import { defineComponent, h, render } from "vue";

function withClasses(...classNames) {
    return classNames.filter(Boolean).join(" ");
}

export const ResponsiveMaterialIcon = defineComponent({
    name: "ResponsiveMaterialIcon",
    props: {
        iconName: { type: String, required: true },
        extraClass: { type: String, default: "" },
    },
    setup(props) {
        return () =>
            h(
                "span",
                {
                    class: withClasses("material-icons", props.extraClass),
                    "aria-hidden": "true",
                },
                props.iconName,
            );
    },
});

export const ResponsiveBrandIcon = defineComponent({
    name: "ResponsiveBrandIcon",
    props: {
        iconClass: { type: String, required: true },
        extraClass: { type: String, default: "" },
    },
    setup(props) {
        return () =>
            h("span", {
                class: withClasses(
                    "fa-brands",
                    props.iconClass,
                    props.extraClass,
                ),
                "aria-hidden": "true",
            });
    },
});

export const ResponsiveField = defineComponent({
    name: "ResponsiveField",
    props: {
        className: { type: String, required: true },
        labelText: { type: String, required: true },
        labelClass: { type: String, required: true },
        controlId: { type: String, default: "" },
    },
    setup(props) {
        return () =>
            h("div", { class: props.className }, [
                h(
                    "label",
                    {
                        class: props.labelClass,
                        for: props.controlId || null,
                    },
                    props.labelText,
                ),
            ]);
    },
});

export const ResponsiveActionButton = defineComponent({
    name: "ResponsiveActionButton",
    props: {
        dataId: { type: String, default: "" },
        elementId: { type: String, default: "" },
        iconName: { type: String, required: true },
        iconLibrary: { type: String, default: "material" },
        label: { type: String, required: true },
        variantClass: { type: String, required: true },
        className: {
            type: String,
            default: "responsive-inline-editor-button",
        },
        onPress: { type: Function, default: null },
    },
    setup(props) {
        const handleClick = (event) => {
            event.preventDefault();

            const target = event.currentTarget;
            if (
                target instanceof HTMLButtonElement &&
                typeof props.onPress === "function"
            ) {
                props.onPress(target);
            }
        };

        return () =>
            h(
                "button",
                {
                    type: "button",
                    class: withClasses(
                        "button",
                        props.className,
                        props.variantClass,
                    ),
                    id: props.elementId || null,
                    "data-id": props.dataId || null,
                    "aria-label": props.label,
                    title: props.label,
                    onClick: handleClick,
                },
                [
                    props.iconLibrary === "brand"
                        ? h(ResponsiveBrandIcon, {
                              iconClass: props.iconName,
                              extraClass: "responsive-brand-icon",
                          })
                        : h(ResponsiveMaterialIcon, {
                              iconName: props.iconName,
                          }),
                ],
            );
    },
});

export function renderVueElement(component, props = {}) {
    const mountPoint = document.createElement("div");
    render(h(component, props), mountPoint);

    const element = mountPoint.firstElementChild;
    if (!(element instanceof HTMLElement)) {
        return null;
    }

    element.remove();
    return element;
}

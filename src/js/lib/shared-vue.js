import { defineComponent, h, render } from "vue";

export const ResponsiveMaterialIcon = defineComponent({
    name: "ResponsiveMaterialIcon",
    props: {
        iconName: { type: String, required: true },
        extraClass: { type: String, default: "" },
    },
    template: `
        <span :class="['material-icons', extraClass]" aria-hidden="true">{{ iconName }}</span>
    `,
});

export const ResponsiveBrandIcon = defineComponent({
    name: "ResponsiveBrandIcon",
    props: {
        iconClass: { type: String, required: true },
        extraClass: { type: String, default: "" },
    },
    template: `
        <span :class="['fa-brands', iconClass, extraClass]" aria-hidden="true"></span>
    `,
});

export const ResponsiveField = defineComponent({
    name: "ResponsiveField",
    props: {
        className: { type: String, required: true },
        labelText: { type: String, required: true },
        labelClass: { type: String, required: true },
        controlId: { type: String, default: "" },
    },
    template: `
        <div :class="className">
            <label :class="labelClass" :for="controlId || null">{{ labelText }}</label>
            <slot />
        </div>
    `,
});

export const ResponsiveTextInputField = defineComponent({
    name: "ResponsiveTextInputField",
    components: {
        ResponsiveField,
    },
    props: {
        fieldClassName: { type: String, required: true },
        labelText: { type: String, required: true },
        labelClassName: { type: String, required: true },
        controlId: { type: String, required: true },
        modelValue: { type: String, default: "" },
        controlType: { type: String, default: "text" },
        placeholder: { type: String, default: "" },
        readOnly: { type: Boolean, default: false },
        ariaLabel: { type: String, default: "" },
        controlRef: { type: [Object, Function], default: null },
    },
    emits: ["update:modelValue"],
    setup(_props, { emit }) {
        const updateValue = (event) => {
            if (!(event.target instanceof HTMLInputElement)) {
                return;
            }

            emit("update:modelValue", event.target.value);
        };

        return {
            updateValue,
        };
    },
    template: `
        <responsive-field
            :class-name="fieldClassName"
            :label-text="labelText"
            :label-class="labelClassName"
            :control-id="controlId"
        >
            <input
                :ref="controlRef || null"
                :type="controlType"
                class="text"
                :id="controlId"
                :value="modelValue"
                :placeholder="placeholder || null"
                :readonly="readOnly"
                :aria-label="ariaLabel || null"
                @input="updateValue"
            />
        </responsive-field>
    `,
});

export const ResponsiveTextareaField = defineComponent({
    name: "ResponsiveTextareaField",
    components: {
        ResponsiveField,
    },
    props: {
        fieldClassName: { type: String, required: true },
        labelText: { type: String, required: true },
        labelClassName: { type: String, required: true },
        controlId: { type: String, required: true },
        modelValue: { type: String, default: "" },
        rows: { type: Number, default: 3 },
        ariaLabel: { type: String, default: "" },
        controlRef: { type: [Object, Function], default: null },
    },
    emits: ["update:modelValue"],
    setup(_props, { emit }) {
        const updateValue = (event) => {
            if (!(event.target instanceof HTMLTextAreaElement)) {
                return;
            }

            emit("update:modelValue", event.target.value);
        };

        return {
            updateValue,
        };
    },
    template: `
        <responsive-field
            :class-name="fieldClassName"
            :label-text="labelText"
            :label-class="labelClassName"
            :control-id="controlId"
        >
            <textarea
                :ref="controlRef || null"
                class="text"
                :id="controlId"
                :rows="rows"
                :aria-label="ariaLabel || null"
                :value="modelValue"
                @input="updateValue"
            ></textarea>
        </responsive-field>
    `,
});

export const ResponsiveActionButton = defineComponent({
    name: "ResponsiveActionButton",
    components: {
        ResponsiveBrandIcon,
        ResponsiveMaterialIcon,
    },
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
    },
    emits: ["press"],
    setup(_props, { emit }) {
        const handleClick = (event) => {
            event.preventDefault();

            const target = event.currentTarget;
            if (target instanceof HTMLButtonElement) {
                emit("press", target);
            }
        };

        return {
            handleClick,
        };
    },
    template: `
        <button
            type="button"
            :class="['button', className, variantClass]"
            :id="elementId || null"
            :data-id="dataId || null"
            :aria-label="label"
            :title="label"
            @click="handleClick"
        >
            <responsive-brand-icon
                v-if="iconLibrary === 'brand'"
                :icon-class="iconName"
                extra-class="responsive-brand-icon"
            />
            <responsive-material-icon
                v-else
                :icon-name="iconName"
            />
        </button>
    `,
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

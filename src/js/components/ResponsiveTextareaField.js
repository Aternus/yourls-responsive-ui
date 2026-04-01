import { defineComponent } from "vue";
import { ResponsiveField } from "./ResponsiveField.js";

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

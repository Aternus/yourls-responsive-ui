import { defineCustomElement } from "vue";

export const RuiTextareaField = defineCustomElement(
    {
        name: "RuiTextareaField",
        props: {
            labelText: { type: String, required: true },
            controlId: { type: String, required: true },
            modelValue: { type: String, default: "" },
            rows: { type: Number, default: 3 },
            autoFocus: { type: Boolean, default: false },
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
            <rui-field
                :label-text="labelText"
                :control-id="controlId"
            >
                <textarea
                    :ref="controlRef || null"
                    class="text"
                    :id="controlId"
                    :rows="rows"
                    :autofocus="autoFocus || null"
                    :aria-label="ariaLabel || null"
                    :value="modelValue"
                    @input="updateValue"
                ></textarea>
            </rui-field>
        `,
    },
    { shadowRoot: false },
);

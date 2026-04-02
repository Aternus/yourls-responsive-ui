import { defineCustomElement } from "vue";

export const RuiTextInputField = defineCustomElement(
    {
        name: "RuiTextInputField",
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
                emit("update:modelValue", event.target.value);
            };

            return {
                updateValue,
            };
        },
        template: `
            <rui-field
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
            </rui-field>
        `,
    },
    { shadowRoot: false },
);

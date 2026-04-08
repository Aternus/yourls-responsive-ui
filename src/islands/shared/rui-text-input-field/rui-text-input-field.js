import { defineCustomElement } from "vue";

export const RuiTextInputField = defineCustomElement(
  {
    name: "RuiTextInputField",
    props: {
      labelText: { type: String, required: true },
      controlId: { type: String, required: true },
      modelValue: { type: String, default: "" },
      controlType: { type: String, default: "text" },
      controlClass: { type: String, default: "" },
      autoFocus: { type: Boolean, default: false },
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
    template: /* HTML */ `
      <rui-field :label-text="labelText" :control-id="controlId">
        <input
          :ref="controlRef || null"
          :type="controlType"
          :class="['text', controlClass || null]"
          :id="controlId"
          :value="modelValue"
          :autofocus="autoFocus || null"
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

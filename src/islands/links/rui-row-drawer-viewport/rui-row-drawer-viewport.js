import { defineCustomElement, ref } from "vue";

function ceDetail(event, index = 0) {
  const detail = event?.detail;
  return Array.isArray(detail) ? detail[index] : detail;
}

export const RuiRowDrawerViewport = defineCustomElement(
  {
    name: "RuiRowDrawerViewport",
    props: {
      mode: { type: String, default: "" },
      data: { type: Object, default: null },
      open: { type: Boolean, default: false },
    },
    emits: [
      "save-edit",
      "request-close",
      "confirm-delete",
      "cancel-delete",
      "after-leave",
    ],
    setup(_props, { emit }) {
      const shellRef = ref(null);

      const requestClose = () => {
        emit("request-close");
      };

      const forwardSaveEdit = (event) => {
        emit("save-edit", ceDetail(event, 0), ceDetail(event, 1));
      };

      const forwardConfirmDelete = (event) => {
        emit("confirm-delete", ceDetail(event, 0));
      };

      const forwardCancelDelete = () => {
        emit("cancel-delete");
      };

      const handleAfterLeave = () => {
        emit("after-leave");
      };

      const handleAfterEnter = () => {
        window.requestAnimationFrame(() => {
          const shell = shellRef.value;
          if (!(shell instanceof HTMLElement)) {
            return;
          }

          const primaryControl = shell.querySelector("[autofocus]");
          if (primaryControl instanceof HTMLElement) {
            primaryControl.focus();
          }
        });
      };

      return {
        shellRef,
        requestClose,
        forwardSaveEdit,
        forwardConfirmDelete,
        forwardCancelDelete,
        handleAfterLeave,
        handleAfterEnter,
      };
    },
    template: /* HTML */ `
      <Transition
        name="rui-drawer-surface"
        @after-enter="handleAfterEnter"
        @after-leave="handleAfterLeave"
      >
        <div
          v-if="open && data && mode"
          ref="shellRef"
          class="rui-drawer__shell"
        >
          <rui-edit-panel
            v-if="mode === 'edit'"
            :data="data"
            @save-edit="forwardSaveEdit"
            @close="requestClose"
          />
          <rui-share-panel
            v-else-if="mode === 'share'"
            :data="data"
            @close="requestClose"
          />
          <rui-delete-panel
            v-else-if="mode === 'delete'"
            :data="data"
            @confirm="forwardConfirmDelete"
            @cancel="forwardCancelDelete"
          />
        </div>
      </Transition>
    `,
  },
  { shadowRoot: false },
);

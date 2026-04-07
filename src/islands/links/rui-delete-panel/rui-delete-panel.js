import { defineCustomElement } from "vue";

export const RuiDeletePanel = defineCustomElement(
  {
    name: "RuiDeletePanel",
    props: {
      data: { type: Object, required: true },
    },
    emits: ["confirm", "cancel"],
    setup(_props, { emit }) {
      const confirmDelete = (button) => {
        emit("confirm", button);
      };

      const cancelDelete = () => {
        emit("cancel");
      };

      return {
        confirmDelete,
        cancelDelete,
      };
    },
    template: `
            <rui-drawer title="Delete Link">
                <section class="rui-drawer__content">
                    <rui-drawer-intro
                        icon="warning_amber"
                        title="Review the link details before deleting."
                        meta="Deletion is permanent."
                        variant="error"
                    />
                    <ul class="rui-drawer__delete-list">
                        <li class="rui-drawer__delete-item">
                            <div class="rui-drawer__delete-section">
                                <span class="rui-drawer__label">Short URL</span>
                                <span class="rui-drawer__value rui-drawer__value--mono">{{ data.shortUrl }}</span>
                            </div>
                        </li>
                        <li class="rui-drawer__delete-item">
                            <div class="rui-drawer__delete-section">
                                <span class="rui-drawer__label">Destination URL</span>
                                <span class="rui-drawer__value rui-drawer__value--mono">{{ data.destinationUrl }}</span>
                            </div>
                        </li>
                        <li class="rui-drawer__delete-item">
                            <div class="rui-drawer__delete-section">
                                <span class="rui-drawer__label">Title</span>
                                <span class="rui-drawer__value">{{ data.title }}</span>
                            </div>
                        </li>
                    </ul>
                </section>
                <rui-action-button
                    slot="actions"
                    class="rui-drawer__button rui-drawer__button--destructive"
                    :icon-name="'delete'"
                    :label="'Delete'"
                    @press="confirmDelete"
                />
                <rui-action-button
                    slot="actions"
                    class="rui-drawer__button rui-drawer__button--tonal"
                    :icon-name="'close'"
                    :label="'Cancel'"
                    @press="cancelDelete"
                />
            </rui-drawer>
        `,
  },
  { shadowRoot: false },
);

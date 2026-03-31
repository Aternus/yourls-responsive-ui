import { createApp, h, onMounted } from "vue";

export function mountVueFeature(target, featureName, dataFlag, runFeature) {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    if (target.dataset[dataFlag] === "true") {
        return false;
    }

    const mountPoint = document.createElement("div");
    mountPoint.hidden = true;
    mountPoint.className = `responsive-vue-feature-root ${featureName}`;
    document.body.append(mountPoint);

    createApp({
        name: featureName,
        setup() {
            onMounted(() => {
                runFeature();
            });

            return () => h("span", { hidden: true });
        },
    }).mount(mountPoint);

    target.dataset[dataFlag] = "true";
    return true;
}

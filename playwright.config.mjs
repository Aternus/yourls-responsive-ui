import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
    testDir: "./tests/e2e",
    fullyParallel: true,
    timeout: 30000,
    expect: {
        timeout: 5000,
    },
    reporter: "list",
    use: {
        baseURL: "https://localhost",
        ignoreHTTPSErrors: true,
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "mobile-chromium",
            use: {
                ...devices["Pixel 7"],
            },
        },
    ],
});

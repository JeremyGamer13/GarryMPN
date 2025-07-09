(() => {
    const appNavbar = document.getElementById("app-navbar");
    const appNavbarHome = document.getElementById("app-navbar-home");
    const appBlur = document.getElementById("app-blur");

    const appContent = document.getElementById("app-content");
    const appTab = document.getElementById("app-tab");
    const appSidebar = document.getElementById("app-sidebar");

    // tab buttons
    let activeTab = "none";
    const activeTabUpdated = () => {
        appTab.dataset.selected = activeTab;

        const event = new CustomEvent("garrympn-tab-updated", { detail: activeTab });
        document.dispatchEvent(event);

        for (const child of appTab.getElementsByTagName("div")) {
            if (child.id.startsWith("app-tab")) {
                child.style.display = "none";
            }
        }

        const wantedTab = document.getElementById("app-tab-" + activeTab);
        if (!wantedTab) return;
        wantedTab.style.display = "";
    };
    for (const child of appSidebar.getElementsByTagName("button")) {
        if (!child.dataset.tab) continue;

        const newTab = child.dataset.tab;
        child.onclick = () => {
            if (appBlur.dataset.enabled === "true") return;
            activeTab = newTab;
            activeTabUpdated();
        };
    }
    appNavbarHome.onclick = () => {
        if (appBlur.dataset.enabled === "true") return;
        activeTab = "home";
        activeTabUpdated();
    };

    // default tab is home
    activeTab = "home";
    activeTabUpdated();
})();
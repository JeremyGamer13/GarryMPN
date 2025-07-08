(() => {
    const appBlur = document.getElementById("app-blur");

    const addonInfoText = document.getElementById("inner-addon-info");
    const addonInfoBusy = (id, message, cb, doneMessage) => {
        return new Promise((resolve) => {
            addonInfoText.innerText = message;
            UtilLoader.waitInQueue(id, message, async () => {
                await cb();
                addonInfoText.innerText = doneMessage;
                resolve();
            });
        });
    };
    
    let loadedAddonBuilderBefore = false;
    const loadAddonBuilderFirstTime = async () => {
        if (loadedAddonBuilderBefore) return;
        loadedAddonBuilderBefore = true;

        // check that the cli can be used
        await addonInfoBusy("garrympn-validate-cli", "Validating garrympn-cli.exe, please wait...", async () => {
            const response = await GarryMPN.invokeCli({ echo: "validate" });
            console.log(response);
        }, "This is the Addon Builder menu. See inputs below.");
    };

    document.addEventListener("garrympn-tab-updated", (event) => {
        if (event.detail === "addon") {
            loadAddonBuilderFirstTime();
        }
    });
})();
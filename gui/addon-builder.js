(() => {
    const appBlur = document.getElementById("app-blur");

    const addonInfoText = document.getElementById("inner-addon-info");
    const addonWarningBox = document.getElementById("inner-addon-warning");
    const addonWarningLabel = document.getElementById("inner-addon-warning-label");
    const addonWarningCopy = document.getElementById("inner-addon-warning-copy");
    const addonInfoBusy = (id, message, cb, doneMessage) => {
        return new Promise((resolve, reject) => {
            addonInfoText.innerText = message;
            UtilLoader.waitInQueue(id, message, async () => {
                try {
                    await cb();
                    addonInfoText.innerText = doneMessage;
                } catch (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };
    const addonWarning = (isErr, text) => {
        addonWarningBox.style.display = "";
        addonWarningBox.value = String(String(text) + "\n" + addonWarningBox.value).trim();

        addonWarningLabel.style.display = "";
        addonWarningCopy.style.display = "";
        if (!isErr) {
            addonWarningLabel.style.color = "yellow";
            addonWarningLabel.innerText = "An action left a warning, see the log below.";
        } else {
            addonWarningLabel.style.color = "#faa";
            addonWarningLabel.innerText = "An action left an error, see the log below."
                + "\nMake sure you have installed GarryMPN properly and haven't deleted any of it's files or resources.";
        }
    };
    addonWarningCopy.onclick = () => {
        navigator.clipboard.writeText(addonWarningBox.value);
    };
    
    let loadedAddonBuilderBefore = false;
    const loadAddonBuilderFirstTime = async () => {
        if (loadedAddonBuilderBefore) return;
        loadedAddonBuilderBefore = true;

        // check that the cli can be used
        try {
            await addonInfoBusy("garrympn-validate-cli", "Validating garrympn-cli.exe, please wait...", async () => {
                const testMessage = "validate";
                const { output, warning } = await GarryMPN.invokeCli({ echo: testMessage });
                if (warning) addonWarning(false, warning);
                if (!output) throw new Error("CLI output no message; " + (warning || ""));
                if (output !== testMessage) throw new Error("Test CLI message did not match; " + ([output, warning || ""]).join("\n"));
            }, "This is the Addon Builder menu. See inputs below.");
        } catch (err) {
            // we cant even use this menu in this state, so let it reload incase the bug can be fixed
            loadedAddonBuilderBefore = false;
            addonWarning(true, err);
        }
    };

    document.addEventListener("garrympn-tab-updated", (event) => {
        if (event.detail === "addon") {
            loadAddonBuilderFirstTime();
        }
    });
})();
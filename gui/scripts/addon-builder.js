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
    const addonWarning = (isErr, doAlert, text) => {
        addonWarningBox.style.display = "";
        addonWarningBox.value = String(String(text) + "\n" + addonWarningBox.value).trim();

        addonWarningLabel.style.display = "";
        addonWarningCopy.style.display = "";
        if (!isErr) {
            addonWarningLabel.style.color = "yellow";
            addonWarningLabel.innerText = "An action left a warning, see the log below.";
            if (doAlert) UtilAlert.showAlert("alert", "An action left a warning, see the log.");
        } else {
            addonWarningLabel.style.color = "#faa";
            addonWarningLabel.innerText = "An action left an error, see the log below."
                + "\nMake sure you have installed GarryMPN properly and haven't deleted any of it's files or resources.";
            if (doAlert) UtilAlert.showAlert("alert", "An action left an error, see the log.");
        }
    };
    addonWarningCopy.onclick = async () => {
        await navigator.clipboard.writeText(addonWarningBox.value);
        UtilAlert.showAlert("alert", "Copied to clipboard!");
    };

    // paths
    const inputFolderOutput = document.getElementById("inner-addon-folder-output");
    const inputFolderModels = document.getElementById("inner-addon-folder-models");
    const inputFolderMaterials = document.getElementById("inner-addon-folder-materials");
    for (const input of [inputFolderOutput, inputFolderModels, inputFolderMaterials]) {
        const browseButton = document.getElementById(`${input.id}-browse`);
        if (!browseButton) continue;
        browseButton.onclick = async () => {
            const chosenPath = await GarryMPN.showOpenDialog(input.placeholder);
            if (!chosenPath) return;
            input.value = chosenPath;
        };
    }

    // buttons
    const buttonQuickGenerate = document.getElementById("inner-addon-quick-generate");
    const buttonQuickLocate = document.getElementById("inner-addon-quick-locate");
    const buttonQuickClone = document.getElementById("inner-addon-quick-clone");
    const buttonQuickGuess = document.getElementById("inner-addon-quick-guess");
    const buttonQuickDelete = document.getElementById("inner-addon-quick-delete");
    buttonQuickGenerate.onclick = async () => {
        if (appBlur.dataset.enabled === "true") return;
        // TODO: this
    };
    buttonQuickLocate.onclick = async () => {
        if (appBlur.dataset.enabled === "true") return;
        await GarryMPN.locatePath(inputFolderOutput.value);
    };
    buttonQuickClone.onclick = async () => {
        if (appBlur.dataset.enabled === "true") return;
        // TODO: There needs to be a settings menu with an option to choose the GMod installation, then we can cpf and cpt in the addons folder there
    };
    buttonQuickGuess.onclick = async () => {
        if (appBlur.dataset.enabled === "true") return;
        // TODO: Should have settings for default ID prefixes, then make this use model names & stuff for ids.
    };
    buttonQuickDelete.onclick = async () => {
        if (appBlur.dataset.enabled === "true") return;
        const willDelete = await GarryMPN.question("Are you sure you want to delete the output addon?", "Delete Output Folder", "Yes", "No");
        if (!willDelete) return;
        try {
            await addonInfoBusy("garrympn-delete-addon", "Deleting output addon, please wait...", async () => {
                const { warning } = await GarryMPN.invokeCli({ deladdon: inputFolderOutput.value });
                if (warning) addonWarning(false, true, warning);
            }, "Output addon has been deleted.");
        } catch (err) {
            // its likely that the folder just isnt an addon
            addonWarning(false, false, err);
            UtilAlert.showAlert("info", "Failed to delete the output folder (is it actually a GMod addon?)");
            addonInfoText.innerText = "Failed to delete the output folder (is it actually a GMod addon?)";
        }
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
                if (warning) addonWarning(false, true, warning);
                if (!output) throw new Error("CLI output no message; " + (warning || ""));
                if (output !== testMessage) throw new Error("Test CLI message did not match; " + ([output, warning || ""]).join("\n"));
            }, "This is the Addon Builder menu. See inputs below.");
        } catch (err) {
            // we cant even use this menu in this state, so let it reload incase the bug can be fixed
            loadedAddonBuilderBefore = false;
            addonWarning(true, true, err);
        }
    };

    document.addEventListener("garrympn-tab-updated", (event) => {
        if (event.detail === "addon") {
            loadAddonBuilderFirstTime();
        }
    });
})();
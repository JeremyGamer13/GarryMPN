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
                    if (doneMessage) {
                        addonInfoText.innerText = doneMessage;
                    }
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
            if (doAlert) UtilAlert.showAlert("error", "An action left an error, see the log.");
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
            // make the lists update (the functions will check if we need to reload)
            listMdlFromFolder(inputFolderModels.value);
        };
    }
    inputFolderModels.onblur = () => {
        listMdlFromFolder(inputFolderModels.value);
    };

    // mdl list
    let listMdlTarget = ""; // which folder is loaded right now
    const listMdlOptions = [];
    const listMdlOption = async (modelsFolder, filePath) => {
        const fileName = await path.basename(filePath);
        const extName = await path.extname(filePath);
        const gmodPath = await path.relative(await path.join(modelsFolder, ".."), filePath);
        let nameNoExt = String(fileName.split(".").slice(0, -1).join("."));

        const options = {
            coreModelsFolder: modelsFolder,
            coreFilePath: filePath,
            coreFileName: fileName,
            coreFileExt: extName,
            coreGmodPath: gmodPath,
            coreFileNameNoExt: nameNoExt,
            ignored: false,
            modelName: nameNoExt,
            modelAuthor: "",
            modelAuthorAdded: true,
            makePlayerModel: true,
            makeNpcFriendly: true,
            makeNpcHostile: true,
            handsExist: false,
            handsModel: gmodPath,
            handsHasSkin: false,
            handsSkin: 0,
            handsHasBodyGroups: false,
            handsBodyGroups: "0000000",
            handsMatchBodySkin: false,
            npcFriendlyName: `${nameNoExt} (Friendly)`,
            npcFriendlyIconMake: true,
            npcFriendlyIconPath: "",
            npcFriendlyCategoryCustom: true,
            npcFriendlyCategory: "Other",
            npcFriendlyId: `npc_${nameNoExt.toLowerCase()}_friendly`,
            npcFriendlyIdCustom: true,
            npcFriendlyAdvanced: false,
            npcFriendlyClass: "npc_citizen",
            npcFriendlyHealth: 100,
            npcFriendlyAdminOnly: false,
            npcHostileName: `${nameNoExt} (Hostile)`,
            npcHostileIconMake: true,
            npcHostileIconPath: "",
            npcHostileCategoryCustom: true,
            npcHostileCategory: "Other",
            npcHostileId: `npc_${nameNoExt.toLowerCase()}_hostile`,
            npcHostileIdCustom: true,
            npcHostileAdvanced: false,
            npcHostileClass: "npc_combine",
            npcHostileHealth: 100,
            npcHostileAdminOnly: false,
        };
        return options;
    };
    const listMdlItem = async (filePath, modelsFolder, options) => {
        const fileName = await path.basename(filePath);
        const gmodPath = await path.relative(await path.join(modelsFolder, ".."), filePath);

        const model = document.createElement("div");
        const modelTitle = document.createElement("h3");
        const modelPath = document.createElement("p");
        modelTitle.innerText = fileName;
        modelPath.classList.add("style-small");
        modelPath.classList.add("style-far");
        modelPath.innerText = gmodPath;

        // make sections
        const sectionModel = document.createElement("div");
        const sectionPlayer = document.createElement("div");
        const sectionNpcFriendly = document.createElement("div");
        const sectionNpcHostile = document.createElement("div");

        // make inputs
        // default & model section
        const labelIgnored = document.createElement("label");
        const ignored = document.createElement("input");
        ignored.type = "checkbox";
        ignored.onblur = () => { options.ignored = ignored.checked; updated(); };
        ignored.onchange = () => { options.ignored = ignored.checked; updated(); };
        ignored.checked = options.ignored;
        labelIgnored.appendChild(ignored);
        labelIgnored.appendChild(document.createTextNode("Don't process model?"));
        const labelModelName = document.createElement("label");
        const modelName = document.createElement("input");
        labelModelName.innerText = "Name:";
        modelName.type = "text";
        modelName.onblur = () => { options.modelName = modelName.value; updated(); };
        modelName.oninput = () => { options.modelName = modelName.value; updated(); };
        modelName.value = options.modelName;
        labelModelName.appendChild(modelName);
        sectionModel.appendChild(labelModelName);
        const labelModelAuthor = document.createElement("label");
        const checkboxModelAuthor = document.createElement("input");
        const modelAuthor = document.createElement("input");
        labelModelAuthor.innerText = "Author:";
        checkboxModelAuthor.type = "checkbox";
        checkboxModelAuthor.onblur = () => { options.modelAuthorAdded = checkboxModelAuthor.checked; updated(); };
        checkboxModelAuthor.onchange = () => { options.modelAuthorAdded = checkboxModelAuthor.checked; updated(); };
        checkboxModelAuthor.checked = options.modelAuthorAdded;
        modelAuthor.type = "text";
        modelAuthor.onblur = () => { options.modelAuthor = modelAuthor.value; updated(); };
        modelAuthor.oninput = () => { options.modelAuthor = modelAuthor.value; updated(); };
        modelAuthor.value = options.modelAuthor;
        labelModelAuthor.appendChild(checkboxModelAuthor);
        labelModelAuthor.appendChild(modelAuthor);
        sectionModel.appendChild(labelModelAuthor);
        const labelMakePlayerModel = document.createElement("label");
        const makePlayerModel = document.createElement("input");
        makePlayerModel.type = "checkbox";
        makePlayerModel.onblur = () => { options.makePlayerModel = makePlayerModel.checked; updated(); };
        makePlayerModel.onchange = () => { options.makePlayerModel = makePlayerModel.checked; updated(); };
        makePlayerModel.checked = options.makePlayerModel;
        labelMakePlayerModel.appendChild(makePlayerModel);
        labelMakePlayerModel.appendChild(document.createTextNode("Make Player Model?"));
        sectionModel.appendChild(labelMakePlayerModel);
        const labelMakeNpcFriendly = document.createElement("label");
        const makeNpcFriendly = document.createElement("input");
        makeNpcFriendly.type = "checkbox";
        makeNpcFriendly.onblur = () => { options.makeNpcFriendly = makeNpcFriendly.checked; updated(); };
        makeNpcFriendly.onchange = () => { options.makeNpcFriendly = makeNpcFriendly.checked; updated(); };
        makeNpcFriendly.checked = options.makeNpcFriendly;
        labelMakeNpcFriendly.appendChild(makeNpcFriendly);
        labelMakeNpcFriendly.appendChild(document.createTextNode("Make Friendly NPC?"));
        sectionModel.appendChild(labelMakeNpcFriendly);
        const labelMakeNpcHostile = document.createElement("label");
        const makeNpcHostile = document.createElement("input");
        makeNpcHostile.type = "checkbox";
        makeNpcHostile.onblur = () => { options.makeNpcHostile = makeNpcHostile.checked; updated(); };
        makeNpcHostile.onchange = () => { options.makeNpcHostile = makeNpcHostile.checked; updated(); };
        makeNpcHostile.checked = options.makeNpcHostile;
        labelMakeNpcHostile.appendChild(makeNpcHostile);
        labelMakeNpcHostile.appendChild(document.createTextNode("Make Hostile NPC?"));
        sectionModel.appendChild(labelMakeNpcHostile);
        // other sections
        sectionModel.appendChild(sectionPlayer);
        sectionModel.appendChild(sectionNpcFriendly);
        sectionModel.appendChild(sectionNpcHostile);
        // playermodel
        const labelHandsModel = document.createElement("label");
        const checkboxHandsModel = document.createElement("input");
        const handsModel = document.createElement("input");
        labelHandsModel.innerText = "Hands:";
        checkboxHandsModel.type = "checkbox";
        checkboxHandsModel.onblur = () => { options.handsExist = checkboxHandsModel.checked; updated(); };
        checkboxHandsModel.onchange = () => { options.handsExist = checkboxHandsModel.checked; updated(); };
        checkboxHandsModel.checked = options.handsExist;
        handsModel.type = "text";
        handsModel.onblur = () => { options.handsModel = handsModel.value; updated(); };
        handsModel.oninput = () => { options.handsModel = handsModel.value; updated(); };
        handsModel.value = options.handsModel;
        labelHandsModel.appendChild(checkboxHandsModel);
        labelHandsModel.appendChild(handsModel);
        sectionPlayer.appendChild(labelHandsModel);
        const labelHandsSkin = document.createElement("label");
        const checkboxHandsSkin = document.createElement("input");
        const handsSkin = document.createElement("input");
        labelHandsSkin.innerText = "Hands Skin:";
        checkboxHandsSkin.type = "checkbox";
        checkboxHandsSkin.onblur = () => { options.handsHasSkin = checkboxHandsSkin.checked; updated(); };
        checkboxHandsSkin.onchange = () => { options.handsHasSkin = checkboxHandsSkin.checked; updated(); };
        checkboxHandsSkin.checked = options.handsHasSkin;
        handsSkin.type = "number";
        handsSkin.onblur = () => { options.handsSkin = handsSkin.value; updated(); };
        handsSkin.oninput = () => { options.handsSkin = handsSkin.value; updated(); };
        handsSkin.value = options.handsSkin;
        handsSkin.min = "0";
        labelHandsSkin.appendChild(checkboxHandsSkin);
        labelHandsSkin.appendChild(handsSkin);
        sectionPlayer.appendChild(labelHandsSkin);
        const labelHandsBodyGroups = document.createElement("label");
        const checkboxHandsBodyGroups = document.createElement("input");
        const handsBodyGroups = document.createElement("input");
        labelHandsBodyGroups.innerText = "Hands Body Groups:";
        checkboxHandsBodyGroups.type = "checkbox";
        checkboxHandsBodyGroups.onblur = () => { options.handsHasBodyGroups = checkboxHandsBodyGroups.checked; updated(); };
        checkboxHandsBodyGroups.onchange = () => { options.handsHasBodyGroups = checkboxHandsBodyGroups.checked; updated(); };
        checkboxHandsBodyGroups.checked = options.handsHasBodyGroups;
        handsBodyGroups.type = "text";
        handsBodyGroups.onblur = () => { options.handsBodyGroups = handsBodyGroups.value; updated(); };
        handsBodyGroups.oninput = () => { options.handsBodyGroups = handsBodyGroups.value; updated(); };
        handsBodyGroups.value = options.handsBodyGroups;
        labelHandsBodyGroups.appendChild(checkboxHandsBodyGroups);
        labelHandsBodyGroups.appendChild(handsBodyGroups);
        sectionPlayer.appendChild(labelHandsBodyGroups);
        const labelhandsMatchBodySkin = document.createElement("label");
        const handsMatchBodySkin = document.createElement("input");
        handsMatchBodySkin.type = "checkbox";
        handsMatchBodySkin.onblur = () => { options.handsMatchBodySkin = handsMatchBodySkin.checked; updated(); };
        handsMatchBodySkin.onchange = () => { options.handsMatchBodySkin = handsMatchBodySkin.checked; updated(); };
        handsMatchBodySkin.checked = options.handsMatchBodySkin;
        labelhandsMatchBodySkin.appendChild(handsMatchBodySkin);
        labelhandsMatchBodySkin.appendChild(document.createTextNode("Hands Match Body Skin?"));
        sectionPlayer.appendChild(labelhandsMatchBodySkin);
        // npc friendly
        const labelNpcFriendlyName = document.createElement("label");
        const npcFriendlyName = document.createElement("input");
        labelNpcFriendlyName.innerText = "Friendly NPC Name:";
        npcFriendlyName.type = "text";
        npcFriendlyName.onblur = () => { options.npcFriendlyName = npcFriendlyName.value; updated(); };
        npcFriendlyName.oninput = () => { options.npcFriendlyName = npcFriendlyName.value; updated(); };
        npcFriendlyName.value = options.npcFriendlyName;
        labelNpcFriendlyName.appendChild(npcFriendlyName);
        sectionNpcFriendly.appendChild(labelNpcFriendlyName);
        const labelNpcFriendlyIconPath = document.createElement("label");
        const checkboxNpcFriendlyIconPath = document.createElement("input");
        const browseNpcFriendlyIconPath = document.createElement("button");
        const npcFriendlyIconPath = document.createElement("input");
        labelNpcFriendlyIconPath.innerText = "Friendly NPC Icon:";
        checkboxNpcFriendlyIconPath.type = "checkbox";
        checkboxNpcFriendlyIconPath.onblur = () => { options.npcFriendlyIconMake = checkboxNpcFriendlyIconPath.checked; updated(); };
        checkboxNpcFriendlyIconPath.onchange = () => { options.npcFriendlyIconMake = checkboxNpcFriendlyIconPath.checked; updated(); };
        checkboxNpcFriendlyIconPath.checked = options.npcFriendlyIconMake;
        browseNpcFriendlyIconPath.innerText = "Browse";
        browseNpcFriendlyIconPath.onclick = async () => {
            const chosenPath = await GarryMPN.showOpenDialog(npcFriendlyIconPath.placeholder);
            if (!chosenPath) return;
            npcFriendlyIconPath.value = chosenPath;
            updated();
        };
        npcFriendlyIconPath.type = "text";
        npcFriendlyIconPath.onblur = () => { options.npcFriendlyIconPath = npcFriendlyIconPath.value; updated(); };
        npcFriendlyIconPath.oninput = () => { options.npcFriendlyIconPath = npcFriendlyIconPath.value; updated(); };
        npcFriendlyIconPath.value = options.npcFriendlyIconPath;
        npcFriendlyIconPath.placeholder = "NPC Icon PNG path";
        labelNpcFriendlyIconPath.appendChild(checkboxNpcFriendlyIconPath);
        labelNpcFriendlyIconPath.appendChild(browseNpcFriendlyIconPath);
        labelNpcFriendlyIconPath.appendChild(npcFriendlyIconPath);
        sectionNpcFriendly.appendChild(labelNpcFriendlyIconPath);
        const labelNpcFriendlyCategory = document.createElement("label");
        const checkboxNpcFriendlyCategory = document.createElement("input");
        const npcFriendlyCategory = document.createElement("input");
        labelNpcFriendlyCategory.innerText = "Friendly NPC Category:";
        checkboxNpcFriendlyCategory.type = "checkbox";
        checkboxNpcFriendlyCategory.onblur = () => { options.npcFriendlyCategoryCustom = checkboxNpcFriendlyCategory.checked; updated(); };
        checkboxNpcFriendlyCategory.onchange = () => { options.npcFriendlyCategoryCustom = checkboxNpcFriendlyCategory.checked; updated(); };
        checkboxNpcFriendlyCategory.checked = options.npcFriendlyCategoryCustom;
        npcFriendlyCategory.type = "text";
        npcFriendlyCategory.onblur = () => { options.npcFriendlyCategory = npcFriendlyCategory.value; updated(); };
        npcFriendlyCategory.oninput = () => { options.npcFriendlyCategory = npcFriendlyCategory.value; updated(); };
        npcFriendlyCategory.value = options.npcFriendlyCategory;
        labelNpcFriendlyCategory.appendChild(checkboxNpcFriendlyCategory);
        labelNpcFriendlyCategory.appendChild(npcFriendlyCategory);
        sectionNpcFriendly.appendChild(labelNpcFriendlyCategory);
        const labelNpcFriendlyId = document.createElement("label");
        const checkboxNpcFriendlyId = document.createElement("input");
        const npcFriendlyId = document.createElement("input");
        labelNpcFriendlyId.innerText = "Friendly NPC Custom ID:";
        checkboxNpcFriendlyId.type = "checkbox";
        checkboxNpcFriendlyId.onblur = () => { options.npcFriendlyIdCustom = checkboxNpcFriendlyId.checked; updated(); };
        checkboxNpcFriendlyId.onchange = () => { options.npcFriendlyIdCustom = checkboxNpcFriendlyId.checked; updated(); };
        checkboxNpcFriendlyId.checked = options.npcFriendlyIdCustom;
        npcFriendlyId.type = "text";
        npcFriendlyId.onblur = () => { options.npcFriendlyId = npcFriendlyId.value; updated(); };
        npcFriendlyId.oninput = () => { options.npcFriendlyId = npcFriendlyId.value; updated(); };
        npcFriendlyId.value = options.npcFriendlyId;
        labelNpcFriendlyId.appendChild(checkboxNpcFriendlyId);
        labelNpcFriendlyId.appendChild(npcFriendlyId);
        sectionNpcFriendly.appendChild(labelNpcFriendlyId);
        const labelNpcFriendlyAdvanced = document.createElement("label");
        const npcFriendlyAdvanced = document.createElement("input");
        npcFriendlyAdvanced.type = "checkbox";
        npcFriendlyAdvanced.onblur = () => { options.npcFriendlyAdvanced = npcFriendlyAdvanced.checked; updated(); };
        npcFriendlyAdvanced.onchange = () => { options.npcFriendlyAdvanced = npcFriendlyAdvanced.checked; updated(); };
        npcFriendlyAdvanced.checked = options.npcFriendlyAdvanced;
        labelNpcFriendlyAdvanced.appendChild(npcFriendlyAdvanced);
        labelNpcFriendlyAdvanced.appendChild(document.createTextNode("Friendly NPC: Advanced Customization?"));
        sectionNpcFriendly.appendChild(labelNpcFriendlyAdvanced);
        const labelNpcFriendlyClass = document.createElement("label");
        const npcFriendlyClass = document.createElement("input");
        labelNpcFriendlyClass.innerText = "Friendly NPC Class:";
        npcFriendlyClass.type = "text";
        npcFriendlyClass.onblur = () => { options.npcFriendlyClass = npcFriendlyClass.value; updated(); };
        npcFriendlyClass.oninput = () => { options.npcFriendlyClass = npcFriendlyClass.value; updated(); };
        npcFriendlyClass.value = options.npcFriendlyClass;
        labelNpcFriendlyClass.appendChild(npcFriendlyClass);
        sectionNpcFriendly.appendChild(labelNpcFriendlyClass);
        const labelNpcFriendlyHealth = document.createElement("label");
        const npcFriendlyHealth = document.createElement("input");
        labelNpcFriendlyHealth.innerText = "Friendly NPC Health:";
        npcFriendlyHealth.type = "number";
        npcFriendlyHealth.onblur = () => { options.npcFriendlyHealth = npcFriendlyHealth.value; updated(); };
        npcFriendlyHealth.oninput = () => { options.npcFriendlyHealth = npcFriendlyHealth.value; updated(); };
        npcFriendlyHealth.value = options.npcFriendlyHealth;
        npcFriendlyHealth.min = "0";
        labelNpcFriendlyHealth.appendChild(npcFriendlyHealth);
        sectionNpcFriendly.appendChild(labelNpcFriendlyHealth);
        const labelNpcFriendlyAdminOnly = document.createElement("label");
        const npcFriendlyAdminOnly = document.createElement("input");
        npcFriendlyAdminOnly.type = "checkbox";
        npcFriendlyAdminOnly.onblur = () => { options.npcFriendlyAdminOnly = npcFriendlyAdminOnly.checked; updated(); };
        npcFriendlyAdminOnly.onchange = () => { options.npcFriendlyAdminOnly = npcFriendlyAdminOnly.checked; updated(); };
        npcFriendlyAdminOnly.checked = options.npcFriendlyAdminOnly;
        labelNpcFriendlyAdminOnly.appendChild(npcFriendlyAdminOnly);
        labelNpcFriendlyAdminOnly.appendChild(document.createTextNode("Friendly NPC is Admin Only?"));
        sectionNpcFriendly.appendChild(labelNpcFriendlyAdminOnly);
        // npc hostile

        const updated = () => {
            // sections
            sectionModel.style.display = options.ignored ? "none" : "";
            sectionPlayer.style.display = !options.makePlayerModel ? "none" : "";
            sectionNpcFriendly.style.display = !options.makeNpcFriendly ? "none" : "";
            sectionNpcHostile.style.display = !options.makeNpcHostile ? "none" : "";

            // hide input sections (labels)
            labelHandsSkin.style.display = !options.handsExist ? "none" : "";
            labelHandsBodyGroups.style.display = !options.handsExist ? "none" : "";
            labelhandsMatchBodySkin.style.display = !options.handsExist ? "none" : "";
            labelNpcFriendlyClass.style.display = !options.npcFriendlyAdvanced ? "none" : "";
            labelNpcFriendlyHealth.style.display = !options.npcFriendlyAdvanced ? "none" : "";
            labelNpcFriendlyAdminOnly.style.display = !options.npcFriendlyAdvanced ? "none" : "";

            // hide inputs
            modelAuthor.style.display = !options.modelAuthorAdded ? "none" : "";
            handsModel.style.display = !options.handsExist ? "none" : "";
            handsSkin.style.display = !options.handsHasSkin ? "none" : "";
            handsBodyGroups.style.display = !options.handsHasBodyGroups ? "none" : "";
            browseNpcFriendlyIconPath.style.display = !options.npcFriendlyIconMake ? "none" : "";
            npcFriendlyIconPath.style.display = !options.npcFriendlyIconMake ? "none" : "";
            npcFriendlyCategory.style.display = !options.npcFriendlyCategoryCustom ? "none" : "";
            npcFriendlyId.style.display = !options.npcFriendlyIdCustom ? "none" : "";
        };

        // add all of the children
        model.appendChild(modelTitle);
        model.appendChild(modelPath);
        model.appendChild(labelIgnored);
        model.appendChild(sectionModel);
        updated();
        return model;
    };
    const listMdlFromFolder = async (modelsFolder) => {
        if (listMdlTarget === modelsFolder) return;
        listMdlTarget = modelsFolder;
        console.log("Needs to load MDL folder");

        const mdlList = document.getElementById("inner-addon-model-list");
        const mdlListDetail = document.getElementById("inner-addon-model-list-detail");
        mdlListDetail.style.display = "none";
        await addonInfoBusy("garrympn-addon-list-mdl", "Reading models folder...", async () => {
            // read folder
            const folderContents = await GarryMPN.readFolder(modelsFolder);
            const mdlContents = folderContents.filter(file => file.endsWith(".mdl"));
            if (mdlContents.length <= 0) {
                mdlListDetail.style.display = "";
                if (folderContents.some(file => file.endsWith(".qc") || file.endsWith(".smd"))) {
                    mdlListDetail.innerText = "No MDL files found. Note that a QC or SMD file was found, make sure this folder contains a compiled MDL model.";
                } else {
                    mdlListDetail.innerText = "No MDL files found.";
                }
            }

            // for each model, make the options & then elements & stuff
            listMdlOptions.splice(0, listMdlOptions.length);

            mdlList.innerHTML = "";
            for (const model of mdlContents) {
                // make options
                const options = await listMdlOption(modelsFolder, model);
                listMdlOptions.push(options);

                // make element
                const element = await listMdlItem(model, modelsFolder, options);
                mdlList.appendChild(element);
            }

            // done
            UtilAlert.showAlert("alert", "Models found, adjust settings for the addon.");
        }, "View the models list for options.");
    }; 

    // buttons
    const buttonQuickGenerate = document.getElementById("inner-addon-quick-generate");
    const buttonQuickLocate = document.getElementById("inner-addon-quick-locate");
    const buttonQuickClone = document.getElementById("inner-addon-quick-clone");
    const buttonQuickGuess = document.getElementById("inner-addon-quick-guess");
    const buttonQuickDelete = document.getElementById("inner-addon-quick-delete");
    buttonQuickGenerate.onclick = async () => {
        if (appBlur.dataset.enabled === "true") return;
        try {
            await generateAddon();
        } catch (err) {
            addonWarning(true, true, err);
            addonInfoText.innerText = "Failed to generate addon";
            return;
        }

        UtilAlert.showAlert("alert", "Addon generated! Check the output folder.");
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
    
    // big logic
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

    const generateAddon = async () => {
        const outputFolder = inputFolderOutput.value;
        const modelsFolder = inputFolderModels.value;
        const materialsFolder = inputFolderMaterials.value;
        // validate stuff
        if (!outputFolder) throw new Error("Enter a valid output folder.");
        if (!modelsFolder) throw new Error("Enter a valid models folder.");
        if (!materialsFolder) throw new Error("Enter a valid materials folder.");
        // prep
        const luaFolder = await path.join(outputFolder, "lua/autorun/");
        await addonInfoBusy("garrympn-addon-build-prepare", "Preparing addon folder...", async () => {
            // make the output folder if it doesnt exist
            await GarryMPN.invokeCli({ mkdir: outputFolder });
            // copy the models folder to the output folder
            const targetModelsFolder = await path.join(outputFolder, "models/");
            await GarryMPN.invokeCli({ cpf: modelsFolder, cpt: targetModelsFolder });
            // copy the materials folder to the output folder
            const targetMaterialsFolder = await path.join(outputFolder, "materials/");
            await GarryMPN.invokeCli({ cpf: materialsFolder, cpt: targetMaterialsFolder });
            // make lua folder
            await GarryMPN.invokeCli({ mkdir: luaFolder });
        });
        for (const mdl of listMdlOptions) {
            if (mdl.ignored) continue;
            // make lua
            const modelId = mdl.coreFileNameNoExt;
            const randomId = `${Math.random() * 99999999}`.replace(/\./g, "");
            const luaName = `model_${modelId.replace(/[^a-z0-9]/g, "_")}_${randomId}.lua`;
            const luaPath = await path.join(luaFolder, luaName);
            await addonInfoBusy("garrympn-addon-build-lua", `Generating lua file "${luaName}"`, async () => {
                const options = {};
                options.lua = luaPath;
                // user options
                // player model
                if (mdl.makePlayerModel) {
                    options.luapm = await slash(mdl.coreGmodPath);
                    options.luapmn = mdl.modelName;
                    if (mdl.handsExist) {
                        options.luaph = await slash(mdl.handsModel);
                    }
                    if (mdl.handsHasSkin) {
                        options.luaphs = mdl.handsSkin;
                    }
                    if (mdl.handsHasBodyGroups) {
                        options.luaphb = mdl.handsBodyGroups;
                    }
                    if (mdl.handsMatchBodySkin) {
                        options.luaphm = mdl.handsMatchBodySkin;
                    }
                }
                // npc friendly
                if (mdl.makeNpcFriendly) {
                    options.luanf = !mdl.npcFriendlyIdCustom ? `npc_${mdl.coreFileNameNoExt.toLowerCase()}_friendly` : mdl.npcFriendlyId;
                    options.luanfn = mdl.npcFriendlyName;
                    options.luanfm = await slash(mdl.coreGmodPath);
                    options.luanfct = !mdl.npcFriendlyCategoryCustom ? "Other" : mdl.npcFriendlyCategory;
                    if (mdl.modelAuthorAdded) {
                        options.luanfa = mdl.modelAuthor;
                    }
                    if (mdl.npcFriendlyAdvanced) {
                        options.luanfc = mdl.npcFriendlyClass;
                        options.luanfh = mdl.npcFriendlyHealth;
                        options.luanfao = mdl.npcFriendlyAdminOnly;
                    }
                }
                // npc hostile
                if (mdl.makeNpcHostile) {
                    options.luanh = !mdl.npcHostileIdCustom ? `npc_${mdl.coreFileNameNoExt.toLowerCase()}_hostile` : mdl.npcHostileId;
                    options.luanhn = mdl.npcHostileName;
                    options.luanhm = await slash(mdl.coreGmodPath);
                    options.luanhct = !mdl.npcHostileCategoryCustom ? "Other" : mdl.npcHostileCategory;
                    if (mdl.modelAuthorAdded) {
                        options.luanha = mdl.modelAuthor;
                    }
                    if (mdl.npcHostileAdvanced) {
                        options.luanhc = mdl.npcHostileClass;
                        options.luanhh = mdl.npcHostileHealth;
                        options.luanhct = mdl.npcHostileCategory;
                        options.luanhao = mdl.npcHostileAdminOnly;
                    }
                }
                // cli
                const { output, warning } = await GarryMPN.invokeCli(options);
                if (warning) addonWarning(false, true, warning);
            });
            // make icons
        }
    };

    document.addEventListener("garrympn-tab-updated", (event) => {
        if (event.detail === "addon") {
            loadAddonBuilderFirstTime();
        }
    });
})();
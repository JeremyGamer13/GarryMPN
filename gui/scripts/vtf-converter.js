(() => {
    const appBlur = document.getElementById("app-blur");

    const vtfInfoText = document.getElementById("inner-vtf-info");
    const vtfWarningBox = document.getElementById("inner-vtf-warning");
    const vtfWarningLabel = document.getElementById("inner-vtf-warning-label");
    const vtfWarningCopy = document.getElementById("inner-vtf-warning-copy");
    const vtfInfoBusy = (id, message, cb, doneMessage) => {
        return new Promise((resolve, reject) => {
            vtfInfoText.innerText = message;
            UtilLoader.waitInQueue(id, message, async () => {
                try {
                    await cb();
                    if (doneMessage) {
                        vtfInfoText.innerText = doneMessage;
                    }
                } catch (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    };
    const vtfWarning = (isErr, doAlert, text) => {
        vtfWarningBox.style.display = "";
        vtfWarningBox.value = String(String(text) + "\n" + vtfWarningBox.value).trim();

        vtfWarningLabel.style.display = "";
        vtfWarningCopy.style.display = "";
        if (!isErr) {
            vtfWarningLabel.style.color = "yellow";
            vtfWarningLabel.innerText = "An action left a warning, see the log below.";
            if (doAlert) UtilAlert.showAlert("alert", "An action left a warning, see the log.");
        } else {
            vtfWarningLabel.style.color = "#faa";
            vtfWarningLabel.innerText = "An action left an error, see the log below."
                + "\nMake sure you have installed GarryMPN properly and haven't deleted any of it's files or resources.";
            if (doAlert) UtilAlert.showAlert("error", "An action left an error, see the log.");
        }
    };
    vtfWarningCopy.onclick = async () => {
        await navigator.clipboard.writeText(vtfWarningBox.value);
        UtilAlert.showAlert("alert", "Copied to clipboard!");
    };

    // paths
    const inputFolderOutput = document.getElementById("inner-vtf-folder-output");
    const inputFolderImages = document.getElementById("inner-vtf-folder-images");
    for (const input of [
        inputFolderOutput,
        inputFolderImages,
    ]) {
        const browseButton = document.getElementById(`${input.id}-browse`);
        if (!browseButton) continue;
        browseButton.onclick = async () => {
            const chosenPath = await GarryMPN.showOpenFolderDialog(input.placeholder);
            if (!chosenPath) return;
            input.value = chosenPath;
            // for convenience the oputput folder is also the input image folder if it wasnt set
            if (!inputFolderOutput.value) inputFolderOutput.value = inputFolderImages.value;
            // make the lists update (the functions will check if we need to reload)
            listImagesFromFolder(inputFolderImages.value);
        };
    }
    inputFolderImages.onblur = () => {
        if (!inputFolderOutput.value) inputFolderOutput.value = inputFolderImages.value;
        listImagesFromFolder(inputFolderImages.value);
    };

    // image list
    let listImagesTarget = ""; // which folder is loaded right now
    const listImagesOptions = [];
    const listImagesOption = async (imagesFolder, filePath) => {
        const fileName = await path.basename(filePath);
        const extName = await path.extname(filePath);
        let nameNoExt = String(fileName.split(".").slice(0, -1).join("."));

        const outputFolder = inputFolderOutput.value;
        const relativeToImageFolder = await path.relative(imagesFolder, filePath);
        const outputImageFolder = await path.join(outputFolder, await path.dirname(relativeToImageFolder));

        const options = {
            coreImagesFolder: imagesFolder,
            coreFilePath: filePath,
            coreFileName: fileName,
            coreFileExt: extName,
            coreFileNameNoExt: nameNoExt,
            ignored: false,
            texturePath: outputImageFolder,
            texturePreset: "CompressedAlpha",
            notUsingPreset: false,
        };
        return options;
    };
    const listImagesItem = async (filePath, imagesFolder, options) => {
        const fileName = await path.basename(filePath);

        const texture = document.createElement("div");
        const textureTitle = document.createElement("h3");
        const texturePathDisplay = document.createElement("p");
        textureTitle.innerText = fileName;
        texturePathDisplay.classList.add("style-small");
        texturePathDisplay.classList.add("style-far");
        texturePathDisplay.innerText = filePath;

        // make sections
        const sectionTexture = document.createElement("div");

        // make inputs
        // default & texture section
        const labelIgnored = document.createElement("label");
        const ignored = document.createElement("input");
        ignored.type = "checkbox";
        ignored.onblur = () => { options.ignored = ignored.checked; updated(); };
        ignored.onchange = () => { options.ignored = ignored.checked; updated(); };
        ignored.checked = options.ignored;
        labelIgnored.appendChild(ignored);
        labelIgnored.appendChild(document.createTextNode("Don't make VTF?"));
        const labelTexturePath = document.createElement("label");
        const texturePath = document.createElement("input");
        labelTexturePath.innerText = "Save to folder:";
        texturePath.type = "text";
        texturePath.onblur = () => { options.texturePath = texturePath.value; updated(); };
        texturePath.oninput = () => { options.texturePath = texturePath.value; updated(); };
        texturePath.value = options.texturePath;
        labelTexturePath.appendChild(texturePath);
        sectionTexture.appendChild(labelTexturePath);
        const labelTexturePreset = document.createElement("label");
        const texturePreset = document.createElement("select");
        labelTexturePreset.innerText = "Preset:";
        texturePreset.onblur = () => { options.texturePreset = texturePreset.value; updated(); };
        texturePreset.onchange = () => { options.texturePreset = texturePreset.value; updated(); };
        texturePreset.value = options.texturePreset;
        const optionTexturePresetCompressedAlpha = document.createElement("option");
        optionTexturePresetCompressedAlpha.innerText = "Compressed with Alpha";
        optionTexturePresetCompressedAlpha.value = "CompressedAlpha";
        const optionTexturePresetCompressed = document.createElement("option");
        optionTexturePresetCompressed.innerText = "Compressed without Alpha";
        optionTexturePresetCompressed.value = "Compressed";
        const optionTexturePresetGenericHigh = document.createElement("option");
        optionTexturePresetGenericHigh.innerText = "Generic (High Filesize)";
        optionTexturePresetGenericHigh.value = "GenericHigh";
        const optionTexturePresetUncompressedAlpha = document.createElement("option");
        optionTexturePresetUncompressedAlpha.innerText = "Uncompressed with Alpha";
        optionTexturePresetUncompressedAlpha.value = "UncompressedAlpha";
        const optionTexturePresetUncompressed = document.createElement("option");
        optionTexturePresetUncompressed.innerText = "Uncompressed without Alpha";
        optionTexturePresetUncompressed.value = "Uncompressed";
        texturePreset.appendChild(optionTexturePresetCompressedAlpha);
        texturePreset.appendChild(optionTexturePresetCompressed);
        texturePreset.appendChild(optionTexturePresetGenericHigh);
        texturePreset.appendChild(optionTexturePresetUncompressedAlpha);
        texturePreset.appendChild(optionTexturePresetUncompressed);
        labelTexturePreset.appendChild(texturePreset);
        sectionTexture.appendChild(labelTexturePreset);

        const updated = () => {
            // sections
            sectionTexture.style.display = options.ignored ? "none" : "";
        };

        // add all of the children
        texture.appendChild(textureTitle);
        texture.appendChild(texturePathDisplay);
        texture.appendChild(labelIgnored);
        texture.appendChild(sectionTexture);
        updated();
        return texture;
    };
    const listImagesFromFolder = async (imagesFolder) => {
        if (listImagesTarget === imagesFolder) return;
        listImagesTarget = imagesFolder;
        console.log("Needs to load images folder");

        const imagesList = document.getElementById("inner-vtf-image-list");
        const imagesListDetail = document.getElementById("inner-vtf-image-list-detail");
        imagesListDetail.style.display = "none";
        await vtfInfoBusy("garrympn-vtf-list-images", "Reading images folder...", async () => {
            // read folder
            const outputFolder = inputFolderOutput.value;
            const folderContents = await GarryMPN.readFolder(imagesFolder);
            const outputContents = outputFolder ? (await GarryMPN.readFolder(outputFolder)) : [];
            const vtfContents = folderContents.filter(file => file.endsWith(".png")
                || file.endsWith("jpeg")
                || file.endsWith("jpg")
                || file.endsWith("bmp"));
            imagesListDetail.style.display = "";
            listImagesOptions.splice(0, listImagesOptions.length);
            imagesList.innerHTML = "";

            if (vtfContents.length <= 0) {
                imagesListDetail.innerText = "No image textures found.";
                return;
            } else {
                imagesListDetail.innerText = "Textures List";
            }

            // for each texture, make the options & then elements & stuff
            for (const texture of vtfContents) {
                // make options
                const nameNoExt = String(texture.split(".").slice(0, -1).join("."));
                // extremely rushed this hasExistingVtf code so it probably does like 80 redundant things
                const relativeToImageFolder = await path.relative(imagesFolder, texture);
                const outputImageFolder = await path.join(outputFolder, await path.dirname(relativeToImageFolder));
                const outputImage = await path.join(outputImageFolder, await path.basename(nameNoExt + ".vtf"));
                const hasExistingVtf = outputContents.includes(outputImage);
                
                const options = await listImagesOption(imagesFolder, texture);
                if (hasExistingVtf) {
                    options.ignored = true;
                }
                listImagesOptions.push(options);

                // make element
                const element = await listImagesItem(texture, imagesFolder, options);
                imagesList.appendChild(element);
            }

            // done
            UtilAlert.showAlert("alert", "Images found, adjust settings to generate VTFs.");
        }, "View the textures list for options.");
    };

    // buttons
    const buttonQuickGenerate = document.getElementById("inner-vtf-quick-generate");
    const buttonQuickLocate = document.getElementById("inner-vtf-quick-locate");
    buttonQuickGenerate.onclick = async () => {
        if (appBlur.dataset.enabled === "true") return;
        try {
            await generateVtfs();
        } catch (err) {
            vtfWarning(true, true, err);
            vtfInfoText.innerText = "Failed to generate VTFs";
            return;
        }

        UtilAlert.showAlert("alert", "VTFs generated! Check the output folder.");
    };
    buttonQuickLocate.onclick = async () => {
        if (appBlur.dataset.enabled === "true") return;
        await GarryMPN.locatePath(inputFolderOutput.value);
    };

    // big logic
    let loadedVtfConverterBefore = false;
    const loadVtfConverterFirstTime = async () => {
        if (loadedVtfConverterBefore) return;
        loadedVtfConverterBefore = true;

        // check that the cli can be used
        try {
            await vtfInfoBusy("garrympn-validate-vtfcmd", "Validating VTFCmd.exe, please wait...", async () => {
                const { output, warning } = await GarryMPN.invokeVtfCmd({ "-help": "" });
                if (warning) vtfWarning(false, true, warning);
                if (!output) throw new Error("VTFCmd output no message; " + (warning || ""));
            }, "This is the VTF Converter menu. You can use this menu to create VTF textures from images. See inputs below.");
        } catch (err) {
            // we cant even use this menu in this state, so let it reload incase the bug can be fixed
            loadedVtfConverterBefore = false;
            vtfWarning(true, true, err);
        }
    };

    const generateVtfs = async () => {
        const outputFolder = inputFolderOutput.value;
        const imagesFolder = inputFolderImages.value;
        // validate stuff
        if (!outputFolder) throw new Error("Enter a valid output folder.");
        if (!imagesFolder) throw new Error("Enter a valid images folder.");
        // prep
        await vtfInfoBusy("garrympn-vtf-build-prepare", "Preparing output folder...", async () => {
            // make the output folder if it doesnt exist
            await GarryMPN.invokeCli({ mkdir: outputFolder });
        });
        // make vtfs
        for (const vtf of listImagesOptions) {
            if (vtf.ignored) continue;
            const textureName = vtf.coreFileNameNoExt;
            await vtfInfoBusy("garrympn-vtf-build-vtfs", `Generating vtf file for "${textureName}"`, async () => {
                // make folder
                // const outputFolder = await path.dirname(vtf.texturePath);
                // const outputFilename = await path.basename(vtf.texturePath);
                const outputFolder = vtf.texturePath;
                await GarryMPN.invokeCli({ mkdir: outputFolder });
                // make vtfs
                const options = {};
                options["-file"] = vtf.coreFilePath;
                options["-output"] = outputFolder;
                // options["-prefix"] = String(outputFilename.split(".").slice(0, -1).join("."));
                options["-recurse"] = "";
                // user options
                // presets
                if (!vtf.notUsingPreset) {
                    options["-mfilter"] = "BOX";
                    options["-msharpen"] = "SHARPENSOFT";
                    options["-resize"] = "";
                    switch (vtf.texturePreset) {
                        case "GenericHigh":
                            options["-format"] = "ABGR8888";
                            options["-alphaformat"] = "ABGR8888";
                            break;
                        case "CompressedAlpha":
                            options["-format"] = "DXT5";
                            options["-alphaformat"] = "DXT5";
                            break;
                        case "Compressed":
                            options["-format"] = "DXT1";
                            options["-alphaformat"] = "DXT1";
                            break;
                        case "UncompressedAlpha":
                            options["-format"] = "BGRA8888";
                            options["-alphaformat"] = "BGRA8888";
                            break;
                        case "Uncompressed":
                            options["-format"] = "BGR888";
                            options["-alphaformat"] = "BGR888";
                            break;
                    }
                }
                // VTFCmd
                const { output, warning } = await GarryMPN.invokeVtfCmd(options);
                if (output.includes("Error creating vtf file")) throw new Error(output);
                if (warning) vtfWarning(false, true, warning);
            });
        }
        vtfInfoText.innerText = "Finished generating texture.";
    };

    document.addEventListener("garrympn-tab-updated", (event) => {
        if (event.detail === "vtf") {
            loadVtfConverterFirstTime();
        }
    });
})();
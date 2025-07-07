const fs = require("fs");
const path = require("path");

module.exports = (addonPath) => {
    if (!fs.existsSync(addonPath)) return; // basically already deleted

    // an addon will have at least one of these
    let oneFolderExists = false;
    const folders = ["lua", "materials", "models", "maps", "sound", "data", "settings", "scripts", "gamemodes"];
    for (const folder of folders) {
        const folderPath = path.join(addonPath, folder + "/");
        if (fs.existsSync(folderPath)) {
            oneFolderExists = true;
            break;
        }
    }
    if (!oneFolderExists) throw new Error("Not an addon folder");
    
    // if there's an addon.json file it needs to be valid json
    const addonJsonPath = path.join(addonPath, "addon.json");
    if (fs.existsSync(addonJsonPath)) {
        const fileData = fs.readFileSync(addonJsonPath, "utf8");
        try {
            JSON.parse(fileData);
        } catch (err) {
            throw new Error("Invalid addon.json, not deleting; " + err);
        }
    }

    // see if the folder only has the folders or addon.json or info.txt
    const folderContent = fs.readdirSync(addonPath);
    const nonAddonContent = folderContent.filter(path => path !== "addon.json" && path !== "info.txt" && !folders.includes(path));
    if (nonAddonContent.length > 0) {
        throw new Error("Folder contains non-addon content, not deleting; " + JSON.stringify(nonAddonContent));
    }

    fs.rmSync(addonPath, {
        recursive: true,
        force: true
    });
};
const fs = require("fs");
const path = require("path");

const quotes = (str) => {
    return JSON.stringify(String(str));
};
const num = (number) => {
    const validNum = Number(number);
    if (isNaN(validNum)) {
        return "0/0";
    }
    if (!isFinite(validNum)) {
        return validNum > 0 ? "math.huge" : "-math.huge";
    }
    return validNum;
};

module.exports = (outPath, options = {}) => {
    let lua = "";
    let luaLines = [];

    // playerModel, playerModelName, playerHands, playerHandsSkin, playerHandsBodygroups, playerHandsMatchBodySkin
    if (options.playerModel && !options.playerModelName) throw new Error("playerModel specified without playerModelName");
    if (!options.playerModel && options.playerModelName) throw new Error("playerModelName specified without playerModel");
    if (options.playerModel) {
        luaLines.push(`list.Set("PlayerOptionsModel", ${quotes(options.playerModelName)}, ${quotes(options.playerModel)})`);
        luaLines.push(`player_manager.AddValidModel(${quotes(options.playerModelName)}, ${quotes(options.playerModel)})`);
    }
    if (options.playerHands && !options.playerModelName) throw new Error("playerHands specified without playerModelName");
    if (options.playerHands) {
        const skin = typeof options.playerHandsSkin !== "number" ? "0" : num(options.playerHandsSkin);
        const bodyGroups = !options.playerHandsBodygroups ? quotes("0000000") : quotes(options.playerHandsBodygroups);
        if (typeof options.playerHandsMatchBodySkin === "boolean") {
            luaLines.push(`player_manager.AddValidHands(${quotes(options.playerModelName)}, ${quotes(options.playerHands)}, ${skin}, ${bodyGroups}, ${options.playerHandsMatchBodySkin})`);
        } else {
            luaLines.push(`player_manager.AddValidHands(${quotes(options.playerModelName)}, ${quotes(options.playerHands)}, ${skin}, ${bodyGroups})`);
        }
    }
    // npcFriendly, npcFriendlyName, npcFriendlyModel, npcFriendlyClass, npcFriendlyHealth, npcFriendlyAuthor, npcFriendlyCategory, npcFriendlyAdminOnly
    for (let i = 0; i < 2; i++) {
        const prefix = i === 0 ? "npcFriendly" : "npcHostile";
        if (options[prefix]) {
            if (!options[prefix + "Model"]) throw new Error(`${prefix} specified without ${prefix + "Model"}`);
            const npcClass = options[prefix + "Class"] || (i === 0 ? "npc_citizen" : "npc_combine");
            const npcHealth = typeof options[prefix + "Health"] === "number" ? options[prefix + "Health"] : 100;
            luaLines.push(`list.Set("NPC", ${quotes(options[prefix])}, {`);
            luaLines.push(`\tName = ${quotes(options[prefix + "Name"] || options[prefix])},`);
            luaLines.push(`\tClass = ${quotes(npcClass)},`);
            luaLines.push(`\tModel = ${quotes(options[prefix + "Model"])},`);
            luaLines.push(`\tHealth = ${num(npcHealth)},`);
            luaLines.push(`\tCategory = ${quotes(options[prefix + "Category"] || "Other")},`);
            if (options[prefix + "Author"]) {
                luaLines.push(`\tAuthor = ${quotes(options[prefix + "Author"])},`);
            }
            if (options[prefix + "AdminOnly"]) {
                luaLines.push(`\tAdminOnly = true,`);
            }
            luaLines.push(`})`);
        }
    }

    // raw lines at the end
    if (options.rawLines) {
        luaLines = [].concat(luaLines, options.rawLines);
    }

    // finish the file
    lua += luaLines.join("\n");
    lua += "\n";
    fs.writeFileSync(outPath, lua, "utf8");
};
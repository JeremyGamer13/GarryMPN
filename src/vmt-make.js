const fs = require("fs");
const path = require("path");

const quotes = (str) => {
    return `"${String(str).replace(/"/g, '\\"')}"`;
};

module.exports = (shaderType, outPath, options = {}) => {
    let vmt = `"${shaderType}"\n{\n`;
    let vmtLines = [];

    // we add props like this: "$basetexture" "models/test2025/body"
    // baseTexture, forModel, surfaceProp, environmentMap, bumpMap, detail, detailScale, selfIllumination, selfIlluminationMask
    if (options.baseTexture) {
        vmtLines.push(`"$basetexture" ${quotes(options.baseTexture)}`);
    }
    if (options.surfaceProp) {
        vmtLines.push(`"$surfaceprop" ${quotes(options.surfaceProp)}`);
    }
    if (options.environmentMap) {
        vmtLines.push(`"$envmap" ${quotes(options.environmentMap)}`);
    }
    if (options.bumpMap) {
        vmtLines.push(`"$bumpmap" ${quotes(options.bumpMap)}`);
    }
    if (options.detail) {
        vmtLines.push(`"$detail" ${quotes(options.detail)}`);
    }
    if (options.detailScale) {
        // i presume it needs to be finite
        if (!isFinite(options.detailScale)) throw new Error("detailScale is not finite");
        vmtLines.push(`"$detailscale" ${options.detailScale}`);
    }
    if (options.selfIllumination) {
        vmtLines.push(`"$selfillum" 1`);
    }
    if (options.selfIlluminationMask) {
        vmtLines.push(`"$selfillummask" ${quotes(options.selfIlluminationMask)}`);
    }
    if (options.forModel) {
        vmtLines.push(`"$model" 1`);
    }

    // raw lines at the end
    if (options.rawLines) {
        vmtLines = [].concat(vmtLines, options.rawLines);
    }

    // finish the file
    vmt += vmtLines.map(text => `\t${text}`).join("\n");
    vmt += "\n}\n";

    // according to https://developer.valvesoftware.com/wiki/Creating_a_Material this is a problem
    if (outPath.includes("%")) console.warn("VMT outPath contains %, may cause issues in Hammer or other programs");
    fs.writeFileSync(outPath, vmt, "utf8");
};
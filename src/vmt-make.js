const fs = require("fs");
const path = require("path");

const quotes = (str) => {
    return `"${String(str).replace(/"/g, '\\"')}"`;
};
const quotesPath = (str) => {
    return `"${String(str).replace(/"/g, '\\"').replace(/\\/g, "/")}"`;
};

module.exports = (shaderType, outPath, options = {}) => {
    let vmt = `${shaderType}\n{\n`;
    let vmtLines = [];

    // we add props like this: $basetexture "models/test2025/body"
    // i presume numbers & floats needs to be finite

    // baseTexture, forModel, surfaceProp, environmentMap, bumpMap, detail, detailScale, selfIllumination, selfIlluminationMask
    if (options.baseTexture) {
        vmtLines.push(`$basetexture ${quotesPath(options.baseTexture)}`);
    }
    if (options.surfaceProp) {
        vmtLines.push(`$surfaceprop ${quotes(options.surfaceProp)}`);
    }
    if (options.environmentMap) {
        vmtLines.push(`$envmap ${quotesPath(options.environmentMap)}`);
    }
    if (options.bumpMap) {
        vmtLines.push(`$bumpmap ${quotesPath(options.bumpMap)}`);
    }
    if (options.detail) {
        vmtLines.push(`$detail ${quotesPath(options.detail)}`);
    }
    if (options.detailScale) {
        if (!isFinite(options.detailScale)) throw new Error("detailScale is not finite");
        vmtLines.push(`$detailscale ${options.detailScale}`);
    }
    if (options.selfIllumination) {
        vmtLines.push(`$selfillum 1`);
    }
    if (options.selfIlluminationMask) {
        vmtLines.push(`$selfillummask ${quotesPath(options.selfIlluminationMask)}`);
    }
    if (options.forModel) {
        vmtLines.push(`$model 1`);
    }

    // phong, phongExponent, phongExponentTexture, phongBoost, phongFresnelRanges
    if (options.phong) {
        if (!["VertexLitGeneric", "LightmappedGeneric", "WorldVertexTransition"].includes(shaderType)) throw new Error("phong not supported in " + shaderType);
        vmtLines.push(`$phong 1`);
    }
    if (options.phongExponent) {
        if (!isFinite(options.phongExponent)) throw new Error("phongExponent is not finite");
        vmtLines.push(`$phongexponent ${options.phongExponent}`);
    }
    if (options.phongExponentTexture) {
        if (!["VertexLitGeneric", "LightmappedGeneric", "WorldVertexTransition"].includes(shaderType)) throw new Error("phongExponentTexture not supported in " + shaderType);
        vmtLines.push(`$phongexponenttexture ${quotesPath(options.phongExponentTexture)}`);
    }
    if (options.phongBoost) {
        if (!["VertexLitGeneric", "LightmappedGeneric", "WorldVertexTransition"].includes(shaderType)) throw new Error("phongBoost not supported in " + shaderType);
        if (!isFinite(options.phongBoost)) throw new Error("phongBoost is not finite");
        vmtLines.push(`$phongboost ${options.phongBoost}`);
    }
    if (options.phongFresnelRanges) {
        if (!["VertexLitGeneric", "LightmappedGeneric", "WorldVertexTransition"].includes(shaderType)) throw new Error("phongFresnelRanges not supported in " + shaderType);
        vmtLines.push(`$phongfresnelranges ${quotes(options.phongFresnelRanges)}`);
    }

    // translucent, alpha, ignoreZ
    if (options.translucent) {
        vmtLines.push(`$translucent 1`);
    }
    if (options.alpha) {
        if (!isFinite(options.alpha)) throw new Error("alpha is not finite");
        vmtLines.push(`$alpha ${options.alpha}`);
    }
    if (options.ignoreZ) {
        vmtLines.push(`$ignorez 1`);
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
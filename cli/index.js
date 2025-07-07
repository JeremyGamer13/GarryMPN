const GarryMPN = require("../src/index");

// make process.argv into an object
const exeArgv = process.argv;
exeArgv.shift();
exeArgv.shift();
const exeParams = {};
for (let i = 0; i < exeArgv.length; i++) {
    const arg = exeArgv[i];
    const value = exeArgv[i + 1];

    if (arg.startsWith("-")) {
        const name = arg.replace(/\-/g, "");
        exeParams[name] = value;
    }
}

// apply args, loop through so we get it in the order specified
(async () => {
    for (const param in exeParams) {
        // simples
        // echo
        if (param === "echo") {
            console.log(exeParams.echo);
        }
        // mkdir
        if (param === "mkdir") {
            GarryMPN.makeFolder(exeParams.mkdir);
        }
        // cpf, cpt
        if (param === "cpf") {
            if (!exeParams.cpt) throw new Error("Specify cpt for a target path to copy to");
            GarryMPN.copyPath(exeParams.cpf, exeParams.cpt);
        }
        // wp
        if (param === "wp") {
            let waitTime = null;
            if (exeParams.wpms) waitTime = Number(exeParams.wpms);
            await GarryMPN.waitPath(exeParams.wp, waitTime);
        }
        // actually gmod/source specific simples
        // deladdon
        if (param === "deladdon") {
            GarryMPN.deleteAddonFolder(exeParams.deladdon);
        }
        // gmod/source specific not simples
        // vmt, vmto optionally vmtr, vmtb, vmtm, vmtsp, vmtem, vmtbm, vmtd, vmtds, vmtsi, vmtsim
        if (param === "vmt") {
            if (!exeParams.vmto) throw new Error("Specify vmto for a target VMT path to output the VMT to");
            const options = {};
            if (exeParams.vmtr) options.rawLines = JSON.parse(exeParams.vmtr);
            if (exeParams.vmtb) options.baseTexture = exeParams.vmtb;
            if (exeParams.vmtm || Object.hasOwn(exeParams, "vmtm")) options.forModel = true;
            if (exeParams.vmtsp) options.surfaceProp = exeParams.vmtsp;
            if (exeParams.vmtem) options.environmentMap = exeParams.vmtem;
            if (exeParams.vmtbm) options.bumpMap = exeParams.vmtbm;
            if (exeParams.vmtd) options.detail = exeParams.vmtd;
            if (exeParams.vmtds) options.detailScale = Number(exeParams.vmtds);
            if (exeParams.vmtsi || Object.hasOwn(exeParams, "vmtsi")) options.selfIllumination = true;
            if (exeParams.vmtsim) options.selfIlluminationMask = exeParams.vmtsim;
            GarryMPN.vmtMake(exeParams.vmt, exeParams.vmto, options);
        }
        // npciconf, npciconh with npciconfout, npciconhout optionally npciconfb, npciconff, npciconfr, npciconhb, npciconhf, npciconhr
        if (param === "npciconf") {
            if (!exeParams.npciconfout) throw new Error("Specify npciconfout for a target PNG path to output the friendly NPC icon to");
            const options = {};
            if (exeParams.npciconfb) options.backPath = exeParams.npciconfb;
            if (exeParams.npciconff) options.frontPath = exeParams.npciconff;
            if (exeParams.npciconfr || Object.hasOwn(exeParams, "npciconfr")) options.resizeBase = true;
            await GarryMPN.npcIcon(exeParams.npciconf, exeParams.npciconfout, options);
        }
        if (param === "npciconh") {
            if (!exeParams.npciconhout) throw new Error("Specify npciconhout for a target PNG path to output the hostile NPC icon to");
            const options = {};
            if (exeParams.npciconhb) options.backPath = exeParams.npciconhb;
            if (exeParams.npciconhf) options.frontPath = exeParams.npciconhf;
            if (exeParams.npciconhr || Object.hasOwn(exeParams, "npciconhr")) options.resizeBase = true;
            await GarryMPN.npcIcon(exeParams.npciconh, exeParams.npciconhout, options);
        }
    }
})();
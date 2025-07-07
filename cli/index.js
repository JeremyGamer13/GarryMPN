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
        // cpf, cpt
        if (param === "cpf" || param === "cpt") {
            if (!exeParams.cpf) throw new Error("Specify cpt for a target path to copy to");
            if (!exeParams.cpt) throw new Error("Specify cpf for a target path to copy from");
            GarryMPN.copyPath(exeParams.cpf, exeParams.cpt);
        }
        // deladdon
        if (param === "deladdon") {
            GarryMPN.deleteAddonFolder(exeParams.deladdon);
        }
        // mkdir
        if (param === "mkdir") {
            GarryMPN.makeFolder(exeParams.mkdir);
        }
        // npciconf, npciconh with npciconfout, npciconhout optionally npciconfb, npciconff, npciconfr, npciconhb, npciconhf, npciconhr
        if (param === "npciconf" || param === "npciconfout") {
            if (!exeParams.npciconf) throw new Error("Specify npciconf for a target path to base the friendly NPC icon on");
            if (!exeParams.npciconfout) throw new Error("Specify npciconfout for a target PNG path to output the friendly NPC icon to");
            const options = {};
            if (exeParams.npciconfb) options.backPath = exeParams.npciconfb;
            if (exeParams.npciconff) options.frontPath = exeParams.npciconff;
            if (exeParams.npciconfr || Object.hasOwn(exeParams, "npciconfr")) options.resizeBase = true;
            await GarryMPN.npcIcon(exeParams.npciconf, exeParams.npciconfout, options);
        }
        if (param === "npciconh" || param === "npciconhout") {
            if (!exeParams.npciconh) throw new Error("Specify npciconh for a target path to base the hostile NPC icon on");
            if (!exeParams.npciconhout) throw new Error("Specify npciconhout for a target PNG path to output the hostile NPC icon to");
            const options = {};
            if (exeParams.npciconhb) options.backPath = exeParams.npciconhb;
            if (exeParams.npciconhf) options.frontPath = exeParams.npciconhf;
            if (exeParams.npciconhr || Object.hasOwn(exeParams, "npciconhr")) options.resizeBase = true;
            await GarryMPN.npcIcon(exeParams.npciconh, exeParams.npciconhout, options);
        }
    }
})();
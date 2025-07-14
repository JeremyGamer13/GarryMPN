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
        // vmt, vmto optionally vmtr, vmtb, vmtm, vmtsp, vmtem, vmtbm, vmtd, vmtds, vmtsi, vmtsim, vmtp, vmtpe, vmtpet, vmtpb, vmtpfr, vmtt, vmta, vmtz
        if (param === "vmt") {
            if (!exeParams.vmto) throw new Error("Specify vmto for a target VMT path to output the VMT to");
            const options = {};
            if (exeParams.vmtr) options.rawLines = JSON.parse(exeParams.vmtr);
            if (exeParams.vmtb) options.baseTexture = exeParams.vmtb;
            if (Object.hasOwn(exeParams, "vmtm")) options.forModel = true;
            if (exeParams.vmtsp) options.surfaceProp = exeParams.vmtsp;
            if (exeParams.vmtem) options.environmentMap = exeParams.vmtem;
            if (exeParams.vmtbm) options.bumpMap = exeParams.vmtbm;
            if (exeParams.vmtd) options.detail = exeParams.vmtd;
            if (exeParams.vmtds) options.detailScale = Number(exeParams.vmtds);
            if (Object.hasOwn(exeParams, "vmtsi")) options.selfIllumination = true;
            if (exeParams.vmtsim) options.selfIlluminationMask = exeParams.vmtsim;
            if (Object.hasOwn(exeParams, "vmtp")) options.phong = true;
            if (exeParams.vmtpe) options.phongExponent = Number(exeParams.vmtpe);
            if (exeParams.vmtpet) options.phongExponentTexture = exeParams.vmtpet;
            if (exeParams.vmtpb) options.phongBoost = Number(exeParams.vmtpb);
            if (exeParams.vmtpfr) options.phongFresnelRanges = exeParams.vmtpfr;
            if (Object.hasOwn(exeParams, "vmtt")) options.translucent = true;
            if (exeParams.vmta) options.alpha = Number(exeParams.vmta);
            if (Object.hasOwn(exeParams, "vmtz")) options.ignoreZ = true;
            GarryMPN.vmtMake(exeParams.vmt, exeParams.vmto, options);
        }
        // lua optionally luar, luapm, luapmn, luaph, luaphs, luaphb, luaphm,
        // luanf, luanh, luanfn, luanhn, luanfm, luanhm, luanfc, luanhc, luanfh, luanhh, luanfa, luanha, luanfct, luanhct, luanfao, luanhao
        if (param === "lua") {
            const options = {};
            if (exeParams.luar) options.rawLines = JSON.parse(exeParams.luar);
            if (exeParams.luapm) options.playerModel = exeParams.luapm;
            if (exeParams.luapmn) options.playerModelName = exeParams.luapmn;
            if (exeParams.luaph) options.playerHands = exeParams.luaph;
            if (exeParams.luaphs) options.playerHandsSkin = Number(exeParams.luaphs);
            if (exeParams.luaphb) options.playerHandsBodygroups = exeParams.luaphb;
            if (exeParams.luaphm) options.playerHandsMatchBodySkin = String(exeParams.luaphm) === "true";
            if (exeParams.luanf) options.npcFriendly = exeParams.luanf;
            if (exeParams.luanfn) options.npcFriendlyName = exeParams.luanfn;
            if (exeParams.luanfm) options.npcFriendlyModel = exeParams.luanfm;
            if (exeParams.luanfc) options.npcFriendlyClass = exeParams.luanfc;
            if (exeParams.luanfh) options.npcFriendlyHealth = Number(exeParams.luanfh);
            if (exeParams.luanfa) options.npcFriendlyAuthor = exeParams.luanfa;
            if (exeParams.luanfct) options.npcFriendlyCategory = exeParams.luanfct;
            if (Object.hasOwn(exeParams, "luanfao")) options.npcFriendlyAdminOnly = true;
            if (exeParams.luanh) options.npcHostile = exeParams.luanh;
            if (exeParams.luanhn) options.npcHostileName = exeParams.luanhn;
            if (exeParams.luanhm) options.npcHostileModel = exeParams.luanhm;
            if (exeParams.luanhc) options.npcHostileClass = exeParams.luanhc;
            if (exeParams.luanhh) options.npcHostileHealth = Number(exeParams.luanhh);
            if (exeParams.luanha) options.npcHostileAuthor = exeParams.luanha;
            if (exeParams.luanhct) options.npcHostileCategory = exeParams.luanhct;
            if (Object.hasOwn(exeParams, "luanhao")) options.npcHostileAdminOnly = true;
            GarryMPN.luaMake(exeParams.lua, options);
        }
        // npciconf, npciconh with npciconfout, npciconhout optionally npciconfb, npciconff, npciconfr, npciconhb, npciconhf, npciconhr
        if (param === "npciconf") {
            if (!exeParams.npciconfout) throw new Error("Specify npciconfout for a target PNG path to output the friendly NPC icon to");
            const options = {};
            if (exeParams.npciconfb) options.backPath = exeParams.npciconfb;
            if (exeParams.npciconff) options.frontPath = exeParams.npciconff;
            if (Object.hasOwn(exeParams, "npciconfr")) options.resizeBase = true;
            await GarryMPN.npcIcon(exeParams.npciconf, exeParams.npciconfout, options);
        }
        if (param === "npciconh") {
            if (!exeParams.npciconhout) throw new Error("Specify npciconhout for a target PNG path to output the hostile NPC icon to");
            const options = {};
            if (exeParams.npciconhb) options.backPath = exeParams.npciconhb;
            if (exeParams.npciconhf) options.frontPath = exeParams.npciconhf;
            if (Object.hasOwn(exeParams, "npciconhr")) options.resizeBase = true;
            await GarryMPN.npcIcon(exeParams.npciconh, exeParams.npciconhout, options);
        }
    }
})();
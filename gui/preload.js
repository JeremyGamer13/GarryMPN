const electron = require("electron");

// this is some lua type stuff right here
const GarryMPN = {};
GarryMPN.invokeCli = async (argsObj) => {
    return await electron.ipcRenderer.invoke("garrympn-invoke-cli", argsObj);
};

electron.contextBridge.exposeInMainWorld("GarryMPN", GarryMPN);
const fs = require("fs");
const path = require("path");

module.exports = (folderPath) => {
    if (fs.existsSync(folderPath)) return; // the exact path we want already is there
    fs.mkdirSync(folderPath, { recursive: true });
};
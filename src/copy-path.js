const fs = require("fs");
const path = require("path");

module.exports = (orgPath, newPath) => {
    if (!fs.existsSync(orgPath)) throw new Error("orgPath is non-existent");
    if (fs.existsSync(newPath)) throw new Error("newPath already exists");
    fs.cpSync(orgPath, newPath, { recursive: true });
};
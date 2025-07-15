const fs = require("fs");
const path = require("path");
const canvas = require("canvas");

module.exports = async (baseImagePath, outputPath, options = {}) => {
    const image = await canvas.loadImage(baseImagePath);
    const widthh = typeof options.newWidth  === "number" ? options.newWidth  : image.width;
    const height = typeof options.newHeight === "number" ? options.newHeight : image.height;

    const newCanvas = canvas.createCanvas(widthh, height);
    const ctx = newCanvas.getContext("2d");
    ctx.drawImage(image, 0, 0, widthh, height);

    const buffer = newCanvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);
};
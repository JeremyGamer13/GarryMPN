const fs = require("fs");
const path = require("path");
const canvas = require("canvas");

module.exports = async (baseImagePath, outputPath, options = {}) => {
    const image = await canvas.loadImage(baseImagePath);
    const widthh = options.resizeBase ? 256 : image.width;
    const height = options.resizeBase ? 256 : image.height;

    const newCanvas = canvas.createCanvas(widthh, height);
    const ctx = newCanvas.getContext("2d");
    if (options.backPath) {
        const imageBack = await canvas.loadImage(options.backPath);
        ctx.drawImage(imageBack, 0, 0, widthh, height);
    }
    ctx.drawImage(image, 0, 0, widthh, height);
    if (options.frontPath) {
        const imageFront = await canvas.loadImage(options.frontPath);
        ctx.drawImage(imageFront, 0, 0, widthh, height);
    }

    const buffer = newCanvas.toBuffer("image/png");
    fs.writeFileSync(outputPath, buffer);
};
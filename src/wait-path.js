const fs = require("fs");

module.exports = (waitPath, timeoutMs) => {
    return new Promise((resolve, reject) => {
        // first see if it already exists
        if (fs.existsSync(waitPath)) {
            resolve(waitPath);
            return;
        }

        // doesnt already exist so lets wait for it
        let timeout;
        let interval;
        let resolved = false;
        if (typeof timeoutMs === "number") {
            timeout = setTimeout(() => {
                clearInterval(interval);
                if (resolved) return;
                if (!fs.existsSync(waitPath)) {
                    reject("Timeout waiting for path");
                    return;
                }
                resolve(waitPath);
            }, timeoutMs);
        }
        interval = setInterval(() => {
            if (!fs.existsSync(waitPath)) return;
            resolved = true;
            clearInterval(interval);
            clearTimeout(timeout);
            resolve(waitPath);
        }, 200);
    });
};
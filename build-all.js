const { execSync } = require("child_process");
execSync("npm run cli:build", { stdio: "inherit" });
execSync("npm run gui:build", { stdio: "inherit" });
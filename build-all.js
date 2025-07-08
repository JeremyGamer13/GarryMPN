const { execSync } = require("child_process");
// TODO: Log stdout and stderr to console because right now nothing is logged
execSync("npm run cli:build");
execSync("npm run gui:build");
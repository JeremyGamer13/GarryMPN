const { exec } = require('pkg');
exec(['cli/index.js', '--config', 'package.json', '--output', './build/garrympn-cli.exe']);
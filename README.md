# GarryMPN
Make simple Player Model & NPC Garry's Mod addon structures with an MDL model and VTF textures.

Note that this program mainly automates taking the puzzle pieces of models and textures and making an addon out of those. You won't get super complicated addons made with this program alone.

# Notice
This program is not complete yet.
As of now the GUI does not let you configure many VMT options, including basic settings like bump maps, surface properties or phong.

When there is a proper v1.0.0 release out, this notice will disappear.

# How to use as an application
1. Download a release (you probably want the latest one)
2. Install the program or get the ZIP portable copy
3. See [MANUAL.md](./MANUAL.md) either here on GitHub, or in the program's files

# How to setup for development
You will need a copy of [Node.js](https://nodejs.org/). v20 is recommended (since I use it).
## CLI
1. Run `npm i`
2. Test changes to the program:
    - Test using `node cli/index.js`
    - Test using the output of `npm run cli:build`, found in `build/garrympn-cli.exe` (so you can see how it behaves when built)
## GUI
Note that to use the GUI, you will need to have the CLI built.
1. Run `npm i`
2. Run `npm run gui:dev`

# How to build the app
1. Run `npm i`
2. Run `npm run build`

# Info
Garry's Mod is a trademark of Facepunch Studios.
GarryMPN is an independent project and is not affiliated with, endorsed by, or sponsored by Facepunch Studios or Valve Corporation.
All trademarks are property of their respective owners.
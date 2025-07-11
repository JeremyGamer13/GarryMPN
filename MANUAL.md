# GarryMPN
Make simple Player Model & NPC Garry's Mod addon structures with an MDL model and VTF textures.

Note that this program mainly automates taking the puzzle pieces of models and textures and making an addon out of those. You won't get super complicated addons made with this program alone.

# Notice
This manual is not complete. Some features have not been covered yet.
This program is also not complete yet.
As of now the GUI does not let you configure many VMT options, including basic settings like bump maps, surface properties or phong.

When there is a proper v1.0.0 release out, this notice will disappear.

# Possible Errors
If you do not find your error here, try reinstalling the program.
If you still get the error on a fresh install, please [report it to the GitHub repository](https://github.com/JeremyGamer13/GarryMPN/issues).

## Non-log errors
### My model is invisible or has the pink + black checkerboard
- Your "materials" folder is missing VMT files for the VTF textures, or has weird settings causing issues.
    - GarryMPN can likely help you make these. Enable the "Make VMT files (material descriptions) for my VTF textures" checkbox, and configure the settings.

### I made a Player Model, Friendly NPC or Hostile NPC with my model, but it stays in a T-Pose or stays in one pose
- See the section in the manual for "Making a model work with Player Models/NPCs"

## Program errors
### Error invoking remote method 'garrympn-invoke-cli'
- Scroll down for the real error message, if present. See below if the error there is mentioned.
- Make sure your error log doesn't mention non-existent paths/folders/directories. If it does, one of the folders/files you selected was deleted or not found.
- Make sure the `garrympn-cli.exe` file is in the same folder as the executable.
- Make sure the `garrympn-cli.exe` file is not renamed, or given strange capitalization.

### Enter a valid output/models/materials folder
- Make sure to specify the output folder, "models" folder, and "materials" folder. See further in the manual if you don't know what to do here.

### Error: newPath already exists
- You likely tried to generate an addon within a folder that already contains an addon. You can try a few things:
    - Use the "Delete Output Folder" button if you are re-generating an addon.
    - Choose a different folder if you wanted to choose an empty folder.
    - Delete the folder from your computer, so GarryMPN can remake it.
- If you are generating icons, make sure your materials folder doesn't already have icons in it.

### Error: Not an addon folder / Invalid addon.json / Folder contains non-addon content
- You likely tried to use the "Delete Output Folder" button in a random folder.
    - GarryMPN will only allow you to delete Garry's Mod addons with this button. It is likely that you chose a non-empty folder for the output folder.

### Error: detailScale is not finite
- If making a VMT material, make sure that Detail Scale is set to a real number.

### VMT outPath contains %
You may not have to worry about this if you are not going to be opening the output files in Hammer.
- Change folder names or the "Save to" path to not include the % symbol.

# How to use GarryMPN
## Expected from you
This isn't meant to be a condescending section, but you will need to know a few things and have a few things to be able to effectively use GarryMPN.

A few basics:
- You know how to read folder/file paths ("path/to/file/myfile.txt" having the "path" folder, "to" folder, and "file" folder with "myfile.txt" inside)
- You can make icon images for NPCs (or can split the images to parts for the Friendly & Hostile icon overlay options)
- You have played Garry's Mod and know what an NPC & Player Model is

Garry's Mod specific:
- You are using [Crowbar](https://steamcommunity.com/groups/CrowbarTool) to compile your models.
- You should know how to make a model that Crowbar can compile.
- You know how to make VTF textures for your models.

You should be able to learn these things from a tutorial on making Garry's Mod player models, and then use GarryMPN after that to automate (most of) the annoying parts.

## Setup for GarryMPN
### Making a model work with Player Models/NPCs
**Note that this section is made without full understanding of how Player Models & NPCs work. Please correct it if it is wrong.**

This section may not work if your model is built on a skeleton other than `ValveBiped` (you can tell if it's in your model's QC file)

If your model works as a Player Model but not an NPC, it is likely that you are missing animations from "npc_citizen" and "npc_combine".
This will likely only apply if you do not change "Friendly/Hostile NPC Class".

If your model works as an NPC but not a Player Model, it is likely that you are missing animations for the player.

You will have to recompile your model, but with some changes to the QC file you used for input.
Add the below options as new lines to the file, if they apply to your situation. Make sure you do not add it between { and } sections.
If your file already includes some of these, do not re-add them.

For Player Models, you will need to add this:
```qc
$includemodel "m_anm.mdl"
```
For Friendly NPCs, you will need to add these:
```qc
$includemodel "humans/male_gestures.mdl"
$includemodel "humans/male_postures.mdl"
$includemodel "humans/male_shared.mdl"
$includemodel "humans/male_ss.mdl"
```
For Hostile NPCs, you will need to add this:
```qc
$includemodel "combine_soldier_anims.mdl"
```
Add all of the above if you want your model to work with everything.

## GarryMPN's menus
### The output, "models" and "materials" folders
- The **Output** folder is going to be an empty folder that your addon will be generated inside of.
- The **"models"** folder is a folder containing a directory structure, eventually leading to compiled MDL models.
    - You make this folder with the "Compile" menu in [Crowbar](https://steamcommunity.com/groups/CrowbarTool).
    - To select the "models" folder in GarryMPN, you want to select the folder *inside* of the "Output to:" folder in Crowbar.
- The **"materials"** folder is a folder containing a directory structure, eventually leading to VTF textures and possibly VMT material descriptions.
    - If you compiled a model for the above folder, you can easily make this folder using the QC file you used for [Crowbar](https://steamcommunity.com/groups/CrowbarTool).
    - Make a folder named "materials", and select that folder.
    - In the QC file (mentioned above) you will see "$cdmaterials". Make the folder structure that it states within your "materials" folder.
    - In the last subfolder, put your VTF textures there. If you already have VMT material descriptions, you can put them there too.

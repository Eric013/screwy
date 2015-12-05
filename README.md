<br>  
<br>  
<br>  
<p align="center">
<img width="350" src="npm-scripts.png"> 	
</p>
<br>  
<br>  
<br>  

# npm scripts gui (NSG)
A ~~GUI~~ gooey interface for npm scripts.

<br>
<p align="center">
<img height="250" src="npmsg.png"> 	
</p>
<br>

### Install
Install globally  
```
npm i -g npm-scripts-gui
```

### Instructions
While in a directory with a `package.json` file, simply run `npm-script-gui` or the shorter `npm-sg`. Any text output associated with the command will be printed to the command line where the gui was launched. 

### Configurations
NSG will automatically search for a `.nsgrc` in the same directory as the `package.json`. It should be in json format.

These are the available options:
- *name* (choose different name than defined in `package.json`)
- *primary* (the primary script buttons for scripts that will be ran more frequently)
- *exclude* (scripts to NOT include in the GUI)
- *font-stack* (the font in the GUI)

**Example**  
```
{
	"name": "Qualtrics Node SFDC",
	"primary": ["build", "run-production", "run-sandbox"],
	"exclude": ["scripts-gui", "prebuild"],
	"font-stack": ["source sans pro", "helvetica neue"]
}
```

Any script not specfied in `primary` or `excludes` will show up a a normal button. 

#### Future Configuration Plans:  
- ability to sort scripts (e.g. alphabetically)
- define font-stack/font-weight for gui
- different skins/themes (npm, node, light, dark, etc.)
- create custom commands not in package.json (specific to gui)
- run npm scripts in silent mode (good for linting tasks)

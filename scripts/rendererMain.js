'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var main = function () {
	'use strict';

	var path = require('path');
	var fs = require('fs');

	var remote = require('remote');
	var app = remote.require('app');
	var electron = require('electron');
	var ipcRenderer = electron.ipcRenderer;
	var remoteElectron = remote.require('electron');
	var globalShortcut = remoteElectron.globalShortcut;
	var EventEmitter = require('events').EventEmitter;
	window.globalEvent = new EventEmitter();
	var logger = require.local('scripts', 'terminalLogger');
	var dom = require.local('scripts', 'dom');
	var fang = require('fangs');
	window.processQueue = require.local('scripts', 'processQueue');

	var packageJsonPath = path.join(process.cwd(), 'package.json');
	var primaryScriptsCont = dom('primaryScripts');
	var secondaryScriptsCont = dom('secondaryScripts');
	var primaryCommands = {};
	var excludedCommands = {};
	var silentCommands = {};

	var readConfigs = fang(

	/* read .nsgrc config file
 *
 */
	function (next) {
		fs.readFile(app.config, 'utf8', function (err, data) {
			if (err) {
				logger('no .nsgrc found');
				theme.set();
				return next();
			}

			var jsonData = undefined;
			try {
				jsonData = JSON.parse(data);
			} catch (e) {
				jsonData = {};
			}

			// set title
			if (jsonData.name) dom('title').text(jsonData.name).addClass('hasTitle');

			// get primary commands from the .nsgrc file
			if (Array.isArray(jsonData.primary)) {
				jsonData.primary.forEach(function (cmd) {
					primaryCommands[cmd] = true;
				});
			}

			// get commands to exclude from the .nsgrc file
			if (Array.isArray(jsonData.exclude)) {
				jsonData.exclude.forEach(function (cmd) {
					excludedCommands[cmd] = true;
				});
			}

			// get commands that run silently
			if (Array.isArray(jsonData.silent)) {
				jsonData.silent.forEach(function (cmd) {
					silentCommands[cmd] = true;
				});
			}

			// get font-stack from the .nsgrc file
			if (Array.isArray(jsonData['font-stack'])) {
				var customCSS = "body { font-family: ";
				jsonData['font-stack'].forEach(function (font) {
					customCSS += "'" + font + "', ";
				});
				customCSS = customCSS.slice(0, -2) + ';}';

				dom('user-styles').text(customCSS);
			}

			theme.set(jsonData.theme);

			// set file watchers
			if (_typeof(jsonData.watch) === 'object') window.watchConfig(jsonData.watch);

			return next();
		});
	},

	/* read package.json file
 *
 */
	function (next) {
		fs.readFile(packageJsonPath, 'utf8', function (err, data) {
			if (err) {
				logger('(package.json error) ' + err);
				ipcRenderer.send('error');
			}

			var jsonData = undefined;
			try {
				jsonData = JSON.parse(data);
			} catch (e) {
				logger(err);
				ipcRenderer.send('error');
			}

			// set title if not already set
			if (!dom('title').hasClass('hasTitle')) dom('title').text(jsonData.name).addClass('hasTitle');;

			Object.keys(jsonData.scripts).forEach(function (cmdName) {
				// if this command is to be excluded, do nothing
				if (excludedCommands[cmdName]) return;

				var btn = dom.create('button').text(cmdName).attr('data-cmd', cmdName);

				// add the btn `click` handler	
				btn.listen('click', function (e) {
					if (btn.classList.contains('in-progress')) return;
					commandClick(btn);
				});

				btn.listen('dblclick', function (e) {
					if (btn.classList.contains('in-progress')) process.nextTick(function () {
						return processQueue.kill(btn.dataset.cmd);
					});
				});

				if (silentCommands[cmdName]) btn.dataset.silent = "true";

				// does button have primary or normal status
				if (primaryCommands[cmdName]) primaryScriptsCont.appendChild(btn.attr('data-primary', 'true'));else secondaryScriptsCont.appendChild(btn);
			});

			// if no primary commands are found, remove the container
			if (Object.keys(primaryCommands).length === 0) dom.remove(primaryScriptsCont);
		});
	});

	process.on('uncaughtException', function (e) {
		logger('NSG ERROR:');
		logger(e.stack);
	});

	window.addEventListener('resize', function (evt) {
		dom('html').style.height = window.innerHeight;
	});

	window.globalEvent.on('ready', readConfigs);

	return {
		quitApp: function quitApp() {
			processQueue.killAll(function () {
				return ipcRenderer.send('can-quit');
			});
		}
	};
}();
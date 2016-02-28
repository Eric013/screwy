'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _electron = require('electron');

var _electron2 = _interopRequireDefault(_electron);

var _remote = require('remote');

var _remote2 = _interopRequireDefault(_remote);

var _terminalLogger = require('./terminalLogger');

var _terminalLogger2 = _interopRequireDefault(_terminalLogger);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = _remote2.default.app;
var configPath = app.configPath;

function parseConfig(configObj, cb) {
	configObj.name = null;
	configObj.primaryScripts = [];
	configObj.secondaryScripts = [];
	configObj.excludeScripts = [];
	configObj.silentScripts = [];
	configObj.fontStack = null;
	configObj.scripts = null;
	configObj.theme = {
		name: null,
		primarySpinnerPath: null,
		secondarySpinnerPath: null,
		logoPath: null
	};

	console.log('configPath: ', configPath);
	_fs2.default.readFile(configPath, 'utf8', function (err, data) {
		if (err) {
			(0, _terminalLogger2.default)('no .nsgrc found');
			return cb(configObj);
		}

		var jsonData = undefined;
		try {
			jsonData = JSON.parse(data);
		} catch (e) {
			jsonData = {};
		}

		if (jsonData.name) configObj.name = jsonData.name;

		if (jsonData.theme) configObj.theme.name = jsonData.theme || 'light';

		if (configObj.theme.name !== 'light' && configObj.theme.name !== 'dark') configObj.theme.name = 'light';

		// get primary commands from the .nsgrc file
		if (_lodash2.default.isArray(jsonData.primary)) configObj.primaryScripts = jsonData.primary;

		// get commands to exclude from the .nsgrc file
		if (_lodash2.default.isArray(jsonData.exclude)) configObj.excludeScripts = jsonData.exclude;

		// get commands that run silently
		if (_lodash2.default.isArray(jsonData.silent)) configObj.silentScripts = jsonData.silent;

		// get font-stack from the .nsgrc file
		if (_lodash2.default.isArray(jsonData.fontStack)) configObj.fontStack = jsonData.fontStack;

		if (_typeof(jsonData.watch) === 'object') configObj.watchScripts = jsonData.watch;

		cb(configObj);
	});
}

module.exports = parseConfig;
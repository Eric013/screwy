'use strict';

import { spawn } from 'child_process';
import psTree from 'ps-tree';
import logger from './terminalLogger';

const queue = {};

function terminate(pid, cb) {
	psTree(pid, (err, children) => {
		spawn('kill', ['-9'].concat(children.map(p => p.PID)));
		if (typeof cb === 'function') return cb(err);
	});
}

function killAll(cb) {
	const cmds = Object.keys(queue);
	const total = cmds.length;
	let completedCount = 0;
	if (total === 0) return cb();

	cmds.forEach(cmd => {
		kill(cmd, function() {
			completedCount++;
			
			if (completedCount === total) cb();
		});
	});
}

function kill(cmdName, cb) {
	if (queue[cmdName] && queue[cmdName].pid) {
		terminate(queue[cmdName].pid, err => {
			if (err) return alert('ERROR ' + err);
			if (typeof cb === 'function') cb();
		});
	}
	else if (typeof cb === 'function') cb();
}

function install(obj) {
	const opts = ['install'];

	if (obj.package.length)
		opts.push(obj.package);
	if (obj.depType)
		opts.push(obj.depType);

	queue[obj.id] = spawn('npm', opts, {
		cwd: process.cwd(),
		stdio: [0,1,2]
	}); 
	return queue[obj.id];
}

function run(cmdName, isSilent) {
	const args = isSilent ? ['run', '-s', cmdName] : ['run', cmdName] ;
	queue[cmdName] = spawn('npm', args, {
		cwd: process.cwd(),
		stdio: [0,1,2]
	}); 
	return queue[cmdName];
}

module.exports = {
	kill,
	killAll,
	run,
	install
};

window.killApp = function() {
	window.store.modifyState(state => {
		state.windowClosing = true;
	});
	killAll();
};

var genfun = require('generate-function');
var util = require('util');
var events = require("events");

var isRegExp = new RegExp('^\/.*\/(?:[a-z]*)$');

function generateEmit(fn, from, to) {
	var From = from[0].toUpperCase() + from.substring(1);
	var To = to[0].toUpperCase() + to.substring(1);

	fn('this.emit("update", "%s", "%s")', from, to);
	if (from === to) {
		fn('this.emit("staying", "%s")', from);
		fn('this.emit("stayingIn%s")', From);
	}
	else {
		fn('this.emit("leaving%s", "%s")', From, to);
		fn('this.emit("entering%s", "%s")', To, from);
		fn('this.emit("goingFrom%sTo%s", "%s", "%s")', From, To, from, to);
	}

	return fn;
}

function updateState(fn, from, to) {
	if (from !== to) {
		fn('this.state = "%s"', to);
	}
	fn('return "%s"', to);

	return fn;
}

function putWildcardsLast(a, b) {
	return a === '_' ? 1 : -1;
}

function FSM(config) {
	events.EventEmitter.call(this);
	this.init(config);
}

util.inherits(FSM, events.EventEmitter);

FSM.prototype.init = function(config) {
	var else__ = false;
	var states = Object.keys(config);

	// pick the first state as the initial state
	this.state = states[0]; 

	// generate a function for transitioning between states
	this.change = states.reduce(function(fn, from) {
		var firstRun = true;
		fn((else__ ? 'else if' : 'if') + '(this.state === "%s") {', from);
		
		Object.keys(config[from]).sort(putWildcardsLast).reduce(function(fn, to) {
			var newState = config[from][to];
			if (isRegExp.test(to)) {
				fn((firstRun ? 'if' : 'else if') + '(%s.test(input)) {', to);
			}
			else if (to !== '_'){
				fn((firstRun ? 'if' : 'else if') + '(input === "%s") {', to);
			}
			else {
				fn((firstRun ? '' : 'else {'));
				generateEmit(fn, from, newState);
				updateState(fn, from, newState);
				fn((firstRun ? '' : '}'));
				return fn;
			}

			generateEmit(fn, from, newState);
			updateState(fn, from, newState);
			firstRun = false;
			fn('}');
			
			return fn;
		}, fn)('}');
		else__ = true;
		return fn;
	}, genfun('function(input) {'))('}').toFunction();

	delete this.init;
};

FSM.prototype.state = '';
FSM.prototype.states = {};
FSM.prototype.change = function() {};

module.exports = FSM;

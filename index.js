var genfun = require('generate-function');

var isRegExp = new RegExp('^\/.*\/(?:[gim]*)$');

function generateEmit(fn, from, to) {
	var From = from[0].toUpperCase() + from.substring(1);
	var To = to[0].toUpperCase() + to.substring(1);

	if (from === '"') from = '\"';
	if (to === '"') to = '\"';
	if (from === '\\') from = '\\\\';
	if (to === '\\') to = '\\\\';

	fn('this.emit("update", "%s", "%s");', from, to);
	if (from === to) {
		fn('this.emit("staying", "%s");', from);
		fn('this.emit("stayingIn%s");', From);
	}
	else {
		fn('this.emit("leaving%s", "%s");', From, to);
		fn('this.emit("entering%s", "%s");', To, from);
		fn('this.emit("goingFrom%sTo%s", "%s", "%s");', From, To, from, to);
	}

	return fn;
}

function updateState(fn, from, to) {
	if (from !== to) {
		fn('this.state = "%s";', to);
	}
	generateEmit(fn, from, to);
	fn('return "%s";', to);

	return fn;
}

// sort function to ensure that wild cards are evaluated as the last thing
function putWildCardsLast(a, b) {
	return a === '_' ? 1 : -1;
}

function generateChangeFunction(fn, config) {
	var states = Object.keys(config);
	return states.reduce(function(fn, from, iteration){
		if (typeof config[from] !== 'object') {
			throw new Error('Input should be an object of possible transitions');
		}

		fn((iteration === 0 ? 'if' : 'else if') + '(this.state === "%s") {', from);

		Object.keys(config[from]).sort(putWildCardsLast).reduce(function(fn, to, iteration) {
			var newState = config[from][to];

			if (isRegExp.test(to)) {
				fn((iteration === 0 ? 'if' : 'else if') + '(%s.test(input)) {', to);
			}
			else if (to !== '_'){
				if (to === '"') to = '\\"';
				else if (to === '\\') to = '\\\\';
				fn((iteration === 0 ? 'if' : 'else if') + '(input === "%s") {', to);
			}
			else {
				fn((iteration === 0 ? '' : 'else {'));
				updateState(fn, from, newState);
				fn((iteration === 0 ? '' : '}'));
				return fn;
			}

			updateState(fn, from, newState);
			fn('}');
			return fn;
		}, fn)('}')

		return fn;
	}, fn('FSM.prototype.change = function(input) {'))('};');
}

function generateFSM(fsm) {
	if (typeof fsm !== 'object' || Object.keys(fsm).length === 0) {
		throw new Error('input should be an object');
	}

	var states = Object.keys(fsm);
	var fn = genfun()
	('function(){')
	  ('function FSM(state) {')
		('if (! (this instanceof FSM)) { return new FSM(state); }')
		('EventEmitter.call(this);')
		('this.state = state || this.state;')
	  ('}')
	  ('util.inherits(FSM, EventEmitter);');
	  generateChangeFunction(fn, fsm);
	  fn()
	  ('FSM.prototype.state = "%s";', states[0])
	  ('return FSM;')
	('}()');

	return fn;
}

module.exports = function(fsm) {
	return generateFSM(fsm).toFunction({
		EventEmitter: require('events').EventEmitter,
		util: require('util')
	});
};

module.exports.toString = function(fsm) {
	return generateFSM(fsm).toString();
};

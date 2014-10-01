var test = require('tape');
var FSM = require('../index.js');

test('test transit into a new state', function(t) {
	t.plan(2);
	var Machine = FSM({
		a: { a: 'a', b: 'b' },
		b: { a: 'a', b: 'b' }
	});
	var machine = new Machine();
	t.equal(machine.state, 'a');
	machine.change('b');
	t.equal(machine.state, 'b');
});

test('should stay at the state state if it transitions into an unknown state', function(t) {
	t.plan(2);
	var Machine = FSM({
		initial: { a: 'c' }
	});
	var machine = new Machine();
	t.equal(machine.state, 'initial');
	machine.change('z');
	t.equal(machine.state, 'initial');
});

test('test underscore as catch all', function(t) {
	t.plan(1);
	var Machine = FSM({
		initial: { _: 'b' },
		b: { initial: 'initial' }
	});
	var machine = new Machine();
	machine.change('z');
	t.equal(machine.state, 'b');
});

test('catch alls should always be the last element in list', function(t) {
	// In the generated function, wild cards (_) should always be evaluated
	// as the last thing, thus in this example `a` should be evaluated before
	// `_`, and reach the `foo` state instead of the `baz` state.
	t.plan(2);
	var Machine = FSM({
		initial: { _: 'baz', a: 'foo' },
		baz: { _: 'initial' },
		foo: { _: 'initial' }
	});
	var machine = new Machine();
	machine.change('a');
	t.notEqual(machine.state, 'baz');
	t.equal(machine.state, 'foo');
});

test('should support regular expressions', function(t) {
	t.plan(2);
	var Machine = FSM({
		lowerCase: {
			'/[a-z]/': 'lowerCase',
			'/[A-Z]/': 'upperCase'
		},
		upperCase: {
			'/[a-z]/': 'lowerCase',
			'/[A-Z]/': 'upperCase'
		}
	});
	var machine = new Machine();
	machine.change('a');
	machine.change('K');
	t.equals(machine.state, 'upperCase');
	machine.change('a');
	t.equals(machine.state, 'lowerCase');
})

//=test-events
test('should emit an update(from, to) event changing state', function(t) {
	t.plan(2);
	var Machine = FSM({
		a: { b: 'b' },
		b: { a: 'a' }
	});
	var machine = new Machine();
	machine.on('update', function(from, to) {
		t.equal(from, 'a');
		t.equal(to, 'b');
	});
	machine.change('b');
});

test('should emit a goingFromAtoB(from, to) event when going from a to b', function(t) {
	t.plan(2);
	var Machine = FSM({
		a: { b: 'b' },
		b: { a: 'a' }
	});
	var machine = new Machine();
	machine.on('goingFromAToB', function(from, to) {
		t.equal(from, 'a');
		t.equal(to, 'b');
	});
	machine.change('b');
});

test('should emit a leavingA(to) event when going from a to b', function(t) {
	t.plan(1);
	var Machine = FSM({
		a: { b: 'b' },
		b: { a: 'a' }
	});
	var machine = new Machine();
	machine.on('leavingA', function(to) {
		t.equal(to, 'b');
	});
	machine.change('b');
});

test('should emit an enteringB(from) event when going from a to b', function(t) {
	t.plan(1);
	var Machine = FSM({
		a: { b: 'b' },
		b: { a: 'a' }
	});
	var machine = new Machine();
	machine.on('enteringB', function(from) {
		t.equal(from, 'a');
	});
	machine.change('b');
});


// Random FSM examples
test('turnstile example', function(t) {
	t.plan(1);
	var Turnstile = FSM({
		locked: {
			coin: 'unlocked',
			push: 'locked'
		},
		unlocked: {
			push: 'locked',
			coin: 'unlocked'
		}
	});
	var turnstile = new Turnstile();
	var states = [];
	turnstile.on('update', function(to) {
		states.push(to);
	});
	
	turnstile.change('push');
	turnstile.change('coin');
	turnstile.change('coin');
	turnstile.change('push');
	turnstile.change('push');

	t.deepEqual(states, ['locked', 'locked', 'unlocked', 'unlocked', 'locked']);
});

test('should handle the \'nice\'-example found on wikipedia', function(t) {
	t.plan(1);
	var Machine = FSM({
		initial: { n: 'n', _: 'initial' },
		n: { i: 'ni', _: 'initial' },
		ni: { c: 'nic', _: 'initial' },
		nic: { e: 'nice' },
		nice: { _: 'nice' }
	});
	var machine = new Machine();

	machine.change('n');
	machine.change('i');
	machine.change('c');
	machine.change('e');

	t.equals(machine.state, 'nice');
});

test('should handle double quotes as input', function(t) {
	t.plan(1);
	var Machine = FSM({
		initial: { '"': 'double quote' },
		'double quote': {}
	});
	var machine = new Machine();
	machine.change('"');
	t.equal(machine.state, 'double quote');
});

test('should handle single quotes as input', function(t) {
	t.plan(1);
	var Machine = FSM({
		initial: { "'": 'single quote' },
		'single quote': {}
	});
	var machine = new Machine();
	machine.change("\'");
	t.equal(machine.state, 'single quote');
});

test('should handle backslash as input', function(t) {
	t.plan(1);
	var Machine = FSM({
		initial: { "\\": 'backslash' },
		backslash: {}
	});
	var machine = new Machine();
	machine.change("\\");
	t.equal(machine.state, 'backslash');
});

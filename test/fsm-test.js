var test = require('tape');
var FSM = require('../index.js');

test('test transit into a new state', function(t) {
	t.plan(2);
	var machine = new FSM({
		a: { a: 'a', b: 'b' },
		b: { a: 'a', b: 'b' }
	});
	t.equal(machine.state, 'a');
	machine.change('b');
	t.equal(machine.state, 'b');
});

test('should stay at the state state if it transitions into an unknown state', function(t) {
	t.plan(2);
	var machine = new FSM({
		initial: { a: 'c' }
	});
	t.equal(machine.state, 'initial');
	machine.change('z');
	t.equal(machine.state, 'initial');
});

test('test underscore as catch all', function(t) {
	t.plan(1);
	var machine = new FSM({
		initial: { _: 'b' },
		b: { initial: 'initial' }
	});
	machine.change('z');
	t.equal(machine.state, 'b');
});

test('catch alls should always be the last element in list', function(t) {
	// In the generated function, wild cards (_) should always be evaluated
	// as the last thing, thus in this example `a` should be evaluated before
	// `_`, and reach the `foo` state instead of the `baz` state.
	t.plan(2);
	var machine = new FSM({
		initial: { _: 'baz', a: 'foo' },
		baz: { _: 'initial' },
		foo: { _: 'initial' }
	});
	machine.change('a');
	t.notEqual(machine.state, 'baz');
	t.equal(machine.state, 'foo');
});

test('should support regular expressions', function(t) {
	t.plan(2);
	var machine = new FSM({
		lowerCase: {
			'/[a-z]/': 'lowerCase',
			'/[A-Z]/': 'upperCase'
		},
		upperCase: {
			'/[a-z]/': 'lowerCase',
			'/[A-Z]/': 'upperCase'
		}
	});
	machine.change('a');
	machine.change('K');
	t.equals(machine.state, 'upperCase');
	machine.change('a');
	t.equals(machine.state, 'lowerCase');
})

//=test-events
test('should emit an update(from, to) event changing state', function(t) {
	t.plan(2);
	var machine = new FSM({
		a: { b: 'b' },
		b: { a: 'a' }
	});
	machine.on('beforeUpdate', function(from, to) {
		t.equal(from, 'a');
		t.equal(to, 'b');
	});
	machine.change('b');
});

test('should emit a goingFromAtoB(from, to) event when going from a to b', function(t) {
	t.plan(2);
	var machine = new FSM({
		a: { b: 'b' },
		b: { a: 'a' }
	});
	machine.on('goingFromAToB', function(from, to) {
		t.equal(from, 'a');
		t.equal(to, 'b');
	});
	machine.change('b');
});

test('should emit a leavingA(to) event when going from a to b', function(t) {
	t.plan(1);
	var machine = new FSM({
		a: { b: 'b' },
		b: { a: 'a' }
	});
	machine.on('leavingA', function(to) {
		t.equal(to, 'b');
	});
	machine.change('b');
});

test('should emit an enteringB(from) event when going from a to b', function(t) {
	t.plan(1);
	var machine = new FSM({
		a: { b: 'b' },
		b: { a: 'a' }
	});
	machine.on('enteringB', function(from) {
		t.equal(from, 'a');
	});
	machine.change('b');
});


// Random FSM examples
test('turnstile example', function(t) {
	t.plan(1);
	var turnstile = new FSM({
		locked: {
			coin: 'unlocked',
			push: 'locked'
		},
		unlocked: {
			push: 'locked',
			coin: 'unlocked'
		}
	});

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
	var machine = new FSM({
		initial: { n: 'n', _: 'initial' },
		n: { i: 'ni', _: 'initial' },
		ni: { c: 'nic', _: 'initial' },
		nic: { e: 'nice' },
		nice: { _: 'nice' }
	});

	machine.change('n');
	machine.change('i');
	machine.change('c');
	machine.change('e');

	t.equals(machine.state, 'nice');
});

test('should handle double quotes as input', function(t) {
	t.plan(1);
	var machine = new FSM({
		initial: { '"': 'double quote' },
		'double quote': {}
	});

	machine.change('"');
	t.equal(machine.state, 'double quote');
});

test('should handle single quotes as input', function(t) {
	t.plan(1);
	var machine = new FSM({
		initial: { "'": 'single quote' },
		'single quote': {}
	});

	machine.change("\'");
	t.equal(machine.state, 'single quote');
});

test('should handle backslash as input', function(t) {
	t.plan(1);
	var machine = new FSM({
		initial: { "\\": 'backslash' },
		backslash: {}
	});

	machine.change("\\");
	t.equal(machine.state, 'backslash');
});

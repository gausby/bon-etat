# Bon état - a finite state machine.

A finite state machine that uses code generation.

## Usage
The following creates a finite state machine that defines a turnstile:

```js
var FSM = require('bon-etat');

// define a state machine like this:
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
// and create instances of this state machine like this:
var turnstile = new Turnstile();
var turnstile2 = new Turnstile('unlocked'); // initialized in unlocked state
```

It is now possible to send events to the state machine (`.change`), and ask for its state (`.state`), like this:

```js
console.log(turnstile.state); // 'locked'
turnstile.change('push');
console.log(turnstile.state); // 'locked'
turnstile.change('coin');
console.log(turnstile.state); // 'unlocked'
turnstile.change('push');
console.log(turnstile.state); // 'locked'
```

Notice, unless the state is passed in as the argument to the state machine instance, the initial state will be the first defined state passed in the state machine definition. That is why the `turnstile` is in the *locked* state upon initialization.


### Emitted transition events
The following events are emitted when the state machine changes state:

  * `update` *`function(from, to)`*, whenever the state machine receive an update command. This will get triggered even if the state stays the same.
  * `goingFromAToB` *`function(from, to)`*, when ever the state transitions from a state to another. These events are auto generated based on the state names, so in the turnstile example from the previous section, the transition from *locked -> unlocked* would emit *`goingFromLockedToUnlocked`*.
  * `leavingA` *`function(to)`* whenever the state machine leaves a given state. These are auto generated from the state names, so if the current state is *locked* the event *`leavingLocked`* would be emitted.
  * `enteringA` *`function(from)`*, same as leavingA, but triggers when the state changes into the given state.

Example:
```js
// using the turnstile from the previous section
turnstile.on('leavingLocked', function(to) {
    console.log('Leaving locked state to:', to);
})
turnstile.change('coin');
// 'Leaving locked state to: unlocked'
```

The following events will get emitted if a state update causes the state machine to stay in its current state:

  * `staying` *`function(state)`* the state did not change.
  * `stayingInA` *`function()`* the state of a specific state remained the same. ie. staying in the locked state would emit `stayingInLocked`.

Only the update event will emit on all update-events.


## Install

Get the latest version from NPM.

```sh
npm install bon-etat --save
```

## License

The MIT License (MIT)

Copyright (c) 2014 Martin Gausby and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.


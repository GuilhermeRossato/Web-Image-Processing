/*
 * Guilherme Rossato - June 2017
 *
 * A class to simplify a state machine with state and lastState property.
 * The input must contain a transition list.
 *
 * Examples of usages:
 * new StateMachine({transitions: [last:"*", next:"idle", event:()=>console.log("initialize!")]);
 * new StateMachine({state: "idle", transitions: [last:"idle", next:"moving", event:()=>console.log("started moving!")]);
 */

function StateMachine(config) {
	(!config.transitions) && (console.warn("Missing transition list!"));
	let currentState = config.state
	  , lastState = config.lastState;
	Object.defineProperty(this, "state", {
		get: function() {
			return currentState;
		},
		set: function(newState) {
			let acceptedTransition = false;
			config.transitions.forEach(transition=>(((transition.last === "*") || (transition.last === this.state)) && (transition.next === newState) && (acceptedTransition = true) && transition.event && transition.event.call(this, lastState, newState)));
			if (acceptedTransition) {
				lastState = currentState;
				currentState = newState;
			} else {
				console.warn(`Unhandled transition: From "${currentState}" to "${newState}"`);
			}
		}
	});
	Object.defineProperty(this, "lastState", {
		get: function() {
			return lastState;
		},
		set: function(s) {
			console.warn("Value can't be set");
		}
	});
}

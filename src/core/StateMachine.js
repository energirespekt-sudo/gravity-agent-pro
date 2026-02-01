export class StateMachine {
    constructor() {
        this.states = new Map();
        this.currentValue = null;
    }

    register(name, state) {
        this.states.set(name, state);
    }

    change(name, params = {}) {
        if (this.currentValue && this.currentValue.exit) {
            this.currentValue.exit();
        }

        const nextState = this.states.get(name);
        if (nextState) {
            this.currentValue = nextState;
            if (this.currentValue.enter) {
                this.currentValue.enter(params);
            }
        } else {
            console.error(`State '${name}' not found!`);
        }
    }

    update(dt) {
        if (this.currentValue && this.currentValue.update) {
            this.currentValue.update(dt);
        }
    }

    render(alpha) {
        if (this.currentValue && this.currentValue.render) {
            this.currentValue.render(alpha);
        }
    }
}

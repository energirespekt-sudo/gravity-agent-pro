export class Entity {
    constructor(id) {
        this.id = id;
        this.components = new Map();
        this.tags = new Set();
        this.isActive = true;
    }

    addComponent(component) {
        this.components.set(component.constructor.name, component);
        return this;
    }

    getComponent(componentClass) {
        return this.components.get(componentClass.name);
    }

    hasComponent(componentClass) {
        return this.components.has(componentClass.name);
    }

    removeComponent(componentClass) {
        this.components.delete(componentClass.name);
    }

    addTag(tag) {
        this.tags.add(tag);
    }

    hasTag(tag) {
        return this.tags.has(tag);
    }
}

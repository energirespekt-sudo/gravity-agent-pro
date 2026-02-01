import { Entity } from './Entity.js';

export class EntityManager {
    constructor() {
        this.entities = [];
        this.nextId = 0;
        this.entitiesToAdd = [];
        this.entitiesToRemove = new Set();
    }

    createEntity() {
        const entity = new Entity(this.nextId++);
        this.entitiesToAdd.push(entity);
        return entity;
    }

    removeEntity(entity) {
        this.entitiesToRemove.add(entity.id);
        entity.isActive = false;
    }

    // Call this at start of update loop
    update() {
        // Add new
        if (this.entitiesToAdd.length > 0) {
            this.entities.push(...this.entitiesToAdd);
            this.entitiesToAdd = [];
        }

        // Remove dead
        if (this.entitiesToRemove.size > 0) {
            this.entities = this.entities.filter(e => !this.entitiesToRemove.has(e.id));
            this.entitiesToRemove.clear();
        }
    }

    getEntities() {
        return this.entities;
    }

    getEntitiesWith(componentClass) {
        return this.entities.filter(e => e.hasComponent(componentClass));
    }

    getEntitiesWithTag(tag) {
        return this.entities.filter(e => e.hasTag(tag));
    }
}

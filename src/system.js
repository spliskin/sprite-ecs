const FArray = require('./types/farray');
const { BitField, makeSig } = require('./componentsig');

/**
 * A system update all eligible entities at a given frequency.
 * This class is not meant to be used directly and should be sub-classed to
 * define specific logic.
 *
 * @class
 * @alias ECS.System
 */
class System {
    static sig = new BitField(8);
    get sig() { return this.constructor.sig; }

    static spec(...components) {
        var sig = new BitField(32);
        makeSig(sig, components);
        return sig;
    }

    /**
     *
     * @param {number} frequency Frequency of execution.
     */
    constructor(frequency = 1) {
        /**
         * Frequency of update execution, a frequency of `1` run the system every
         * update, `2` will run the system every 2 updates, ect.
         *
         * @member {number}
         */
        this.frequency = frequency;

        /**
         * Entities of the system.
         *
         * @member {Entity[]}
         */
        this.entities = new FArray(16);

        /**
         * Flag that tells the ECS to actually use this system. Since adding/removing
         * a system can be expensive, this is a way to temporarily disable a system
         * without taking the cost of recalculating the eligibility of all the entities.
         *
         * @member {boolean}
         */
        this.enable = true;
    }

    /**
     * Add an entity to the system entities.
     *
     * @param {Entity} entity - The entity to add to the system.
     */
    addEntity(entity) {
        entity._addSystem(this);
        this.entities.push(entity);

        this.enter(entity);
    }

    /**
     * Remove an entity from the system entities. exit() handler is executed
     * only if the entity actually exists in the system entities.
     *
     * @param {Entity} entity - Reference of the entity to remove.
     */
    removeEntity(entity) {
        const index = this.entities.indexOf(entity);

        if (index !== -1) {
            entity._removeSystem(this);
            this.entities.removeAt(index);

            this.exit(entity);
        }
    }

    /**
     * Initialize the system. This is called when the system is added
     * to the ECS manager.
     *
     */
    initialize() {} // eslint-disable-line no-empty-function

    /**
     * Dispose the system by exiting all the entities. This is called
     * when the system is removed from the ECS manager.
     *
     */
    dispose() {
        for (let i = 0; i < this.entities.size; ++i) {
            this.entities[i]._removeSystem(this);
            this.exit(this.entities[i]);
        }
    }

    /**
     * Abstract method to subclass. Should return true if the entity is eligible
     * to the system, false otherwise.
     *
     * @param {Entity} entity - The entity to test.
     * @return {boolean} True if entity should be included.
     */
    test(entity) { // eslint-disable-line no-unused-vars
        return this.sig.subset(entity.sig);
    }

    /**
     * Abstract method to subclass. Called when an entity is added to the system.
     *
     * @param {Entity} entity - The added entity.
     */
    enter(entity) {} // eslint-disable-line no-empty-function,no-unused-vars

    /**
     * Abstract method to subclass. Called when an entity is removed from the system.
     *
     * @param {Entity} entity - The removed entity.
     */
    exit(entity) {} // eslint-disable-line no-empty-function,no-unused-vars

    /**
     * Abstract method to subclass. Called for each entity to update. This is
     * the only method that should actual mutate entity state.
     *
     * @param {Entity} entity - The entity to update.
     * @param {number} elapsed - The time elapsed since last update call.
     */
    update(elapsed) {} // eslint-disable-line no-empty-function,no-unused-vars

    //run(elapsed) {
    //    for(var j=0, e=this.entities.size; j < e; j++) {
    //        this.update(this.entities[j], elapsed);
    //    }
    //}
}

exports = module.exports = System;

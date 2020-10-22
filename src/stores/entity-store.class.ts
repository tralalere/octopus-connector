import {DataEntity} from "../data-structures/data-entity.class";
import {Observable, BehaviorSubject, ReplaySubject} from "rxjs";

/**
 * Entity store: where the entities and the entities observables are stored for an endpoint
 */
export class EntityStore {

    /**
     * Stores entities subjects, indexed by entity id
     * @type {{}}
     */
    private entitiesObservables:{[key:number]:ReplaySubject<DataEntity>} = {};

    /**
     * Creates the store
     */
    constructor() {}


    clear(): void {

    }

    /**
     * Registers the entity in store and update associated subject. If the subject does not exists, creates it
     * @param {DataEntity} entity Entity to register
     * @param {number} id Entity id
     * @returns {Observable<DataEntity>} Observable associated to the entity
     */
    registerEntity(entity:DataEntity, id:number|string):Observable<DataEntity> {

        if (id !== -1 && this.entitiesObservables[id]) {
            this.entitiesObservables[id].next(entity);
            return this.entitiesObservables[id];
        } else {
            let subject:ReplaySubject<DataEntity> = new ReplaySubject<DataEntity>(1);
            subject.next(entity);

            if (id !== -1) {
                this.entitiesObservables[id] = subject;
            }

            return subject;
        }

    }

    /**
     * Register an entity subject to a specified id
     * @param {number} id Id used for registration
     * @param {ReplaySubject<DataEntity>} subject Subject to register
     */
    registerEntitySubject(id:number, subject:ReplaySubject<DataEntity>) {
        if (id !== -1) {
            this.entitiesObservables[id] = subject;
        }
    }

    /**
     * Delete all data for a specific entity id
     * @param {number} id Entity id
     */
    unregister(id:number|string) {
        if (this.entitiesObservables[id]) {
            delete this.entitiesObservables[id];
        }
    }

    /**
     * Delete entity from store
     * @param {DataEntity} entity Entity to delete
     */
    unregisterEntity(entity:DataEntity) {
        delete this.entitiesObservables[entity.id];
    }

    /**
     * Returns the observable associated to the specified id
     * @param {number} id Id used in registration
     * @returns {Observable<DataEntity>} Entity subject associated to the id
     */
    getEntityObservable(id:number|string, createObservable: boolean = false):ReplaySubject<DataEntity> {

        if (this.entitiesObservables[id] && createObservable === false) {
            return this.entitiesObservables[id];
        } else {
            let subject:ReplaySubject<DataEntity> = new ReplaySubject<DataEntity>(1);
            this.entitiesObservables[id] = subject;
            return subject;
        }
    }

    /**
     * Returns true if entity is defined in store
     * @param {number} entityId Entity id
     * @returns {boolean}
     */
    isInStore(entityId:number):boolean {
        return !!this.entitiesObservables[entityId];
    }
}
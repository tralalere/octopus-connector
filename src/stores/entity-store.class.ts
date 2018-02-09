import {DataEntity} from "../data-structures/data-entity.class";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/Rx";
import {ReplaySubject} from "rxjs/Rx";

/**
 * Entity store: where the entities and the entities observables are stored for an endpoint
 */
export class EntityStore {

    /**
     * Stores entities subjects, indexed by entity id
     * @type {{}}
     */
    private entities:{[key:number]:ReplaySubject<DataEntity>} = {};

    /**
     * Creates the store
     */
    constructor() {}

    /**
     * Registers the entity in store and update associated subject. If the subject does not exists, creates it
     * @param {DataEntity} entity Entity to register
     * @param {number} id Entity id
     * @returns {Observable<DataEntity>} Observable associated to the entity
     */
    registerEntity(entity:DataEntity, id:number):Observable<DataEntity> {

        if (this.entities[id]) {
            this.entities[id].next(entity);
            return this.entities[id];
        } else {
            let subject:ReplaySubject<DataEntity> = new ReplaySubject<DataEntity>(1);
            subject.next(entity);
            this.entities[id] = subject;
            return subject;
        }

    }

    /**
     * Register an entity subject to a specified id
     * @param {number} id Id used for registration
     * @param {ReplaySubject<DataEntity>} subject Subject to register
     */
    registerEntitySubject(id:number, subject:ReplaySubject<DataEntity>) {
        this.entities[id] = subject;
    }

    /**
     * Returns the observable associated to the specified id
     * @param {number} id Id used in registration
     * @returns {Observable<DataEntity>} Entity subject associated to the id
     */
    getEntityObservable(id:number):Observable<DataEntity> {

        if (this.entities[id]) {
            return this.entities[id];
        } else {
            let subject:ReplaySubject<DataEntity> = new ReplaySubject<DataEntity>(1);
            this.entities[id] = subject;
            return subject;
        }
    }
}
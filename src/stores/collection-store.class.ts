import {Observable} from "rxjs/Observable";
import {DataCollection} from "../data-structures/data-collection.class";
import * as ObjectHash from "object-hash";
import {BehaviorSubject} from "rxjs/Rx";
import {ReplaySubject} from "rxjs/Rx";
import {DataEntity} from "../data-structures/data-entity.class";
import {FilterData} from "../types";

/**
 * Collection store: where the collections and the collection observables are stored for an endpoint
 */
export class CollectionStore {

    /**
     * Stored collection observables, indexed by filter hash
     * @type {{}}
     */
    private collectionObservables:{[key:string]:ReplaySubject<DataCollection>} = {};

    /**
     * Filters indexed by their hash
     * @type {{}}
     */
    private filters:FilterData = {};

    /**
     * Stored collections, indexed by filter hash
     * @type {{}}
     */
    private collections:{[key:string]:DataCollection} = {};

    /**
     * Creates the store
     */
    constructor() {}

    /**
     * Registers the collection in store and update associated subject. If the subject does not exists, creates it
     * @param {DataCollection} collection Collection to register
     * @param {FilterData} filter Collection filter
     * @returns {Observable<DataCollection>} Observable associated to the collection
     */
    registerCollection(collection:DataCollection, filter:FilterData):Observable<DataCollection> {

        let hash:string = ObjectHash(filter);
        this.filters[hash] = filter;
        this.collections[hash] = collection;

        if (this.collectionObservables[hash]) {
            this.collectionObservables[hash].next(collection);
            return this.collectionObservables[hash];
        } else {
            let subject:ReplaySubject<DataCollection> = new ReplaySubject<DataCollection>(1);
            subject.next(collection);
            this.collectionObservables[hash] = subject;
            return subject;
        }
    }

    registerEntityInCollections(entity:DataEntity, entityObservable:Observable<DataEntity>) {
        let collectionKeys:string[] = Object.keys(this.collections);

        collectionKeys.forEach((key:string) => {
            if (this.matchFilter(entity, this.filters[key])) {
                this.collections[key].registerEntity(entity, entityObservable);
                this.collectionObservables[key].next(this.collections[key]);
            }
        });
    }

    /**
     * Delete entity from stored collections
     * @param {DataEntity} entity Entity to delete
     */
    deleteEntityFromCollection(entity:DataEntity) {

        let collectionKeys:string[] = Object.keys(this.collections);

        collectionKeys.forEach((key:string) => {
            if (this.matchFilter(entity, this.filters[key])) {
                this.collections[key].deleteEntity(entity.id);
                this.collectionObservables[key].next(this.collections[key]);
            }
        });
    }

    /**
     * Test if the entity matches the filter
     * @param {DataEntity} entity Entity to test
     * @param {FilterData} filter Filter object
     * @returns {boolean} True if the entity matches the filter
     */
    matchFilter(entity:DataEntity, filter:FilterData):boolean {
        let filterKeys:string[] = Object.keys(filter);

        for (let key of filterKeys) {
            if (entity.attributes[key] !== undefined && filter[key] !== entity.attributes[key]) {
                return false;
            }
        }

        return true;
    }

    /**
     * Returns the observable associated to the specified filter
     * @param {FilterData} filter Filter object
     * @returns {Observable<DataCollection>} The observable associated to the filter object
     */
    getCollectionObservable(filter:FilterData):Observable<DataCollection> {

        let hash:string = ObjectHash(filter);

        if (this.collectionObservables[hash]) {
            return this.collectionObservables[hash];
        } else {
            let subject:ReplaySubject<DataCollection> = new ReplaySubject<DataCollection>(1);
            this.collectionObservables[hash] = subject;
            return subject;
        }
    }
}
import {Observable} from "rxjs/Observable";
import {DataCollection} from "../data-structures/data-collection.class";
import * as ObjectHash from "object-hash";
import {BehaviorSubject} from "rxjs/Rx";
import {ReplaySubject} from "rxjs/Rx";
import {DataEntity} from "../data-structures/data-entity.class";

export class CollectionStore {

    private collectionObservables:{[key:string]:ReplaySubject<DataCollection>} = {};
    private filters:{[key:string]:any} = {};
    private collections:{[key:string]:DataCollection} = {};

    constructor() {}

    registerCollection(collection:DataCollection, filter:{[key:string]:any}):Observable<DataCollection> {

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

    registerEntityInCollections(entity:DataEntity) {
        let collectionKeys:string[] = Object.keys(this.collections);

        console.log("yep");

        collectionKeys.forEach((key:string) => {
            console.log("là");
            if (this.matchFilter(entity, this.filters[key])) {
                console.log("ici");
            }
        });
    }

    matchFilter(entity:DataEntity, filter:{[key:string]:any}):boolean {
        let filterKeys:string[] = Object.keys(filter);

        for (let key of filterKeys) {
            if (entity.attributes[key] !== undefined && filter[key] !== entity.attributes[key]) {
                return false;
            }
        }

        return true;
    }

    getCollectionObservable(filter:{[key:string]:any}):Observable<DataCollection> {

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
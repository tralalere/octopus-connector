import {Observable} from "rxjs/Observable";
import {DataCollection} from "../data-structures/data-collection.class";
import * as ObjectHash from "object-hash";
import {BehaviorSubject} from "rxjs/Rx";

export class CollectionStore {

    private collections:{[key:string]:BehaviorSubject<DataCollection>} = {};
    private filters:{[key:string]:any} = {};

    constructor() {}

    registerCollection(collection:DataCollection, filter:{[key:string]:any}):Observable<DataCollection> {

        let hash:string = ObjectHash(filter);
        this.filters[hash] = filter;

        if (this.collections[hash]) {
            this.collections[hash].next(collection);
            return this.collections[hash];
        } else {
            let subject:BehaviorSubject<DataCollection> = new BehaviorSubject<DataCollection>(collection);
            this.collections[hash] = subject;
            return subject;
        }
    }

    getCollection(filter:{[key:string]:any}):Observable<DataCollection> {
        let hash:string = ObjectHash(filter);
        return this.collections[hash] ? this.collections[hash] : null;
    }
}
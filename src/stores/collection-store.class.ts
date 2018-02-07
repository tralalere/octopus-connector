import {Observable} from "rxjs/Observable";
import {DataCollection} from "../data-structures/data-collection.class";
import * as ObjectHash from "object-hash";
import {BehaviorSubject} from "rxjs/Rx";
import {ReplaySubject} from "rxjs/Rx";

export class CollectionStore {

    private collections:{[key:string]:ReplaySubject<DataCollection>} = {};
    private filters:{[key:string]:any} = {};

    constructor() {}

    registerCollection(collection:DataCollection, filter:{[key:string]:any}):Observable<DataCollection> {

        let hash:string = ObjectHash(filter);
        this.filters[hash] = filter;

        if (this.collections[hash]) {
            this.collections[hash].next(collection);
            return this.collections[hash];
        } else {
            let subject:ReplaySubject<DataCollection> = new ReplaySubject<DataCollection>(1);
            subject.next(collection);
            this.collections[hash] = subject;
            return subject;
        }
    }

    getCollectionObservable(filter:{[key:string]:any}):Observable<DataCollection> {

        let hash:string = ObjectHash(filter);

        if (this.collections[hash]) {
            return this.collections[hash];
        } else {
            let subject:ReplaySubject<DataCollection> = new ReplaySubject<DataCollection>(1);
            this.collections[hash] = subject;
            return subject;
        }
    }
}
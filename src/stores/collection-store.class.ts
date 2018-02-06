import {Observable} from "rxjs/Observable";
import {DataCollection} from "../data-structures/data-collection.class";
import * as ObjectHash from "object-hash";

export class CollectionStore {

    private collections:{[key:string]:Observable<DataCollection>} = {};
    private filters:{[key:string]:any} = {};

    constructor() {}

    addCollection(collection:Observable<DataCollection>, filter:{[key:string]:any}) {
        let hash:string = ObjectHash(filter);
        this.collections[hash] = collection;
        this.filters[hash] = filter;
    }

    getCollection(filter:{[key:string]:any}):Observable<DataCollection> {
        let hash:string = ObjectHash(filter);
        return this.collections[hash] ? this.collections[hash] : null;
    }
}
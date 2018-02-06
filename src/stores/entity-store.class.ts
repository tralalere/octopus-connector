import {DataEntity} from "../data-structures/data-entity.class";
import {Observable} from "rxjs/Observable";

export class EntityStore {

    private entities:{[key:number]:Observable<DataEntity>} = {};

    constructor() {}

    addEntity(entity:Observable<DataEntity>, id:number) {
        this.entities[id] = entity;
    }

    getEntity(id:number):Observable<DataEntity> {
        return this.entities[id] ? this.entities[id] : null;
    }
}
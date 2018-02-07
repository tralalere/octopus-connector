import {DataEntity} from "../data-structures/data-entity.class";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/Rx";

export class EntityStore {

    private entities:{[key:number]:BehaviorSubject<DataEntity>} = {};

    constructor() {}

    registerEntity(entity:DataEntity, id:number):Observable<DataEntity> {

        if (this.entities[id]) {
            this.entities[id].next(entity);
            return this.entities[id];
        } else {
            let subject:BehaviorSubject<DataEntity> = new BehaviorSubject<DataEntity>(entity);
            this.entities[id] = subject;
            return subject;
        }

    }

    getEntity(id:number):Observable<DataEntity> {
        return this.entities[id] ? this.entities[id] : null;
    }
}
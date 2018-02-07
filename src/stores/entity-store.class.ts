import {DataEntity} from "../data-structures/data-entity.class";
import {Observable} from "rxjs/Observable";
import {BehaviorSubject} from "rxjs/Rx";
import {ReplaySubject} from "rxjs/Rx";

export class EntityStore {

    private entities:{[key:number]:ReplaySubject<DataEntity>} = {};

    constructor() {}

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

    registerEntitySubject(id:number, subject:ReplaySubject<DataEntity>) {
        this.entities[id] = subject;
    }

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
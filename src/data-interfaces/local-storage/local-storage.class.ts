/**
 * Created by Christophe on 12/10/2017.
 */
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {DataEntity} from "../../data-structures/data-entity.class";
import {DataCollection} from "../../data-structures/data-collection.class";
import {LocalStorageConfiguration} from "./local-storage-configuration.interface";
import {DataConnector} from "../../data-connector.class";
import {ExternalInterface} from "../abstract-external-interface.class";

export class LocalStorage extends ExternalInterface {

    private dataStore:{[key:string]:Object} = {};
    
    constructor(
        private configuration:LocalStorageConfiguration,
        private connector:DataConnector
    ) {
        super();
    }

    private getPrefixedType(type:string):string {
        if (this.configuration.prefix) {
            return this.configuration.prefix + "-" + type;
        } else {
            return type;
        }
    }

    private loadPointFromStorage(pointName:string) {
        if (!localStorage[pointName] || localStorage[pointName] === "") {
            this.dataStore[pointName] = {};
        } else {
            this.dataStore[pointName] = JSON.parse(localStorage[pointName]);
        }
    }

    private loadPointFromStorageIfEmpty(type:string) {
        let pointName:string = this.getPrefixedType(type);

        if (!this.dataStore[pointName]) {
            this.loadPointFromStorage(pointName);
        }
    }

    private setEntityInStore(type:string, id:number, data:{[key:string]:any}) {
        let pointName:string = this.getPrefixedType(type);
        this.loadPointFromStorageIfEmpty(type);
        this.dataStore[pointName][id] = data;
        this.savePointToStorage(type);
    }

    private getEntityFromStore(type:string, id:number):{[key:string]:any} {
        let pointName:string = this.getPrefixedType(type);
        this.loadPointFromStorageIfEmpty(type);
        return this.dataStore[pointName][id];
    }

    private savePointToStorage(type:string) {
        let pointName:string = this.getPrefixedType(type);

        if (this.dataStore[pointName]) {
            localStorage[pointName] = JSON.stringify(this.dataStore[pointName]);
        }
    }

    private set lastUsedId(value:number) {
        let lastUsedIdKey:string = this.getPrefixedType("lastusedid");

        localStorage[lastUsedIdKey] = value;
    }

    private get lastUsedId():number {
        let lastUsedIdKey:string = this.getPrefixedType("lastusedid");

        if (!localStorage[lastUsedIdKey] || localStorage[lastUsedIdKey] === "") {
            return 0;
        } else {
            return +localStorage[lastUsedIdKey];
        }
    }

    loadEntity(type:string, id:number, fields:string[] = []):Observable<DataEntity> {
        this.loadPointFromStorageIfEmpty(type);
        let data:{[key:number]:any} = this.getEntityFromStore(type, id);

        let entity:DataEntity = data ? new DataEntity(type, data, this.connector, id) : null;

        return new BehaviorSubject(entity);
    }

    loadCollection(type:string, filter:{[key:string]:any} = null, order:{[key:string]:string}, fields:string[] = null):Observable<DataCollection> {
        this.loadPointFromStorageIfEmpty(type);
        return Observable.create();
    }

    saveEntity():Observable<DataEntity> {
        return Observable.create();
    }

    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity> {
        let newId:number = ++this.lastUsedId;
        let entity:DataEntity = new DataEntity(type, data, this.connector, newId);
        this.setEntityInStore(type, newId, data);
        return new BehaviorSubject<DataEntity>(entity);
    }
}
/**
 * Created by Christophe on 12/10/2017.
 */
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {LocalStorageConfiguration} from "./local-storage-configuration.interface";
import {DataConnector} from "../../data-connector.class";
import {ExternalInterface} from "../abstract-external-interface.class";
import {CollectionDataSet, EntityDataSet} from "../../types";
import {DataEntity} from "../../data-structures/data-entity.class";

export class LocalStorage extends ExternalInterface {

    private dataStore:CollectionDataSet = {};
    
    constructor(
        private configuration:LocalStorageConfiguration,
        private connector:DataConnector
    ) {
        super();
        this.useDiff = false;
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

    private getEntityFromStore(type:string, id:number):EntityDataSet {
        let pointName:string = this.getPrefixedType(type);
        this.loadPointFromStorageIfEmpty(type);
        return this.dataStore[pointName][id];
    }

    private deleteEntityFromStore(type:string, id:number):boolean {
        let pointName:string = this.getPrefixedType(type);
        this.loadPointFromStorageIfEmpty(type);

        if (this.dataStore[pointName][id]) {
            delete this.dataStore[pointName][id];
            this.savePointToStorage(type);
            return true;
        }

        return false;
    }

    private getCollectionFromStore(type:string, filter:{[key:string]:any} = {}):CollectionDataSet {

        let pointName:string = this.getPrefixedType(type);
        this.loadPointFromStorageIfEmpty(type);

        let dataSet:CollectionDataSet = {};

        let keys:string[] = Object.keys(this.dataStore[pointName]);
        let filterKeys:string[] = Object.keys(filter);

        keys.forEach((key:string) => {
            let matching:boolean = true;

            filterKeys.forEach((filterKey:string) => {
                if (filter[filterKey] !== this.dataStore[pointName][+key][filterKey]) {
                    matching = false;
                }
            });

            if (matching) {
                dataSet[+key] = this.dataStore[pointName][+key];
            }
        });

        return dataSet;
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

        if (localStorage[lastUsedIdKey] === undefined || localStorage[lastUsedIdKey] === "") {
            return 0;
        } else {
            return +localStorage[lastUsedIdKey];
        }
    }

    loadEntity(type:string, id:number, fields:string[] = []):EntityDataSet {
        this.loadPointFromStorageIfEmpty(type);
        let data:EntityDataSet = this.getEntityFromStore(type, id);

        return data ? data : null;
    }

    loadCollection(type:string, filter:{[key:string]:any} = {}):CollectionDataSet {
        this.loadPointFromStorageIfEmpty(type);
        let data:CollectionDataSet = this.getCollectionFromStore(type, filter);

        return data ? data : null;
    }

    saveEntity(entity:EntityDataSet, type:string, id:number):EntityDataSet {
        this.loadPointFromStorageIfEmpty(type);
        this.setEntityInStore(type, id, entity);

        return entity;
    }

    createEntity(type:string, data:EntityDataSet):EntityDataSet {
        let newId:number = ++this.lastUsedId;
        data.id = newId;
        this.setEntityInStore(type, newId, data);
        return data;
    }

    deleteEntity(type:string, id:number):boolean {
        this.loadPointFromStorageIfEmpty(type);
        return this.deleteEntityFromStore(type, id);
    }
}
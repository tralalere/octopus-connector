/**
 * Created by Christophe on 12/10/2017.
 */
import {ExternalInterface} from "../external-interface.interface";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {DataEntity} from "../../data-structures/data-entity.class";
import {DataCollection} from "../../data-structures/data-collection.class";
import {LocalStorageConfiguration} from "./local-storage-configuration.interface";
import {DataConnector} from "../../data-connector.class";

export class LocalStorage implements ExternalInterface {

    private _dataStore:{[key:string]:Object} = {};
    
    constructor(
        private _configuration:LocalStorageConfiguration,
        private _connector:DataConnector
    ) {}

    private _getPrefixedType(type:string):string {
        if (this._configuration.prefix) {
            return this._configuration.prefix + "-" + type;
        } else {
            return type;
        }
    }

    private _loadPointFromStorage(pointName:string) {
        if (!localStorage[pointName] || localStorage[pointName] === "") {
            this._dataStore[pointName] = {};
        } else {
            this._dataStore[pointName] = JSON.parse(localStorage[pointName]);
        }
    }

    private _loadPointFromStorageIfEmpty(type:string) {
        let pointName:string = this._getPrefixedType(type);

        if (!this._dataStore[pointName]) {
            this._loadPointFromStorage(pointName);
        }
    }

    private _setEntityInStore(type:string, id:number, data:{[key:string]:any}) {
        let pointName:string = this._getPrefixedType(type);
        this._loadPointFromStorageIfEmpty(type);
        this._dataStore[pointName][id] = data;
        this._savePointToStorage(type);
    }

    private _getEntityFromStore(type:string, id:number):{[key:string]:any} {
        let pointName:string = this._getPrefixedType(type);
        this._loadPointFromStorageIfEmpty(type);
        return this._dataStore[pointName][id];
    }

    private _savePointToStorage(type:string) {
        let pointName:string = this._getPrefixedType(type);

        if (this._dataStore[pointName]) {
            localStorage[pointName] = JSON.stringify(this._dataStore[pointName]);
        }
    }

    private set _lastUsedId(value:number) {
        let lastUsedIdKey:string = this._getPrefixedType("lastusedid");

        localStorage[lastUsedIdKey] = value;
    }

    private get _lastUsedId():number {
        let lastUsedIdKey:string = this._getPrefixedType("lastusedid");

        if (!localStorage[lastUsedIdKey] || localStorage[lastUsedIdKey] === "") {
            return 0;
        } else {
            return +localStorage[lastUsedIdKey];
        }
    }

    loadEntity(type:string, id:number, fields:string[] = null):Observable<DataEntity> {
        this._loadPointFromStorageIfEmpty(type);
        let data:{[key:number]:any} = this._getEntityFromStore(type, id);

        let entity:DataEntity = data ? new DataEntity(type, data, this._connector, id) : null;

        return new BehaviorSubject(entity);
    }

    loadCollection(type:string, filter:{[key:string]:any} = null, order:{[key:string]:string}, fields:string[] = null):Observable<DataCollection> {
        this._loadPointFromStorageIfEmpty(type);
        return Observable.create();
    }

    saveEntity():Observable<DataEntity> {
        return Observable.create();
    }

    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity> {
        let newId:number = ++this._lastUsedId;
        let entity:DataEntity = new DataEntity(type, data, this._connector, newId);
        this._setEntityInStore(type, newId, data);
        return new BehaviorSubject<DataEntity>(entity);
    }
}
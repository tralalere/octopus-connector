/**
 * Created by Christophe on 12/10/2017.
 */
import {ExternalInterface} from "../external-interface.interface";
import {Observable} from "rxjs/Rx";
import {DataEntity} from "../../data-structures/data-entity.class";
import {DataCollection} from "../../data-structures/data-collection.class";
import {LocalStorageConfiguration} from "./local-storage-configuration.interface";

export class LocalStorage implements ExternalInterface {

    private _dataStore:{[key:string]:Object} = {};
    
    constructor(
        private _configuration:LocalStorageConfiguration
    ) {}

    private _getPrefixedType(type:string):string {
        if (this._configuration.prefix) {
            return this._configuration.prefix + "-" + type;
        } else {
            return type;
        }
    }

    private _loadPointFromStore(type:string) {
        let pointName:string = this._getPrefixedType(type);

        if (!localStorage[pointName] || localStorage[pointName] === "") {
            this._dataStore[pointName] = {};
        } else {
            this._dataStore[pointName] = JSON.parse(localStorage[pointName]);
        }
    }

    private _savePointToStore(type:string) {
        let pointName:string = this._getPrefixedType(type);

        if (this._dataStore[pointName]) {
            localStorage[pointName] = JSON.stringify(this._dataStore[pointName]);
        }
    }

    loadEntity(type:string, id:number, fields:string[] = null):Observable<DataEntity> {
        return Observable.create();
    }

    loadCollection(type:string, filter:{[key:string]:any} = null, order:{[key:string]:string}, fields:string[] = null):Observable<DataCollection> {
        return Observable.create();
    }

    saveEntity():Observable<DataEntity> {
        return Observable.create();
    }
}
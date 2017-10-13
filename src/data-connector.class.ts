/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnectorConfig} from "./data-connector-config.interface";
import {DataEntity} from "./data-structures/data-entity.class";
import {Observable} from "rxjs/Rx";
import {DataCollection} from "./data-structures/data-collection.class";
import {ExternalInterface} from "./data-interfaces/external-interface.interface";
import {LocalStorage} from "./data-interfaces/local-storage/local-storage.class";

export class DataConnector {

    private _interfaces:{[key:string]:ExternalInterface} = {};

    private _builtInFactories:{[key:string]:any} = {
        localstorage: LocalStorage
    };

    constructor(
        private _configuration:DataConnectorConfig
    ) {
        for (let interfaceName in _configuration.configuration) {
            if (_configuration.configuration.hasOwnProperty(interfaceName)) {
                this._interfaces[interfaceName] = new this._builtInFactories[interfaceName](_configuration.configuration[interfaceName]);
            }
        }
    }

    private _getInterface(type:string):ExternalInterface {
        if (!this._interfaces[type]) {
            console.log("Unknown interface type : " + type);
            return null;
        } else {
            return this._interfaces[type];
        }
    }

    loadEntity(type:string, id:number, forced:boolean = true, fields:string[] = null):Observable<DataEntity> {
        var choosenInterface:ExternalInterface = this._getInterface(type);

        if (choosenInterface) {
            let obs:Observable<DataEntity> = choosenInterface.loadEntity(type, id, fields);
            return obs;
        } else {
            return null;
        }
    }

    loadCollection(type:string, filter:{[key:string]:any} = null, forced:boolean = true, order:{[key:string]:string} = null, fields:string[] = null):Observable<DataCollection> {
        return Observable.create();
    }

    saveEntity(entity:DataEntity):Observable<DataEntity> {
        return Observable.create();
    }
}
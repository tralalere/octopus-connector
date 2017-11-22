/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnectorConfig} from "./data-connector-config.interface";
import {DataEntity} from "./data-structures/data-entity.class";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {DataCollection} from "./data-structures/data-collection.class";
import {ExternalInterface} from "./data-interfaces/abstract-external-interface.class";
import {LocalStorage} from "./data-interfaces/local-storage/local-storage.class";
import {EntitiesDictionary, Dictionary} from "./types";

export class DataConnector {

    private _interfaces:{[key:string]:ExternalInterface} = {};
    private _entitiesStore:{[key:string]:Dictionary<DataEntity>} = {};
    private _entitiesLiveStore:{[key:string]:{[key:number]:Observable<DataEntity>}} = {};

    private _builtInFactories:{[key:string]:any} = {
        localstorage: LocalStorage
    };

    constructor(
        private _configuration:DataConnectorConfig
    ) {
        for (let interfaceName in _configuration.configuration) {
            if (_configuration.configuration.hasOwnProperty(interfaceName)) {
                this._interfaces[interfaceName] = new this._builtInFactories[interfaceName](_configuration.configuration[interfaceName], this);
            }
        }
    }

    private _getInterface(type:string):ExternalInterface {
        /*if (!this._interfaces[type]) {
            console.log("Unknown interface type : " + type);
            return null;
        } else {
            return this._interfaces[type];
        }*/

        return this._interfaces["localstorage"];
    }

    private _useCache(type:string) {
        return this._configuration.cached !== undefined && this._configuration.cached.indexOf(type) !== -1;
    }

    private _getEntityInStore(type:string, id:number):DataEntity {

        if (this._entitiesStore[type] && this._entitiesStore[type][id]) {
            return this._entitiesStore[type][id];
        }

        return null;
    }

    private _registerEntity(entity:DataEntity) {

        if (!this._entitiesStore[entity.type]) {
            this._entitiesStore[entity.type] = {};
        }

        this._entitiesStore[entity.type][entity.id] = entity;
    }

    loadEntity(type:string, id:number, fields:string[] = []):Observable<DataEntity> {

        let entity:DataEntity;

        if (this._useCache(type)) {
            entity = this._getEntityInStore(type, id);
        }

        if (entity) {
            this._registerEntity(entity);
            return new BehaviorSubject<DataEntity>(entity);
        } else {
            let selectedInterface:ExternalInterface = this._getInterface(type);

            if (selectedInterface) {
                let obs:Observable<DataEntity> = selectedInterface.loadEntity(type, id, fields);

                obs.subscribe((entity:DataEntity) => {
                    this._registerEntity(entity);
                });

                return obs;
            } else {
                return null;
            }
        }
    }

    loadCollection(type:string, filter:{[key:string]:any} = null, forced:boolean = true, order:{[key:string]:string} = null, fields:string[] = null):Observable<DataCollection> {
        return Observable.create();
    }

    saveEntity(entity:DataEntity):Observable<DataEntity> {
        return Observable.create();
    }

    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity> {
        let selectedInterface:ExternalInterface = this._getInterface(type);
        let obs:Observable<DataEntity> = selectedInterface.createEntity(type, data);

        obs.subscribe((data:DataEntity) => {
            
        });

        return obs;
    }
}
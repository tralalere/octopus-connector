/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnectorConfig} from "./data-connector-config.interface";
import {DataEntity} from "./data-structures/data-entity.class";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {DataCollection} from "./data-structures/data-collection.class";
import {ExternalInterface} from "./data-interfaces/abstract-external-interface.class";
import {LocalStorage} from "./data-interfaces/local-storage/local-storage.class";
import {Dictionary} from "./types";

export class DataConnector {

    private interfaces:{[key:string]:ExternalInterface} = {};
    private entitiesStore:{[key:string]:Dictionary<DataEntity>} = {};
    private entitiesLiveStore:{[key:string]:Dictionary<Observable<DataEntity>>} = {};

    private builtInFactories:{[key:string]:any} = {
        localstorage: LocalStorage
    };

    constructor(
        private configuration:DataConnectorConfig
    ) {
        for (let interfaceName in configuration.configuration) {
            if (configuration.configuration.hasOwnProperty(interfaceName)) {
                this.interfaces[interfaceName] = new this.builtInFactories[interfaceName](configuration.configuration[interfaceName], this);
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

        return this.interfaces["localstorage"];
    }

    private _useCache(type:string):boolean {
        return this.configuration.cached !== undefined && this.configuration.cached.indexOf(type) !== -1;
    }

    private _getEntityInStore(type:string, id:number):DataEntity {

        if (this.entitiesStore[type] && this.entitiesStore[type][id]) {
            return this.entitiesStore[type][id];
        }

        return null;
    }

    private _getEntityObservableInStore(type:string, id:number):Observable<DataEntity> {

        if (this.entitiesLiveStore[type] && this.entitiesLiveStore[type][id]) {
            return this.entitiesLiveStore[type][id];
        }

        return null;
    }

    private _registerEntity(entity:DataEntity) {

        if (!this.entitiesStore[entity.type]) {
            this.entitiesStore[entity.type] = {};
        }

        this.entitiesStore[entity.type][entity.id] = entity;
    }

    private _registerEntityObservable(type:string, id:number, obs:Observable<DataEntity>) {

        if (!this.entitiesLiveStore[type]) {
            this.entitiesLiveStore[type] = {};
        }

        this.entitiesLiveStore[type][id] = obs;
    }

    loadEntity(type:string, id:number, fields:string[] = []):Observable<DataEntity> {

        if (this._useCache(type)) {
            let obs:Observable<DataEntity> = this._getEntityObservableInStore(type, id);

            if (obs) {
                return obs;
            }
        }

        let selectedInterface:ExternalInterface = this._getInterface(type);

        if (selectedInterface) {
            let obs:Observable<DataEntity> = selectedInterface.loadEntity(type, id, fields);
            this._registerEntityObservable(type, id, obs);

            return obs;
        }

        return null;
    }

    loadEntities() {

    }

    loadCollection(type:string, filter:{[key:string]:any} = {}, fields:string[] = []):Observable<DataCollection> {

        // utilisation du cache ??

        let selectedInterface:ExternalInterface = this._getInterface(type);

        if (selectedInterface) {

        }

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
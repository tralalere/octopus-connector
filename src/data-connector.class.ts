/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnectorConfig} from "./data-connector-config.interface";
import {DataEntity} from "./data-structures/data-entity.class";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {DataCollection} from "./data-structures/data-collection.class";
import {ExternalInterface} from "./data-interfaces/abstract-external-interface.class";
import {LocalStorage} from "./data-interfaces/local-storage/local-storage.class";
import {NumberDictionary, StringDictionary} from "./types";
import {Http} from "./data-interfaces/http/http.class";
import {Nodejs} from "./data-interfaces/nodejs/nodejs.class";

export class DataConnector {

    private interfaces:{[key:string]:ExternalInterface} = {};
    private entitiesStore:{[key:string]:NumberDictionary<DataEntity>} = {};
    private entitiesLiveStore:{[key:string]:NumberDictionary<Observable<DataEntity>>} = {};

    private collectionsLiveStore:{[key:string]:StringDictionary<Observable<DataEntity>>} = {};

    private builtInFactories:{[key:string]:any} = {
        localstorage: LocalStorage,
        http: Http,
        nodejs: Nodejs
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

    private getInterface(type:string):ExternalInterface {
        /*if (!this._interfaces[type]) {
            console.log("Unknown interface type : " + type);
            return null;
        } else {
            return this._interfaces[type];
        }*/

        return this.interfaces["localstorage"];
    }

    private useCache(type:string):boolean {
        // TODO: pas bon
        //return this.configuration.cached !== undefined && this.configuration.cached.indexOf(type) !== -1;
        return false;
    }

    private getEntityInStore(type:string, id:number):DataEntity {

        if (this.entitiesStore[type] && this.entitiesStore[type][id]) {
            return this.entitiesStore[type][id];
        }

        return null;
    }

    private getEntityObservableInStore(type:string, id:number):Observable<DataEntity> {

        if (this.entitiesLiveStore[type] && this.entitiesLiveStore[type][id]) {
            return this.entitiesLiveStore[type][id];
        }

        return null;
    }

    private registerEntity(entity:DataEntity) {

        if (!this.entitiesStore[entity.type]) {
            this.entitiesStore[entity.type] = {};
        }

        this.entitiesStore[entity.type][entity.id] = entity;
    }

    private registerEntityObservable(type:string, id:number, obs:Observable<DataEntity>) {

        if (!this.entitiesLiveStore[type]) {
            this.entitiesLiveStore[type] = {};
        }

        this.entitiesLiveStore[type][id] = obs;
    }

    loadEntity(type:string, id:number, fields:string[] = []):Observable<DataEntity> {

        if (this.useCache(type)) {
            let obs:Observable<DataEntity> = this.getEntityObservableInStore(type, id);

            if (obs) {
                return obs;
            }
        }

        let selectedInterface:ExternalInterface = this.getInterface(type);

        if (selectedInterface) {
            let obs:Observable<DataEntity> = selectedInterface.loadEntity(type, id, fields);
            this.registerEntityObservable(type, id, obs);

            return obs;
        }

        return null;
    }

    loadEntities() {

    }

    loadCollection(type:string, filter:{[key:string]:any} = {}):Observable<DataCollection> {

        // utilisation du cache ??

        let selectedInterface:ExternalInterface = this.getInterface(type);

        if (selectedInterface) {

        }

        return Observable.create();
    }

    saveEntity(entity:DataEntity):Observable<DataEntity> {
        return Observable.create();
    }

    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity> {
        let selectedInterface:ExternalInterface = this.getInterface(type);
        let obs:Observable<DataEntity> = selectedInterface.createEntity(type, data);

        obs.subscribe((data:DataEntity) => {
            
        });

        return obs;
    }
}
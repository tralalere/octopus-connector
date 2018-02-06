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
import {CollectionStore} from "./stores/collection-store.class";
import {EntityStore} from "./stores/entity-store.class";

export class DataConnector {

    private interfaces:{[key:string]:ExternalInterface} = {};

    private entitiesLiveStore:{[key:string]:EntityStore} = {};
    private collectionsLiveStore:{[key:string]:CollectionStore} = {};

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
        // TODO: pas bon, mis en commentaire
        //return this.configuration.cached !== undefined && this.configuration.cached.indexOf(type) !== -1;
        return false;
    }

    private getEntityObservableInStore(type:string, id:number):Observable<DataEntity> {

        if (this.entitiesLiveStore[type]) {
            return this.entitiesLiveStore[type].getEntity(id);
        }

        return null;
    }

    private getCollectionObservableInStore(type:string, filter:{[key:string]:any}):Observable<DataCollection> {
        if (this.collectionsLiveStore[type]) {
            return this.collectionsLiveStore[type].getCollection(filter);
        }

        return null;
    }

    private registerEntityObservable(type:string, id:number, obs:Observable<DataEntity>) {

        if (!this.entitiesLiveStore[type]) {
            this.entitiesLiveStore[type] = new EntityStore();
        }

        this.entitiesLiveStore[type].addEntity(obs, id);
    }

    private registerCollectionObservable(type:string, filter:{[key:string]:any}, obs:Observable<DataCollection>) {

        if (!this.collectionsLiveStore[type]) {
            this.collectionsLiveStore[type] = new CollectionStore();
        }

        this.collectionsLiveStore[type].addCollection(obs, filter);
    }

    loadEntity(type:string, id:number):Observable<DataEntity> {

        if (this.useCache(type)) {
            let obs:Observable<DataEntity> = this.getEntityObservableInStore(type, id);

            if (obs) {
                return obs;
            }
        }

        let selectedInterface:ExternalInterface = this.getInterface(type);

        if (selectedInterface) {
            let obs:Observable<DataEntity> = selectedInterface.loadEntity(type, id);
            this.registerEntityObservable(type, id, obs);

            return obs;
        }

        return null;
    }

    loadEntities() {

    }

    loadCollection(type:string, filter:{[key:string]:any} = {}):Observable<DataCollection> {

        if (this.useCache(type)) {
            let obs:Observable<DataCollection> = this.getCollectionObservableInStore(type, filter);

            if (obs) {
                return obs;
            }
        }

        let selectedInterface:ExternalInterface = this.getInterface(type);

        if (selectedInterface) {
            let obs:Observable<DataCollection> = selectedInterface.loadCollection(type, filter);
            this.registerCollectionObservable(type, filter, obs);

            return obs;
        }

        return Observable.create();
    }

    saveEntity(entity:DataEntity):Observable<DataEntity> {
        return Observable.create();
    }

    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity> {
        let selectedInterface:ExternalInterface = this.getInterface(type);
        let obs:Observable<DataEntity> = selectedInterface.createEntity(type, data);

        obs.take(1).subscribe((data:DataEntity) => {
            this.registerEntityObservable(type, data.id, obs);
        });

        return obs;
    }
}
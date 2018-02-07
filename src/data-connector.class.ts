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
import {ReplaySubject} from "rxjs/Rx";
import {EndpointConfig} from "./endpoint-config.interface";
import {ModelSchema} from "octopus-model";

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
        let conf:string|EndpointConfig = this.getEndpointConfiguration(type);

        if (typeof conf === "string") {
            return this.interfaces[conf];
        } else if (conf && conf.type) {
            return this.interfaces[conf.type];
        } else {
            return this.interfaces[this.configuration.defaultInterface];
        }
    }

    private getEndpointConfiguration(type:string):string|EndpointConfig {
        return this.configuration.map[type];
    }

    private getEndpointStructureModel(type:string):ModelSchema {
        let conf:string|EndpointConfig = this.getEndpointConfiguration(type);

        if (conf && typeof conf === "object") {
            return conf.structure;
        }
    }

    private useCache(type:string):boolean {
        let conf:string|EndpointConfig = this.getEndpointConfiguration(type);

        if (conf && typeof conf === "object") {
            return !!conf.cached;
        }

        return false;
    }

    private getEntityObservableInStore(type:string, id:number):Observable<DataEntity> {

        if (this.entitiesLiveStore[type]) {
            return this.entitiesLiveStore[type].getEntityObservable(id);
        }

        return null;
    }

    private getCollectionObservableInStore(type:string, filter:{[key:string]:any}):Observable<DataCollection> {
        if (this.collectionsLiveStore[type]) {
            return this.collectionsLiveStore[type].getCollectionObservable(filter);
        }

        return null;
    }

    private getEntityObservable(type:string, id:number):Observable<DataEntity> {

        if (!this.entitiesLiveStore[type]) {
            this.entitiesLiveStore[type] = new EntityStore();
        }

        return this.entitiesLiveStore[type].getEntityObservable(id);
    }

    private registerEntity(type:string, id:number, entity:DataEntity):Observable<DataEntity> {

        if (!this.entitiesLiveStore[type]) {
            this.entitiesLiveStore[type] = new EntityStore();
        }

        return this.entitiesLiveStore[type].registerEntity(entity, id);
    }

    private registerEntitySubject(type:string, id:number, subject:ReplaySubject<DataEntity>) {

        if (!this.entitiesLiveStore[type]) {
            this.entitiesLiveStore[type] = new EntityStore();
        }

        this.entitiesLiveStore[type].registerEntitySubject(id, subject);
    }

    private getCollectionObservable(type:string, filter:{[key:string]:any}):Observable<DataCollection> {

        if (!this.collectionsLiveStore[type]) {
            this.collectionsLiveStore[type] = new CollectionStore();
        }

        return this.collectionsLiveStore[type].getCollectionObservable(filter);
    }

    private registerCollection(type:string, filter:{[key:string]:any}, collection:DataCollection):Observable<DataCollection> {

        if (!this.collectionsLiveStore[type]) {
            this.collectionsLiveStore[type] = new CollectionStore();
        }

        // registering entities
        let entitiesObservables:Observable<DataEntity>[] = [];

        collection.entities.forEach((entity:DataEntity) => {
            entitiesObservables.push(this.registerEntity(type, entity.id, entity));
        });

        collection.entitiesObservables = entitiesObservables;

        return this.collectionsLiveStore[type].registerCollection(collection, filter);
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
            let entity:DataEntity|Observable<DataEntity> = selectedInterface.loadEntity(type, id);
            let entityObservable:Observable<DataEntity> = this.getEntityObservable(type, id);

            if (entity instanceof Observable) {
                entity.take(1).subscribe((entity:DataEntity) => {
                    this.registerEntity(type, id, entity);
                });
            } else {
                this.registerEntity(type, id, entity);
            }

            return entityObservable;
        }
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
            let collectionObservable:Observable<DataCollection> = this.getCollectionObservable(type, filter);
            let collection:DataCollection|Observable<DataCollection> = selectedInterface.loadCollection(type, filter);

            if (collection instanceof Observable) {
                collection.take(1).subscribe((collection:DataCollection) => {
                    this.registerCollection(type, filter, collection);
                });
            } else {
                this.registerCollection(type, filter, collection);
            }

            return collectionObservable;
        }

        return null;
    }

    saveEntity(entity:DataEntity):Observable<DataEntity> {
        return Observable.create();
    }

    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity> {
        let selectedInterface:ExternalInterface = this.getInterface(type);

        let structure:ModelSchema = this.getEndpointStructureModel(type);

        if (structure) {
            data = structure.generateModel(null, data);
        }

        let entity:DataEntity|Observable<DataEntity> = selectedInterface.createEntity(type, data);

        let entitySubject:ReplaySubject<DataEntity> = new ReplaySubject<DataEntity>(1);

        if (entity instanceof Observable) {
            entity.take(1).subscribe((createdEntity:DataEntity) => {
                this.registerEntitySubject(type, createdEntity.id, entitySubject);
                this.registerEntity(type, createdEntity.id, createdEntity);
            });
        } else {
            this.registerEntitySubject(type, entity.id, entitySubject);
            this.registerEntity(type, entity.id, entity);
        }

        return entitySubject;
    }
}
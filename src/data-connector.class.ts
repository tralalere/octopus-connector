/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnectorConfig} from "./data-connector-config.interface";
import {DataEntity} from "./data-structures/data-entity.class";
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {DataCollection} from "./data-structures/data-collection.class";
import {ExternalInterface} from "./data-interfaces/abstract-external-interface.class";
import {LocalStorage} from "./data-interfaces/local-storage/local-storage.class";
import {CollectionDataSet, EntityDataSet, NumberDictionary, StringDictionary} from "./types";
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

    private getExclusions(type:string):string[] {
        let conf:string|EndpointConfig = this.getEndpointConfiguration(type);

        if (conf && typeof conf === "object") {
            return conf.exclusions ? conf.exclusions : [];
        }

        return [];
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

        if (!this.collectionsLiveStore[type]) {
            this.collectionsLiveStore[type] = new CollectionStore();
        }

        // TODO: on met à jour toutes les collections pouvant accepter l'entité
        this.collectionsLiveStore[type].registerEntityInCollections(entity);

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
            let entityData:EntityDataSet|Observable<EntityDataSet> = selectedInterface.loadEntity(type, id);
            let entityObservable:Observable<DataEntity> = this.getEntityObservable(type, id);

            let structure:ModelSchema = this.getEndpointStructureModel(type);

            if (entityData instanceof Observable) {
                entityData.take(1).subscribe((entity:EntityDataSet) => {

                    if (entity) {
                        if (structure) {
                            entity = structure.filterModel(entity);
                        }

                        this.registerEntity(type, id, new DataEntity(type, entity, this, id));
                    }

                });
            } else {

                if (entityData) {
                    if (structure) {
                        entityData = structure.filterModel(entityData);
                    }

                    this.registerEntity(type, id, new DataEntity(type, entityData, this, id));
                }

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
        let structure:ModelSchema = this.getEndpointStructureModel(type);

        if (selectedInterface) {
            let collectionObservable:Observable<DataCollection> = this.getCollectionObservable(type, filter);
            let collection:CollectionDataSet|Observable<CollectionDataSet> = selectedInterface.loadCollection(type, filter);

            if (collection instanceof Observable) {
                collection.take(1).subscribe((newCollection:CollectionDataSet) => {
                    this.registerCollection(type, filter, new DataCollection(type, newCollection, this, structure));
                });
            } else {
                this.registerCollection(type, filter, new DataCollection(type, collection, this, structure));
            }

            return collectionObservable;
        }

        return null;
    }

    saveEntity(entity:DataEntity):Observable<DataEntity> {

        let selectedInterface:ExternalInterface = this.getInterface(entity.type);
        let structure:ModelSchema = this.getEndpointStructureModel(entity.type);

        // TODO: c'est ici qu'on doit générer le diff (ou pas) et les exclusions (ou pas)

        let dataToSave:EntityDataSet;

        if (selectedInterface.useDiff) {
            dataToSave = entity.getDiff();
        } else {
            dataToSave = entity.getClone();
        }

        let exclusions:string[] = this.getExclusions(entity.type);

        exclusions.forEach((key:string) => {
            if (dataToSave[key]) {
                delete dataToSave[key];
            }
        });

        let entityData:EntityDataSet|Observable<EntityDataSet> = selectedInterface.saveEntity(dataToSave, entity.type, entity.id);

        let entityObservable:Observable<DataEntity> = this.getEntityObservable(entity.type, entity.id);

        if (entityData instanceof Observable) {
            entityData.take(1).subscribe((saveEntity:EntityDataSet) => {

                if (structure) {
                    saveEntity = structure.filterModel(saveEntity);
                }

                this.registerEntity(entity.type, entity.id, new DataEntity(entity.type, saveEntity, this, entity.id));
            });
        } else {

            if (structure) {
                entityData = structure.filterModel(entityData);
            }

            this.registerEntity(entity.type, entity.id, new DataEntity(entity.type, entityData, this, entity.id));
        }

        return entityObservable;
    }

    createEntity(type:string, data:{[key:string]:any} = {}):Observable<DataEntity> {
        let selectedInterface:ExternalInterface = this.getInterface(type);

        let structure:ModelSchema = this.getEndpointStructureModel(type);

        if (structure) {
            data = structure.generateModel(null, data);
        }

        let exclusions:string[] = this.getExclusions(type);

        exclusions.forEach((key:string) => {
            if (data[key]) {
                delete data[key];
            }
        });

        let entity:EntityDataSet|Observable<EntityDataSet> = selectedInterface.createEntity(type, data);

        let entitySubject:ReplaySubject<DataEntity> = new ReplaySubject<DataEntity>(1);

        if (entity instanceof Observable) {
            entity.take(1).subscribe((createdEntity:EntityDataSet) => {
                this.registerEntitySubject(type, createdEntity.id, entitySubject);
                this.registerEntity(type, createdEntity.id, new DataEntity(type, createdEntity, this, createdEntity.id));
            });
        } else {
            this.registerEntitySubject(type, entity.id, entitySubject);
            this.registerEntity(type, entity.id, new DataEntity(type, entity, this, entity.id));
        }

        return entitySubject;
    }

    deleteEntity(entity:DataEntity):Observable<boolean> {
        let selectedInterface:ExternalInterface = this.getInterface(entity.type);

        let subject:ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

        let result:boolean|Observable<boolean> = selectedInterface.deleteEntity(entity.type, entity.id);

        if (result instanceof Observable) {
            result.take(1).subscribe((res:boolean) => {
                subject.next(res);
            });
        } else {
            subject.next(result);
        }

        return subject;
    }
}
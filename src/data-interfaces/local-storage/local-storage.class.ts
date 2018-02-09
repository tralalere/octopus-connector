/**
 * Created by Christophe on 12/10/2017.
 */
import {Observable, BehaviorSubject} from "rxjs/Rx";
import {LocalStorageConfiguration} from "./local-storage-configuration.interface";
import {DataConnector} from "../../data-connector.class";
import {ExternalInterface} from "../abstract-external-interface.class";
import {CollectionDataSet, EntityDataSet, FilterData} from "../../types";
import {DataEntity} from "../../data-structures/data-entity.class";

/**
 * Local storage data interface
 */
export class LocalStorage extends ExternalInterface {

    /**
     * Where are stored the entities
     * @type {CollectionDataSet}
     */
    private dataStore:CollectionDataSet = {};

    /**
     * Create a local storage data interface
     * @param {LocalStorageConfiguration} configuration Configuration object
     * @param {DataConnector} connector Reference to the connector
     */
    constructor(
        private configuration:LocalStorageConfiguration,
        private connector:DataConnector
    ) {
        super();
        this.useDiff = false;
    }

    /**
     * If a prefix is defined in the configuration, returns a concatenation of prefix and endpoint name
     * @param {string} type Name of the endpoint
     * @returns {string} The prefixed endpoint name
     */
    private getPrefixedType(type:string):string {
        if (this.configuration.prefix) {
            return this.configuration.prefix + "-" + type;
        } else {
            return type;
        }
    }

    /**
     * Load an endpoint from the local storage
     * @param {string} pointName The endpoint name
     */
    private loadPointFromStorage(pointName:string) {
        if (!localStorage[pointName] || localStorage[pointName] === "") {
            this.dataStore[pointName] = {};
        } else {
            this.dataStore[pointName] = JSON.parse(localStorage[pointName]);
        }
    }

    /**
     * Load an endpoint from the local storage if storage object is empty for that name
     * @param {string} type Name of the endpoint
     */
    private loadPointFromStorageIfEmpty(type:string) {
        let pointName:string = this.getPrefixedType(type);

        if (!this.dataStore[pointName]) {
            this.loadPointFromStorage(pointName);
        }
    }

    /**
     * Set entity data in local store
     * @param {string} type Name of the endpoint
     * @param {number} id Id of the entity
     * @param {EntityDataSet} data Entity Data
     */
    private setEntityInStore(type:string, id:number, data:EntityDataSet) {
        let pointName:string = this.getPrefixedType(type);
        this.loadPointFromStorageIfEmpty(type);
        this.dataStore[pointName][id] = data;
        this.savePointToStorage(type);
    }

    /**
     * Get entity data from local store
     * @param {string} type Name of the endpoint
     * @param {number} id Id of the entity
     * @returns {EntityDataSet} Data of the entity
     */
    private getEntityFromStore(type:string, id:number):EntityDataSet {
        let pointName:string = this.getPrefixedType(type);
        this.loadPointFromStorageIfEmpty(type);
        return this.dataStore[pointName][id];
    }

    /**
     * Delete entity from local store
     * @param {string} type Name of the endpoint
     * @param {number} id Id of the entity
     * @returns {boolean} True if deletion success
     */
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

    /**
     * Get collection data from local store
     * @param {string} type Name of the endpoint
     * @param {FilterData} filter Filter data
     * @returns {CollectionDataSet} Collection data
     */
    private getCollectionFromStore(type:string, filter:FilterData = {}):CollectionDataSet {

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

    /**
     * Save local store to localStorage, for a specified endpoint
     * @param {string} type Name of the endpoint
     */
    private savePointToStorage(type:string) {
        let pointName:string = this.getPrefixedType(type);

        if (this.dataStore[pointName]) {
            localStorage[pointName] = JSON.stringify(this.dataStore[pointName]);
        }
    }

    /**
     * Set last used id to localStorage
     * @param {number} value The value to set to
     */
    private set lastUsedId(value:number) {
        let lastUsedIdKey:string = this.getPrefixedType("lastusedid");

        localStorage[lastUsedIdKey] = value;
    }

    /**
     * Get last used id from localStorage
     * @returns {number} The value
     */
    private get lastUsedId():number {
        let lastUsedIdKey:string = this.getPrefixedType("lastusedid");

        if (localStorage[lastUsedIdKey] === undefined || localStorage[lastUsedIdKey] === "") {
            return 0;
        } else {
            return +localStorage[lastUsedIdKey];
        }
    }

    /**
     * Load an entity from local storage service
     * @param {string} type Name of the endpoint
     * @param {number} id Id of the entity
     * @returns {EntityDataSet} The entity raw datas
     */
    loadEntity(type:string, id:number):EntityDataSet {
        this.loadPointFromStorageIfEmpty(type);
        let data:EntityDataSet = this.getEntityFromStore(type, id);

        return data ? data : null;
    }

    /**
     * Load a collection from local storage service
     * @param {string} type Name of the endpoint
     * @param {FilterData} filter Filter data
     * @returns {CollectionDataSet} The collection raw data
     */
    loadCollection(type:string, filter:FilterData = {}):CollectionDataSet {
        this.loadPointFromStorageIfEmpty(type);
        let data:CollectionDataSet = this.getCollectionFromStore(type, filter);

        return data ? data : null;
    }

    /**
     * Save an entity to the local storage service
     * @param {EntityDataSet} entity Entity data to save
     * @param {string} type Name of the endpoint
     * @param {number} id Id of the entity
     * @returns {EntityDataSet} Saved raw data
     */
    saveEntity(entity:EntityDataSet, type:string, id:number):EntityDataSet {
        this.loadPointFromStorageIfEmpty(type);
        this.setEntityInStore(type, id, entity);

        return entity;
    }

    /**
     * Create an entity on the local storage service
     * @param {string} type Name of the endpoint
     * @param {EntityDataSet} data Entity Data
     * @returns {EntityDataSet} The saved raw dats
     */
    createEntity(type:string, data:EntityDataSet):EntityDataSet {
        let newId:number = ++this.lastUsedId;
        data.id = newId;
        this.setEntityInStore(type, newId, data);
        return data;
    }

    /**
     * Delete an entity from the local storage service
     * @param {string} type Name of the endpoint
     * @param {number} id Id of the entity
     * @returns {boolean} True if deletion success
     */
    deleteEntity(type:string, id:number):boolean {
        this.loadPointFromStorageIfEmpty(type);
        return this.deleteEntityFromStore(type, id);
    }
}
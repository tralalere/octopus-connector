import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {HeaderObject, HttpConfiguration} from "./http-configuration.interface";
import {BehaviorSubject, Observable, ReplaySubject} from "rxjs/Rx";
import {CollectionDataSet, EntityDataSet} from "../../types";
import {DataEntity} from "../../data-structures/data-entity.class";
import {InterfaceError} from "../interface-error.class";

/**
 * Http external interface
 */
export class Http extends ExternalInterface {

    /*
    Headers sent with each request
     */
    private headers:HeaderObject[] = [];

    /**
     * Creates the http interface
     * @param {HttpConfiguration} configuration Configuration object
     * @param {DataConnector} connector Reference to the connector
     */
    constructor(
        private configuration:HttpConfiguration,
        private connector:DataConnector
    ) {
        super();
        this.useDiff = true;

        if (configuration.headers) {
            this.headers = configuration.headers;
        }
    }

    /**
     * Add headers to the request
     * @param {XMLHttpRequest} request A xhr request
     */
    private addHeaders(request:XMLHttpRequest) {
        this.headers.forEach((header:HeaderObject) => {
            request.setRequestHeader(header.key, header.value);
        });
    }

    /**
     * Load entity in http service
     * @param {string} type Endpoint name
     * @param {number} id Id of the entity
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<EntityDataSet>} Observable returning the data
     */
    loadEntity(type:string, id:number, errorHandler:Function = null):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        let url:string = `${<string>this.configuration.apiUrl}${type}/${id}`;
        request.open("GET", url, true);

        let subject:ReplaySubject<EntityDataSet> = new ReplaySubject<EntityDataSet>(1);

        this.addHeaders(request);
        
        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(request.responseText));
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send();
        
        return subject;
    }

    /**
     * Load a collection in http service
     * @param {string} type Endpoint name
     * @param {{[p: string]: any}} filter Filter Object
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<CollectionDataSet>} Observable returning the collection data
     */
    loadCollection(type:string, filter:{[key:string]:any} = {}, errorHandler:Function = null):Observable<CollectionDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();

        let url:string = `${<string>this.configuration.apiUrl}${type}`;

        let filterKeys:string[] = Object.keys(filter);

        if (filterKeys.length > 0) {
            url += "?";
        }

        filterKeys.forEach((key:string, index:number) => {
            let val:any = filter[key];
            url += `filter[${key}]=${val}`;

            if (index < filterKeys.length - 1) {
                url += "&";
            }
        });

        request.open("GET", url, true);

        this.addHeaders(request);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<CollectionDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractCollection(request.responseText));
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send();

        return subject;
    }

    /**
     * Save entity to the http service
     * @param {EntityDataSet} entity Entity data to save
     * @param {string} type Endpoint name
     * @param {number} id Id of the entity
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<EntityDataSet>} Observable returning the entity data
     */
    saveEntity(entity:EntityDataSet, type:string, id:number, errorHandler:Function = null):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        let url:string = `${<string>this.configuration.apiUrl}${type}/${id}`;
        request.open("PATCH", url, true);

        this.addHeaders(request);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<EntityDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(request.responseText));
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send(JSON.stringify(entity));

        return subject;
    }

    /**
     * Create entity in http service
     * @param {string} type Endpoint name
     * @param {EntityDataSet} data Data used to create the entity
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<EntityDataSet>} Observable returning the entity data
     */
    createEntity(type:string, data:EntityDataSet, errorHandler:Function = null):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        let url:string = `${<string>this.configuration.apiUrl}${type}`;
        request.open("POST", url, true);

        this.addHeaders(request);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<EntityDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(request.responseText));
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send(JSON.stringify(data));

        return subject;
    }

    /**
     * Delete entity from http service
     * @param {string} type Endpoint type
     * @param {number} id Entity id
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<boolean>} True if deletion success
     */
    deleteEntity(type:string, id:number, errorHandler:Function = null):Observable<boolean> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        let url:string = `${<string>this.configuration.apiUrl}${type}/${id}`;
        request.open("DELETE", url,true);

        this.addHeaders(request);

        let subject:ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(true);
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send();

        return subject;
    }

    /**
     * Authenticate in service
     * @param {string} login User login
     * @param {string} password User password
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<boolean>} True if authentication success
     */
    authenticate(login:string, password:string, errorHandler:Function = null):Observable<boolean> {
        return null;
    }

    /**
     * Extract entity data from raw data
     * @param {string} responseText Response text from server
     * @returns {EntityDataSet} Entity data
     */
    protected extractEntity(responseText:string):EntityDataSet {
        let data:Object = JSON.parse(responseText);
        return data["data"][0];
    }

    /**
     * Extract collection data from raw data
     * @param {string} responseText Response text from server
     * @returns {CollectionDataSet} Collection data
     */
    protected extractCollection(responseText:string):CollectionDataSet {
        let data:Object = JSON.parse(responseText);

        let collectionData:CollectionDataSet = {};

        data["data"].forEach((entityData:EntityDataSet) => {
            collectionData[entityData["id"]] = entityData;
        });

        return collectionData;
    }
}
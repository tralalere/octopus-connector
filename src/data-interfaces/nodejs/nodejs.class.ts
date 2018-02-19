import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {NodejsConfiguration} from "./nodejs-configuration.interface";
import {Observable} from "rxjs/Observable";
import {CollectionDataSet, EntityDataSet, FilterData} from "../../types";
import * as ObjectHash from "object-hash";
import * as io from 'socket.io-client';
import {ReplaySubject} from "rxjs/ReplaySubject";

/**
 * Nodejs interface
 */
export class Nodejs extends ExternalInterface {

    private messagePrefix:string;
    private retrieveEvent:string;
    private connectionCommand:string;
    private socket:any;

    /**
     * Create the nodejs interface
     * @param {NodejsConfiguration} configuration Interface configuration object
     * @param {DataConnector} connector Reference to the connector
     */
    constructor(
        private configuration:NodejsConfiguration,
        private connector:DataConnector
    ) {
        super();
        this.messagePrefix = this.configuration.messagePrefix || "message_";
        this.retrieveEvent = this.configuration.retrievePrefix || "retrieve_";
        this.connectionCommand = this.configuration.connectionCommand || "connexion";
    }

    private initializeSocket(forced:boolean = false) {

        if (this.socket && !forced) {
            return;
        }

        if (this.socket) {
            this.socket.disconnect();
            this.socket.close();
        }

        this.socket = io(this.configuration.socketUrl);

        // Doit-on checker ici tous ces events, ou uniquement au loading (de collection ou d'entité) ?
        this.socket.on('connect_failed', function(){
            console.log('Connection Failed');
        });

        this.socket.on('connect_error', () => {
            console.log('Connection Error');
        });

        this.socket.on('connect', () => {
            console.log('Connected');
        });

        this.socket.on('reconnecting', () => {
            console.log('reconnecting');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected');
        });

        // l'erreur est à gérer au cas par cas
        /*this.socket.on('error', function () {
            console.log('Disconnected !!!');
        });*/
    }

    /**
     *
     * @param {string} type
     * @param {FilterData} filter
     * @param {Function} errorHandler
     */
    private collectionConnectionAndRetrieve(type:string, filter:FilterData = {}, errorHandler:Function = null):Observable<CollectionDataSet> {
        let hash:string = ObjectHash(filter);

        this.socket.emit('connexion', type, filter);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<CollectionDataSet>(1);

        // les datas seront peut-être retournée dans une autre format que CollectionDataSet
        this.socket.on(this.retrieveEvent + type + "_" + hash, (data:CollectionDataSet) => {
            // récupération des datas de collection

            // il y aura peut-être besoin de mapper les données reçues
            subject.next(data);
        });

        this.socket.on("error", () => {
            this.sendError(0, "", errorHandler);
        });

        return subject;
    }

    /**
     * Load entity in http service
     * @param {string} type Endpoint name
     * @param {number} id Id of the entity
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<EntityDataSet>} Observable returning the data
     */
    loadEntity(type:string, id:number, errorHandler:Function):Observable<EntityDataSet> {
        return null;
    }

    /**
     * Load a collection in http service
     * @param {string} type Endpoint name
     * @param {{[p: string]: any}} filter Filter Object
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<CollectionDataSet>} Observable returning the collection data
     */
    loadCollection(type:string, filter:{[key:string]:any} = {}, errorHandler:Function = null):Observable<CollectionDataSet> {
        this.initializeSocket();

        let hash:string = ObjectHash(filter);

        this.socket.emit('connexion', type, filter);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<CollectionDataSet>(1);

        this.socket.on(this.retrieveEvent + type + "_" + hash, (data:CollectionDataSet) => {
            // récupération des datas de collection

            // il y aura peut-être besoin de mapper les données reçues
            subject.next(data);
        });

        this.socket.on("error", () => {
            // attention, modifier le code erreur en fonction du cas actuel
            this.sendError(0, "", errorHandler);
        });

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
        return null;
    }

    /**
     * Delete entity from http service
     * @param {string} type Endpoint type
     * @param {number} id Entity id
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<boolean>} True if deletion success
     */
    deleteEntity(type:string, id:number, errorHandler:Function = null):Observable<boolean> {
        return null;
    }
}
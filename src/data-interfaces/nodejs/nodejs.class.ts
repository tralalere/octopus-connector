import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {NodejsConfiguration} from "./nodejs-configuration.interface";
import {Observable} from "rxjs/Rx";
import {CollectionDataSet, EntityDataSet, FilterData} from "../../types";
import * as ObjectHash from "object-hash";
import * as io from 'socket.io-client';
import {ReplaySubject} from "rxjs/Rx";

/**
 * Nodejs interface
 */
export class Nodejs extends ExternalInterface {

    private messagePrefix:string;
    private retrieveEvent:string;
    private connectionCommand:string;
    private socket:any;

    private temporaryStore:{[key:number]:ReplaySubject<EntityDataSet>} = {};
    private temporaryDeletionStore:{[key:number]:ReplaySubject<boolean>} = {};

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
        this.messagePrefix = this.configuration.messagePrefix || "message";
        this.retrieveEvent = this.configuration.retrievePrefix || "retrieve_";
        this.connectionCommand = this.configuration.connectionCommand || "connexion";

        this.initializeSocket();
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

        this.socket.on(this.messagePrefix, (data:Object[]) => {
            console.log("MESSAGE DATA: ", data);

            let tmp: ReplaySubject<EntityDataSet> = this.temporaryStore[data[0]["cid"]];

            if (tmp) {
                tmp.next(data[0]["data"]);
                delete this.temporaryStore[data[0]["cid"]];
            }

            let deletionTmp: ReplaySubject<boolean> = this.temporaryDeletionStore[data[0]["cid"]];

            if (deletionTmp) {
                deletionTmp.next(true);
                delete this.temporaryDeletionStore[data[0]["cid"]];
            }
        });
    }

    /**
     * Load entity in http service
     * @param {string} type Endpoint name
     * @param {number} id Id of the entity
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<EntityDataSet>} Observable returning the data
     */
    loadEntity(type:string, id:number, errorHandler:Function):Observable<EntityDataSet> {

        console.log(String(id));

        return this.loadCollection(type, {
            id: id
        }).map((data: CollectionDataSet) => {
            return data[0];
        })
    }

    saveEntity(data:EntityDataSet, type:string, id:number, errorHandler:Function = null):Observable<EntityDataSet> {

        let subject: ReplaySubject<EntityDataSet> = new ReplaySubject<EntityDataSet>(1);

        let cid: number = Math.floor(Math.random() * 1000000000000000);

        this.temporaryStore[cid] = subject;

        let requestData:Object = {
            command: "update",
            data: data,
            type: type,
            cid: cid
        };

        console.log("SAVE", requestData);

        this.socket.emit("message", requestData);

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
        this.initializeSocket();

        console.log(filter);

        let hash:string = ObjectHash(filter);

        this.socket.emit('connexion', type, filter);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<CollectionDataSet>(1);

        this.socket.on(this.retrieveEvent + type + "_" + hash, (data:CollectionDataSet) => {
            // récupération des datas de collection

            console.log(data);

            let res: CollectionDataSet = {};

            for (let id in data) {
                res[+id] = data[id]["data"];
            }

            subject.next(res);
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

        let subject:ReplaySubject<EntityDataSet> = new ReplaySubject<EntityDataSet>(1);

        let cid: number = Math.floor(Math.random() * 1000000000000000);

        let requestData:Object = {
            command: "put",
            data: data,
            type: type,
            cid: cid
        };

        this.temporaryStore[cid] = subject;

        let dataHash:string = ObjectHash(data);

        this.socket.emit("message", requestData);

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

        let subject:ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

        let cid: number = Math.floor(Math.random() * 1000000000000000);

        this.temporaryDeletionStore[cid] = subject;

        let requestData:Object = {
            command: "delete",
            id: id,
            type: type,
            cid: cid
        };

        console.log(requestData);

        this.socket.emit("message", requestData);

        return subject;
    }
}
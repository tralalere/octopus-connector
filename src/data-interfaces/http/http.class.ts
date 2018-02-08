import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {HttpConfiguration} from "./http-configuration.interface";
import {BehaviorSubject, Observable, ReplaySubject} from "rxjs/Rx";
import {CollectionDataSet, EntityDataSet} from "../../types";
import {DataEntity} from "../../data-structures/data-entity.class";

export class Http extends ExternalInterface {

    constructor(
        private configuration:HttpConfiguration,
        private connector:DataConnector
    ) {
        super();
        this.useDiff = true;
    }

    loadEntity(type:string, id:number):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        request.open("GET", <string>this.configuration.apiUrl + type + "/" + id, true);

        let subject:ReplaySubject<EntityDataSet> = new ReplaySubject<EntityDataSet>(1);

        // TODO: voir de quelle manière passer les headers, qui peuvent être optionnels
        //request.setRequestHeader('Content-Type', 'application/json');
        
        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(type, request.responseText));
                } else {
                    subject.error("Error loading entity " + type + " with id " + id);
                }
            }
        };

        request.send();
        
        return subject;
    }

    loadCollection(type:string, filter:{[key:string]:any} = null):Observable<CollectionDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        request.open("GET", <string>this.configuration.apiUrl + type, true);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<CollectionDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractCollection(type, request.responseText));
                } else {
                    subject.error("Error loading collection " + type);
                }
            }
        };

        request.send();

        return subject;
    }

    saveEntity(entity:EntityDataSet, type:string, id:number):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        request.open("PATCH", <string>this.configuration.apiUrl + type + "/" + id, true);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<EntityDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(type, request.responseText));
                } else {
                    subject.error("Error saving entity " + type + " with id " + id);
                }
            }
        };

        request.send(JSON.stringify(entity));

        return subject;
    }

    createEntity(type:string, data:{[key:string]:any}):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        request.open("POST", <string>this.configuration.apiUrl + type, true);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<EntityDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(type, request.responseText));
                } else {
                    subject.error("Error creating entity " + type);
                }
            }
        };

        request.send(JSON.stringify(data));

        return subject;
    }

    deleteEntity(type:string, id:number):Observable<boolean> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        request.open("DELETE", <string>this.configuration.apiUrl + type + "/" + id, true);

        let subject:ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(true);
                } else {
                    subject.error("Error deleting entity " + type);
                }
            }
        };

        request.send();

        return subject;
    }

    authenticate(login:string, password:string):Observable<boolean> {
        return null;
    }

    protected extractEntity(type:string, responseText:string):EntityDataSet {
        let data:Object = JSON.parse(responseText);
        return data["data"][0];
    }

    protected extractCollection(type:string, responseText:string):CollectionDataSet {
        let data:Object = JSON.parse(responseText);

        let collectionData:CollectionDataSet = {};

        data["data"].forEach((entityData:EntityDataSet) => {
            collectionData[entityData["id"]] = entityData;
        });

        return collectionData;
    }
}
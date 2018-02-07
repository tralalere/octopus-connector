import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {HttpConfiguration} from "./http-configuration.interface";
import {DataCollection} from "../../data-structures/data-collection.class";
import {DataEntity} from "../../data-structures/data-entity.class";
import {BehaviorSubject, Observable, ReplaySubject} from "rxjs/Rx";

export class Http extends ExternalInterface {

    constructor(
        private configuration:HttpConfiguration,
        private connector:DataConnector
    ) {
        super();
    }

    loadEntity(type:string, id:number):Observable<DataEntity> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        request.open("GET", <string>this.configuration.apiUrl + type + "/" + id, true);

        let subject:ReplaySubject<DataEntity> = new ReplaySubject<DataEntity>(1);

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

    loadCollection(type:string, filter:{[key:string]:any} = null):Observable<DataCollection> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        request.open("GET", <string>this.configuration.apiUrl + type, true);

        let subject:ReplaySubject<DataCollection> = new ReplaySubject<DataCollection>(1);

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

    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity> {
        return null;
    }

    authenticate(login:string, password:string):Observable<boolean> {
        return null;
    }

    protected extractEntity(type:string, responseText:string):DataEntity {
        let data:Object = JSON.parse(responseText);
        return new DataEntity(type, data["data"][0], this.connector, +data["data"][0]["id"]);
    }

    protected extractCollection(type:string, responseText:string):DataCollection {
        let data:Object = JSON.parse(responseText);
        return new DataCollection(type, data["data"], this.connector);
    }
}
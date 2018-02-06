import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {HttpConfiguration} from "./http-configuration.interface";
import {DataCollection} from "../../data-structures/data-collection.class";
import {DataEntity} from "../../data-structures/data-entity.class";
import {BehaviorSubject, Observable} from "rxjs/Rx";

export class Http extends ExternalInterface {

    constructor(
        private configuration:HttpConfiguration,
        private connector:DataConnector
    ) {
        super();
    }

    loadEntity(type:string, id:number, fields:string[] = []):Observable<DataEntity> {
        return null;
    }

    loadCollection(type:string, filter:{[key:string]:any} = null):Observable<DataCollection> {
        return null;
    }

    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity> {
        return null;
    }
}
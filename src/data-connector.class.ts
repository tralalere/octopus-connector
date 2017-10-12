/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnectorConfig} from "./data-connector-config.interface";
import {DataEntity} from "./data-structures/data-entity.class";
import {Observable} from "rxjs/Rx";
import {DataCollection} from "./data-structures/data-collection.class";
import {ExternalInterface} from "./data-interfaces/external-interface.interface";

export class DataConnector {

    private _interfaces:{[key:string]:ExternalInterface} = {};

    constructor(
        private _configuration:DataConnectorConfig
    ) {}

    saveEntity(entity:DataEntity):Observable<DataEntity> {
        return Observable.create();
    }

    loadEntity(type:string, id:number, forced:boolean = true, fields:string[] = null):Observable<DataEntity> {
        return Observable.create();
    }

    loadCollection(type:string, filter:{[key:string]:any} = null, forced:boolean = true, fields:string[] = null):Observable<DataCollection> {
        return Observable.create();
    }
}
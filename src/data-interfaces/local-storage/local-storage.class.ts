/**
 * Created by Christophe on 12/10/2017.
 */
import {ExternalInterface} from "../external-interface.interface";
import {Observable} from "rxjs/Rx";
import {DataEntity} from "../../data-structures/data-entity.class";
import {DataCollection} from "../../data-structures/data-collection.class";
import {LocalStorageConfiguration} from "./local-storage-configuration.interface";

export class LocalStorage implements ExternalInterface {
    
    constructor(
        private _configuration:LocalStorageConfiguration
    ) {}

    loadEntity(type:string, id:number, forced:boolean = true, fields:string[] = null):Observable<DataEntity> {
        return Observable.create();
    }

    loadCollection(type:string, filter:{[key:string]:any} = null, forced:boolean = true, fields:string[] = null):Observable<DataCollection> {
        return Observable.create();
    }
}
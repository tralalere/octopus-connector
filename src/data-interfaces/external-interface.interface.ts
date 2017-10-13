/**
 * Created by Christophe on 10/10/2017.
 */
import {Observable} from "rxjs/Rx";
import {DataEntity} from "../data-structures/data-entity.class";
import {DataCollection} from "../data-structures/data-collection.class";

export interface ExternalInterface {
    loadEntity(type:string, id:number, fields:string[]):Observable<DataEntity>;
    loadCollection(type:string, filter:{[key:string]:any}, order:{[key:string]:string}, fields:string[]):Observable<DataCollection>;
    createEntity(type:string, data:{[key:string]:any}):Observable<DataEntity>;
}
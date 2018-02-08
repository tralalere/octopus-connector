/**
 * Created by Christophe on 22/11/2017.
 */
import {Observable} from "rxjs/Rx";
import {DataEntity} from "../data-structures/data-entity.class";
import {DataCollection} from "../data-structures/data-collection.class";
import {BehaviorSubject} from "rxjs/BehaviorSubject";
import {CollectionDataSet, EntityDataSet} from "../types";

export abstract class ExternalInterface {
    
    loadEntity(type:string, id:number, fields:string[] = []):EntityDataSet|Observable<EntityDataSet> {
        console.warn("LoadEntity not implemented in interface");
        return null;
    }
    
    loadCollection(type:string, filter:{[key:string]:any} = {}):CollectionDataSet|Observable<CollectionDataSet> {
        console.warn("LoadCollection not implemented in interface");
        return null;
    }
    
    createEntity(type:string, data:{[key:string]:any}):EntityDataSet|Observable<EntityDataSet> {
        console.warn("CreateEntity not implemented in interface");
        return null;
    }

    deleteEntity(type:string, id:number):Observable<boolean> {
        console.warn("DeleteEntity not implemented in interface");
        return null;
    }

    authenticate(login:string, password:string):Observable<boolean> {
        console.warn("Authenticate not implemented in interface");
        return null;
    }

    release(type:string) {
        console.warn("Release not implemented in interface");
    }

}
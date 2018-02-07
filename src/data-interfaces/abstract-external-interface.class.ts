/**
 * Created by Christophe on 22/11/2017.
 */
import {Observable} from "rxjs/Rx";
import {DataEntity} from "../data-structures/data-entity.class";
import {DataCollection} from "../data-structures/data-collection.class";
import {BehaviorSubject} from "rxjs/BehaviorSubject";

export abstract class ExternalInterface {
    
    loadEntity(type:string, id:number, fields:string[] = []):DataEntity|Observable<DataEntity> {
        console.warn("LoadEntity not implemented in interface");
        return null;
    }
    
    loadCollection(type:string, filter:{[key:string]:any} = {}):DataCollection|Observable<DataCollection> {
        console.warn("LoadCollection not implemented in interface");
        return null;
    }
    
    createEntity(type:string, data:{[key:string]:any}):DataEntity|Observable<DataEntity> {
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
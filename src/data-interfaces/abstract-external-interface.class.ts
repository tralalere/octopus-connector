/**
 * Created by Christophe on 22/11/2017.
 */
import {Observable} from "rxjs/Rx";
import {DataEntity} from "../data-structures/data-entity.class";
import {DataCollection} from "../data-structures/data-collection.class";

export abstract class ExternalInterface {
    
    loadEntity(type:string, id:number, fields:string[] = []):DataEntity {
        console.warn("LoadEntity not implemented in interface");
        return null;
    }
    
    loadCollection(type:string, filter:{[key:string]:any} = {}):DataCollection {
        console.warn("LoadCollection not implemented in interface");
        return null;
    }
    
    createEntity(type:string, data:{[key:string]:any}):DataEntity {
        console.warn("CreateEntity not implemented in interface");
        return null;
    }

    authenticate() {
        console.warn("Authenticate not implemented in interface");
    }

    release(type:string) {
        console.warn("Release not implemented in interface");
    }

}
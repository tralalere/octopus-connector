/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnector} from "../data-connector.class";
import {Observable} from "rxjs/Rx";

export class DataEntity {

    private attributes:{[key:string]:any} = {};

    constructor(
        public type:string,
        data:{[key:string]:any},
        private connector:DataConnector = null,
        public id:number = null
    ) {
        for (let key in data) {
            if (data.hasOwnProperty(key) && key !== "id") {
                this.attributes[key] = data[key];
            }
        }

        if (data["id"]) {
            this.id = +data["id"];
        }
    }

    set(key:string, value:any) {
        this.attributes[key] = value;
    }

    get(key:string):any {
        return this.attributes[key];
    }
    
    save():Observable<DataEntity> {
        return this.connector.saveEntity(this);
    }
}
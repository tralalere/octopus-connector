/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnector} from "../data-connector.class";
import {Observable} from "rxjs/Rx";

export class DataEntity {

    id:number;

    private _attributes:{[key:string]:any} = {};

    constructor(
        public type:string,
        data:{[key:string]:any},
        private _connector:DataConnector
    ) {
        for (let key in data) {
            if (data.hasOwnProperty(key) && key !== "id") {
                this._attributes[key] = data[key];
            }
        }

        this.id = +data["id"];
    }

    set(key:string, value:any) {
        this._attributes[key] = value;
    }

    get(key:string):any {
        return this._attributes[key];
    }
    
    save():Observable<DataEntity> {
        return this._connector.saveEntity(this);
    }
}
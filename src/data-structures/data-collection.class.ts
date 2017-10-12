/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnector} from "../data-connector.class";
import {DataEntity} from "./data-entity.class";

export class DataCollection {

    entities:DataEntity[] = [];

    constructor(
        public type:string,
        data:{[key:string]:any}[],
        private _connector:DataConnector
    ) {
        for (let key in data) {
            if (data.hasOwnProperty(key)) {
                this.entities.push(new DataEntity(type, data[key], _connector));
            }
        }
    }

    
}
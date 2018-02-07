/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnector} from "../data-connector.class";
import {DataEntity} from "./data-entity.class";
import {CollectionDataSet, EntityDataSet} from "../types";
import {Observable} from "rxjs/Observable";

export class DataCollection {

    entities:DataEntity[] = [];
    entitiesObservables:Observable<DataEntity>[] = [];

    constructor(
        public type:string,
        data:CollectionDataSet|EntityDataSet[],
        private connector:DataConnector = null
    ) {

        if (Array.isArray(data)) {
            data.forEach((elem:Object) => {
                this.entities.push(new DataEntity(type, elem, connector, elem["id"]));
            });
        } else {
            let keys:string[] = Object.keys(data);
            keys.forEach((key:string) => {
                this.entities.push(new DataEntity(type, data[key], connector, +key));
            });
        }

    }
}
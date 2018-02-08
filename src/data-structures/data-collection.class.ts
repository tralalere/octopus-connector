/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnector} from "../data-connector.class";
import {DataEntity} from "./data-entity.class";
import {CollectionDataSet, EntityDataSet} from "../types";
import {Observable} from "rxjs/Observable";
import {ModelSchema} from "octopus-model";

export class DataCollection {

    entities:DataEntity[] = [];
    entitiesObservables:Observable<DataEntity>[] = [];

    constructor(
        public type:string,
        data:CollectionDataSet|EntityDataSet[],
        private connector:DataConnector = null,
        structure:ModelSchema = null
    ) {

        if (Array.isArray(data)) {
            data.forEach((elem:Object) => {

                if (structure) {
                    elem = structure.filterModel(elem);
                }

                this.entities.push(new DataEntity(type, elem, connector, elem["id"]));
            });
        } else {
            let keys:string[] = Object.keys(data);
            keys.forEach((key:string) => {

                if (structure) {
                    data[key] = structure.filterModel(data[key]);
                }

                this.entities.push(new DataEntity(type, data[key], connector, +key));
            });
        }

    }
}
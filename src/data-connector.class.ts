/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnectorConfig} from "./data-connector-config.interface";
import {DataEntity} from "./data-structures/data-entity.class";
import {Observable} from "rxjs/Rx";

export class DataConnector {

    constructor(
        private _configuration:DataConnectorConfig
    ) {}

    saveEntity(entity:DataEntity):Observable<DataEntity> {
        return Observable.create();
    }
}
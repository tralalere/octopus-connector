/**
 * Created by Christophe on 10/10/2017.
 */
import {LocalStorageConfiguration} from "./data-interfaces/local-storage/local-storage-configuration.interface";

export interface DataConnectorConfig {
    defaultInterface:string;
    configuration: {
        localstorage?:LocalStorageConfiguration
    };
    declarations:any;
    map?:{[key:string]:string};
}
/**
 * Created by Christophe on 10/10/2017.
 */
import {LocalStorageConfiguration} from "./data-interfaces/local-storage/local-storage-configuration.interface";
import {ExternalInterface} from "./data-interfaces/abstract-external-interface.class";
import {EndpointConfig} from "./endpoint-config.interface";

export interface DataConnectorConfig {
    defaultInterface:string;
    configuration: {
        localstorage?:LocalStorageConfiguration
    };
    declarations?:any;
    map?:{[key:string]:string|EndpointConfig};
    cached?:string[];

    // ici déclaration des structures octopusModel
    structures?:{[key:string]:string};
    interfaces?:{[key:string]:ExternalInterface}
}
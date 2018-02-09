/**
 * Created by Christophe on 10/10/2017.
 */
import {LocalStorageConfiguration} from "./data-interfaces/local-storage/local-storage-configuration.interface";
import {ExternalInterface} from "./data-interfaces/abstract-external-interface.class";
import {EndpointConfig} from "./endpoint-config.interface";
import {HttpConfiguration} from "./data-interfaces/http/http-configuration.interface";

/**
 * Connector main configuration
 */
export interface DataConnectorConfig {

    /**
     * Interface used when no interface name specified for an endpoint
     */
    defaultInterface:string;

    /**
     * Base configurations for each service type
     */
    configuration: {
        localstorage?:LocalStorageConfiguration,
        http?:HttpConfiguration
    };

    // not used
    declarations?:any;

    /**
     * Individual endpoint configuration
     */
    map?:{[key:string]:string|EndpointConfig};

    // not used
    interfaces?:{[key:string]:ExternalInterface};
}
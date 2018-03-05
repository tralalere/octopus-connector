/**
 * Created by Christophe on 10/10/2017.
 */
import {LocalStorageConfiguration} from "./data-interfaces/local-storage/local-storage-configuration.interface";
import {ExternalInterface} from "./data-interfaces/abstract-external-interface.class";
import {EndpointConfig} from "./endpoint-config.interface";
import {HttpConfiguration} from "./data-interfaces/http/http-configuration.interface";
import {NodejsConfiguration} from "./data-interfaces/nodejs/nodejs-configuration.interface";

/**
 * Connector main configuration
 */
export interface DataConnectorConfig {

    /**
     * Interface used when no interface name specified for an endpoint
     */
    defaultInterface:string;

    /**
     * Delay before action retry
     */
    retryTimeout?:number;

    /**
     * Max attempts number
     */
    maxRetry?:number;

    /**
     * Base configurations for each service type
     */
    configuration: {
        localstorage?:LocalStorageConfiguration,
        http?:HttpConfiguration,
        nodejs?:NodejsConfiguration
    };

    // currently not used
    declarations?:any;

    /**
     * Individual endpoint configuration
     */
    map?:{[key:string]:string|EndpointConfig};

    // currently not used
    interfaces?:{[key:string]:ExternalInterface};
}
import {ModelSchema} from "octopus-model";

/**
 * Individual endpoint config
 */
export interface EndpointConfig {

    /**
     * Service used by this endpoint
     */
    type:string;

    /**
     * Model structure associated to this endpoint
     */
    structure?:ModelSchema;

    /**
     * Does the endpoint use the connector cache ?
     */
    cached?:boolean;

    /**
     * List of data attributes keys excluded in save and create actions, used in some services
     */
    exclusions?:string[];
}
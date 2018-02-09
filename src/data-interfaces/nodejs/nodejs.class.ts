import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {NodejsConfiguration} from "./nodejs-configuration.interface";

/**
 * Nodejs interface
 */
export class Nodejs extends ExternalInterface {

    /**
     * Create the nodejs interface
     * @param {NodejsConfiguration} configuration Interface configuration object
     * @param {DataConnector} connector Reference to the connector
     */
    constructor(
        private configuration:NodejsConfiguration,
        private connector:DataConnector
    ) {
        super();
    }
}
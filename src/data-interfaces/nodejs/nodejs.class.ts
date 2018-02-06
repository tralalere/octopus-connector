import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {NodejsConfiguration} from "./nodejs-configuration.interface";

export class Nodejs extends ExternalInterface {

    constructor(
        private configuration:NodejsConfiguration,
        private connector:DataConnector
    ) {
        super();
    }
}
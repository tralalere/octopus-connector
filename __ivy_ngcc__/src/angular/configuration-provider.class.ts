import {Inject, Injectable} from "@angular/core";
import {DataConnectorConfig} from "../..";

@Injectable()
export class ConfigurationProvider {

    constructor(
        @Inject("configuration") public configuration:DataConnectorConfig
    ) {}
    
}

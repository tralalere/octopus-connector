import {Inject, Injectable} from '@angular/core';
import {DataConnectorConfig} from './data-connector-config.interface';

@Injectable()
export class ConfigurationProvider {

    constructor(
        @Inject('configuration') public configuration: DataConnectorConfig
    ) {
    }

}

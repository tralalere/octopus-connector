import {Injectable} from '@angular/core';
import {ConfigurationProvider} from './models/configuration-provider.class';
import {DataConnector} from './models/data-connector.class';

@Injectable()
export class OctopusConnectService extends DataConnector {
    constructor(
        public configurationProvider: ConfigurationProvider
    ) {
        super(configurationProvider.configuration);
    }
}

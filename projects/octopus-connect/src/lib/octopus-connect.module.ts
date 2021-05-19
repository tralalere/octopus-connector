import {ModuleWithProviders, NgModule} from '@angular/core';
import {OctopusConnectService} from './octopus-connect.service';
import {DataConnectorConfig} from './models/data-connector-config.interface';
import {ConfigurationProvider} from './models/configuration-provider.class';

@NgModule({
    providers: [
        OctopusConnectService
    ]
})
export class OctopusConnectModule {
    static forRoot(configuration: DataConnectorConfig): ModuleWithProviders<OctopusConnectModule> {
        return {
            ngModule: OctopusConnectModule,
            providers: [
                ConfigurationProvider,
                {provide: 'configuration', useValue: configuration}
            ]
        };
    }
}

import {ModuleWithProviders, NgModule} from "@angular/core";
import {OctopusConnectService} from "./octopus-connect.service";
import {DataConnectorConfig} from "../..";
import {ConfigurationProvider} from "./configuration-provider.class";

@NgModule({
    providers: [
        OctopusConnectService
    ]
})
export class OctopusConnectModule {

    static forRoot(configuration:DataConnectorConfig):ModuleWithProviders {
        return {
            ngModule: OctopusConnectModule,
            providers: [
                ConfigurationProvider,
                {provide: "configuration", useValue: configuration}
            ]
        }
    }
}

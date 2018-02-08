import {ModelSchema} from "octopus-model";

export interface EndpointConfig {
    type:string;
    structure?:ModelSchema;
    cached?:boolean;
    exclusions?:string[];
}
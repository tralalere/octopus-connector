import {Model} from "octopus-model";

export interface EndpointConfig {
    type:string;
    structure?:Model;
    cached?:boolean;
}
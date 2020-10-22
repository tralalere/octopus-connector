/**
 * Created by Christophe on 12/10/2017.
 */
import {DataConnector} from "../src/data-connector.class";
import {DataEntity} from "../src/data-structures/data-entity.class";
import {DataCollection} from "../src/data-structures/data-collection.class";
import {ObjectsStructures} from "./objects-structures.class";
import {InterfaceError} from "../src/data-interfaces/interface-error.class";

let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    configuration: {
        localstorage: {
            prefix: "test"
        },
        http: {
            apiUrl: "http://preprod.savanturiers.api.tralalere.com/api/"
        }
    },
    map: {

    }
});


connector.loadCollection("user", { name: "bob" }).subscribe((collection: DataCollection) => {
   let entities: DataEntity[] = collection.entities;
});

connector.createEntity("user", {
    name: "bob",
    age: 24
}).subscribe((entity: DataEntity) => { console.log(entity) });
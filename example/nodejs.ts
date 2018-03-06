import {DataConnector} from "../src/data-connector.class";
import {ObjectsStructures} from "./objects-structures.class";
import {DataCollection} from "../src/data-structures/data-collection.class";
import {DataEntity} from "../src/data-structures/data-entity.class";
import {InterfaceError} from "../src/data-interfaces/interface-error.class";
import * as ObjectHash from "object-hash";

let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    configuration: {
        localstorage: {
            prefix: "app_"
        },
        nodejs: {
            socketUrl: "https://node.savanturiers.tralalere.com",
        }
    },
    map: {
        "idea": {
            type: "nodejs"
        }
    }
});

setTimeout(() => {
    connector.loadCollection("idea").subscribe((collection:DataCollection) => {
        console.log("coll", collection);
    }, () => {
        console.log("échec et mat");
    });
}, 10000);


setTimeout(() => {
    /*connector.loadEntity("idea", "6376453095987085312").subscribe((data:DataEntity) => {
        console.log("ddd", data);
        data.remove().subscribe(() => {
            console.log("deleted");
        });
    });*/
}, 1000);


/*setTimeout(() => {
    connector.createEntity("idea", {
        key1: "val1",
        key2: "val2"
    }).subscribe((entity:DataEntity) => {
        console.log(entity);
    }, (error:InterfaceError) => {

    });
}, 2000);*/

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
        },
        wall: "nodejs"
    }
});

//setTimeout(() => {
    connector.loadCollection("idea").subscribe((collection:DataCollection) => {
        console.log("coll", collection);
    }, () => {
        console.log("échec et mat");
    });
//}, 1);

let setted:DataEntity;

setTimeout(() => {
    /*connector.loadEntity("idea", "6376453095987085312").subscribe((data:DataEntity) => {
        console.log("ddd", data);
        data.remove().subscribe(() => {
            console.log("deleted");
        });
    });*/

    connector.createEntity("idea", {
        okhh: 1,
        dfd: 2
    }).subscribe((entity:DataEntity) => {
        setted = entity;
    });

}, 3000);

setTimeout(() => {
    //setted.set("dfd", 4);
    setted.remove();
}, 6000);

/*setTimeout(() => {
    connector.createEntity("idea", {
        key1: "val1",
        key2: "val2"
    }).subscribe((entity:DataEntity) => {
        console.log(entity);
    }, (error:InterfaceError) => {

    });
}, 2000);*/

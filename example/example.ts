/**
 * Created by Christophe on 12/10/2017.
 */
import {DataConnector} from "../src/data-connector.class";
import {DataEntity} from "../src/data-structures/data-entity.class";
import {DataCollection} from "../src/data-structures/data-collection.class";
import {ObjectsStructures} from "./objects-structures.class";

let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    configuration: {
        localstorage: {
            prefix: "test"
        },
        http: {
            apiUrl: "https://api.e-talmud.com/api/"
        }
    },
    map: {
        "endpoint1": {
            type: "localstorage",
            structure: ObjectsStructures.endpoint1
        },
        "lesson_light": {
            type: "http"
        }
    }
});

connector.createEntity("endpoint2", {key1: "val1", key2: "val2"}).subscribe((data:DataEntity) => {
    console.log(data);
});

/*connector.loadEntity("lesson_light", 6).subscribe((data:DataEntity) => {
    console.log(data);
});*/

/*connector.loadCollection("lesson_light").subscribe((collection:DataCollection) => {
    console.log(collection);
});*/

/*connector.loadCollection("endpoint1").subscribe((data:DataCollection) => {
    console.log(data);
});*/
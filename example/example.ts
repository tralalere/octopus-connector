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
        "endpoint2": {
            type: "localstorage",
            structure: ObjectsStructures.endpoint1
        },
        "lesson_light": {
            type: "http"
        }
    }
});

let count:HTMLElement = document.getElementById("count");
let button:HTMLElement = document.getElementById("test-button");

button.addEventListener("click", () => {
    connector.createEntity("endpoint2").subscribe((data:DataEntity) => {
        console.log("au click", data);
    });
});

/*connector.createEntity("endpoint2", {key1: "ok1", key2: "val2"}).subscribe((data:DataEntity) => {
    console.log(data);
});*/

/*connector.loadEntity("lesson_light", 6).subscribe((data:DataEntity) => {
    console.log(data);
});*/

connector.loadCollection("lesson_light").subscribe((collection:DataCollection) => {
    console.log(collection);
    count.innerText = collection.entities.length.toString();
});

/*connector.loadCollection("endpoint2", {key1: "ok1"}).subscribe((data:DataCollection) => {
    console.log(data);
});*/

/*connector.loadEntity("endpoint2", 7).take(1).subscribe((data:DataEntity) => {
    console.log(data);
    data.remove();
});*/
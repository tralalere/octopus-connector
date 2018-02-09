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
        "test-endpoint": {
            type: "localstorage",
            structure: ObjectsStructures.endpoint1
        }
    }
});

let count:HTMLElement = document.getElementById("count");
count.remove();

let button1:HTMLElement = document.getElementById("test-button1");
let button2:HTMLElement = document.getElementById("test-button2");

let displayer1:HTMLElement = document.getElementById("displayer1");
let displayer2:HTMLElement = document.getElementById("displayer2");

let key2Elem:HTMLInputElement = <HTMLInputElement>document.getElementById("key2");

button1.addEventListener("click", () => {
    connector.createEntity("test-endpoint", { key1: "val1", key2: key2Elem.value });
});

button2.addEventListener("click", () => {
    connector.createEntity("test-endpoint", { key1: "val2", key2: key2Elem.value });
});

connector.loadCollection("test-endpoint", { key1: "val1" }).subscribe((data:DataCollection) => {
    displayer1.innerHTML = "";
    data.entities.forEach((entity:DataEntity) => {
        let counter:Node = count.cloneNode(true);
        (<HTMLElement>counter).innerHTML = entity.id.toString() + "<br>" + entity.get("key2");
        displayer1.appendChild(counter);

        counter.addEventListener("click", () => {
            entity.remove();
        });
    });
});

connector.loadCollection("test-endpoint").subscribe((data:DataCollection) => {
    displayer2.innerHTML = "";
    data.entities.forEach((entity:DataEntity) => {
        let counter:Node = count.cloneNode(true);
        (<HTMLElement>counter).innerHTML = entity.id.toString() + "<br>" + entity.get("key2");
        displayer2.appendChild(counter);

        counter.addEventListener("click", () => {
            entity.remove();
        });
    });
});
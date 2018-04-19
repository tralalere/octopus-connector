import {DataConnector} from "../src/data-connector.class";
import {ObjectsStructures} from "./objects-structures.class";
import {DataEntity} from "../src/data-structures/data-entity.class";
import {DataCollection} from "../src/data-structures/data-collection.class";
import {InterfaceError} from "../src/data-interfaces/interface-error.class";

let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    declarations: {
        http2: "http"
    },
    configuration: {
        localstorage: {
            prefix: "test"
        },
        nodejs: {
            socketUrl: "https://jmdall.fr:8087/"
        },
        drupal8: {
            apiUrl: "https://preprod.lms.api.tralalere.com/api/",
            headers: {
                "Content-type": "application/json"
            },
            clientId: "f7d33bbc-d79a-48ac-8473-e7b833561466",
            clientSecret: "tralalere",
            scope: "administrator angular"
        }
    },
    map: {
        "endpoint": "localstorage",
        idea: "nodejs",
        category: "nodejs",
        wall: "nodejs",
    }
});

setTimeout(() => {
    connector.loadCollection("wall").subscribe((coll: DataCollection) => {
        console.log(coll);
    });
}, 2000);

import {DataConnector} from "../src/data-connector.class";
import {ObjectsStructures} from "./objects-structures.class";
import {DataEntity} from "../src/data-structures/data-entity.class";
import {DataCollection} from "../src/data-structures/data-collection.class";
import {InterfaceError} from "../src/data-interfaces/interface-error.class";

let connector:DataConnector = new DataConnector({
    defaultInterface: "http",
    language: "fr",
    declarations: {
        http2: "http"
    },
    configuration: {
        localstorage: {
            prefix: "test"
        },
        http: {
            apiUrl: "https://savanturiers.api.tralalere.com/"
        }
    },
    map: {
        "endpoint": "localstorage",
        "users": {
            type: "http",
            useLanguage: true
        }
    }
});

connector.authenticate("http", "christophe", "Pass").subscribe((user: DataEntity) =>  {
    connector.loadCollection("userskk").subscribe((coll: DataCollection) => {
        console.log(coll);
    }, err => console.log(err));
});

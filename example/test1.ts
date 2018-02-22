import {DataConnector} from "../src/data-connector.class";
import {ObjectsStructures} from "./objects-structures.class";
import {DataEntity} from "../src/data-structures/data-entity.class";
import {DataCollection} from "../src/data-structures/data-collection.class";

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
        "projets": {
            type: "http"
        }
    }
});

connector.authenticated("http").subscribe((user:DataEntity) => {
    console.log("Utilisateur courant", user);
    connector.loadCollection("projets").subscribe((coll:DataCollection) => {
        console.log(coll);
    });
}, () => {
    connector.authenticate("http", "christophe", "tralalere2017").subscribe(() => {
        console.log("Authentification");
    });
});


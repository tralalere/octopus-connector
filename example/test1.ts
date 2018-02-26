import {DataConnector} from "../src/data-connector.class";
import {ObjectsStructures} from "./objects-structures.class";
import {DataEntity} from "../src/data-structures/data-entity.class";
import {DataCollection} from "../src/data-structures/data-collection.class";
import {InterfaceError} from "../src/data-interfaces/interface-error.class";

let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    configuration: {
        localstorage: {
            prefix: "test"
        },
        http: {
            apiUrl: "http://preprod.savanturiers.api.tralalere.com/api/",
            headers: {
                "Content-type": "application/json"
            }
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
    /*connector.loadCollection("projets").subscribe((coll:DataCollection) => {
        console.log(coll);
    });*/

    connector.loadEntities("projets", [25, 250]).subscribe((entities:DataEntity[]) => {

    }, (err:any) => {
        console.log(err);
    });

}, () => {
        console.log("pas connecté");
});

//connector.authenticate("http", "christophe", "tralalere2017");

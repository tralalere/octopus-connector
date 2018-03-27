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
        drupal8: {
            apiUrl: "https://preprod.lms.api.tralalere.com/",
            headers: {
                "Content-type": "application/json"
            }
        },
        http: {
            apiUrl: "http://preprod.savanturiers.api.tralalere.com/api/",
            headers: {
                "Content-type": "application/json"
            }
        },
        http2: {
            apiUrl: "http://preprod.savanturiers.api.tralalere.com/api/",
            headers: {
                "Content-type": "application/json"
            }
        }
    },
    map: {
        "projets": {
            type: "http"
        },
        "endpoint": "localstorage"
    }
});

/*connector.authenticated("http").subscribe((user:DataEntity) => {
    console.log("Utilisateur courant", user);

    connector.loadEntities("projets", [25, 250]).subscribe((entities:DataEntity[]) => {

    }, (err:any) => {
        console.log(err);
    });

}, () => {
        console.log("pas connecté");
});*/

connector.authenticate("http", "christophe", "tralalere2017").subscribe((data:DataEntity) => {
    console.log("c'est bon", data);

    connector.loadCollection("projets").subscribe((coll: DataCollection) => {
        console.log(coll);
    })
}, (error: InterfaceError) => {
    console.log(error);
});

//connector.authenticate("http", "christophe", "tralalere2017");
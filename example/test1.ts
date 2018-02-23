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
    connector.loadCollection("projets").subscribe((coll:DataCollection) => {
        console.log(coll);
    });

    /*connector.createEntity("projets", {
        classe: 207,
        label: "un nouveau projet",
        theme: 1
    }).subscribe((data:DataEntity) => {
        console.log("nouveau", data);
    }, (err:InterfaceError) => {
        console.log("pas bon", err);
    });*/

    /*connector.loadEntity("projets", 1289).subscribe((data:DataEntity) => {
        console.log(data);
        //data.set("label", "okokok1");
        data.remove();
    });*/


}, () => {
        console.log("pas connecté");
});


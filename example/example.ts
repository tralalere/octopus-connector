/**
 * Created by Christophe on 12/10/2017.
 */
import {DataConnector} from "../src/data-connector.class";
import {DataEntity} from "../src/data-structures/data-entity.class";
import {DataCollection} from "../src/data-structures/data-collection.class";

let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    configuration: {
        localstorage: {
            prefix: "test"
        }
    },
    map: {
        "endpoint1": {
            type: "localstorage"
        }
    }
});

/*connector.createEntity("endpoint1", {key1: "val1", key2: "val2"}).subscribe((data:DataEntity) => {
    console.log(data);
});*/

connector.loadEntity("endpoint1", 2).subscribe((data:DataEntity) => {
    console.log(data);
});

connector.loadCollection("endpoint1").subscribe((data:DataCollection) => {
    console.log(data);
});
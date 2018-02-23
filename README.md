# octopus-connect
Un connecteur de données universel.

## What is octopus connect ?

Octopus connect est un connecteur universel et extensible vers des sources de données en ligne en locales.

Il est étudié de manière à pouvoir charger les données depuis des sources multiples, et de les manipuler avec une API
unique et facile à utiliser.

Trois concepts principaux: *DataConnector*, *DataEntity* et *DataCollection*.

## Comment installer OctopusConnect dans un projet ?

L'installation se fait via la commande suivante :
```sh
npm install octopus-connect --save
```

## Comment ça s'utilise ?

OctopusConnect peut-être utilisé dans deux contextes techniques différents : Javascript pur, et TypeScript. Nous verrons
d'abord la manière de l'utiliser dans un projet TypeScript, et ensuite son utilisation en Javascript, qui n'est pas radicalement
différente.

```typescript
import {DataConnector} from "./src/data-connector.class";

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
```


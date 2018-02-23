# OctopusConnect
Un connecteur de données universel.

* [Concept](#quel-est-le-concept-?)
* [Installation](#comment-installer-octopusconnect-dans-un-projet-?)
* [Usage basique](#usage-basique)
  * [Instanciation et configuration](#instanciation-et-configuration)
    * [Un premier exemple très basique](#un-premier-exemple-très-basique)
    * [Une dissection de la configuration](#une-dissection-de-la-configuration)
* [Le connecteur en lui-même, et son fonctionnement](#le-connecteur-en-lui-même,-et-son-fonctionnement)
  * [DataEntity](#dataentity)
  * [DataCollection](#datacollection)
  * [Lien intrinsèque entre DataEntity et DataCollection](#lien-intrinsèque-entre-dataentity-et-datacollection)
* [L'API du connecteur](#l'api-du-connecteur)
  

## Quel est le concept ?

Octopus connect est un connecteur universel et extensible vers des sources de données en ligne en locales.

Il est étudié de manière à pouvoir charger les données depuis des sources multiples, et de les manipuler avec une API
unique et facile à utiliser.

Trois concepts principaux: *DataConnector*, *DataEntity* et *DataCollection*.

La version basique d'OctopusConnect embarque trois interfaces différentes
* **http** (pour connection à un back-office drupal avec module RestFul)
* **nodejs** (pour connection à un web socket dont le code sera publié plus tard)
* **localstorage**, pour un travail en local basique, en attendant la création d'un back-office

## Comment installer OctopusConnect dans un projet ?

L'installation se fait via la commande suivante :
```sh
npm install octopus-connect --save
```

## Usage basique

OctopusConnect peut-être utilisé dans deux contextes techniques différents : Javascript pur, et TypeScript. Nous verrons
d'abord la manière de l'utiliser dans un projet TypeScript, et ensuite son utilisation en Javascript, qui n'est pas radicalement
différente.


### Instanciation et configuration

#### Un premier exemple très basique

Une instanciation basique du connecteur, utilisant l'interface **http** embarquée (le détail de la configuration viendra
plus tard)

```typescript
import {DataConnector, DataCollection, DataEntity} from ".";

let connector: DataConnector = new DataConnector({
    defaultInterface: "http",
    configuration: {
        http: {
            apiUrl: "http://test-server.com/api/"
        }
    }
});

// Le chargement d'une collection se fait ensuite à l'aide la commande suivante :

connector.loadCollection("projets").subscribe((collection: DataCollection) => {
    // la valeur de la collection
    console.log(collection);
});

// Et pour ce qui est du chargement d'une entité unique
connector.loadEntity("projets", 25).subscribe((entity: DataEntity) => {
    // la valeur de l'entité
    console.log(entity);
});
```


#### Une dissection de la configuration

Pour bien aborder OctopusConnect, commençons par regarder de quelle manière est structurée sa configuration :

```typescript
import {DataConnectorConfig} from ".";


// l'objet de configuration doit respecter l'interface DataConnectorConfig
let configuration: DataConnectorConfig = {
    
    // le type de service utilisé quand rien n'est spécifié dans l'objet "map"
    defaultInterface: "localstorage",
    
    // la configuration individuelle des différents services disponibles
    configuration: {
        
        // configuration du service http
        http: {
            
        },
        
        // configuration du service nodejs
        nodejs: {
            
        },
        
        // configuration du service localstorage
        localstorage: {
            
        }
    },
    
    // listing de chacun des endpoints utilisés par le module, et configuration individuelle
    map: {
        
        // chaque entrée dans "map" est soit de type string, ou de type EndpointConfig
        
        // le endpoint "endpoint1" utilise l'interface http. Pas de configuration supplémentaire.
        endpoint1: "http",
        
        // le endpoint "endpoint2" utilise l'interface nodejs. Pas de configuration supplémentaire.
        endpoint2: "nodejs",
        
        // le endpoint "endpoint3" utilise l'interface http, et le résultat des requêtes sera mis en cache
        endpoint3: {
            type: "http",
            cached: true
        }
    }
};
```

Le détail de la configuration viendra plus tard.

## Le connecteur en lui-même, et son fonctionnement

### DataEntity
Unité de donnée de base, englobant les données d'une entité de l'API.

L'accès aux données d'une entité se fait via les méthodes **get()** et **set()**.

La sauvegarde sur le service de l'entité (après modification) se fait par le biais de la méthode **save()**, et sa
suppression par la méthode **remove()**.

**Exemple :**
```typescript
import {DataEntity, DataConnector, DataConnectorConfig} from "./";

let button: HTMLElement;
let entity: DataEntity;

// Attention, cette conf a été volontairement allègée pour une question de lisibilité
let configuration: DataConnectorConfig = {};

let connector: DataConnector = new DataConnector(configuration);

connector.loadEntity("endpoint1", 12).subscribe((data: DataEntity) => {
    entity = data;
    
    // retourne la valeur "key1" de l'entité si elle existe. Sinon retourne null
    let val: number = data.get("key1");
    
    // Met à jour la valeur de key1 au sein de l'entité
    data.set("key1", 560);
});

button.addEventListener("click", () => {
    if (entity) {
        
        // sauvegarde l'entité sur le service
        entity.save();
        
        // Supprime l'entité du service
        entity.remove();
    }
});
```


### DataCollection
Collection d'entités, agglémérée suivant un filtre.

Une propriété nous intéresse particulièrement dans la DataCollection : **entities**, qui est un array des entités englobée par
la collection.

```typescript
import {DataConnectorConfig, DataConnector, DataEntity, DataCollection} from "./"

// Attention, cette conf a été volontairement allègée pour une question de lisibilité
let configuration: DataConnectorConfig = {};

let connector: DataConnector = new DataConnector(configuration);

// chargement de la collection
connector.loadCollection("endpoint1").subscribe((collection: DataCollection) => {
    
    // extraction des entités de la collection
    let entities: DataEntity[] = collection.entities;
});
```

### Lien intrinsèque entre DataEntity et DataCollection

Collections et entités sont intimement liés. Lors du chargement d'une entité via la commande loadEntity, si cette entité
est susceptible d'entrer dans une collection parcequ'elle satisfait aux critères de tri d'une collection de même type, celle-ci
sera insérée dans la collection si elle n'est y est pas déjà présente (dans ce cas elle sera mise à jour), et la collection est
rafraichie.

De la même façon, si une collection, chargée via un loadCollection, charge des entités déjà chargées ailleurs (via un loadEntity), 
ces entités sont mises à jour. Si des entités chargées satisfont aux critères de filtre d'une collection déjà chargées, ces
collections sont mises à jour avec les nouvelles entités, et les collections sont rafraichies.


## L'API du connecteur

### loadCollection

Charge une collection, pour un endpoint spécifique, satisfaisant à des critères de filtres donnés.

Arguments:

**type:** nom du endpoint ciblé
**filter:** 

```typescript
connector.loadCollection("endpoint1").subscribe((collection: DataCollection) => {
    
    // extraction des entités de la collection
    let entities: DataEntity[] = collection.entities;
});
```
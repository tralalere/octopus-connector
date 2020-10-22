# OctopusConnect

(English translation coming soon !)

Un connecteur de données universel et extensible.

* [Concept](#quel-est-le-concept-?)
* [Installation](#comment-installer-octopusconnect-dans-un-projet-?)
* [Usage basique](#usage-basique)
  * [Instanciation et configuration](#instanciation-et-configuration)
    * [Un premier exemple très basique](#un-premier-exemple-très-basique)
    * [Une dissection de la configuration](#une-dissection-de-la-configuration)
* [Le connecteur en lui-même, et son fonctionnement](#le-connecteur-en-lui-même,-et-son-fonctionnement)
  * [Le concept DataEntity](#le-concept-de-dataentity)
  * [Le concept de DataCollection](#le-concept-de-datacollection)
  * [L'objet InterfaceError](#l'objet-interfaceerror)
  * [Lien intrinsèque entre DataEntity et DataCollection](#lien-intrinsèque-entre-dataentity-et-datacollection)
* [L'API du connecteur](#l'api-du-connecteur)
  * [authenticated](#authenticated)
  * [authenticate](#authenticate)
  * [loadCollection](#loadcollection)
  * [loadEntity](#loadentity)
  * [loadEntities](#loadentities)
  * [createEntity](#createentity)
  * [createTemporaryEntity](#createtemporaryentity)
* [Configuration](#configuration)
  * [Configuration générale du connecteur](#configuration-générale-du-connecteur)
  * [Configuration des services](#configuration-des-services-(_configuration_))
  * [Configuration par endpoint](#configuration-par-endpoint-(_map_))
  
  

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

### Le concept de DataEntity
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


### Le concept de DataCollection
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

### L'objet InterfaceError
Objet retourné par le connecteur dans une souscription en cas d'erreur rencontrée sur l'interface.

_Propriétés:_

**code:** Code de l'erreur. Pour l'interface Http, correspond au code d'erreur HTTP

**message:** Message d'erreur généré par le connecteur

**originalMessage:** Message d'erreur original de l'interface


### Lien intrinsèque entre DataEntity et DataCollection

Collections et entités sont intimement liés. Lors du chargement d'une entité via la commande loadEntity, si cette entité
est susceptible d'entrer dans une collection parcequ'elle satisfait aux critères de tri d'une collection de même type, celle-ci
sera insérée dans la collection si elle n'est y est pas déjà présente (dans ce cas elle sera mise à jour), et la collection est
rafraichie.

De la même façon, si une collection, chargée via un loadCollection, charge des entités déjà chargées ailleurs (via un loadEntity), 
ces entités sont mises à jour. Si des entités chargées satisfont aux critères de filtre d'une collection déjà chargées, ces
collections sont mises à jour avec les nouvelles entités, et les collections sont rafraichies.


## L'API du connecteur

### authenticated

Observable retournant les données de l'utilisateur courant (sous forme de dataEntity) si la session est toujours en cours.

Sinon il retourne une erreur.

```typescript
connector.authenticated.subscribe((userData: DataEntity) => {
    // exécuté si succès
}, () => {
    // exécuté si la session n'est plus valide
});
```

### authenticate

Méthode qui prend en paramètre un login et un mot de passe, et qui retourne un observable (de DataEntity) des données de l'utilisateur
courant, ou une erreur en cas de problème d'authentification.

```typescript
connector.authenticate("login", "password").subscribe((userData: DataEntity) => {
    // succès de l'authentification
}, (error: InterfaceError) => {
    // erreur d'authentification
});
```

### loadCollection

Charge une collection, pour un endpoint spécifique, satisfaisant à des critères de filtres donnés.

**_Arguments_**:

**type:** Nom du endpoint ciblé

**filter:** Objet clé / valeur

**Retourne:** L'observable correspondant à la collection

```typescript
connector.loadCollection("endpoint1").subscribe((collection: DataCollection) => {
    
    // extraction des entités de la collection en cas de succès
    let entities: DataEntity[] = collection.entities;
}, (error: InterfaceError) => {
    // code éxécuté en cas d'erreur
});
```

### loadEntity

Charge l'entité dont l'id est celui passé en paramètre, sur un endpoint spécifié.

_**Arguments**_

**type:** Nom du endpoint ciblé

**id:** Id de l'entité

**Retourne:** L'observable correspondant à l'entité

```typescript
connector.loadEntity("endpoint1", 125).subscribe((entity: DataEntity) => {
    // code éxécuté en cas de succès
}, (error: InterfaceError)=> {
    // code éxécuté en cas d'erreur de chargemement
});
```

### loadEntities

Même fonctionnement que loadEntities, exepté qu'il prend en argument une liste d'ids, et retourne une liste d'entités sous
forme d'observable.

**_Arguments:_**

**type:** Nom du endpoint ciblé

**ids:** Array d'ids

**Retourne:** Un observable retournant un array des entités chargés

```typescript
connector.loadEntities("endpoint1", [25, 100, 212]).subscribe((entities: DataEntity[]) => {
    // en cas de succès des chargements
}, (error: InterfaceError) => {
    // retourne la première erreur rencontrée
});
```

### createEntity

Crée une entité sur le service spécifié, à l'aide des données passées en argument.

**_Arguments:_** 

**type:** Nom du endpoint ciblé

**data:** Données utilisées pour la création de l'objet

**Retourne:** Un observable des données de l'entitée crée

```typescript
connector.createEntity("endpoint1", {
    username: "chris",
    role: 4
}).subscribe((entity: DataEntity) => {
    // succès de la création de l'entité
}, (error: InterfaceError) => {
    // échec de la création
});
```

Attention: il est possible de créer une entité à partir d'un schéma de données spécifié dans la configuration du endpoint.
Voir plus loin.

### createTemporaryEntity

Crée une entité temporaire (présente uniquement sur le front).

Même fonctionnement que createEntity, excepté que l'entité ne sera crée sur le service que lorsqu'il sera fait appel à la
méthode save de l'entité.

```typescript
connector.createTemporaryEntity("endpoint1", {
    username: "chris",
    role: 4
}).subscribe((entity: DataEntity) => {
    // succès de la création de l'entité
    
    // et si on veut la sauver sur le service
    entity.save();
    
}, (error: InterfaceError) => {
    // échec de la création
});
```

## Configuration

Comme nous l'avons vu plus haut, la configuration de base du connecteur est faite dans un object qui doit satisfaire à 
l'interface **DataConnectorConfig**. Nous allons voir une par une les propriétés qu'il est possible d'utiliser dans
cette configuration, et l'influence de chacun de ces paramètres sur le fonctionnement du connecteur.

Un exemple très basique :
```typescript
let connector: DataConnector = new DataConnector({
    defaultInterface: "http",
    configuration: {
        
    },
    map: {
        
    }
});
```

### Configuration générale du connecteur

C'est le premier niveau de configuration.

**_Propriétés :_**

**defaultInterface** (string, obligatoire):

Type de l'interface par défaut du connecteur. Si le type d'un endpoint n'est pas spécifié
dans map, c'est cette interface-là qui sera utilisée.

**retryTimeout** (number, valeur par défaut: 2000):

En cas d'échec d'une action sur le connecteur (loadEntity, save, etc.) (avec un code d'erreur 0), c'est le temps qui
s'écoulera avant une nouvelle tentative de cette action.

**maxRetry** (number, valeur par défaut: 10):

En cas d'échec d'une action sur le connecteur avec un code 0, c'est le nombre maximum de tentative de relancement de l'actions.
Au delà de ce nombre de tentatives, l'action échoue.

**configuration** (obligatoire):

Configuration individuelle des services (voir ci-dessous)

**map** (optionnel):

Configuration individuelle des endpoints (voir ci-dessous)

### Configuration des services (_configuration_)

Configuration individuelle des services, par nom de service.

#### http

Interface à respecter : HttpConfiguration

**_Propriétés :_**

**apiUrl** (string, obligatoire): 

Url de l'api du service

**headers** ({[key:string]:string}, optionnel): 

Liste clé / valeur de headers passés lors de chacune des requêtes

**Exemple :**

```typescript
let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    configuration: {
        http: {
            apiUrl: "http://test-server.com/api/",
            headers: {
                "Content-type": "application/json"
            }
        }
    }
});
```

#### localstorage

**_Propriétés :_**

**prefix** (string, optionnel):

Préfixe utilisé sur les clés d'endpoints pour le stockage des données en localStorage

**Exemple :**

```typescript
let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    configuration: {
        localstorage: {
            prefix: "app_"
        }
    }
});
```

#### nodejs

A venir.

### Configuration par endpoint (_map_)

Objet clé / valeur d'objets respectant l'interface EndpointConfig, ou une chaine de caractères indiquant le service à utiliser,
dans le cas où aucune configuration supplémentaire n'est nécessaire.

**_Propriétés :_**

**type** (string, obligatoire):

+ Type du service à utiliser pour cet endpoint.

**structure** (ModelSchema, optionnel):

+ ModelSchema de la bibliothèque OctopusModel. Dans le cas où la structure est spécifiée, permet la création d'entités à partir de données
partielles. Voir plus bas.

**cached** (boolean, valeur par défaut : false):

+ Si **cached** est défini à true, une commande de chargement vers un endpoint qui a déjà été chargé plus tôt ne provoquera pas
de nouvelle requête vers le serveur, mais retournera la valeur précédente (en d'autres termes, la commande ne retournera que l'observable, 
sans mettre à jour la valeur).

+ Valable pour loadEntity, loadEntities et loadCollection.

+ Utile pour éviter un requêtes vers un endpoint dont les données sont pérènnes.

**exclusions** (string[], optionnel):

+ Liste de clés qui ne seront pas envoyées au serveur lors d'un save() ou d'un createEntity().

+ Utile pour les endpoint Drupal qui peuvent posséder des propriétés d'entité autogénérées.


**nesting**:

+ Work in progress.

Exemple global de configuration :

```typescript
let endpoint3Structure:ModelSchema = new ModelSchema({
    key1: Structures.string("val key 1"),
    key2: Structures.string("val key 2"),
    key3: Structures.array([25, 26]),
    key4: Structures.boolean(true)
});

let connector:DataConnector = new DataConnector({
    defaultInterface: "localstorage",
    configuration: {
        localstorage: {
            prefix: "app_"
        },
        http: {
            apiUrl: "http://test-server.com/api/",
            headers: {
                "Content-type": "application/json"
            }
        },
    },
    map: {
        endpoint1: "http",
        endpoint2: {
            type: "http",
            cached: true,
            exclusions: [
                "label",
                "key-test"
            ]
        },
        endpoint3: {
            type: "localstorage",
            structure: endpoint3Structure
        }
    }
});
```
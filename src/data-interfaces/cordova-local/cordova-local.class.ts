import {ExternalInterface} from "../abstract-external-interface.class";
import {CordovaLocalConfiguration} from "./cordova-local-configuration.interface";
import {DataConnector} from "../../data-connector.class";
import {CollectionDataSet, EntityDataSet, FilterData} from "../../types";
declare var window: any;
declare var cordova: any;
declare var device: any;
declare var LocalFileSystem: any;

export class CordovaLocal extends ExternalInterface {

    fileSystem: any;
    private dataStore:CollectionDataSet = {};

    constructor(
        private configuration: CordovaLocalConfiguration,
        private connector: DataConnector,
        private interfaceName: string
    ) {
        super();

        this.loadPointFromStorage("ideaswall");
    }

    private createFile(
        dirEntry,
        fileName: string,
        text: string,
        isAppend: boolean,
        success: Function,
        fail: Function
    ) {
        dirEntry.getFile(fileName, {create: true, exclusive: false}, fileEntry => {

            this.writeFile(fileEntry, text, e => {
                success(e);
            }, e => fail(e));

        }, e => {
            fail(e);
        });
    }

    private writeFile(
        fileEntry,
        dataObj,
        success: Function,
        fail: Function
    ) {
        fileEntry.createWriter(function (fileWriter) {

            fileWriter.onwriteend = function() {
                success();
            };

            fileWriter.onerror = function (e) {
                fail(e);
            };

            fileWriter.write(dataObj);
        });
    }

    private readFile(
        fileEntry,
        success: Function,
        fail: Function
    ) {

        fileEntry.file(function (file) {
            let reader = new FileReader();

            reader.onloadend = function() {
                success(this.result);
            };

            reader.readAsText(file);

        }, e => {
            fail(e);
        });
    }


    private createFileInPersistentStorage(
        fileName: string,
        textContent: string,
        success: Function,
        fail: Function
    ) {
        this.createFileInSpace("persistent", fileName, textContent, success, fail);
    }

    private createFileInSpace(
        space: string,
        fileName: string,
        textContent: string,
        success: Function,
        fail: Function
    ) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, () => {

            window.resolveLocalFileSystemURL("cdvfile://localhost/" + space + "/", dirEntry => {
                this.createFile(dirEntry, fileName, textContent, false, e => {
                    success(e);
                }, e => fail(e));
            }, e => {
                fail(e);
            });

        }, e => {
            fail(e);
        });
    }

    private readFileInPersistentStorage(
        fileName: string,
        success: Function,
        fail: Function
    ) {
        this.readFileInSpace("persistent", fileName, success, fail);
    }

    private readFileInAppDirectory(
        fileName: string,
        success: Function,
        fail: Function
    ) {
        let space: string;

        if (device.platform === "Android") {
            space = "assets";
        } else if (device.platform === "iOS") {
            space = "bundle";
        }

        this.readFileInSpace(space, fileName, success, fail);
    }
    

    private readEndpoint(endpointName: string, success: Function, fail: Function) {
        // si le fichier n'existe pas dans le dossier de stockage, on copie celui qui se trouve dans le dossier de l'appli
        // sinon on lit celui-ci

        this.readFileInPersistentStorage(endpointName + ".json", text => {
            success(text);
            console.log("Fichier lu depuis persistant");
        }, e => {
            // le fichier doit être copié dans le stockage persistant
            this.readFileInAppDirectory("www/assets/endpoints/" + endpointName + ".json", oText => {

                this.createFileInPersistentStorage(endpointName + ".json", oText, () => {
                    success(oText);
                    console.log("Fichier copié dans persistant");
                }, () => {
                    console.log("erreur de copie dans le dossier");
                })

            }, e => {
                console.log("Erreur bizarre", e);
            });
        });
    }


    private saveToEndPoint(endpointName: string, content: string, success: Function, fail: Function) {
        this.createFileInPersistentStorage("www/assets/endpoints/" + endpointName + ".json", content, () => {
            success();
        }, e => {
            fail(e);
        })
    }


    private readFileInSpace(
        space: string,
        fileName: string,
        success: Function,
        fail: Function
    ) {
        window.requestFileSystem(LocalFileSystem.PERSISTENT, 0, () => {

            window.resolveLocalFileSystemURL("cdvfile://localhost/" + space + "/" + fileName, fileEntry => {

                this.readFile(fileEntry, text => success(text), e => fail(e));

            }, e => {
                fail(e);
            });

        }, e => {
            fail(e);
        });
    }


    private getCollectionFromStore(type:string, filter:FilterData = {}):CollectionDataSet {

        let pointName:string = type;
        this.loadPointFromStorageIfEmpty(type);

        let dataSet:CollectionDataSet = {};

        let keys:string[] = Object.keys(this.dataStore[pointName]);
        let filterKeys:string[] = Object.keys(filter);

        keys.forEach((key:string) => {
            let matching:boolean = true;

            filterKeys.forEach((filterKey:string) => {
                if (filter[filterKey] !== this.dataStore[pointName][+key][filterKey]) {
                    matching = false;
                }
            });

            if (matching) {
                dataSet[+key] = this.dataStore[pointName][+key];
            }
        });

        return dataSet;
    }


    private getEntityFromStore(type:string, id:number):EntityDataSet {
        let pointName:string = type;
        this.loadPointFromStorageIfEmpty(type);
        return this.dataStore[pointName][id];
    }


    private deleteEntityFromStore(type:string, id:number):boolean {
        let pointName:string = type;
        this.loadPointFromStorageIfEmpty(type);

        if (this.dataStore[pointName][id]) {
            delete this.dataStore[pointName][id];
            this.savePointToStorage(type);
            return true;
        }

        return false;
    }


    // TODO
    private set lastUsedId(value:number) {
        let lastUsedIdKey:string = "lastusedid";

        localStorage[lastUsedIdKey] = value;
    }

    /**
     * Get last used id from localStorage
     * @returns {number} The value
     */

    // TODO
    private get lastUsedId():number {
        let lastUsedIdKey:string = "lastusedid";

        if (localStorage[lastUsedIdKey] === undefined || localStorage[lastUsedIdKey] === "") {
            return 0;
        } else {
            return +localStorage[lastUsedIdKey];
        }
    }


    // TODO: pas bon encore
    private savePointToStorage(type:string) {
        let pointName:string = type;

        if (this.dataStore[pointName]) {
            const obj: Object = {
                data: this.dataStore[pointName]
            };

            const str = JSON.stringify(obj);

            this.saveToEndPoint(type, str, () => {

            }, () => {

            });
        }
    }


    private loadPointFromStorage(pointName:string) {
        this.readEndpoint(pointName, text => {
            console.log(JSON.parse(text));
            this.dataStore[pointName] = JSON.parse(text)["data"];
        }, () => {
            this.dataStore[pointName] = {};
        });
    }


    private loadPointFromStorageIfEmpty(type:string) {
        let pointName:string = type;

        if (!this.dataStore[pointName]) {
            this.loadPointFromStorage(pointName);
        }
    }

    loadEntity(type:string, id:number):EntityDataSet {
        this.loadPointFromStorageIfEmpty(type);
        let data:EntityDataSet = this.getEntityFromStore(type, id);

        return data ? data : null;
    }

    loadCollection(type:string, filter:FilterData = {}):CollectionDataSet {
        this.loadPointFromStorageIfEmpty(type);
        let data:CollectionDataSet = this.getCollectionFromStore(type, filter);

        return data ? data : null;
    }

    saveEntity(entity:EntityDataSet, type:string, id:number):EntityDataSet {
        this.loadPointFromStorageIfEmpty(type);
        this.setEntityInStore(type, id, entity);

        return entity;
    }

    createEntity(type:string, data:EntityDataSet):EntityDataSet {
        let newId:number = ++this.lastUsedId;
        data.id = newId;
        this.setEntityInStore(type, newId, data);
        return data;
    }

    deleteEntity(type:string, id:number):boolean {
        this.loadPointFromStorageIfEmpty(type);
        return this.deleteEntityFromStore(type, id);
    }

    private setEntityInStore(type:string, id:number, data:EntityDataSet) {
        let pointName:string = type;
        this.loadPointFromStorageIfEmpty(type);
        this.dataStore[pointName][id] = data;
        this.savePointToStorage(type);
    }
}
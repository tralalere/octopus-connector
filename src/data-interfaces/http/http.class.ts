import {ExternalInterface} from "../abstract-external-interface.class";
import {DataConnector} from "../../data-connector.class";
import {HeaderObject, HttpConfiguration} from "./http-configuration.interface";
import {BehaviorSubject, Observable, ReplaySubject} from "rxjs/Rx";
import {CollectionDataSet, EntityDataSet} from "../../types";
import {DataEntity} from "../../data-structures/data-entity.class";
import {InterfaceError} from "../interface-error.class";

/**
 * Http external interface
 */
export class Http extends ExternalInterface {

    /**
     *
     * @type {boolean}
     */
    authenticated:ReplaySubject<EntityDataSet>;

    /**
     *
     */
    private dataStore: {
        user
    };

    /*
    Headers sent with each request
     */
    private headers:HeaderObject[] = [];

    /**
     * Creates the http interface
     * @param {HttpConfiguration} configuration Configuration object
     * @param {DataConnector} connector Reference to the connector
     */
    constructor(
        private configuration:HttpConfiguration,
        private connector:DataConnector
    ) {
        super();
        this.useDiff = true;

        if (configuration.headers) {
            for (let header of configuration.headers) {
                this.headers.push(header);
            }
        }

        this.dataStore = {
            user: undefined
        };

        this.authenticated = new ReplaySubject<DataEntity>(1);

        this.dataStore.user = JSON.parse(localStorage.getItem('currentUser'));
        let expire:number =  JSON.parse(localStorage.getItem('expires_in'));
        if(expire > Date.now()) {
            this.dataStore.user = JSON.parse(localStorage.getItem('currentUser'));
            this.setToken(JSON.parse(localStorage.getItem('accessToken'))).subscribe((data:EntityDataSet) => {
                this.authenticated.next(data);
            });
        } else if(expire && expire < Date.now()) {
            this.authenticated.error(null);
            this.logOut();
        } else {
            this.authenticated.error(null);
        }
    }

    /**
     * Add headers to the request
     * @param {XMLHttpRequest} request A xhr request
     */
    private addHeaders(request:XMLHttpRequest) {
        this.headers.forEach((header:HeaderObject) => {
            request.setRequestHeader(header.key, header.value);
        });
    }

    /**
     * Load entity in http service
     * @param {string} type Endpoint name
     * @param {number} id Id of the entity
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<EntityDataSet>} Observable returning the data
     */
    loadEntity(type:string, id:number, errorHandler:Function = null):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        let url:string = `${<string>this.configuration.apiUrl}${type}/${id}`;
        request.open("GET", url, true);

        let subject:ReplaySubject<EntityDataSet> = new ReplaySubject<EntityDataSet>(1);

        this.addHeaders(request);
        
        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(request.responseText));
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send();
        
        return subject;
    }

    /**
     * Load a collection in http service
     * @param {string} type Endpoint name
     * @param {{[p: string]: any}} filter Filter Object
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<CollectionDataSet>} Observable returning the collection data
     */
    loadCollection(type:string, filter:{[key:string]:any} = {}, errorHandler:Function = null):Observable<CollectionDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();

        let url:string = `${<string>this.configuration.apiUrl}${type}`;

        let filterKeys:string[] = Object.keys(filter);

        if (filterKeys.length > 0) {
            url += "?";
        }

        filterKeys.forEach((key:string, index:number) => {
            let val:any = filter[key];
            url += `filter[${key}]=${val}`;

            if (index < filterKeys.length - 1) {
                url += "&";
            }
        });

        request.open("GET", url, true);

        this.addHeaders(request);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<CollectionDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractCollection(request.responseText));
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send();

        return subject;
    }

    /**
     * Save entity to the http service
     * @param {EntityDataSet} entity Entity data to save
     * @param {string} type Endpoint name
     * @param {number} id Id of the entity
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<EntityDataSet>} Observable returning the entity data
     */
    saveEntity(entity:EntityDataSet, type:string, id:number, errorHandler:Function = null):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        let url:string = `${<string>this.configuration.apiUrl}${type}/${id}`;
        request.open("PATCH", url, true);

        this.addHeaders(request);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<EntityDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(request.responseText));
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send(JSON.stringify(entity));

        return subject;
    }

    /**
     * Create entity in http service
     * @param {string} type Endpoint name
     * @param {EntityDataSet} data Data used to create the entity
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<EntityDataSet>} Observable returning the entity data
     */
    createEntity(type:string, data:EntityDataSet, errorHandler:Function = null):Observable<EntityDataSet> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        let url:string = `${<string>this.configuration.apiUrl}${type}`;
        request.open("POST", url, true);

        this.addHeaders(request);

        let subject:ReplaySubject<CollectionDataSet> = new ReplaySubject<EntityDataSet>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(this.extractEntity(request.responseText));
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send(JSON.stringify(data));

        return subject;
    }

    /**
     * Delete entity from http service
     * @param {string} type Endpoint type
     * @param {number} id Entity id
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<boolean>} True if deletion success
     */
    deleteEntity(type:string, id:number, errorHandler:Function = null):Observable<boolean> {
        let request:XMLHttpRequest = new XMLHttpRequest();
        let url:string = `${<string>this.configuration.apiUrl}${type}/${id}`;
        request.open("DELETE", url,true);

        this.addHeaders(request);

        let subject:ReplaySubject<boolean> = new ReplaySubject<boolean>(1);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    subject.next(true);
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send();

        return subject;
    }

    /**
     * Authenticate in service
     * @param {string} login User login
     * @param {string} password User password
     * @param {Function} errorHandler Function used to handle errors
     * @returns {Observable<boolean>} True if authentication success
     */
    authenticate(login:string, password:string, errorHandler:Function = null):Observable<EntityDataSet> {

        //let subject:ReplaySubject<EntityDataSet> = new ReplaySubject<EntityDataSet>(1);

        let request:XMLHttpRequest = new XMLHttpRequest();

        let url:string = `${<string>this.configuration.apiUrl}login-token`;
        request.open("GET", url,true);

        request.setRequestHeader("Authorization", 'Basic ' + btoa(login.trim() + ':' + password));

        let observables:Observable<any>[] = [];

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    let loginData:Object = JSON.parse(request.responseText);
                    console.log("resp", JSON.parse(request.responseText));
                    let expire:number = +loginData["expires_in"] - 3600;
                    if(expire < 3600){
                        if(localStorage.getItem('accessToken')){
                            console.log("ici");
                            observables.push(this.setToken(loginData["access_token"], errorHandler));
                            this.setExpireDate(expire);
                            this.setRefreshToken(loginData["refreshToken"]);
                        }
                        observables.push(this.refreshToken(loginData["refresh_token"], errorHandler));
                    } else {
                        console.log("là");
                        observables.push(this.setToken(loginData["access_token"], errorHandler));
                        this.setExpireDate(expire);
                        this.setRefreshToken(loginData["refreshToken"]);
                    }
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        request.send();

        return Observable.combineLatest(...observables).map((values:any[]) => {
            return values[0];
        });
    }

    logOut() {
        this.headers.forEach((object:HeaderObject, index:number) => {
            if (object.key !== "access-token") {
                this.headers.splice(index, 1);
            }
        });

        localStorage.removeItem('currentUser');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('expires_in');
        localStorage.removeItem('refreshToken');
        this.dataStore.user = null;
    }


    /**
     *
     * @param {string} accessToken
     * @param {Function} errorHandler
     */
    private setToken(accessToken:string, errorHandler:Function = null):Observable<EntityDataSet> {
        if(accessToken && accessToken !="") {
            localStorage.setItem('accessToken', JSON.stringify(accessToken));
            this.headers.push({key: "access-token", value: accessToken});

            return this.getMe(true, errorHandler);
        }
    }

    /**
     *
     * @param {number} expire
     */
    private setExpireDate(expire:number) {
        let date:number = Date.now();
        localStorage.setItem('expires_in', JSON.stringify(date + (expire*1000)));
    }

    /**
     *
     * @param {string} refreshToken
     * @param {Function} errorHandler
     */
    private refreshToken(refreshToken:string, errorHandler:Function):Observable<Object> {

        let subject:ReplaySubject<Object> = new ReplaySubject<Object>(1);

        let request:XMLHttpRequest = new XMLHttpRequest();

        let url:string = `${<string>this.configuration.apiUrl}refresh-token`;
        request.open("GET", url,true);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    let userData:Object = JSON.parse(request.responseText);
                    this.setToken(userData["access_token"], errorHandler);
                    this.setExpireDate(+userData["expires_in"] - 3600);
                    this.setRefreshToken(userData["refreshToken"]);
                    subject.next(userData);
                } else {
                    this.sendError(request.status, request.statusText, errorHandler);
                }
            }
        };

        return subject;
    }

    /**
     *
     * @param {string} refreshToken
     */
    private setRefreshToken(refreshToken:string) {
        localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
    }


    getMe(complete:boolean = true, errorHandler:Function = null):Observable<EntityDataSet> {

        let subject:ReplaySubject<EntityDataSet> = new ReplaySubject<EntityDataSet>(1);

        let request:XMLHttpRequest = new XMLHttpRequest();

        let url:string = `${<string>this.configuration.apiUrl}users/me`;
        request.open("GET", url,true);
        this.addHeaders(request);

        request.onreadystatechange = () => {
            if (request.readyState === XMLHttpRequest.DONE) {
                if (request.status === 200) {
                    let userData:Object = JSON.parse(request.responseText)["data"][0];
                    subject.next(userData);
                    this.setMe(userData, complete);
                } else {
                    if (errorHandler) {
                        this.sendError(request.status, request.statusText, errorHandler);
                    }

                    subject.error(null);
                }
            }
        };

        request.send();

        return subject;
    }

    setMe(userData:EntityDataSet, complete:boolean = true){

        if (complete) {
            this.dataStore.user = userData;
            //this.data.next(this.dataStore.user);
            localStorage.setItem('currentUser', JSON.stringify(userData));
        }

        //this.currentUserData = userData;
    }

    /**
     * Extract entity data from raw data
     * @param {string} responseText Response text from server
     * @returns {EntityDataSet} Entity data
     */
    protected extractEntity(responseText:string):EntityDataSet {
        let data:Object = JSON.parse(responseText);
        return data["data"][0];
    }

    /**
     * Extract collection data from raw data
     * @param {string} responseText Response text from server
     * @returns {CollectionDataSet} Collection data
     */
    protected extractCollection(responseText:string):CollectionDataSet {
        let data:Object = JSON.parse(responseText);

        let collectionData:CollectionDataSet = {};

        data["data"].forEach((entityData:EntityDataSet) => {
            collectionData[entityData["id"]] = entityData;
        });

        return collectionData;
    }
}
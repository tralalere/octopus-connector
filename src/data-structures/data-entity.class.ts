/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnector} from "../data-connector.class";
import {Observable} from "rxjs/Rx";
import {EntityDataSet} from "../types";
import {combineLatest} from 'rxjs/observable/combineLatest';

/**
 * Data entity unit object
 */
export class DataEntity {

    /**
     * Entity attributes
     * @type {{}}
     */
    attributes:{[key:string]:any} = {};

    /**
     * Nested entities
     * @type {{}}
     */
    nesting:{[key:string]:any} = {};


    //embeddings: {[key: string]: DataEntity[]} = {};

    relationship: {[key: string]: DataEntity} = {};

    /**
     * Reference object for diff
     */
    private attributesRef:{[key:string]:any};

    /**
     *
     * @type {{}}
     */
    private embeddings: {[key: string]: DataEntity[] | DataEntity} = {};


    /**
     * Create the data entity
     * @param {string} type Type of the entity
     * @param {EntityDataSet} data Entity data
     * @param {DataConnector} connector Reference to the connector
     * @param {number} id Entity id
     * @param {Object} embeddingsConf
     */
    constructor(
        public type:string,
        data:EntityDataSet,
        private connector:DataConnector = null,
        public id:number|string = null,
        private embeddingsConf: {[key: string]: string} = null
    ) {
        for (let key in data) {
            if (data.hasOwnProperty(key) && key !== "id") {
                this.attributes[key] = data[key];

                if (embeddingsConf && embeddingsConf[key] !== undefined && this.attributes[key]) {
                    if (Array.isArray(this.attributes[key])) {
                        this.embeddings[key] = [];

                        this.attributes[key].forEach((elem: EntityDataSet) => {
                            (<DataEntity[]>this.embeddings[key]).push(new DataEntity(embeddingsConf[key], elem, connector, elem["id"], embeddingsConf));
                        });
                    } else {
                        this.embeddings[key] = new DataEntity(embeddingsConf[key], this.attributes[key], connector, this.attributes[key]["id"], embeddingsConf);
                    }
                }
            }
        }

        if (data["id"]) {
            this.id = data["id"];
        }

        this.generateReferenceObject();
    }

    /**
     * Set an attribute by key
     * @param {string} key Key name
     * @param value New value
     */
    set(key:string, value:any) {
        this.attributes[key] = value;
    }

    /**
     * Get an attribute by key
     * @param {string} key Key name
     * @returns {any} Value
     */
    get(key:string):any {
        return this.attributes[key];
    }

    /**
     *
     * @returns {boolean}
     */
    get hasChanges(): boolean {

        if (Object.keys(this.attributes).length === 0) {
            return false;
        }

        for (let key in this.attributes) {
            if (this.attributes[key] !== this.attributesRef[key]) {
                return false;
            }
        }

        return true;
    }

    /**
     *
     * @param {string} name
     * @returns {DataEntity | DataEntity[]}
     */
    getEmbed(name: string): DataEntity | DataEntity[] {
        return this.embeddings[name];
    }

    /**
     * Save the entity
     * @returns {Observable<DataEntity>} The observable associated to the entity in connector stores
     */
    save():Observable<DataEntity> {

        const saveArray: Observable<DataEntity>[] = [];

        for (let key in this.embeddings) {
            if (this.embeddings[key] instanceof DataEntity) {
                if ((<DataEntity>this.embeddings[key]).hasChanges) {
                    saveArray.push((<DataEntity>this.embeddings[key]).save());
                }

            } else if (Array.isArray(this.embeddings[key])) {
                (<DataEntity[]>this.embeddings[key]).forEach(entity => {
                    if ((<DataEntity>entity).hasChanges) {
                        saveArray.push((<DataEntity>entity).save());
                    }
                })
            }
        }

        if (saveArray.length === 0) {
            return this.saveAction();
        } else {
            return combineLatest(...saveArray).take(1).flatMap(() => {
                return this.saveAction();
            });
        }
    }

    saveAction(): Observable<DataEntity> {
        let obs:Observable<DataEntity>;

        if (this.id !== -1) {
            obs = this.connector.saveEntity(this);
        } else {
            // temporary entity deletion
            this.remove();
            obs = this.connector.createEntity(this.type, this.attributes);
        }

        obs.take(1).subscribe(() => {
            this.generateReferenceObject();
        });

        return obs;
    }

    /**
     * Delete the entity
     * @returns {Observable<boolean>} True if deletion success
     */
    remove():Observable<boolean> {
        return this.connector.deleteEntity(this);
    }

    /**
     * Copy the attributes to generate the new reference object (for diff)
     */
    private generateReferenceObject() {
        let ref:{[key:string]:any} = {};

        let keys:string[] = Object.keys(this.attributes);

        keys.forEach((key:string) => {
            ref[key] = this.attributes[key];
        });

        this.attributesRef = ref;
    }

    /**
     * Get an attributes cloned object
     * @returns {EntityDataSet} The cloned attributes object
     */
    getClone():EntityDataSet {
        let clone:EntityDataSet = {};

        let keys:string[] = Object.keys(this.attributes);

        keys.forEach((key:string) => {
            clone[key] = this.attributes[key];
        });

        return clone;
    }

    /**
     * Return the diff (only updated properties since last save action)
     * @returns {EntityDataSet} Diff object
     */
    getDiff():EntityDataSet {
        let diff:EntityDataSet = {};

        let keys:string[] = Object.keys(this.attributes);

        keys.forEach((key:string) => {
            if (this.attributes[key] !== undefined &&
                this.attributesRef[key] !== this.attributes[key]) {
                diff[key] = this.attributes[key];
            }
        });

        return diff;
    }
}
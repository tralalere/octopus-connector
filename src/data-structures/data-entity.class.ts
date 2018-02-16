/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnector} from "../data-connector.class";
import {Observable} from "rxjs/Rx";
import {EntityDataSet} from "../types";

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
     * Reference object for diff
     */
    private attributesRef:{[key:string]:any};

    /**
     * Create the data entity
     * @param {string} type Type of the entity
     * @param {EntityDataSet} data Entity data
     * @param {DataConnector} connector Reference to the connector
     * @param {number} id Entity id
     */
    constructor(
        public type:string,
        data:EntityDataSet,
        private connector:DataConnector = null,
        public id:number = null
    ) {
        for (let key in data) {
            if (data.hasOwnProperty(key) && key !== "id") {
                this.attributes[key] = data[key];
            }
        }

        if (data["id"]) {
            this.id = +data["id"];
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
     * Save the entity
     * @returns {Observable<DataEntity>} The observable associated to the entity in connector stores
     */
    save():Observable<DataEntity> {

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
            if (this.attributes[key] !== undefined && this.attributesRef[key] !== undefined && this.attributesRef[key] !== this.attributes[key]) {
                diff[key] = this.attributes[key];
            }
        });

        return diff;
    }
}
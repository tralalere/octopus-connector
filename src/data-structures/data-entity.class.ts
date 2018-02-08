/**
 * Created by Christophe on 10/10/2017.
 */
import {DataConnector} from "../data-connector.class";
import {Observable} from "rxjs/Rx";

export class DataEntity {

    attributes:{[key:string]:any} = {};
    private attributesRef:{[key:string]:any};

    constructor(
        public type:string,
        data:{[key:string]:any},
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

    set(key:string, value:any) {
        this.attributes[key] = value;
    }

    get(key:string):any {
        return this.attributes[key];
    }
    
    save():Observable<DataEntity> {
        let obs:Observable<DataEntity> = this.connector.saveEntity(this);

        obs.take(1).subscribe(() => {
            this.generateReferenceObject();
        });

        return obs;
    }

    remove():Observable<boolean> {
        return this.connector.deleteEntity(this);
    }

    private generateReferenceObject() {
        let ref:{[key:string]:any} = {};

        let keys:string[] = Object.keys(this.attributes);

        keys.forEach((key:string) => {
            ref[key] = this.attributes[key];
        });

        this.attributesRef = ref;
    }

    getClone():{[key:string]:any} {
        let clone:{[key:string]:any} = {};

        let keys:string[] = Object.keys(this.attributes);

        keys.forEach((key:string) => {
            clone[key] = this.attributes[key];
        });

        return clone;
    }

    getDiff():{[key:string]:any} {
        let diff:{[key:string]:any} = {};

        let keys:string[] = Object.keys(this.attributes);

        keys.forEach((key:string) => {
            if (this.attributes[key] !== undefined && this.attributesRef[key] !== undefined && this.attributesRef[key] !== this.attributes[key]) {
                diff[key] = this.attributes[key];
            }
        });

        return diff;
    }
}
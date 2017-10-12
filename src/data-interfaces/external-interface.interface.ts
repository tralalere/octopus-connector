/**
 * Created by Christophe on 10/10/2017.
 */
export interface ExternalInterface {
    loadEntity(type:string, id:number, forced:boolean, fields:string[]);
    loadCollection(type:string, filter:{[key:string]:any}, forced:boolean, fields:string[]);
}
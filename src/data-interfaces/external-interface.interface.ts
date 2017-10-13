/**
 * Created by Christophe on 10/10/2017.
 */
export interface ExternalInterface {
    loadEntity(type:string, id:number, fields:string[]);
    loadCollection(type:string, filter:{[key:string]:any}, order:{[key:string]:string}, fields:string[]);
}
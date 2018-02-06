/**
 * Created by Christophe on 20/11/2017.
 */
import {DataEntity} from "./data-structures/data-entity.class";

export interface EntitiesDictionary {
    [key:number]:DataEntity;
}

export interface NumberDictionary<T> {
    [key:number]:T;
}

export interface StringDictionary<T> {
    [key:string]:T;
}

export interface EntityDataSet {
    [key:number]:any;
}

export interface CollectionDataSet {
    [key:number]:EntityDataSet;
}
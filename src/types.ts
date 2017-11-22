/**
 * Created by Christophe on 20/11/2017.
 */
import {DataEntity} from "./data-structures/data-entity.class";

export interface EntitiesDictionary {
    [key:number]:DataEntity;
}

export interface Dictionary<T> {
    [key:number]:T;
}
import {OrderCriteria} from "./order-criteria.interface";

export interface CollectionOptionsInterface {
    filter?: {[key: string]: any};
    page?: number;
    offset?: number;
    range?: number;
    urlExtension?: string;
    orderOptions?: OrderCriteria[];
}
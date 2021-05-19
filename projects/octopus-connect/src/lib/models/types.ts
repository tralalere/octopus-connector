/**
 * Entity raw data
 */
export interface EntityDataSet {

    /**
     * Entity attributes, indexed by string
     */
    [key: string]: any;

    /**
     * Optional entity id
     */
    id?: number;
}

/**
 * Collection raw data
 */
export interface CollectionDataSet {

    /**
     * Entities data, indexed by id
     */
    [key: number]: EntityDataSet;
}

/**
 * Filter object
 */
export interface FilterData {

    /**
     * Filter properties, indexed by string key name
     */
    [key: string]: any;
}

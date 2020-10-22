/**
 * Header object
 */
export interface HeaderObject {

    /**
     * Name of the header
     */
    key:string;

    /**
     * Value of the header
     */
    value:string;
}

/**
 * Http interface configuration
 */
export interface HttpConfiguration {

    /**
     * Base url of the api
     */
    apiUrl: string | Function;

    /**
     * List of header which will be sent with the requests
     */
    headers?:{[key:string]:string};

    /**
     *
     */
    useApiExtension?: boolean;
}
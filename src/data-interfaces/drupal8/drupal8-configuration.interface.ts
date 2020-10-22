/**
 * Drupal8 interface configuration
 */
export interface Drupal8Configuration {

    /**
     * Base url of the api
     */
    apiUrl:string|Function;

    /**
     * List of header which will be sent with the requests
     */
    headers?:{[key:string]:string};

    clientId: string;

    clientSecret?: string;

    scope?: string
}
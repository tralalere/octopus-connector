export interface HeaderObject {
    key:string;
    value:string;
}

export interface HttpConfiguration {
    apiUrl:string|Function;
    headers?:HeaderObject[];
}
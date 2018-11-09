import {DataConnector} from "./data-connector.class";
import {CollectionOptionsInterface} from "./collection-options.interface";

export class CollectionPaginator {

    private _page: number;
    private _offset: number;
    private _range: number;

    constructor(
        private connector: DataConnector,
        private options: CollectionOptionsInterface,
        public filter: {[key: string]: any}
    ) {
        this._page = options.page;
        this._offset = options.offset;
        this._range = options.range;
    }

    get page(): number {
        return this._page;
    }

    set page(value: number) {
        this._page = value;
        this.reload();
    }

    get offset(): number {
        return this._offset;
    }

    set offset(value: number) {
        this._offset = value;
        this.reload();
    }

    get range(): number {
        return this._range;
    }

    set range(value: number) {
        this._range = value;
        this.reload();
    }

    private reload() {
        this.connector.paginatedLoadCollectionExec("jj", this.filter, this);
    }
}
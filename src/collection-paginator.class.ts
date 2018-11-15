import {DataConnector} from "./data-connector.class";
import {CollectionOptionsInterface} from "./collection-options.interface";

export class CollectionPaginator {

    private _page: number;
    private _offset: number;
    private _range: number;
    private _filter: {[key: string]: any} = {};
    count: number;

    hasNextPage = false;
    hasPreviousPage = false;

    constructor(
        private connector: DataConnector,
        private type: string,
        private options: CollectionOptionsInterface,
        public mfilter: {[key: string]: any}
    ) {
        this._page = options.page;
        this._offset = options.offset;
        this._range = options.range;
        this._filter = mfilter;
    }

    get filter(): {[key: string]: any} {
        return this._filter;
    }

    set filter(value: {[key: string]: any}) {
        this._filter = value;
        this.reload();
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

    updateCount(count: number): void {
        this.count = count;

        if (this._range > 0) {
            this.hasPreviousPage = this._page > 1;
            this.hasNextPage = Math.ceil(count / this._range) > this._page;
        }
    }

    private reload() {
        this.connector.paginatedLoadCollectionExec(this.type, this._filter, this);
    }
}
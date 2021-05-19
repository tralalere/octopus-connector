import {Observable} from 'rxjs';
import {DataCollection} from './data-structures/data-collection.class';
import {CollectionPaginator} from './collection-paginator.class';

export interface PaginatedCollection {
    collectionObservable: Observable<DataCollection>;
    paginator: CollectionPaginator;
}

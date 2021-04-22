import {OrderDirection} from "./order-direction.enum";

export interface OrderCriteria {
    field: string;
    direction: OrderDirection;
}
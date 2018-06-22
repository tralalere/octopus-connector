export class InterfaceError {

    constructor(
        public code:number = 0,
        public message:string = "",
        public originalMessage:string = "",
        public data: Object = {}
    ) {}
}
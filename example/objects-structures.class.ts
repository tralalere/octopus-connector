import {ModelSchema, Structures} from "octopus-model";

export class ObjectsStructures {

    static endpoint1:ModelSchema = new ModelSchema({
        key1: Structures.string("val key 1"),
        key2: Structures.string("val key 2"),
        key3: Structures.number(25),
        key4: Structures.boolean(true)
    });
}
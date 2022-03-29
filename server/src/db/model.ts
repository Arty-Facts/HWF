import { ObjectId } from "mongodb";

export default class Task {
    constructor(public msg: string, public id?: ObjectId ) {}

}

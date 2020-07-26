import { Resource } from "./Resource";
import { Connection } from "typeorm";
import { BaseDatabase } from "admin-bro";
export declare class Database extends BaseDatabase {
    readonly connection: Connection;
    constructor(connection: Connection);
    resources(): Array<Resource>;
    static isAdapterFor(connection: any): boolean;
}

import "reflect-metadata";
import { Property } from "./Property";
import { BaseEntity } from "typeorm";
import { BaseResource, Filter } from "admin-bro";
import { ParamsType } from "admin-bro/types/src/backend/adapters/base-record";
import { ExtendedRecord } from "./ExtendedRecord";
export declare class Resource extends BaseResource {
    static validate: any;
    model: typeof BaseEntity;
    private propsObject;
    constructor(model: typeof BaseEntity);
    databaseName(): string;
    databaseType(): string;
    name(): string;
    id(): string;
    properties(): Property[];
    property(path: string): Property | null;
    count(filter: any): Promise<number>;
    populate(baseRecords: any, property: Property): Promise<any>;
    find(filter: Filter, { limit, offset, sort }: {
        limit?: number | undefined;
        offset?: number | undefined;
        sort?: {} | undefined;
    }): Promise<Array<ExtendedRecord>>;
    findMany(ids: Array<string>): Promise<Array<ExtendedRecord>>;
    search(value: any, limit?: number): Promise<Array<ExtendedRecord>>;
    findOne(id: any): Promise<ExtendedRecord>;
    findById(id: any): Promise<BaseEntity | undefined>;
    create(params: any): Promise<ParamsType>;
    update(pk: any, params?: any): Promise<ParamsType>;
    delete(pk: any): Promise<void>;
    private prepareProps;
    private prepareParamsBeforeSave;
    private validate;
    private validateAndSave;
    static isAdapterFor(rawResource: any): boolean;
}

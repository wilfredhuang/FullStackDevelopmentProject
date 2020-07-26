import { BaseRecord, CurrentAdmin } from "admin-bro";
import RecordJSON from "admin-bro/types/src/backend/decorators/record-json.interface";
import { BaseEntity } from "typeorm";
import { Resource } from "./Resource";
export declare class ExtendedRecord extends BaseRecord {
    private _instance;
    private _customTitle;
    constructor(instance: BaseEntity | null | undefined, resource: Resource);
    setTitle(value: string): void;
    title(): string;
    toJSON(currentAdmin?: CurrentAdmin): RecordJSON;
}

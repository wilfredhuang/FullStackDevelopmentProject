import "reflect-metadata";
import { ColumnMetadata } from "typeorm/metadata/ColumnMetadata";
import { BaseProperty, PropertyType } from "admin-bro";
import { Resource } from "./Resource";
export declare class Property extends BaseProperty {
    column: ColumnMetadata;
    resource: Resource;
    columnPosition: number;
    constructor(column: ColumnMetadata, resource: Resource, columnPosition: number);
    name(): string;
    isTitle(): boolean;
    isEditable(): boolean;
    isId(): boolean;
    reference(): string | null;
    position(): number;
    availableValues(): string[] | null;
    type(): PropertyType;
}

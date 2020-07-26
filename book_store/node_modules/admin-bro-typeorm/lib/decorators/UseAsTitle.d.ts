import "reflect-metadata";
import { BaseEntity } from "typeorm";
export declare function UseAsTitle(name?: string): (target: BaseEntity, propertyKey: string | undefined) => void;

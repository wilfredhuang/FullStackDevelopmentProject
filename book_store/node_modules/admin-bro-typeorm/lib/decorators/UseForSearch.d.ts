import "reflect-metadata";
import { BaseEntity } from "typeorm";
export declare function UseForSearch(name?: string): (target: BaseEntity, propertyKey: string | undefined) => void;

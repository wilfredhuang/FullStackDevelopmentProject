import "reflect-metadata";
import { BaseEntity } from "typeorm";
export declare function Textarea(name?: string): (target: BaseEntity, propertyKey: string | undefined) => void;

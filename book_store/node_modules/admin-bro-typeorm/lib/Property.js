"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const data_types_1 = require("./utils/data-types");
const admin_bro_1 = require("admin-bro");
const TEXTAREA_SYMBOL_1 = require("./symbols/TEXTAREA_SYMBOL");
const SEARCH_FIELD_SYMBOL_1 = require("./symbols/SEARCH_FIELD_SYMBOL");
class Property extends admin_bro_1.BaseProperty {
    constructor(column, resource, columnPosition) {
        // for reference fields take database name (with ...Id)
        const path = column.referencedColumn ? column.databaseName : column.propertyPath;
        super({ path });
        this.column = column;
        this.resource = resource;
        this.columnPosition = columnPosition;
    }
    name() {
        return this.column.propertyName;
    }
    isTitle() {
        const name = this.name();
        const key = Reflect.getMetadata(SEARCH_FIELD_SYMBOL_1.SEARCH_FIELD_SYMBOL, this.resource.model);
        if (key != undefined)
            return key == this.name();
        else {
            const firstProp = this.resource.properties()[0];
            if (firstProp)
                return firstProp.name() == name;
            return false;
        }
    }
    isEditable() {
        return !this.isId()
            && !this.column.isCreateDate
            && !this.column.isUpdateDate;
    }
    isId() {
        return this.column.isPrimary;
    }
    reference() {
        const ref = this.column.referencedColumn;
        if (ref)
            return ref.entityMetadata.name;
        else
            return null;
    }
    position() {
        return this.columnPosition || 0;
    }
    availableValues() {
        const values = this.column.enum;
        if (values)
            return values.map(val => val.toString());
        return null;
    }
    type() {
        let type = null;
        if (typeof this.column.type == "function") {
            if (this.column.type == Number)
                type = "number";
            else if (this.column.type == String)
                type = "string";
            else if (this.column.type == Date)
                type = "datetime";
            else if (this.column.type == Boolean)
                type = "boolean";
        }
        else
            type = data_types_1.DATA_TYPES[this.column.type];
        if (this.reference())
            return "reference";
        if (!type)
            console.warn(`Unhandled type: ${this.column.type}`);
        type = type || "string";
        if (["string", "richtext"].includes(type) &&
            Reflect.getMetadata(TEXTAREA_SYMBOL_1.TEXTAREA_SYMBOL, this.resource.model, this.name()))
            return "textarea";
        return type;
    }
}
exports.Property = Property;
//# sourceMappingURL=Property.js.map
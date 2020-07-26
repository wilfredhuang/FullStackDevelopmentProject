"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const Property_1 = require("./Property");
const typeorm_1 = require("typeorm");
const admin_bro_1 = require("admin-bro");
const convertFilter_1 = require("./utils/convertFilter");
const ExtendedRecord_1 = require("./ExtendedRecord");
const getTitle_1 = require("./utils/getTitle");
const SEARCH_FIELD_SYMBOL_1 = require("./symbols/SEARCH_FIELD_SYMBOL");
class Resource extends admin_bro_1.BaseResource {
    constructor(model) {
        super(model);
        this.propsObject = {};
        this.model = model;
        this.prepareProps();
    }
    databaseName() {
        return this.model.getRepository().metadata.connection.options.database || "typeorm";
    }
    databaseType() {
        return this.model.getRepository().metadata.connection.options.type || "typeorm";
    }
    name() {
        return this.model.getRepository().metadata.tableName;
    }
    id() {
        return this.model.name;
    }
    properties() {
        return Object.values(this.propsObject);
    }
    property(path) {
        return this.propsObject[path] || null;
    }
    count(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.model.count(({
                where: convertFilter_1.convertFilter(filter),
            }));
        });
    }
    populate(baseRecords, property) {
        return __awaiter(this, void 0, void 0, function* () {
            const fks = baseRecords.map(baseRecord => baseRecord.params[property.name()]);
            const instances = yield this.model.findByIds(fks);
            const instancesRecord = {};
            for (const instance of instances) {
                if (instance.hasId())
                    instancesRecord[instance.id] = instance;
            }
            for (const baseRecord of baseRecords) {
                const fk = baseRecord.params[property.name()];
                const instance = instancesRecord[fk];
                if (instance) {
                    const record = new ExtendedRecord_1.ExtendedRecord(instance, this);
                    record.setTitle(yield getTitle_1.getTitle(instance));
                    baseRecord.populated[property.name()] = record;
                }
            }
            return baseRecords;
        });
    }
    find(filter, { limit = 10, offset = 0, sort = {} }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { direction, sortBy } = sort;
            const instances = yield this.model.find({
                where: convertFilter_1.convertFilter(filter),
                take: limit,
                skip: offset,
                order: {
                    [sortBy]: (direction || "asc").toUpperCase()
                }
            });
            const records = [];
            for (const instance of instances) {
                const record = new ExtendedRecord_1.ExtendedRecord(instance, this);
                record.setTitle(yield getTitle_1.getTitle(instance));
                records.push(record);
            }
            return records;
        });
    }
    findMany(ids) {
        return __awaiter(this, void 0, void 0, function* () {
            const instances = yield this.model.find({ where: { id: typeorm_1.In(ids) } });
            const records = [];
            for (const instance of instances) {
                const record = new ExtendedRecord_1.ExtendedRecord(instance, this);
                record.setTitle(yield getTitle_1.getTitle(instance));
                records.push(record);
            }
            return records;
        });
    }
    search(value, limit = 50) {
        return __awaiter(this, void 0, void 0, function* () {
            const meta = Reflect.getMetadata(SEARCH_FIELD_SYMBOL_1.SEARCH_FIELD_SYMBOL, this.model);
            let kt = null;
            if (meta) {
                const key = `${meta}`;
                const prop = this.property(key);
                if (prop != null)
                    kt = { key, type: prop.type() };
            }
            else {
                const nameProp = this.property("name");
                const idProp = this.property("id");
                if (nameProp)
                    kt = { key: "name", type: nameProp.type() };
                else if (idProp)
                    kt = { key: "id", type: idProp.type() };
            }
            if (kt != null) {
                const instances = yield this.model.find({
                    where: { [kt.key]: kt.type == "string" ? typeorm_1.Like(`%${value}%`) : value },
                    take: limit
                });
                const records = [];
                for (const instance of instances) {
                    const record = new ExtendedRecord_1.ExtendedRecord(instance, this);
                    record.setTitle(yield getTitle_1.getTitle(instance));
                    records.push(record);
                }
                return records;
            }
            throw new Error("Search field not found.");
        });
    }
    findOne(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = yield this.model.findOne(id);
            const record = new ExtendedRecord_1.ExtendedRecord(instance, this);
            record.setTitle(yield getTitle_1.getTitle(instance));
            return record;
        });
    }
    findById(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.findOne(id);
        });
    }
    create(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const instance = yield this.model.create(this.prepareParamsBeforeSave(params));
            yield this.validateAndSave(instance);
            return instance;
        });
    }
    update(pk, params = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            params = this.prepareParamsBeforeSave(params);
            const instance = yield this.model.findOne(pk);
            if (instance) {
                for (const p in params)
                    instance[p] = params[p];
                yield this.validate(instance);
                yield instance.save();
                return instance;
            }
            throw new Error("Instance not found.");
        });
    }
    delete(pk) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.model.delete(pk);
        });
    }
    prepareProps() {
        const columns = this.model.getRepository().metadata.columns;
        for (let i = 0; i < columns.length; i++) {
            const property = new Property_1.Property(columns[i], this, i);
            this.propsObject[property.path()] = property;
        }
    }
    prepareParamsBeforeSave(params) {
        for (const p in params) {
            const property = this.property(p);
            if (property) {
                if (["mixed", "boolean"].includes(property.type()))
                    params[p] = !params[p] ? null : JSON.parse(params[p]);
                else if (["number", "float"].includes(property.type()))
                    params[p] = !params[p] ? null : Number(params[p]);
                else if (["date", "datetime"].includes(property.type()))
                    params[p] = !params[p] ? null : new Date(params[p]);
                else if (property.type() == "reference")
                    params[property.column.propertyName] = !params[p] ? null : +params[p];
            }
        }
        return params;
    }
    validate(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            if (Resource.validate) {
                const errors = yield Resource.validate(instance);
                if (errors && errors.length) {
                    const validationErrors = errors.reduce((memo, error) => (Object.assign(Object.assign({}, memo), { [error.property]: {
                            type: Object.keys(error.constraints)[0],
                            message: Object.values(error.constraints)[0],
                        } })), {});
                    throw new admin_bro_1.ValidationError(`${this.name()} validation failed`, validationErrors);
                }
            }
        });
    }
    validateAndSave(instance) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.validate(instance);
            try {
                yield instance.save();
            }
            catch (error) {
                if (error.name === "QueryFailedError") {
                    throw new admin_bro_1.ValidationError(`${this.name()} validation failed`, {
                        [error.column]: {
                            type: "schema error",
                            message: error.message
                        }
                    });
                }
            }
        });
    }
    static isAdapterFor(rawResource) {
        try {
            return !!rawResource.getRepository().metadata;
        }
        catch (e) {
            return false;
        }
    }
}
exports.Resource = Resource;
//# sourceMappingURL=Resource.js.map
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Resource_1 = require("./Resource");
const admin_bro_1 = require("admin-bro");
class Database extends admin_bro_1.BaseDatabase {
    constructor(connection) {
        super(connection);
        this.connection = connection;
    }
    resources() {
        const resources = [];
        for (const entityMetadata of this.connection.entityMetadatas)
            resources.push(new Resource_1.Resource(entityMetadata.target));
        return resources;
    }
    static isAdapterFor(connection) {
        return !!connection.entityMetadatas;
    }
}
exports.Database = Database;
//# sourceMappingURL=Database.js.map
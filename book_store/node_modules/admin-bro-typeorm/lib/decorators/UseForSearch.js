"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const SEARCH_FIELD_SYMBOL_1 = require("../symbols/SEARCH_FIELD_SYMBOL");
function UseForSearch(name) {
    return function (target, propertyKey) {
        if (propertyKey == undefined)
            throw new TypeError();
        Reflect.defineMetadata(SEARCH_FIELD_SYMBOL_1.SEARCH_FIELD_SYMBOL, name || propertyKey, target.constructor);
    };
}
exports.UseForSearch = UseForSearch;
//# sourceMappingURL=UseForSearch.js.map
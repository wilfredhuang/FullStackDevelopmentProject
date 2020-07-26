"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const TITLE_SYMBOL_1 = require("../symbols/TITLE_SYMBOL");
function UseAsTitle(name) {
    return function (target, propertyKey) {
        if (propertyKey == undefined)
            throw new TypeError();
        Reflect.defineMetadata(TITLE_SYMBOL_1.TITLE_SYMBOL, name || propertyKey, target.constructor);
    };
}
exports.UseAsTitle = UseAsTitle;
//# sourceMappingURL=UseAsTitle.js.map
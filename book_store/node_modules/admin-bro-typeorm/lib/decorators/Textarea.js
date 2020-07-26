"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const TEXTAREA_SYMBOL_1 = require("../symbols/TEXTAREA_SYMBOL");
function Textarea(name) {
    return function (target, propertyKey) {
        if (propertyKey == undefined)
            throw new TypeError();
        Reflect.defineMetadata(TEXTAREA_SYMBOL_1.TEXTAREA_SYMBOL, true, target.constructor, name || propertyKey);
    };
}
exports.Textarea = Textarea;
//# sourceMappingURL=Textarea.js.map
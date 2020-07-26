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
const TITLE_SYMBOL_1 = require("../symbols/TITLE_SYMBOL");
function getTitle(instance) {
    return __awaiter(this, void 0, void 0, function* () {
        if (instance) {
            const meta = Reflect.getMetadata(TITLE_SYMBOL_1.TITLE_SYMBOL, instance.constructor);
            if (meta) {
                const prop = instance[meta];
                if (prop instanceof Function)
                    return `${yield (prop.bind(instance))()}`;
                else if (prop instanceof Promise)
                    return `${yield prop}`;
                return `${prop}`;
            }
            else {
                if (instance.hasOwnProperty("name"))
                    return `${instance.name}`;
                else if (instance.hasOwnProperty("id"))
                    return `${instance.id}`;
                else {
                    for (const k in instance)
                        return instance[k];
                }
            }
        }
        return "";
    });
}
exports.getTitle = getTitle;
//# sourceMappingURL=getTitle.js.map
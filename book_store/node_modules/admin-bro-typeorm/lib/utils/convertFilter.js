"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
function safeParseJSON(json) {
    try {
        return JSON.parse(json);
    }
    catch (e) {
        return json;
    }
}
function convertFilter(filter) {
    if (!filter)
        return {};
    else {
        const { filters } = filter;
        const where = {};
        for (const n in filters) {
            const one = filters[n];
            if (["number", "float", "reference"].includes(one.property.type())) {
                const val = Number(one.value);
                if (!isNaN(val))
                    where[n] = val;
            }
            else if (["boolean", "mixed"].includes(one.property.type()))
                where[n] = safeParseJSON(one.value);
            else if (["date", "datetime"].includes(one.property.type())) {
                if (one.value.from && one.value.to)
                    where[n] = typeorm_1.Between(new Date(one.value.from), new Date(one.value.to));
                else if (one.value.from)
                    where[n] = typeorm_1.MoreThanOrEqual(new Date(one.value.from));
                else if (one.value.to)
                    where[n] = typeorm_1.LessThanOrEqual(new Date(one.value.to));
            }
            else
                where[n] = typeorm_1.Like(`%${one.value}%`);
        }
        return where;
    }
}
exports.convertFilter = convertFilter;
//# sourceMappingURL=convertFilter.js.map
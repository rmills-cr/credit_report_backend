"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const not_found = (req, res, next) => {
    res.status(404).json({ err: "Page not found, check url and try again" });
    next();
};
exports.default = not_found;
//# sourceMappingURL=not_found.js.map
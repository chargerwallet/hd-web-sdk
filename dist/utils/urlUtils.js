"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHost = exports.getOrigin = void 0;
const getOrigin = (url) => {
    if (typeof url !== 'string')
        return 'unknown';
    if (url.indexOf('file://') === 0)
        return 'file://';
    const parts = url.match(/^.+\:\/\/[^\/]+/);
    return Array.isArray(parts) && parts.length > 0 ? parts[0] : 'unknown';
};
exports.getOrigin = getOrigin;
const getHost = (url) => {
    var _a;
    if (typeof url !== 'string')
        return;
    const [, , uri] = (_a = url.match(/^(https?):\/\/([^:/]+)?/i)) !== null && _a !== void 0 ? _a : [];
    if (uri) {
        const parts = uri.split('.');
        return parts.length > 2
            ?
                parts.slice(parts.length - 2, parts.length).join('.')
            : uri;
    }
};
exports.getHost = getHost;
//# sourceMappingURL=urlUtils.js.map
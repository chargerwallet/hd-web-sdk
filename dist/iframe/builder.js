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
exports.dispose = exports.init = exports.timeout = exports.initPromise = exports.origin = exports.instance = void 0;
const hd_shared_1 = require("@chargerwallet/hd-shared");
const urlUtils_1 = require("../utils/urlUtils");
exports.initPromise = (0, hd_shared_1.createDeferred)();
exports.timeout = 0;
const init = (settings) => __awaiter(void 0, void 0, void 0, function* () {
    exports.initPromise = (0, hd_shared_1.createDeferred)();
    const existedFrame = document.getElementById('chargerwallet-connect');
    if (existedFrame) {
        exports.instance = existedFrame;
    }
    else {
        exports.instance = document.createElement('iframe');
        exports.instance.frameBorder = '0';
        exports.instance.width = '0px';
        exports.instance.height = '0px';
        exports.instance.style.position = 'absolute';
        exports.instance.style.display = 'none';
        exports.instance.style.border = '0px';
        exports.instance.style.width = '0px';
        exports.instance.style.height = '0px';
        exports.instance.id = 'chargerwallet-connect';
        if (settings.env === 'webusb') {
            exports.instance.allow = 'usb';
        }
    }
    const src = `${settings.iframeSrc}`;
    exports.instance.setAttribute('src', src);
    exports.origin = (0, urlUtils_1.getOrigin)(exports.instance.src);
    exports.timeout = window.setTimeout(() => {
        exports.initPromise.reject(hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.IframeTimeout));
    }, 10000);
    const onLoad = () => {
        var _a;
        if (!exports.instance) {
            exports.initPromise.reject(hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.IframeBlocked));
            return;
        }
        (_a = exports.instance.contentWindow) === null || _a === void 0 ? void 0 : _a.postMessage({
            type: 'iframe-init',
            payload: {
                settings: Object.assign({}, settings),
            },
        }, exports.origin);
        exports.instance.onload = null;
    };
    if (exports.instance.attachEvent) {
        exports.instance.attachEvent('onload', onLoad);
    }
    else {
        exports.instance.onload = onLoad;
    }
    if (document.body) {
        document.body.appendChild(exports.instance);
    }
    try {
        yield exports.initPromise.promise;
    }
    catch (e) {
        if (exports.instance) {
            if (exports.instance.parentNode) {
                exports.instance.parentNode.removeChild(exports.instance);
            }
            exports.instance = null;
        }
        throw e;
    }
    finally {
        window.clearTimeout(exports.timeout);
        exports.timeout = 0;
    }
});
exports.init = init;
const dispose = () => {
    if (exports.instance && exports.instance.parentNode) {
        try {
            exports.instance.parentNode.removeChild(exports.instance);
        }
        catch (e) {
        }
    }
    exports.instance = null;
    exports.timeout = 0;
};
exports.dispose = dispose;
//# sourceMappingURL=builder.js.map
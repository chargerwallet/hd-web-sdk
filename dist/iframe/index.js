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
exports.init = void 0;
const hd_transport_http_1 = require("@chargerwallet/hd-transport-http");
const hd_transport_webusb_1 = require("@chargerwallet/hd-transport-webusb");
const hd_core_1 = require("@chargerwallet/hd-core");
const lodash_1 = require("lodash");
const urlUtils_1 = require("../utils/urlUtils");
const bridgeUtils_1 = require("../utils/bridgeUtils");
const bridge_config_1 = require("./bridge-config");
const __1 = require("..");
let _core;
const Log = (0, hd_core_1.getLogger)(hd_core_1.LoggerNames.Iframe);
const handleMessage = (event) => {
    var _a;
    if (event.comurce === window || !event.data)
        return;
    const whitelist = (0, __1.isOriginWhitelisted)(event.origin) || (0, __1.isExtensionWhitelisted)(event.origin);
    const isTrustedDomain = event.origin === window.location.origin || !!whitelist;
    const eventOrigin = (0, urlUtils_1.getOrigin)(event.origin);
    if (!isTrustedDomain &&
        eventOrigin !== hd_core_1.DataManager.getSettings('origin') &&
        eventOrigin !== (0, urlUtils_1.getOrigin)(document.referrer)) {
        return;
    }
    const message = (0, hd_core_1.parseMessage)(event);
    if (message.type === hd_core_1.IFRAME.INIT) {
        init((_a = message.payload) !== null && _a !== void 0 ? _a : {});
    }
};
function init(payload) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (hd_core_1.DataManager.getSettings('origin'))
            return;
        const settings = (0, hd_core_1.parseConnectSettings)(Object.assign(Object.assign({}, ((_a = payload.settings) !== null && _a !== void 0 ? _a : {})), { isFrame: true }));
        settings.origin = !origin || origin === 'null' ? payload.settings.origin : origin;
        Log.enabled = !!settings.debug;
        try {
            const Transport = settings.env === 'webusb' ? hd_transport_webusb_1.default : hd_transport_http_1.default;
            _core = yield (0, hd_core_1.initCore)(settings, Transport);
            _core === null || _core === void 0 ? void 0 : _core.on(hd_core_1.CORE_EVENT, messages => (0, bridgeUtils_1.sendMessage)(messages, false));
        }
        catch (error) {
            return (0, hd_core_1.createErrorMessage)(error);
        }
        (0, bridgeUtils_1.createJsBridge)({
            isHost: false,
            remoteFrame: window.parent,
            remoteFrameName: bridge_config_1.default.hostName,
            selfFrameName: bridge_config_1.default.iframeName,
            channel: bridge_config_1.default.channel,
            targetOrigin: (0, urlUtils_1.getOrigin)(settings.parentOrigin),
            receiveHandler: (messageEvent) => __awaiter(this, void 0, void 0, function* () {
                const message = (0, hd_core_1.parseMessage)(messageEvent);
                const blockLog = hd_core_1.LogBlockEvent.has((0, lodash_1.get)(message, 'type')) ? message.type : undefined;
                if (blockLog) {
                    Log.debug('Frame Bridge Receive message: ', blockLog);
                }
                else {
                    Log.debug('Frame Bridge Receive message: ', message);
                }
                const response = yield (_core === null || _core === void 0 ? void 0 : _core.handleMessage(message));
                if (blockLog) {
                    Log.debug('Frame Bridge response message: ', blockLog);
                }
                else {
                    Log.debug('Frame Bridge response message: ', message);
                }
                return response;
            }),
        });
        yield (0, bridgeUtils_1.sendMessage)((0, hd_core_1.createIFrameMessage)(hd_core_1.IFRAME.INIT_BRIDGE, {}), false);
    });
}
exports.init = init;
window.addEventListener('message', handleMessage, false);
//# sourceMappingURL=index.js.map
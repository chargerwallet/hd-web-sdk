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
exports.isExtensionWhitelisted = exports.isOriginWhitelisted = void 0;
const events_1 = require("events");
const hd_core_1 = require("@chargerwallet/hd-core");
const hd_shared_1 = require("@chargerwallet/hd-shared");
const iframe = require("./iframe/builder");
const bridge_config_1 = require("./iframe/bridge-config");
const bridgeUtils_1 = require("./utils/bridgeUtils");
const urlUtils_1 = require("./utils/urlUtils");
const eventEmitter = new events_1.default();
const Log = (0, hd_core_1.getLogger)(hd_core_1.LoggerNames.Connect);
let _settings = (0, hd_core_1.parseConnectSettings)();
const isOriginWhitelisted = (origin) => {
    const host = (0, urlUtils_1.getHost)(origin);
    return hd_core_1.whitelist.find(item => item.origin === origin || item.origin === host);
};
exports.isOriginWhitelisted = isOriginWhitelisted;
const isExtensionWhitelisted = (origin) => true;
exports.isExtensionWhitelisted = isExtensionWhitelisted;
const handleMessage = (message) => __awaiter(void 0, void 0, void 0, function* () {
    switch (message.event) {
        case hd_core_1.UI_EVENT:
            if (message.type === hd_core_1.IFRAME.INIT_BRIDGE) {
                iframe.initPromise.resolve();
                return Promise.resolve({ success: true, payload: 'JSBridge Handshake Success' });
            }
            eventEmitter.emit(message.event, message);
            eventEmitter.emit(message.type, message.payload);
            break;
        case hd_core_1.LOG_EVENT:
        case hd_core_1.FIRMWARE_EVENT:
            eventEmitter.emit(message.event, message);
            break;
        case hd_core_1.DEVICE_EVENT:
            if ([hd_core_1.DEVICE.CONNECT, hd_core_1.DEVICE.DISCONNECT, hd_core_1.DEVICE.FEATURES, hd_core_1.DEVICE.SUPPORT_FEATURES].includes(message.type)) {
                eventEmitter.emit(message.type, message.payload);
            }
            break;
        default:
            Log.warn('No need to be captured message', message.event);
    }
});
function checkTrust(settings) {
    var _a, _b;
    const hasTrust = (0, exports.isOriginWhitelisted)((_a = settings.parentOrigin) !== null && _a !== void 0 ? _a : '') ||
        (0, exports.isExtensionWhitelisted)((_b = settings.extension) !== null && _b !== void 0 ? _b : '');
    if (!hasTrust) {
        throw hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.IframeDistrust, JSON.stringify(settings));
    }
}
const dispose = () => {
    checkTrust(_settings);
    eventEmitter.removeAllListeners();
    iframe.dispose();
    _settings = (0, hd_core_1.parseConnectSettings)();
    window.removeEventListener('message', createJSBridge);
};
const uiResponse = (response) => {
    if (!iframe.instance) {
        throw hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.IFrameNotInitialized);
    }
    const { type, payload } = response;
    (0, bridgeUtils_1.sendMessage)({ event: hd_core_1.UI_EVENT, type, payload });
};
const cancel = (connectId) => {
    (0, bridgeUtils_1.sendMessage)({ event: hd_core_1.IFRAME.CANCEL, type: hd_core_1.IFRAME.CANCEL, payload: { connectId } });
};
let prevFrameInstance = null;
const createJSBridge = (messageEvent) => {
    var _a, _b, _c;
    if (messageEvent.origin !== iframe.origin) {
        return;
    }
    if (!bridgeUtils_1.hostBridge || prevFrameInstance !== ((_a = iframe.instance) === null || _a === void 0 ? void 0 : _a.contentWindow)) {
        (0, bridgeUtils_1.resetListenerFlag)();
        (0, bridgeUtils_1.createJsBridge)({
            isHost: true,
            remoteFrame: (_b = iframe.instance) === null || _b === void 0 ? void 0 : _b.contentWindow,
            remoteFrameName: bridge_config_1.default.iframeName,
            selfFrameName: bridge_config_1.default.hostName,
            channel: bridge_config_1.default.channel,
            targetOrigin: iframe.origin,
            receiveHandler: (messageEvent) => __awaiter(void 0, void 0, void 0, function* () {
                const message = (0, hd_core_1.parseMessage)(messageEvent);
                if (message.event !== 'LOG_EVENT') {
                    if (['DEVICE_EVENT', 'FIRMWARE_EVENT'].includes(message.event)) {
                        Log.debug('Host Bridge Receive message: ', message);
                    }
                    else {
                        Log.debug('Host Bridge Receive message: ', message);
                    }
                }
                const response = yield handleMessage(message);
                if (message.event !== 'LOG_EVENT') {
                    if (['DEVICE_EVENT', 'FIRMWARE_EVENT'].includes(message.event)) {
                        Log.debug('Host Bridge response: ', message);
                    }
                    else {
                        Log.debug('Host Bridge response: ', message);
                    }
                }
                return response;
            }),
        });
        prevFrameInstance = (_c = iframe.instance) === null || _c === void 0 ? void 0 : _c.contentWindow;
    }
};
const init = (settings) => __awaiter(void 0, void 0, void 0, function* () {
    if (iframe.instance) {
        throw hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.IFrameAleradyInitialized);
    }
    _settings = (0, hd_core_1.parseConnectSettings)(Object.assign(Object.assign({}, _settings), settings));
    checkTrust(_settings);
    (0, hd_core_1.enableLog)(!!settings.debug);
    (0, hd_core_1.setLoggerPostMessage)(handleMessage);
    Log.debug('init');
    window.addEventListener('message', createJSBridge);
    window.addEventListener('unload', dispose);
    try {
        yield iframe.init(Object.assign(Object.assign({}, _settings), { version: process.env.VERSION }));
        return true;
    }
    catch (e) {
        console.log('init error: ', e);
        return false;
    }
});
const call = (params) => __awaiter(void 0, void 0, void 0, function* () {
    Log.debug('call : ', params);
    if (!iframe.instance && !iframe.timeout) {
        _settings = (0, hd_core_1.parseConnectSettings)(_settings);
        checkTrust(_settings);
        Log.debug("Try to recreate iframe if it's initialize failed: ", _settings);
        try {
            const initResult = yield init(_settings);
            if (!initResult) {
                Log.debug('Recreate iframe failed');
                return (0, hd_core_1.createErrorMessage)(hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.IFrameLoadFail));
            }
            Log.debug('Recreate iframe success');
        }
        catch (error) {
            Log.debug('Recreate iframe failed: ', error);
            return (0, hd_core_1.createErrorMessage)(error);
        }
    }
    if (iframe.timeout) {
        return (0, hd_core_1.createErrorMessage)(hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.IFrameLoadFail));
    }
    try {
        const response = yield (0, bridgeUtils_1.sendMessage)({ event: hd_core_1.IFRAME.CALL, type: hd_core_1.IFRAME.CALL, payload: params });
        if (response) {
            return response;
        }
        return (0, hd_core_1.createErrorMessage)(hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.CallMethodNotResponse));
    }
    catch (error) {
        Log.error('__call error: ', error);
        let err = error;
        if (!(err instanceof hd_shared_1.HardwareError)) {
            err = hd_shared_1.ERRORS.CreateErrorByMessage(error.message);
        }
        return (0, hd_core_1.createErrorMessage)(err);
    }
});
const updateSettings = (settings) => __awaiter(void 0, void 0, void 0, function* () {
    if (iframe.instance) {
        throw hd_shared_1.ERRORS.TypedError(hd_shared_1.HardwareErrorCode.IFrameAleradyInitialized);
    }
    checkTrust(_settings);
    Log.debug('updateSettings API Called =>: old settings: ', _settings);
    _settings = (0, hd_core_1.parseConnectSettings)(Object.assign(Object.assign({}, _settings), settings));
    Log.debug('updateSettings API Called =>: new settings: ', _settings);
    return Promise.resolve(true);
});
const addHardwareGlobalEventListener = (listener) => {
    [
        hd_core_1.UI_EVENT,
        hd_core_1.LOG_EVENT,
        hd_core_1.FIRMWARE_EVENT,
        hd_core_1.DEVICE.CONNECT,
        hd_core_1.DEVICE.DISCONNECT,
        hd_core_1.DEVICE.FEATURES,
        hd_core_1.DEVICE.SUPPORT_FEATURES,
        hd_core_1.UI_REQUEST.FIRMWARE_PROGRESS,
        hd_core_1.UI_REQUEST.FIRMWARE_TIP,
        hd_core_1.UI_REQUEST.PREVIOUS_ADDRESS_RESULT,
    ].forEach(eventName => {
        eventEmitter.on(eventName, (message) => {
            let emitMessage = message;
            if (!message.event && !message.type) {
                emitMessage = Object.assign(Object.assign({}, message), { event: eventName, type: eventName });
            }
            listener === null || listener === void 0 ? void 0 : listener(emitMessage);
        });
    });
};
const HardwareSDKLowLevel = (0, hd_core_1.HardwareSDKLowLevel)({
    eventEmitter,
    init,
    call,
    cancel,
    dispose,
    addHardwareGlobalEventListener,
    uiResponse,
    updateSettings,
});
const HardwareSDKTopLevel = (0, hd_core_1.HardwareTopLevelSdk)();
const HardwareWebSdk = (0, hd_core_1.default)({
    eventEmitter,
    init,
    call,
    cancel,
    dispose,
    uiResponse,
    updateSettings,
});
exports.default = { HardwareSDKLowLevel, HardwareSDKTopLevel, HardwareWebSdk };
//# sourceMappingURL=index.js.map
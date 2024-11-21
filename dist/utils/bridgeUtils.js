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
exports.hostBridge = exports.frameBridge = exports.sendMessage = exports.createJsBridge = exports.resetListenerFlag = void 0;
const cross_inpage_provider_core_1 = require("@chargerwallet/cross-inpage-provider-core");
const hd_core_1 = require("@chargerwallet/hd-core");
const hd_shared_1 = require("@chargerwallet/hd-shared");
const lodash_1 = require("lodash");
const bridge_config_1 = require("../iframe/bridge-config");
let frameBridge;
let hostBridge;
const Log = (0, hd_core_1.getLogger)(hd_core_1.LoggerNames.SendMessage);
const resetListenerFlag = () => (0, cross_inpage_provider_core_1.setPostMessageListenerFlag)(false);
exports.resetListenerFlag = resetListenerFlag;
const createJsBridge = (params) => {
    const bridge = new cross_inpage_provider_core_1.JsBridgeIframe(params);
    if (params.isHost) {
        exports.hostBridge = hostBridge = bridge;
    }
    else {
        exports.frameBridge = frameBridge = bridge;
    }
};
exports.createJsBridge = createJsBridge;
const sendMessage = (messages, isHost = true) => __awaiter(void 0, void 0, void 0, function* () {
    const bridge = isHost ? hostBridge : frameBridge;
    try {
        const blockLog = hd_core_1.LogBlockEvent.has((0, lodash_1.get)(messages, 'type')) ? messages.type : undefined;
        if (messages.event !== 'LOG_EVENT') {
            if (blockLog) {
                Log.debug('request: ', blockLog);
            }
            else {
                Log.debug('request: ', messages);
            }
        }
        const result = yield (bridge === null || bridge === void 0 ? void 0 : bridge.request({
            scope: bridge_config_1.default.scope,
            data: Object.assign({}, messages),
        }));
        if (messages.event !== 'LOG_EVENT') {
            if (blockLog) {
                Log.debug('request result: ', blockLog);
            }
            else {
                Log.debug('request result: ', result);
            }
        }
        return result;
    }
    catch (error) {
        Log.error(error);
        throw hd_shared_1.ERRORS.CreateErrorByMessage(error.message);
    }
});
exports.sendMessage = sendMessage;
//# sourceMappingURL=bridgeUtils.js.map
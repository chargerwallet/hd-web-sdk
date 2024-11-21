import { IJsBridgeIframeConfig, JsBridgeIframe } from '@chargerwallet/cross-inpage-provider-core';
import { CoreMessage } from '@chargerwallet/hd-core';
declare let frameBridge: JsBridgeIframe;
declare let hostBridge: JsBridgeIframe;
export declare const resetListenerFlag: () => void;
export declare const createJsBridge: (params: IJsBridgeIframeConfig & {
    isHost: boolean;
}) => void;
export declare const sendMessage: (messages: CoreMessage, isHost?: boolean) => Promise<any>;
export { frameBridge, hostBridge };
//# sourceMappingURL=bridgeUtils.d.ts.map
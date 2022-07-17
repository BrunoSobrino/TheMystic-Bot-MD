export * from './Auth';
export * from './GroupMetadata';
export * from './Chat';
export * from './Contact';
export * from './State';
export * from './Message';
export * from './Legacy';
export * from './Socket';
export * from './Events';
export * from './Product';
export * from './Call';
import type NodeCache from 'node-cache';
import { proto } from '../../WAProto';
import { AuthenticationState, TransactionCapabilityOptions } from './Auth';
import { CommonSocketConfig } from './Socket';
export declare type MessageRetryMap = {
    [msgId: string]: number;
};
export declare type SocketConfig = CommonSocketConfig<AuthenticationState> & {
    /** By default true, should history messages be downloaded and processed */
    downloadHistory: boolean;
    /** transaction capability options for SignalKeyStore */
    transactionOpts: TransactionCapabilityOptions;
    /** provide a cache to store a user's device list */
    userDevicesCache?: NodeCache;
    /** marks the client as online whenever the socket successfully connects */
    markOnlineOnConnect: boolean;
    /**
     * map to store the retry counts for failed messages;
     * used to determine whether to retry a message or not */
    msgRetryCounterMap?: MessageRetryMap;
    /** width for link preview images */
    linkPreviewImageThumbnailWidth: number;
    /**
     * fetch a message from your store
     * implement this so that messages failed to send (solves the "this message can take a while" issue) can be retried
     * */
    getMessage: (key: proto.IMessageKey) => Promise<proto.IMessage | undefined>;
};
export declare type UserFacingSocketConfig = Partial<SocketConfig> & {
    auth: AuthenticationState;
};
export declare enum DisconnectReason {
    connectionClosed = 428,
    connectionLost = 408,
    connectionReplaced = 440,
    timedOut = 408,
    loggedOut = 401,
    badSession = 500,
    restartRequired = 515,
    multideviceMismatch = 411
}
export declare type WAInitResponse = {
    ref: string;
    ttl: number;
    status: 200;
};
export declare type WABusinessHoursConfig = {
    day_of_week: string;
    mode: string;
    open_time?: number;
    close_time?: number;
};
export declare type WABusinessProfile = {
    description: string;
    email: string;
    business_hours: {
        timezone?: string;
        config?: WABusinessHoursConfig[];
        business_config?: WABusinessHoursConfig[];
    };
    website: string[];
    categories: {
        id: string;
        localized_display_name: string;
    }[];
    wid?: string;
};
export declare type CurveKeyPair = {
    private: Uint8Array;
    public: Uint8Array;
};

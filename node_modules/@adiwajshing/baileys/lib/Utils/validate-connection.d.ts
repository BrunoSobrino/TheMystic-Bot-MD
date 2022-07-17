import { proto } from '../../WAProto';
import type { AuthenticationCreds, SignalCreds, SocketConfig } from '../Types';
import { BinaryNode } from '../WABinary';
declare type ClientPayloadConfig = Pick<SocketConfig, 'version' | 'browser'>;
export declare const generateLoginNode: (userJid: string, config: ClientPayloadConfig) => proto.IClientPayload;
export declare const generateRegistrationNode: ({ registrationId, signedPreKey, signedIdentityKey }: SignalCreds, config: ClientPayloadConfig) => proto.ClientPayload;
export declare const configureSuccessfulPairing: (stanza: BinaryNode, { advSecretKey, signedIdentityKey, signalIdentities }: Pick<AuthenticationCreds, 'advSecretKey' | 'signedIdentityKey' | 'signalIdentities'>) => {
    creds: Partial<AuthenticationCreds>;
    reply: BinaryNode;
};
export {};

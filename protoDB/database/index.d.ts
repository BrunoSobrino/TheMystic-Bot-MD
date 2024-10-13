import * as $protobuf from "protobufjs";
import Long = require("long");
/** Properties of a User. */
export interface IUser {

    /** User afk */
    afk?: (number|null);

    /** User afkReason */
    afkReason?: (string|null);

    /** User age */
    age?: (number|null);

    /** User wait */
    wait?: (number|null);

    /** User agility */
    agility?: (number|null);

    /** User bowDurability */
    bowDurability?: (number|null);

    /** User armor */
    armor?: (number|null);

    /** User armorDurability */
    armorDurability?: (number|null);

    /** User autolevelup */
    autolevelup?: (boolean|null);

    /** User lastadventure */
    lastadventure?: (number|null);

    /** User role */
    role?: (string|null);

    /** User language */
    language?: (string|null);

    /** User exp */
    exp?: (number|null);

    /** User money */
    money?: (number|null);

    /** User joincount */
    joincount?: (number|null);

    /** User wood */
    wood?: (number|null);

    /** User rock */
    rock?: (number|null);

    /** User string */
    string?: (number|null);

    /** User common */
    common?: (number|null);

    /** User uncommon */
    uncommon?: (number|null);

    /** User mythic */
    mythic?: (number|null);

    /** User legendary */
    legendary?: (number|null);

    /** User pet */
    pet?: (number|null);

    /** User level */
    level?: (number|null);

    /** User premiumTime */
    premiumTime?: (number|null);

    /** User premium */
    premium?: (boolean|null);

    /** User diamond */
    diamond?: (number|null);

    /** User limit */
    limit?: (number|null);

    /** User lastMining */
    lastMining?: (number|null);

    /** User potion */
    potion?: (number|null);

    /** User health */
    health?: (number|null);
}

/** Represents a User. */
export class User implements IUser {

    /**
     * Constructs a new User.
     * @param [properties] Properties to set
     */
    constructor(properties?: IUser);

    /** User afk. */
    public afk: number;

    /** User afkReason. */
    public afkReason: string;

    /** User age. */
    public age: number;

    /** User wait. */
    public wait: number;

    /** User agility. */
    public agility: number;

    /** User bowDurability. */
    public bowDurability: number;

    /** User armor. */
    public armor: number;

    /** User armorDurability. */
    public armorDurability: number;

    /** User autolevelup. */
    public autolevelup: boolean;

    /** User lastadventure. */
    public lastadventure: number;

    /** User role. */
    public role: string;

    /** User language. */
    public language: string;

    /** User exp. */
    public exp: number;

    /** User money. */
    public money: number;

    /** User joincount. */
    public joincount: number;

    /** User wood. */
    public wood: number;

    /** User rock. */
    public rock: number;

    /** User string. */
    public string: number;

    /** User common. */
    public common: number;

    /** User uncommon. */
    public uncommon: number;

    /** User mythic. */
    public mythic: number;

    /** User legendary. */
    public legendary: number;

    /** User pet. */
    public pet: number;

    /** User level. */
    public level: number;

    /** User premiumTime. */
    public premiumTime: number;

    /** User premium. */
    public premium: boolean;

    /** User diamond. */
    public diamond: number;

    /** User limit. */
    public limit: number;

    /** User lastMining. */
    public lastMining: number;

    /** User potion. */
    public potion: number;

    /** User health. */
    public health: number;

    /**
     * Creates a new User instance using the specified properties.
     * @param [properties] Properties to set
     * @returns User instance
     */
    public static create(properties?: IUser): User;

    /**
     * Encodes the specified User message. Does not implicitly {@link User.verify|verify} messages.
     * @param message User message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IUser, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified User message, length delimited. Does not implicitly {@link User.verify|verify} messages.
     * @param message User message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IUser, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a User message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns User
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): User;

    /**
     * Decodes a User message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns User
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): User;

    /**
     * Verifies a User message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a User message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns User
     */
    public static fromObject(object: { [k: string]: any }): User;

    /**
     * Creates a plain object from a User message. Also converts values to other types if specified.
     * @param message User
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: User, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this User to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for User
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Chat. */
export interface IChat {

    /** Chat isBanned */
    isBanned?: (boolean|null);

    /** Chat welcome */
    welcome?: (boolean|null);

    /** Chat banchat */
    banchat?: (boolean|null);

    /** Chat detect */
    detect?: (boolean|null);

    /** Chat detect2 */
    detect2?: (boolean|null);

    /** Chat sWelcome */
    sWelcome?: (string|null);

    /** Chat sBye */
    sBye?: (string|null);

    /** Chat sPromote */
    sPromote?: (string|null);

    /** Chat sDemote */
    sDemote?: (string|null);

    /** Chat antidelete */
    antidelete?: (boolean|null);

    /** Chat modohorny */
    modohorny?: (boolean|null);

    /** Chat autosticker */
    autosticker?: (boolean|null);

    /** Chat audios */
    audios?: (boolean|null);

    /** Chat antiLink2 */
    antiLink2?: (boolean|null);

    /** Chat antiviewonce */
    antiviewonce?: (boolean|null);

    /** Chat antiToxic */
    antiToxic?: (boolean|null);

    /** Chat antiTraba */
    antiTraba?: (boolean|null);

    /** Chat modoadmin */
    modoadmin?: (boolean|null);

    /** Chat antiArab */
    antiArab?: (boolean|null);

    /** Chat antiArab2 */
    antiArab2?: (boolean|null);

    /** Chat antiporno */
    antiporno?: (boolean|null);

    /** Chat simi */
    simi?: (boolean|null);

    /** Chat game */
    game?: (boolean|null);

    /** Chat expired */
    expired?: (number|null);

    /** Chat language */
    language?: (string|null);
}

/** Represents a Chat. */
export class Chat implements IChat {

    /**
     * Constructs a new Chat.
     * @param [properties] Properties to set
     */
    constructor(properties?: IChat);

    /** Chat isBanned. */
    public isBanned: boolean;

    /** Chat welcome. */
    public welcome: boolean;

    /** Chat banchat. */
    public banchat: boolean;

    /** Chat detect. */
    public detect: boolean;

    /** Chat detect2. */
    public detect2: boolean;

    /** Chat sWelcome. */
    public sWelcome: string;

    /** Chat sBye. */
    public sBye: string;

    /** Chat sPromote. */
    public sPromote: string;

    /** Chat sDemote. */
    public sDemote: string;

    /** Chat antidelete. */
    public antidelete: boolean;

    /** Chat modohorny. */
    public modohorny: boolean;

    /** Chat autosticker. */
    public autosticker: boolean;

    /** Chat audios. */
    public audios: boolean;

    /** Chat antiLink2. */
    public antiLink2: boolean;

    /** Chat antiviewonce. */
    public antiviewonce: boolean;

    /** Chat antiToxic. */
    public antiToxic: boolean;

    /** Chat antiTraba. */
    public antiTraba: boolean;

    /** Chat modoadmin. */
    public modoadmin: boolean;

    /** Chat antiArab. */
    public antiArab: boolean;

    /** Chat antiArab2. */
    public antiArab2: boolean;

    /** Chat antiporno. */
    public antiporno: boolean;

    /** Chat simi. */
    public simi: boolean;

    /** Chat game. */
    public game: boolean;

    /** Chat expired. */
    public expired: number;

    /** Chat language. */
    public language: string;

    /**
     * Creates a new Chat instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Chat instance
     */
    public static create(properties?: IChat): Chat;

    /**
     * Encodes the specified Chat message. Does not implicitly {@link Chat.verify|verify} messages.
     * @param message Chat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IChat, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Chat message, length delimited. Does not implicitly {@link Chat.verify|verify} messages.
     * @param message Chat message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IChat, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Chat message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Chat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Chat;

    /**
     * Decodes a Chat message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Chat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Chat;

    /**
     * Verifies a Chat message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Chat message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Chat
     */
    public static fromObject(object: { [k: string]: any }): Chat;

    /**
     * Creates a plain object from a Chat message. Also converts values to other types if specified.
     * @param message Chat
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Chat, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Chat to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Chat
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Settings. */
export interface ISettings {

    /** Settings self */
    self?: (boolean|null);

    /** Settings autoread */
    autoread?: (boolean|null);

    /** Settings autoread2 */
    autoread2?: (boolean|null);

    /** Settings restrict */
    restrict?: (boolean|null);

    /** Settings antiCall */
    antiCall?: (boolean|null);

    /** Settings antiPrivate */
    antiPrivate?: (boolean|null);

    /** Settings modejadibot */
    modejadibot?: (boolean|null);

    /** Settings antispam */
    antispam?: (boolean|null);

    /** Settings audiosBot */
    audiosBot?: (boolean|null);

    /** Settings modoia */
    modoia?: (boolean|null);
}

/** Represents a Settings. */
export class Settings implements ISettings {

    /**
     * Constructs a new Settings.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISettings);

    /** Settings self. */
    public self: boolean;

    /** Settings autoread. */
    public autoread: boolean;

    /** Settings autoread2. */
    public autoread2: boolean;

    /** Settings restrict. */
    public restrict: boolean;

    /** Settings antiCall. */
    public antiCall: boolean;

    /** Settings antiPrivate. */
    public antiPrivate: boolean;

    /** Settings modejadibot. */
    public modejadibot: boolean;

    /** Settings antispam. */
    public antispam: boolean;

    /** Settings audiosBot. */
    public audiosBot: boolean;

    /** Settings modoia. */
    public modoia: boolean;

    /**
     * Creates a new Settings instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Settings instance
     */
    public static create(properties?: ISettings): Settings;

    /**
     * Encodes the specified Settings message. Does not implicitly {@link Settings.verify|verify} messages.
     * @param message Settings message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISettings, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Settings message, length delimited. Does not implicitly {@link Settings.verify|verify} messages.
     * @param message Settings message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISettings, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Settings message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Settings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Settings;

    /**
     * Decodes a Settings message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Settings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Settings;

    /**
     * Verifies a Settings message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Settings message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Settings
     */
    public static fromObject(object: { [k: string]: any }): Settings;

    /**
     * Creates a plain object from a Settings message. Also converts values to other types if specified.
     * @param message Settings
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Settings, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Settings to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Settings
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Sticker. */
export interface ISticker {

    /** Sticker text */
    text?: (string|null);

    /** Sticker mentionedJid */
    mentionedJid?: (string|null);

    /** Sticker creator */
    creator?: (string|null);

    /** Sticker locked */
    locked?: (boolean|null);

    /** Sticker at */
    at?: (number|null);
}

/** Represents a Sticker. */
export class Sticker implements ISticker {

    /**
     * Constructs a new Sticker.
     * @param [properties] Properties to set
     */
    constructor(properties?: ISticker);

    /** Sticker text. */
    public text: string;

    /** Sticker mentionedJid. */
    public mentionedJid: string;

    /** Sticker creator. */
    public creator: string;

    /** Sticker locked. */
    public locked: boolean;

    /** Sticker at. */
    public at: number;

    /**
     * Creates a new Sticker instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Sticker instance
     */
    public static create(properties?: ISticker): Sticker;

    /**
     * Encodes the specified Sticker message. Does not implicitly {@link Sticker.verify|verify} messages.
     * @param message Sticker message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: ISticker, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Sticker message, length delimited. Does not implicitly {@link Sticker.verify|verify} messages.
     * @param message Sticker message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: ISticker, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Sticker message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Sticker
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Sticker;

    /**
     * Decodes a Sticker message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Sticker
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Sticker;

    /**
     * Verifies a Sticker message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Sticker message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Sticker
     */
    public static fromObject(object: { [k: string]: any }): Sticker;

    /**
     * Creates a plain object from a Sticker message. Also converts values to other types if specified.
     * @param message Sticker
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Sticker, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Sticker to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Sticker
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

/** Properties of a Database. */
export interface IDatabase {

    /** Database users */
    users?: ({ [k: string]: IUser }|null);

    /** Database chats */
    chats?: ({ [k: string]: IChat }|null);

    /** Database settings */
    settings?: ({ [k: string]: ISettings }|null);

    /** Database stickers */
    stickers?: ({ [k: string]: ISticker }|null);
}

/** Represents a Database. */
export class Database implements IDatabase {

    /**
     * Constructs a new Database.
     * @param [properties] Properties to set
     */
    constructor(properties?: IDatabase);

    /** Database users. */
    public users: { [k: string]: IUser };

    /** Database chats. */
    public chats: { [k: string]: IChat };

    /** Database settings. */
    public settings: { [k: string]: ISettings };

    /** Database stickers. */
    public stickers: { [k: string]: ISticker };

    /**
     * Creates a new Database instance using the specified properties.
     * @param [properties] Properties to set
     * @returns Database instance
     */
    public static create(properties?: IDatabase): Database;

    /**
     * Encodes the specified Database message. Does not implicitly {@link Database.verify|verify} messages.
     * @param message Database message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encode(message: IDatabase, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Encodes the specified Database message, length delimited. Does not implicitly {@link Database.verify|verify} messages.
     * @param message Database message or plain object to encode
     * @param [writer] Writer to encode to
     * @returns Writer
     */
    public static encodeDelimited(message: IDatabase, writer?: $protobuf.Writer): $protobuf.Writer;

    /**
     * Decodes a Database message from the specified reader or buffer.
     * @param reader Reader or buffer to decode from
     * @param [length] Message length if known beforehand
     * @returns Database
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decode(reader: ($protobuf.Reader|Uint8Array), length?: number): Database;

    /**
     * Decodes a Database message from the specified reader or buffer, length delimited.
     * @param reader Reader or buffer to decode from
     * @returns Database
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    public static decodeDelimited(reader: ($protobuf.Reader|Uint8Array)): Database;

    /**
     * Verifies a Database message.
     * @param message Plain object to verify
     * @returns `null` if valid, otherwise the reason why it is not
     */
    public static verify(message: { [k: string]: any }): (string|null);

    /**
     * Creates a Database message from a plain object. Also converts values to their respective internal types.
     * @param object Plain object
     * @returns Database
     */
    public static fromObject(object: { [k: string]: any }): Database;

    /**
     * Creates a plain object from a Database message. Also converts values to other types if specified.
     * @param message Database
     * @param [options] Conversion options
     * @returns Plain object
     */
    public static toObject(message: Database, options?: $protobuf.IConversionOptions): { [k: string]: any };

    /**
     * Converts this Database to JSON.
     * @returns JSON object
     */
    public toJSON(): { [k: string]: any };

    /**
     * Gets the default type url for Database
     * @param [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns The default type url
     */
    public static getTypeUrl(typeUrlPrefix?: string): string;
}

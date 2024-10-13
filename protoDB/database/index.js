/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/minimal");

// Common aliases
var $Reader = $protobuf.Reader, $Writer = $protobuf.Writer, $util = $protobuf.util;

// Exported root namespace
var $root = $protobuf.roots["default"] || ($protobuf.roots["default"] = {});

$root.User = (function() {

    /**
     * Properties of a User.
     * @exports IUser
     * @interface IUser
     * @property {number|null} [afk] User afk
     * @property {string|null} [afkReason] User afkReason
     * @property {number|null} [age] User age
     * @property {number|null} [wait] User wait
     * @property {number|null} [agility] User agility
     * @property {number|null} [bowDurability] User bowDurability
     * @property {number|null} [armor] User armor
     * @property {number|null} [armorDurability] User armorDurability
     * @property {boolean|null} [autolevelup] User autolevelup
     * @property {number|null} [lastadventure] User lastadventure
     * @property {string|null} [role] User role
     * @property {string|null} [language] User language
     * @property {number|null} [exp] User exp
     * @property {number|null} [money] User money
     * @property {number|null} [joincount] User joincount
     * @property {number|null} [wood] User wood
     * @property {number|null} [rock] User rock
     * @property {number|null} [string] User string
     * @property {number|null} [common] User common
     * @property {number|null} [uncommon] User uncommon
     * @property {number|null} [mythic] User mythic
     * @property {number|null} [legendary] User legendary
     * @property {number|null} [pet] User pet
     * @property {number|null} [level] User level
     * @property {number|null} [premiumTime] User premiumTime
     * @property {boolean|null} [premium] User premium
     * @property {number|null} [diamond] User diamond
     * @property {number|null} [limit] User limit
     * @property {number|null} [lastMining] User lastMining
     * @property {number|null} [potion] User potion
     * @property {number|null} [health] User health
     */

    /**
     * Constructs a new User.
     * @exports User
     * @classdesc Represents a User.
     * @implements IUser
     * @constructor
     * @param {IUser=} [properties] Properties to set
     */
    function User(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * User afk.
     * @member {number} afk
     * @memberof User
     * @instance
     */
    User.prototype.afk = 0;

    /**
     * User afkReason.
     * @member {string} afkReason
     * @memberof User
     * @instance
     */
    User.prototype.afkReason = "";

    /**
     * User age.
     * @member {number} age
     * @memberof User
     * @instance
     */
    User.prototype.age = 0;

    /**
     * User wait.
     * @member {number} wait
     * @memberof User
     * @instance
     */
    User.prototype.wait = 0;

    /**
     * User agility.
     * @member {number} agility
     * @memberof User
     * @instance
     */
    User.prototype.agility = 0;

    /**
     * User bowDurability.
     * @member {number} bowDurability
     * @memberof User
     * @instance
     */
    User.prototype.bowDurability = 0;

    /**
     * User armor.
     * @member {number} armor
     * @memberof User
     * @instance
     */
    User.prototype.armor = 0;

    /**
     * User armorDurability.
     * @member {number} armorDurability
     * @memberof User
     * @instance
     */
    User.prototype.armorDurability = 0;

    /**
     * User autolevelup.
     * @member {boolean} autolevelup
     * @memberof User
     * @instance
     */
    User.prototype.autolevelup = false;

    /**
     * User lastadventure.
     * @member {number} lastadventure
     * @memberof User
     * @instance
     */
    User.prototype.lastadventure = 0;

    /**
     * User role.
     * @member {string} role
     * @memberof User
     * @instance
     */
    User.prototype.role = "";

    /**
     * User language.
     * @member {string} language
     * @memberof User
     * @instance
     */
    User.prototype.language = "";

    /**
     * User exp.
     * @member {number} exp
     * @memberof User
     * @instance
     */
    User.prototype.exp = 0;

    /**
     * User money.
     * @member {number} money
     * @memberof User
     * @instance
     */
    User.prototype.money = 0;

    /**
     * User joincount.
     * @member {number} joincount
     * @memberof User
     * @instance
     */
    User.prototype.joincount = 0;

    /**
     * User wood.
     * @member {number} wood
     * @memberof User
     * @instance
     */
    User.prototype.wood = 0;

    /**
     * User rock.
     * @member {number} rock
     * @memberof User
     * @instance
     */
    User.prototype.rock = 0;

    /**
     * User string.
     * @member {number} string
     * @memberof User
     * @instance
     */
    User.prototype.string = 0;

    /**
     * User common.
     * @member {number} common
     * @memberof User
     * @instance
     */
    User.prototype.common = 0;

    /**
     * User uncommon.
     * @member {number} uncommon
     * @memberof User
     * @instance
     */
    User.prototype.uncommon = 0;

    /**
     * User mythic.
     * @member {number} mythic
     * @memberof User
     * @instance
     */
    User.prototype.mythic = 0;

    /**
     * User legendary.
     * @member {number} legendary
     * @memberof User
     * @instance
     */
    User.prototype.legendary = 0;

    /**
     * User pet.
     * @member {number} pet
     * @memberof User
     * @instance
     */
    User.prototype.pet = 0;

    /**
     * User level.
     * @member {number} level
     * @memberof User
     * @instance
     */
    User.prototype.level = 0;

    /**
     * User premiumTime.
     * @member {number} premiumTime
     * @memberof User
     * @instance
     */
    User.prototype.premiumTime = 0;

    /**
     * User premium.
     * @member {boolean} premium
     * @memberof User
     * @instance
     */
    User.prototype.premium = false;

    /**
     * User diamond.
     * @member {number} diamond
     * @memberof User
     * @instance
     */
    User.prototype.diamond = 0;

    /**
     * User limit.
     * @member {number} limit
     * @memberof User
     * @instance
     */
    User.prototype.limit = 0;

    /**
     * User lastMining.
     * @member {number} lastMining
     * @memberof User
     * @instance
     */
    User.prototype.lastMining = 0;

    /**
     * User potion.
     * @member {number} potion
     * @memberof User
     * @instance
     */
    User.prototype.potion = 0;

    /**
     * User health.
     * @member {number} health
     * @memberof User
     * @instance
     */
    User.prototype.health = 0;

    /**
     * Creates a new User instance using the specified properties.
     * @function create
     * @memberof User
     * @static
     * @param {IUser=} [properties] Properties to set
     * @returns {User} User instance
     */
    User.create = function create(properties) {
        return new User(properties);
    };

    /**
     * Encodes the specified User message. Does not implicitly {@link User.verify|verify} messages.
     * @function encode
     * @memberof User
     * @static
     * @param {IUser} message User message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    User.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.afk != null && Object.hasOwnProperty.call(message, "afk"))
            writer.uint32(/* id 1, wireType 0 =*/8).int32(message.afk);
        if (message.afkReason != null && Object.hasOwnProperty.call(message, "afkReason"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.afkReason);
        if (message.age != null && Object.hasOwnProperty.call(message, "age"))
            writer.uint32(/* id 4, wireType 0 =*/32).int32(message.age);
        if (message.wait != null && Object.hasOwnProperty.call(message, "wait"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.wait);
        if (message.agility != null && Object.hasOwnProperty.call(message, "agility"))
            writer.uint32(/* id 6, wireType 0 =*/48).int32(message.agility);
        if (message.bowDurability != null && Object.hasOwnProperty.call(message, "bowDurability"))
            writer.uint32(/* id 7, wireType 0 =*/56).int32(message.bowDurability);
        if (message.armor != null && Object.hasOwnProperty.call(message, "armor"))
            writer.uint32(/* id 8, wireType 0 =*/64).int32(message.armor);
        if (message.armorDurability != null && Object.hasOwnProperty.call(message, "armorDurability"))
            writer.uint32(/* id 9, wireType 0 =*/72).int32(message.armorDurability);
        if (message.autolevelup != null && Object.hasOwnProperty.call(message, "autolevelup"))
            writer.uint32(/* id 10, wireType 0 =*/80).bool(message.autolevelup);
        if (message.lastadventure != null && Object.hasOwnProperty.call(message, "lastadventure"))
            writer.uint32(/* id 11, wireType 0 =*/88).int32(message.lastadventure);
        if (message.role != null && Object.hasOwnProperty.call(message, "role"))
            writer.uint32(/* id 12, wireType 2 =*/98).string(message.role);
        if (message.language != null && Object.hasOwnProperty.call(message, "language"))
            writer.uint32(/* id 13, wireType 2 =*/106).string(message.language);
        if (message.exp != null && Object.hasOwnProperty.call(message, "exp"))
            writer.uint32(/* id 14, wireType 0 =*/112).int32(message.exp);
        if (message.money != null && Object.hasOwnProperty.call(message, "money"))
            writer.uint32(/* id 15, wireType 0 =*/120).int32(message.money);
        if (message.joincount != null && Object.hasOwnProperty.call(message, "joincount"))
            writer.uint32(/* id 16, wireType 0 =*/128).int32(message.joincount);
        if (message.wood != null && Object.hasOwnProperty.call(message, "wood"))
            writer.uint32(/* id 17, wireType 0 =*/136).int32(message.wood);
        if (message.rock != null && Object.hasOwnProperty.call(message, "rock"))
            writer.uint32(/* id 18, wireType 0 =*/144).int32(message.rock);
        if (message.string != null && Object.hasOwnProperty.call(message, "string"))
            writer.uint32(/* id 19, wireType 0 =*/152).int32(message.string);
        if (message.common != null && Object.hasOwnProperty.call(message, "common"))
            writer.uint32(/* id 20, wireType 0 =*/160).int32(message.common);
        if (message.uncommon != null && Object.hasOwnProperty.call(message, "uncommon"))
            writer.uint32(/* id 21, wireType 0 =*/168).int32(message.uncommon);
        if (message.mythic != null && Object.hasOwnProperty.call(message, "mythic"))
            writer.uint32(/* id 22, wireType 0 =*/176).int32(message.mythic);
        if (message.legendary != null && Object.hasOwnProperty.call(message, "legendary"))
            writer.uint32(/* id 23, wireType 0 =*/184).int32(message.legendary);
        if (message.pet != null && Object.hasOwnProperty.call(message, "pet"))
            writer.uint32(/* id 24, wireType 0 =*/192).int32(message.pet);
        if (message.level != null && Object.hasOwnProperty.call(message, "level"))
            writer.uint32(/* id 25, wireType 0 =*/200).int32(message.level);
        if (message.premiumTime != null && Object.hasOwnProperty.call(message, "premiumTime"))
            writer.uint32(/* id 26, wireType 0 =*/208).int32(message.premiumTime);
        if (message.premium != null && Object.hasOwnProperty.call(message, "premium"))
            writer.uint32(/* id 27, wireType 0 =*/216).bool(message.premium);
        if (message.diamond != null && Object.hasOwnProperty.call(message, "diamond"))
            writer.uint32(/* id 28, wireType 0 =*/224).int32(message.diamond);
        if (message.limit != null && Object.hasOwnProperty.call(message, "limit"))
            writer.uint32(/* id 29, wireType 0 =*/232).int32(message.limit);
        if (message.lastMining != null && Object.hasOwnProperty.call(message, "lastMining"))
            writer.uint32(/* id 30, wireType 0 =*/240).int32(message.lastMining);
        if (message.potion != null && Object.hasOwnProperty.call(message, "potion"))
            writer.uint32(/* id 31, wireType 0 =*/248).int32(message.potion);
        if (message.health != null && Object.hasOwnProperty.call(message, "health"))
            writer.uint32(/* id 32, wireType 0 =*/256).int32(message.health);
        return writer;
    };

    /**
     * Encodes the specified User message, length delimited. Does not implicitly {@link User.verify|verify} messages.
     * @function encodeDelimited
     * @memberof User
     * @static
     * @param {IUser} message User message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    User.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a User message from the specified reader or buffer.
     * @function decode
     * @memberof User
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {User} User
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    User.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.User();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.afk = reader.int32();
                    break;
                }
            case 2: {
                    message.afkReason = reader.string();
                    break;
                }
            case 4: {
                    message.age = reader.int32();
                    break;
                }
            case 5: {
                    message.wait = reader.int32();
                    break;
                }
            case 6: {
                    message.agility = reader.int32();
                    break;
                }
            case 7: {
                    message.bowDurability = reader.int32();
                    break;
                }
            case 8: {
                    message.armor = reader.int32();
                    break;
                }
            case 9: {
                    message.armorDurability = reader.int32();
                    break;
                }
            case 10: {
                    message.autolevelup = reader.bool();
                    break;
                }
            case 11: {
                    message.lastadventure = reader.int32();
                    break;
                }
            case 12: {
                    message.role = reader.string();
                    break;
                }
            case 13: {
                    message.language = reader.string();
                    break;
                }
            case 14: {
                    message.exp = reader.int32();
                    break;
                }
            case 15: {
                    message.money = reader.int32();
                    break;
                }
            case 16: {
                    message.joincount = reader.int32();
                    break;
                }
            case 17: {
                    message.wood = reader.int32();
                    break;
                }
            case 18: {
                    message.rock = reader.int32();
                    break;
                }
            case 19: {
                    message.string = reader.int32();
                    break;
                }
            case 20: {
                    message.common = reader.int32();
                    break;
                }
            case 21: {
                    message.uncommon = reader.int32();
                    break;
                }
            case 22: {
                    message.mythic = reader.int32();
                    break;
                }
            case 23: {
                    message.legendary = reader.int32();
                    break;
                }
            case 24: {
                    message.pet = reader.int32();
                    break;
                }
            case 25: {
                    message.level = reader.int32();
                    break;
                }
            case 26: {
                    message.premiumTime = reader.int32();
                    break;
                }
            case 27: {
                    message.premium = reader.bool();
                    break;
                }
            case 28: {
                    message.diamond = reader.int32();
                    break;
                }
            case 29: {
                    message.limit = reader.int32();
                    break;
                }
            case 30: {
                    message.lastMining = reader.int32();
                    break;
                }
            case 31: {
                    message.potion = reader.int32();
                    break;
                }
            case 32: {
                    message.health = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a User message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof User
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {User} User
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    User.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a User message.
     * @function verify
     * @memberof User
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    User.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.afk != null && message.hasOwnProperty("afk"))
            if (!$util.isInteger(message.afk))
                return "afk: integer expected";
        if (message.afkReason != null && message.hasOwnProperty("afkReason"))
            if (!$util.isString(message.afkReason))
                return "afkReason: string expected";
        if (message.age != null && message.hasOwnProperty("age"))
            if (!$util.isInteger(message.age))
                return "age: integer expected";
        if (message.wait != null && message.hasOwnProperty("wait"))
            if (!$util.isInteger(message.wait))
                return "wait: integer expected";
        if (message.agility != null && message.hasOwnProperty("agility"))
            if (!$util.isInteger(message.agility))
                return "agility: integer expected";
        if (message.bowDurability != null && message.hasOwnProperty("bowDurability"))
            if (!$util.isInteger(message.bowDurability))
                return "bowDurability: integer expected";
        if (message.armor != null && message.hasOwnProperty("armor"))
            if (!$util.isInteger(message.armor))
                return "armor: integer expected";
        if (message.armorDurability != null && message.hasOwnProperty("armorDurability"))
            if (!$util.isInteger(message.armorDurability))
                return "armorDurability: integer expected";
        if (message.autolevelup != null && message.hasOwnProperty("autolevelup"))
            if (typeof message.autolevelup !== "boolean")
                return "autolevelup: boolean expected";
        if (message.lastadventure != null && message.hasOwnProperty("lastadventure"))
            if (!$util.isInteger(message.lastadventure))
                return "lastadventure: integer expected";
        if (message.role != null && message.hasOwnProperty("role"))
            if (!$util.isString(message.role))
                return "role: string expected";
        if (message.language != null && message.hasOwnProperty("language"))
            if (!$util.isString(message.language))
                return "language: string expected";
        if (message.exp != null && message.hasOwnProperty("exp"))
            if (!$util.isInteger(message.exp))
                return "exp: integer expected";
        if (message.money != null && message.hasOwnProperty("money"))
            if (!$util.isInteger(message.money))
                return "money: integer expected";
        if (message.joincount != null && message.hasOwnProperty("joincount"))
            if (!$util.isInteger(message.joincount))
                return "joincount: integer expected";
        if (message.wood != null && message.hasOwnProperty("wood"))
            if (!$util.isInteger(message.wood))
                return "wood: integer expected";
        if (message.rock != null && message.hasOwnProperty("rock"))
            if (!$util.isInteger(message.rock))
                return "rock: integer expected";
        if (message.string != null && message.hasOwnProperty("string"))
            if (!$util.isInteger(message.string))
                return "string: integer expected";
        if (message.common != null && message.hasOwnProperty("common"))
            if (!$util.isInteger(message.common))
                return "common: integer expected";
        if (message.uncommon != null && message.hasOwnProperty("uncommon"))
            if (!$util.isInteger(message.uncommon))
                return "uncommon: integer expected";
        if (message.mythic != null && message.hasOwnProperty("mythic"))
            if (!$util.isInteger(message.mythic))
                return "mythic: integer expected";
        if (message.legendary != null && message.hasOwnProperty("legendary"))
            if (!$util.isInteger(message.legendary))
                return "legendary: integer expected";
        if (message.pet != null && message.hasOwnProperty("pet"))
            if (!$util.isInteger(message.pet))
                return "pet: integer expected";
        if (message.level != null && message.hasOwnProperty("level"))
            if (!$util.isInteger(message.level))
                return "level: integer expected";
        if (message.premiumTime != null && message.hasOwnProperty("premiumTime"))
            if (!$util.isInteger(message.premiumTime))
                return "premiumTime: integer expected";
        if (message.premium != null && message.hasOwnProperty("premium"))
            if (typeof message.premium !== "boolean")
                return "premium: boolean expected";
        if (message.diamond != null && message.hasOwnProperty("diamond"))
            if (!$util.isInteger(message.diamond))
                return "diamond: integer expected";
        if (message.limit != null && message.hasOwnProperty("limit"))
            if (!$util.isInteger(message.limit))
                return "limit: integer expected";
        if (message.lastMining != null && message.hasOwnProperty("lastMining"))
            if (!$util.isInteger(message.lastMining))
                return "lastMining: integer expected";
        if (message.potion != null && message.hasOwnProperty("potion"))
            if (!$util.isInteger(message.potion))
                return "potion: integer expected";
        if (message.health != null && message.hasOwnProperty("health"))
            if (!$util.isInteger(message.health))
                return "health: integer expected";
        return null;
    };

    /**
     * Creates a User message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof User
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {User} User
     */
    User.fromObject = function fromObject(object) {
        if (object instanceof $root.User)
            return object;
        var message = new $root.User();
        if (object.afk != null)
            message.afk = object.afk | 0;
        if (object.afkReason != null)
            message.afkReason = String(object.afkReason);
        if (object.age != null)
            message.age = object.age | 0;
        if (object.wait != null)
            message.wait = object.wait | 0;
        if (object.agility != null)
            message.agility = object.agility | 0;
        if (object.bowDurability != null)
            message.bowDurability = object.bowDurability | 0;
        if (object.armor != null)
            message.armor = object.armor | 0;
        if (object.armorDurability != null)
            message.armorDurability = object.armorDurability | 0;
        if (object.autolevelup != null)
            message.autolevelup = Boolean(object.autolevelup);
        if (object.lastadventure != null)
            message.lastadventure = object.lastadventure | 0;
        if (object.role != null)
            message.role = String(object.role);
        if (object.language != null)
            message.language = String(object.language);
        if (object.exp != null)
            message.exp = object.exp | 0;
        if (object.money != null)
            message.money = object.money | 0;
        if (object.joincount != null)
            message.joincount = object.joincount | 0;
        if (object.wood != null)
            message.wood = object.wood | 0;
        if (object.rock != null)
            message.rock = object.rock | 0;
        if (object.string != null)
            message.string = object.string | 0;
        if (object.common != null)
            message.common = object.common | 0;
        if (object.uncommon != null)
            message.uncommon = object.uncommon | 0;
        if (object.mythic != null)
            message.mythic = object.mythic | 0;
        if (object.legendary != null)
            message.legendary = object.legendary | 0;
        if (object.pet != null)
            message.pet = object.pet | 0;
        if (object.level != null)
            message.level = object.level | 0;
        if (object.premiumTime != null)
            message.premiumTime = object.premiumTime | 0;
        if (object.premium != null)
            message.premium = Boolean(object.premium);
        if (object.diamond != null)
            message.diamond = object.diamond | 0;
        if (object.limit != null)
            message.limit = object.limit | 0;
        if (object.lastMining != null)
            message.lastMining = object.lastMining | 0;
        if (object.potion != null)
            message.potion = object.potion | 0;
        if (object.health != null)
            message.health = object.health | 0;
        return message;
    };

    /**
     * Creates a plain object from a User message. Also converts values to other types if specified.
     * @function toObject
     * @memberof User
     * @static
     * @param {User} message User
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    User.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.afk = 0;
            object.afkReason = "";
            object.age = 0;
            object.wait = 0;
            object.agility = 0;
            object.bowDurability = 0;
            object.armor = 0;
            object.armorDurability = 0;
            object.autolevelup = false;
            object.lastadventure = 0;
            object.role = "";
            object.language = "";
            object.exp = 0;
            object.money = 0;
            object.joincount = 0;
            object.wood = 0;
            object.rock = 0;
            object.string = 0;
            object.common = 0;
            object.uncommon = 0;
            object.mythic = 0;
            object.legendary = 0;
            object.pet = 0;
            object.level = 0;
            object.premiumTime = 0;
            object.premium = false;
            object.diamond = 0;
            object.limit = 0;
            object.lastMining = 0;
            object.potion = 0;
            object.health = 0;
        }
        if (message.afk != null && message.hasOwnProperty("afk"))
            object.afk = message.afk;
        if (message.afkReason != null && message.hasOwnProperty("afkReason"))
            object.afkReason = message.afkReason;
        if (message.age != null && message.hasOwnProperty("age"))
            object.age = message.age;
        if (message.wait != null && message.hasOwnProperty("wait"))
            object.wait = message.wait;
        if (message.agility != null && message.hasOwnProperty("agility"))
            object.agility = message.agility;
        if (message.bowDurability != null && message.hasOwnProperty("bowDurability"))
            object.bowDurability = message.bowDurability;
        if (message.armor != null && message.hasOwnProperty("armor"))
            object.armor = message.armor;
        if (message.armorDurability != null && message.hasOwnProperty("armorDurability"))
            object.armorDurability = message.armorDurability;
        if (message.autolevelup != null && message.hasOwnProperty("autolevelup"))
            object.autolevelup = message.autolevelup;
        if (message.lastadventure != null && message.hasOwnProperty("lastadventure"))
            object.lastadventure = message.lastadventure;
        if (message.role != null && message.hasOwnProperty("role"))
            object.role = message.role;
        if (message.language != null && message.hasOwnProperty("language"))
            object.language = message.language;
        if (message.exp != null && message.hasOwnProperty("exp"))
            object.exp = message.exp;
        if (message.money != null && message.hasOwnProperty("money"))
            object.money = message.money;
        if (message.joincount != null && message.hasOwnProperty("joincount"))
            object.joincount = message.joincount;
        if (message.wood != null && message.hasOwnProperty("wood"))
            object.wood = message.wood;
        if (message.rock != null && message.hasOwnProperty("rock"))
            object.rock = message.rock;
        if (message.string != null && message.hasOwnProperty("string"))
            object.string = message.string;
        if (message.common != null && message.hasOwnProperty("common"))
            object.common = message.common;
        if (message.uncommon != null && message.hasOwnProperty("uncommon"))
            object.uncommon = message.uncommon;
        if (message.mythic != null && message.hasOwnProperty("mythic"))
            object.mythic = message.mythic;
        if (message.legendary != null && message.hasOwnProperty("legendary"))
            object.legendary = message.legendary;
        if (message.pet != null && message.hasOwnProperty("pet"))
            object.pet = message.pet;
        if (message.level != null && message.hasOwnProperty("level"))
            object.level = message.level;
        if (message.premiumTime != null && message.hasOwnProperty("premiumTime"))
            object.premiumTime = message.premiumTime;
        if (message.premium != null && message.hasOwnProperty("premium"))
            object.premium = message.premium;
        if (message.diamond != null && message.hasOwnProperty("diamond"))
            object.diamond = message.diamond;
        if (message.limit != null && message.hasOwnProperty("limit"))
            object.limit = message.limit;
        if (message.lastMining != null && message.hasOwnProperty("lastMining"))
            object.lastMining = message.lastMining;
        if (message.potion != null && message.hasOwnProperty("potion"))
            object.potion = message.potion;
        if (message.health != null && message.hasOwnProperty("health"))
            object.health = message.health;
        return object;
    };

    /**
     * Converts this User to JSON.
     * @function toJSON
     * @memberof User
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    User.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for User
     * @function getTypeUrl
     * @memberof User
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    User.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/User";
    };

    return User;
})();

$root.Chat = (function() {

    /**
     * Properties of a Chat.
     * @exports IChat
     * @interface IChat
     * @property {boolean|null} [isBanned] Chat isBanned
     * @property {boolean|null} [welcome] Chat welcome
     * @property {boolean|null} [banchat] Chat banchat
     * @property {boolean|null} [detect] Chat detect
     * @property {boolean|null} [detect2] Chat detect2
     * @property {string|null} [sWelcome] Chat sWelcome
     * @property {string|null} [sBye] Chat sBye
     * @property {string|null} [sPromote] Chat sPromote
     * @property {string|null} [sDemote] Chat sDemote
     * @property {boolean|null} [antidelete] Chat antidelete
     * @property {boolean|null} [modohorny] Chat modohorny
     * @property {boolean|null} [autosticker] Chat autosticker
     * @property {boolean|null} [audios] Chat audios
     * @property {boolean|null} [antiLink2] Chat antiLink2
     * @property {boolean|null} [antiviewonce] Chat antiviewonce
     * @property {boolean|null} [antiToxic] Chat antiToxic
     * @property {boolean|null} [antiTraba] Chat antiTraba
     * @property {boolean|null} [modoadmin] Chat modoadmin
     * @property {boolean|null} [antiArab] Chat antiArab
     * @property {boolean|null} [antiArab2] Chat antiArab2
     * @property {boolean|null} [antiporno] Chat antiporno
     * @property {boolean|null} [simi] Chat simi
     * @property {boolean|null} [game] Chat game
     * @property {number|null} [expired] Chat expired
     * @property {string|null} [language] Chat language
     */

    /**
     * Constructs a new Chat.
     * @exports Chat
     * @classdesc Represents a Chat.
     * @implements IChat
     * @constructor
     * @param {IChat=} [properties] Properties to set
     */
    function Chat(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Chat isBanned.
     * @member {boolean} isBanned
     * @memberof Chat
     * @instance
     */
    Chat.prototype.isBanned = false;

    /**
     * Chat welcome.
     * @member {boolean} welcome
     * @memberof Chat
     * @instance
     */
    Chat.prototype.welcome = false;

    /**
     * Chat banchat.
     * @member {boolean} banchat
     * @memberof Chat
     * @instance
     */
    Chat.prototype.banchat = false;

    /**
     * Chat detect.
     * @member {boolean} detect
     * @memberof Chat
     * @instance
     */
    Chat.prototype.detect = false;

    /**
     * Chat detect2.
     * @member {boolean} detect2
     * @memberof Chat
     * @instance
     */
    Chat.prototype.detect2 = false;

    /**
     * Chat sWelcome.
     * @member {string} sWelcome
     * @memberof Chat
     * @instance
     */
    Chat.prototype.sWelcome = "";

    /**
     * Chat sBye.
     * @member {string} sBye
     * @memberof Chat
     * @instance
     */
    Chat.prototype.sBye = "";

    /**
     * Chat sPromote.
     * @member {string} sPromote
     * @memberof Chat
     * @instance
     */
    Chat.prototype.sPromote = "";

    /**
     * Chat sDemote.
     * @member {string} sDemote
     * @memberof Chat
     * @instance
     */
    Chat.prototype.sDemote = "";

    /**
     * Chat antidelete.
     * @member {boolean} antidelete
     * @memberof Chat
     * @instance
     */
    Chat.prototype.antidelete = false;

    /**
     * Chat modohorny.
     * @member {boolean} modohorny
     * @memberof Chat
     * @instance
     */
    Chat.prototype.modohorny = false;

    /**
     * Chat autosticker.
     * @member {boolean} autosticker
     * @memberof Chat
     * @instance
     */
    Chat.prototype.autosticker = false;

    /**
     * Chat audios.
     * @member {boolean} audios
     * @memberof Chat
     * @instance
     */
    Chat.prototype.audios = false;

    /**
     * Chat antiLink2.
     * @member {boolean} antiLink2
     * @memberof Chat
     * @instance
     */
    Chat.prototype.antiLink2 = false;

    /**
     * Chat antiviewonce.
     * @member {boolean} antiviewonce
     * @memberof Chat
     * @instance
     */
    Chat.prototype.antiviewonce = false;

    /**
     * Chat antiToxic.
     * @member {boolean} antiToxic
     * @memberof Chat
     * @instance
     */
    Chat.prototype.antiToxic = false;

    /**
     * Chat antiTraba.
     * @member {boolean} antiTraba
     * @memberof Chat
     * @instance
     */
    Chat.prototype.antiTraba = false;

    /**
     * Chat modoadmin.
     * @member {boolean} modoadmin
     * @memberof Chat
     * @instance
     */
    Chat.prototype.modoadmin = false;

    /**
     * Chat antiArab.
     * @member {boolean} antiArab
     * @memberof Chat
     * @instance
     */
    Chat.prototype.antiArab = false;

    /**
     * Chat antiArab2.
     * @member {boolean} antiArab2
     * @memberof Chat
     * @instance
     */
    Chat.prototype.antiArab2 = false;

    /**
     * Chat antiporno.
     * @member {boolean} antiporno
     * @memberof Chat
     * @instance
     */
    Chat.prototype.antiporno = false;

    /**
     * Chat simi.
     * @member {boolean} simi
     * @memberof Chat
     * @instance
     */
    Chat.prototype.simi = false;

    /**
     * Chat game.
     * @member {boolean} game
     * @memberof Chat
     * @instance
     */
    Chat.prototype.game = false;

    /**
     * Chat expired.
     * @member {number} expired
     * @memberof Chat
     * @instance
     */
    Chat.prototype.expired = 0;

    /**
     * Chat language.
     * @member {string} language
     * @memberof Chat
     * @instance
     */
    Chat.prototype.language = "";

    /**
     * Creates a new Chat instance using the specified properties.
     * @function create
     * @memberof Chat
     * @static
     * @param {IChat=} [properties] Properties to set
     * @returns {Chat} Chat instance
     */
    Chat.create = function create(properties) {
        return new Chat(properties);
    };

    /**
     * Encodes the specified Chat message. Does not implicitly {@link Chat.verify|verify} messages.
     * @function encode
     * @memberof Chat
     * @static
     * @param {IChat} message Chat message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Chat.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.isBanned != null && Object.hasOwnProperty.call(message, "isBanned"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.isBanned);
        if (message.welcome != null && Object.hasOwnProperty.call(message, "welcome"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.welcome);
        if (message.banchat != null && Object.hasOwnProperty.call(message, "banchat"))
            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.banchat);
        if (message.detect != null && Object.hasOwnProperty.call(message, "detect"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.detect);
        if (message.detect2 != null && Object.hasOwnProperty.call(message, "detect2"))
            writer.uint32(/* id 5, wireType 0 =*/40).bool(message.detect2);
        if (message.sWelcome != null && Object.hasOwnProperty.call(message, "sWelcome"))
            writer.uint32(/* id 6, wireType 2 =*/50).string(message.sWelcome);
        if (message.sBye != null && Object.hasOwnProperty.call(message, "sBye"))
            writer.uint32(/* id 7, wireType 2 =*/58).string(message.sBye);
        if (message.sPromote != null && Object.hasOwnProperty.call(message, "sPromote"))
            writer.uint32(/* id 8, wireType 2 =*/66).string(message.sPromote);
        if (message.sDemote != null && Object.hasOwnProperty.call(message, "sDemote"))
            writer.uint32(/* id 9, wireType 2 =*/74).string(message.sDemote);
        if (message.antidelete != null && Object.hasOwnProperty.call(message, "antidelete"))
            writer.uint32(/* id 10, wireType 0 =*/80).bool(message.antidelete);
        if (message.modohorny != null && Object.hasOwnProperty.call(message, "modohorny"))
            writer.uint32(/* id 11, wireType 0 =*/88).bool(message.modohorny);
        if (message.autosticker != null && Object.hasOwnProperty.call(message, "autosticker"))
            writer.uint32(/* id 12, wireType 0 =*/96).bool(message.autosticker);
        if (message.audios != null && Object.hasOwnProperty.call(message, "audios"))
            writer.uint32(/* id 13, wireType 0 =*/104).bool(message.audios);
        if (message.antiLink2 != null && Object.hasOwnProperty.call(message, "antiLink2"))
            writer.uint32(/* id 14, wireType 0 =*/112).bool(message.antiLink2);
        if (message.antiviewonce != null && Object.hasOwnProperty.call(message, "antiviewonce"))
            writer.uint32(/* id 15, wireType 0 =*/120).bool(message.antiviewonce);
        if (message.antiToxic != null && Object.hasOwnProperty.call(message, "antiToxic"))
            writer.uint32(/* id 16, wireType 0 =*/128).bool(message.antiToxic);
        if (message.antiTraba != null && Object.hasOwnProperty.call(message, "antiTraba"))
            writer.uint32(/* id 17, wireType 0 =*/136).bool(message.antiTraba);
        if (message.modoadmin != null && Object.hasOwnProperty.call(message, "modoadmin"))
            writer.uint32(/* id 18, wireType 0 =*/144).bool(message.modoadmin);
        if (message.antiArab != null && Object.hasOwnProperty.call(message, "antiArab"))
            writer.uint32(/* id 19, wireType 0 =*/152).bool(message.antiArab);
        if (message.antiArab2 != null && Object.hasOwnProperty.call(message, "antiArab2"))
            writer.uint32(/* id 20, wireType 0 =*/160).bool(message.antiArab2);
        if (message.antiporno != null && Object.hasOwnProperty.call(message, "antiporno"))
            writer.uint32(/* id 21, wireType 0 =*/168).bool(message.antiporno);
        if (message.simi != null && Object.hasOwnProperty.call(message, "simi"))
            writer.uint32(/* id 22, wireType 0 =*/176).bool(message.simi);
        if (message.game != null && Object.hasOwnProperty.call(message, "game"))
            writer.uint32(/* id 23, wireType 0 =*/184).bool(message.game);
        if (message.expired != null && Object.hasOwnProperty.call(message, "expired"))
            writer.uint32(/* id 24, wireType 0 =*/192).int32(message.expired);
        if (message.language != null && Object.hasOwnProperty.call(message, "language"))
            writer.uint32(/* id 25, wireType 2 =*/202).string(message.language);
        return writer;
    };

    /**
     * Encodes the specified Chat message, length delimited. Does not implicitly {@link Chat.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Chat
     * @static
     * @param {IChat} message Chat message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Chat.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Chat message from the specified reader or buffer.
     * @function decode
     * @memberof Chat
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Chat} Chat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Chat.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Chat();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.isBanned = reader.bool();
                    break;
                }
            case 2: {
                    message.welcome = reader.bool();
                    break;
                }
            case 3: {
                    message.banchat = reader.bool();
                    break;
                }
            case 4: {
                    message.detect = reader.bool();
                    break;
                }
            case 5: {
                    message.detect2 = reader.bool();
                    break;
                }
            case 6: {
                    message.sWelcome = reader.string();
                    break;
                }
            case 7: {
                    message.sBye = reader.string();
                    break;
                }
            case 8: {
                    message.sPromote = reader.string();
                    break;
                }
            case 9: {
                    message.sDemote = reader.string();
                    break;
                }
            case 10: {
                    message.antidelete = reader.bool();
                    break;
                }
            case 11: {
                    message.modohorny = reader.bool();
                    break;
                }
            case 12: {
                    message.autosticker = reader.bool();
                    break;
                }
            case 13: {
                    message.audios = reader.bool();
                    break;
                }
            case 14: {
                    message.antiLink2 = reader.bool();
                    break;
                }
            case 15: {
                    message.antiviewonce = reader.bool();
                    break;
                }
            case 16: {
                    message.antiToxic = reader.bool();
                    break;
                }
            case 17: {
                    message.antiTraba = reader.bool();
                    break;
                }
            case 18: {
                    message.modoadmin = reader.bool();
                    break;
                }
            case 19: {
                    message.antiArab = reader.bool();
                    break;
                }
            case 20: {
                    message.antiArab2 = reader.bool();
                    break;
                }
            case 21: {
                    message.antiporno = reader.bool();
                    break;
                }
            case 22: {
                    message.simi = reader.bool();
                    break;
                }
            case 23: {
                    message.game = reader.bool();
                    break;
                }
            case 24: {
                    message.expired = reader.int32();
                    break;
                }
            case 25: {
                    message.language = reader.string();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Chat message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Chat
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Chat} Chat
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Chat.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Chat message.
     * @function verify
     * @memberof Chat
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Chat.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.isBanned != null && message.hasOwnProperty("isBanned"))
            if (typeof message.isBanned !== "boolean")
                return "isBanned: boolean expected";
        if (message.welcome != null && message.hasOwnProperty("welcome"))
            if (typeof message.welcome !== "boolean")
                return "welcome: boolean expected";
        if (message.banchat != null && message.hasOwnProperty("banchat"))
            if (typeof message.banchat !== "boolean")
                return "banchat: boolean expected";
        if (message.detect != null && message.hasOwnProperty("detect"))
            if (typeof message.detect !== "boolean")
                return "detect: boolean expected";
        if (message.detect2 != null && message.hasOwnProperty("detect2"))
            if (typeof message.detect2 !== "boolean")
                return "detect2: boolean expected";
        if (message.sWelcome != null && message.hasOwnProperty("sWelcome"))
            if (!$util.isString(message.sWelcome))
                return "sWelcome: string expected";
        if (message.sBye != null && message.hasOwnProperty("sBye"))
            if (!$util.isString(message.sBye))
                return "sBye: string expected";
        if (message.sPromote != null && message.hasOwnProperty("sPromote"))
            if (!$util.isString(message.sPromote))
                return "sPromote: string expected";
        if (message.sDemote != null && message.hasOwnProperty("sDemote"))
            if (!$util.isString(message.sDemote))
                return "sDemote: string expected";
        if (message.antidelete != null && message.hasOwnProperty("antidelete"))
            if (typeof message.antidelete !== "boolean")
                return "antidelete: boolean expected";
        if (message.modohorny != null && message.hasOwnProperty("modohorny"))
            if (typeof message.modohorny !== "boolean")
                return "modohorny: boolean expected";
        if (message.autosticker != null && message.hasOwnProperty("autosticker"))
            if (typeof message.autosticker !== "boolean")
                return "autosticker: boolean expected";
        if (message.audios != null && message.hasOwnProperty("audios"))
            if (typeof message.audios !== "boolean")
                return "audios: boolean expected";
        if (message.antiLink2 != null && message.hasOwnProperty("antiLink2"))
            if (typeof message.antiLink2 !== "boolean")
                return "antiLink2: boolean expected";
        if (message.antiviewonce != null && message.hasOwnProperty("antiviewonce"))
            if (typeof message.antiviewonce !== "boolean")
                return "antiviewonce: boolean expected";
        if (message.antiToxic != null && message.hasOwnProperty("antiToxic"))
            if (typeof message.antiToxic !== "boolean")
                return "antiToxic: boolean expected";
        if (message.antiTraba != null && message.hasOwnProperty("antiTraba"))
            if (typeof message.antiTraba !== "boolean")
                return "antiTraba: boolean expected";
        if (message.modoadmin != null && message.hasOwnProperty("modoadmin"))
            if (typeof message.modoadmin !== "boolean")
                return "modoadmin: boolean expected";
        if (message.antiArab != null && message.hasOwnProperty("antiArab"))
            if (typeof message.antiArab !== "boolean")
                return "antiArab: boolean expected";
        if (message.antiArab2 != null && message.hasOwnProperty("antiArab2"))
            if (typeof message.antiArab2 !== "boolean")
                return "antiArab2: boolean expected";
        if (message.antiporno != null && message.hasOwnProperty("antiporno"))
            if (typeof message.antiporno !== "boolean")
                return "antiporno: boolean expected";
        if (message.simi != null && message.hasOwnProperty("simi"))
            if (typeof message.simi !== "boolean")
                return "simi: boolean expected";
        if (message.game != null && message.hasOwnProperty("game"))
            if (typeof message.game !== "boolean")
                return "game: boolean expected";
        if (message.expired != null && message.hasOwnProperty("expired"))
            if (!$util.isInteger(message.expired))
                return "expired: integer expected";
        if (message.language != null && message.hasOwnProperty("language"))
            if (!$util.isString(message.language))
                return "language: string expected";
        return null;
    };

    /**
     * Creates a Chat message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Chat
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Chat} Chat
     */
    Chat.fromObject = function fromObject(object) {
        if (object instanceof $root.Chat)
            return object;
        var message = new $root.Chat();
        if (object.isBanned != null)
            message.isBanned = Boolean(object.isBanned);
        if (object.welcome != null)
            message.welcome = Boolean(object.welcome);
        if (object.banchat != null)
            message.banchat = Boolean(object.banchat);
        if (object.detect != null)
            message.detect = Boolean(object.detect);
        if (object.detect2 != null)
            message.detect2 = Boolean(object.detect2);
        if (object.sWelcome != null)
            message.sWelcome = String(object.sWelcome);
        if (object.sBye != null)
            message.sBye = String(object.sBye);
        if (object.sPromote != null)
            message.sPromote = String(object.sPromote);
        if (object.sDemote != null)
            message.sDemote = String(object.sDemote);
        if (object.antidelete != null)
            message.antidelete = Boolean(object.antidelete);
        if (object.modohorny != null)
            message.modohorny = Boolean(object.modohorny);
        if (object.autosticker != null)
            message.autosticker = Boolean(object.autosticker);
        if (object.audios != null)
            message.audios = Boolean(object.audios);
        if (object.antiLink2 != null)
            message.antiLink2 = Boolean(object.antiLink2);
        if (object.antiviewonce != null)
            message.antiviewonce = Boolean(object.antiviewonce);
        if (object.antiToxic != null)
            message.antiToxic = Boolean(object.antiToxic);
        if (object.antiTraba != null)
            message.antiTraba = Boolean(object.antiTraba);
        if (object.modoadmin != null)
            message.modoadmin = Boolean(object.modoadmin);
        if (object.antiArab != null)
            message.antiArab = Boolean(object.antiArab);
        if (object.antiArab2 != null)
            message.antiArab2 = Boolean(object.antiArab2);
        if (object.antiporno != null)
            message.antiporno = Boolean(object.antiporno);
        if (object.simi != null)
            message.simi = Boolean(object.simi);
        if (object.game != null)
            message.game = Boolean(object.game);
        if (object.expired != null)
            message.expired = object.expired | 0;
        if (object.language != null)
            message.language = String(object.language);
        return message;
    };

    /**
     * Creates a plain object from a Chat message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Chat
     * @static
     * @param {Chat} message Chat
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Chat.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.isBanned = false;
            object.welcome = false;
            object.banchat = false;
            object.detect = false;
            object.detect2 = false;
            object.sWelcome = "";
            object.sBye = "";
            object.sPromote = "";
            object.sDemote = "";
            object.antidelete = false;
            object.modohorny = false;
            object.autosticker = false;
            object.audios = false;
            object.antiLink2 = false;
            object.antiviewonce = false;
            object.antiToxic = false;
            object.antiTraba = false;
            object.modoadmin = false;
            object.antiArab = false;
            object.antiArab2 = false;
            object.antiporno = false;
            object.simi = false;
            object.game = false;
            object.expired = 0;
            object.language = "";
        }
        if (message.isBanned != null && message.hasOwnProperty("isBanned"))
            object.isBanned = message.isBanned;
        if (message.welcome != null && message.hasOwnProperty("welcome"))
            object.welcome = message.welcome;
        if (message.banchat != null && message.hasOwnProperty("banchat"))
            object.banchat = message.banchat;
        if (message.detect != null && message.hasOwnProperty("detect"))
            object.detect = message.detect;
        if (message.detect2 != null && message.hasOwnProperty("detect2"))
            object.detect2 = message.detect2;
        if (message.sWelcome != null && message.hasOwnProperty("sWelcome"))
            object.sWelcome = message.sWelcome;
        if (message.sBye != null && message.hasOwnProperty("sBye"))
            object.sBye = message.sBye;
        if (message.sPromote != null && message.hasOwnProperty("sPromote"))
            object.sPromote = message.sPromote;
        if (message.sDemote != null && message.hasOwnProperty("sDemote"))
            object.sDemote = message.sDemote;
        if (message.antidelete != null && message.hasOwnProperty("antidelete"))
            object.antidelete = message.antidelete;
        if (message.modohorny != null && message.hasOwnProperty("modohorny"))
            object.modohorny = message.modohorny;
        if (message.autosticker != null && message.hasOwnProperty("autosticker"))
            object.autosticker = message.autosticker;
        if (message.audios != null && message.hasOwnProperty("audios"))
            object.audios = message.audios;
        if (message.antiLink2 != null && message.hasOwnProperty("antiLink2"))
            object.antiLink2 = message.antiLink2;
        if (message.antiviewonce != null && message.hasOwnProperty("antiviewonce"))
            object.antiviewonce = message.antiviewonce;
        if (message.antiToxic != null && message.hasOwnProperty("antiToxic"))
            object.antiToxic = message.antiToxic;
        if (message.antiTraba != null && message.hasOwnProperty("antiTraba"))
            object.antiTraba = message.antiTraba;
        if (message.modoadmin != null && message.hasOwnProperty("modoadmin"))
            object.modoadmin = message.modoadmin;
        if (message.antiArab != null && message.hasOwnProperty("antiArab"))
            object.antiArab = message.antiArab;
        if (message.antiArab2 != null && message.hasOwnProperty("antiArab2"))
            object.antiArab2 = message.antiArab2;
        if (message.antiporno != null && message.hasOwnProperty("antiporno"))
            object.antiporno = message.antiporno;
        if (message.simi != null && message.hasOwnProperty("simi"))
            object.simi = message.simi;
        if (message.game != null && message.hasOwnProperty("game"))
            object.game = message.game;
        if (message.expired != null && message.hasOwnProperty("expired"))
            object.expired = message.expired;
        if (message.language != null && message.hasOwnProperty("language"))
            object.language = message.language;
        return object;
    };

    /**
     * Converts this Chat to JSON.
     * @function toJSON
     * @memberof Chat
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Chat.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Chat
     * @function getTypeUrl
     * @memberof Chat
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Chat.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Chat";
    };

    return Chat;
})();

$root.Settings = (function() {

    /**
     * Properties of a Settings.
     * @exports ISettings
     * @interface ISettings
     * @property {boolean|null} [self] Settings self
     * @property {boolean|null} [autoread] Settings autoread
     * @property {boolean|null} [autoread2] Settings autoread2
     * @property {boolean|null} [restrict] Settings restrict
     * @property {boolean|null} [antiCall] Settings antiCall
     * @property {boolean|null} [antiPrivate] Settings antiPrivate
     * @property {boolean|null} [modejadibot] Settings modejadibot
     * @property {boolean|null} [antispam] Settings antispam
     * @property {boolean|null} [audiosBot] Settings audiosBot
     * @property {boolean|null} [modoia] Settings modoia
     */

    /**
     * Constructs a new Settings.
     * @exports Settings
     * @classdesc Represents a Settings.
     * @implements ISettings
     * @constructor
     * @param {ISettings=} [properties] Properties to set
     */
    function Settings(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Settings self.
     * @member {boolean} self
     * @memberof Settings
     * @instance
     */
    Settings.prototype.self = false;

    /**
     * Settings autoread.
     * @member {boolean} autoread
     * @memberof Settings
     * @instance
     */
    Settings.prototype.autoread = false;

    /**
     * Settings autoread2.
     * @member {boolean} autoread2
     * @memberof Settings
     * @instance
     */
    Settings.prototype.autoread2 = false;

    /**
     * Settings restrict.
     * @member {boolean} restrict
     * @memberof Settings
     * @instance
     */
    Settings.prototype.restrict = false;

    /**
     * Settings antiCall.
     * @member {boolean} antiCall
     * @memberof Settings
     * @instance
     */
    Settings.prototype.antiCall = false;

    /**
     * Settings antiPrivate.
     * @member {boolean} antiPrivate
     * @memberof Settings
     * @instance
     */
    Settings.prototype.antiPrivate = false;

    /**
     * Settings modejadibot.
     * @member {boolean} modejadibot
     * @memberof Settings
     * @instance
     */
    Settings.prototype.modejadibot = false;

    /**
     * Settings antispam.
     * @member {boolean} antispam
     * @memberof Settings
     * @instance
     */
    Settings.prototype.antispam = false;

    /**
     * Settings audiosBot.
     * @member {boolean} audiosBot
     * @memberof Settings
     * @instance
     */
    Settings.prototype.audiosBot = false;

    /**
     * Settings modoia.
     * @member {boolean} modoia
     * @memberof Settings
     * @instance
     */
    Settings.prototype.modoia = false;

    /**
     * Creates a new Settings instance using the specified properties.
     * @function create
     * @memberof Settings
     * @static
     * @param {ISettings=} [properties] Properties to set
     * @returns {Settings} Settings instance
     */
    Settings.create = function create(properties) {
        return new Settings(properties);
    };

    /**
     * Encodes the specified Settings message. Does not implicitly {@link Settings.verify|verify} messages.
     * @function encode
     * @memberof Settings
     * @static
     * @param {ISettings} message Settings message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Settings.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.self != null && Object.hasOwnProperty.call(message, "self"))
            writer.uint32(/* id 1, wireType 0 =*/8).bool(message.self);
        if (message.autoread != null && Object.hasOwnProperty.call(message, "autoread"))
            writer.uint32(/* id 2, wireType 0 =*/16).bool(message.autoread);
        if (message.autoread2 != null && Object.hasOwnProperty.call(message, "autoread2"))
            writer.uint32(/* id 3, wireType 0 =*/24).bool(message.autoread2);
        if (message.restrict != null && Object.hasOwnProperty.call(message, "restrict"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.restrict);
        if (message.antiCall != null && Object.hasOwnProperty.call(message, "antiCall"))
            writer.uint32(/* id 5, wireType 0 =*/40).bool(message.antiCall);
        if (message.antiPrivate != null && Object.hasOwnProperty.call(message, "antiPrivate"))
            writer.uint32(/* id 6, wireType 0 =*/48).bool(message.antiPrivate);
        if (message.modejadibot != null && Object.hasOwnProperty.call(message, "modejadibot"))
            writer.uint32(/* id 7, wireType 0 =*/56).bool(message.modejadibot);
        if (message.antispam != null && Object.hasOwnProperty.call(message, "antispam"))
            writer.uint32(/* id 8, wireType 0 =*/64).bool(message.antispam);
        if (message.audiosBot != null && Object.hasOwnProperty.call(message, "audiosBot"))
            writer.uint32(/* id 9, wireType 0 =*/72).bool(message.audiosBot);
        if (message.modoia != null && Object.hasOwnProperty.call(message, "modoia"))
            writer.uint32(/* id 10, wireType 0 =*/80).bool(message.modoia);
        return writer;
    };

    /**
     * Encodes the specified Settings message, length delimited. Does not implicitly {@link Settings.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Settings
     * @static
     * @param {ISettings} message Settings message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Settings.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Settings message from the specified reader or buffer.
     * @function decode
     * @memberof Settings
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Settings} Settings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Settings.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Settings();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.self = reader.bool();
                    break;
                }
            case 2: {
                    message.autoread = reader.bool();
                    break;
                }
            case 3: {
                    message.autoread2 = reader.bool();
                    break;
                }
            case 4: {
                    message.restrict = reader.bool();
                    break;
                }
            case 5: {
                    message.antiCall = reader.bool();
                    break;
                }
            case 6: {
                    message.antiPrivate = reader.bool();
                    break;
                }
            case 7: {
                    message.modejadibot = reader.bool();
                    break;
                }
            case 8: {
                    message.antispam = reader.bool();
                    break;
                }
            case 9: {
                    message.audiosBot = reader.bool();
                    break;
                }
            case 10: {
                    message.modoia = reader.bool();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Settings message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Settings
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Settings} Settings
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Settings.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Settings message.
     * @function verify
     * @memberof Settings
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Settings.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.self != null && message.hasOwnProperty("self"))
            if (typeof message.self !== "boolean")
                return "self: boolean expected";
        if (message.autoread != null && message.hasOwnProperty("autoread"))
            if (typeof message.autoread !== "boolean")
                return "autoread: boolean expected";
        if (message.autoread2 != null && message.hasOwnProperty("autoread2"))
            if (typeof message.autoread2 !== "boolean")
                return "autoread2: boolean expected";
        if (message.restrict != null && message.hasOwnProperty("restrict"))
            if (typeof message.restrict !== "boolean")
                return "restrict: boolean expected";
        if (message.antiCall != null && message.hasOwnProperty("antiCall"))
            if (typeof message.antiCall !== "boolean")
                return "antiCall: boolean expected";
        if (message.antiPrivate != null && message.hasOwnProperty("antiPrivate"))
            if (typeof message.antiPrivate !== "boolean")
                return "antiPrivate: boolean expected";
        if (message.modejadibot != null && message.hasOwnProperty("modejadibot"))
            if (typeof message.modejadibot !== "boolean")
                return "modejadibot: boolean expected";
        if (message.antispam != null && message.hasOwnProperty("antispam"))
            if (typeof message.antispam !== "boolean")
                return "antispam: boolean expected";
        if (message.audiosBot != null && message.hasOwnProperty("audiosBot"))
            if (typeof message.audiosBot !== "boolean")
                return "audiosBot: boolean expected";
        if (message.modoia != null && message.hasOwnProperty("modoia"))
            if (typeof message.modoia !== "boolean")
                return "modoia: boolean expected";
        return null;
    };

    /**
     * Creates a Settings message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Settings
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Settings} Settings
     */
    Settings.fromObject = function fromObject(object) {
        if (object instanceof $root.Settings)
            return object;
        var message = new $root.Settings();
        if (object.self != null)
            message.self = Boolean(object.self);
        if (object.autoread != null)
            message.autoread = Boolean(object.autoread);
        if (object.autoread2 != null)
            message.autoread2 = Boolean(object.autoread2);
        if (object.restrict != null)
            message.restrict = Boolean(object.restrict);
        if (object.antiCall != null)
            message.antiCall = Boolean(object.antiCall);
        if (object.antiPrivate != null)
            message.antiPrivate = Boolean(object.antiPrivate);
        if (object.modejadibot != null)
            message.modejadibot = Boolean(object.modejadibot);
        if (object.antispam != null)
            message.antispam = Boolean(object.antispam);
        if (object.audiosBot != null)
            message.audiosBot = Boolean(object.audiosBot);
        if (object.modoia != null)
            message.modoia = Boolean(object.modoia);
        return message;
    };

    /**
     * Creates a plain object from a Settings message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Settings
     * @static
     * @param {Settings} message Settings
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Settings.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.self = false;
            object.autoread = false;
            object.autoread2 = false;
            object.restrict = false;
            object.antiCall = false;
            object.antiPrivate = false;
            object.modejadibot = false;
            object.antispam = false;
            object.audiosBot = false;
            object.modoia = false;
        }
        if (message.self != null && message.hasOwnProperty("self"))
            object.self = message.self;
        if (message.autoread != null && message.hasOwnProperty("autoread"))
            object.autoread = message.autoread;
        if (message.autoread2 != null && message.hasOwnProperty("autoread2"))
            object.autoread2 = message.autoread2;
        if (message.restrict != null && message.hasOwnProperty("restrict"))
            object.restrict = message.restrict;
        if (message.antiCall != null && message.hasOwnProperty("antiCall"))
            object.antiCall = message.antiCall;
        if (message.antiPrivate != null && message.hasOwnProperty("antiPrivate"))
            object.antiPrivate = message.antiPrivate;
        if (message.modejadibot != null && message.hasOwnProperty("modejadibot"))
            object.modejadibot = message.modejadibot;
        if (message.antispam != null && message.hasOwnProperty("antispam"))
            object.antispam = message.antispam;
        if (message.audiosBot != null && message.hasOwnProperty("audiosBot"))
            object.audiosBot = message.audiosBot;
        if (message.modoia != null && message.hasOwnProperty("modoia"))
            object.modoia = message.modoia;
        return object;
    };

    /**
     * Converts this Settings to JSON.
     * @function toJSON
     * @memberof Settings
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Settings.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Settings
     * @function getTypeUrl
     * @memberof Settings
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Settings.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Settings";
    };

    return Settings;
})();

$root.Sticker = (function() {

    /**
     * Properties of a Sticker.
     * @exports ISticker
     * @interface ISticker
     * @property {string|null} [text] Sticker text
     * @property {string|null} [mentionedJid] Sticker mentionedJid
     * @property {string|null} [creator] Sticker creator
     * @property {boolean|null} [locked] Sticker locked
     * @property {number|null} [at] Sticker at
     */

    /**
     * Constructs a new Sticker.
     * @exports Sticker
     * @classdesc Represents a Sticker.
     * @implements ISticker
     * @constructor
     * @param {ISticker=} [properties] Properties to set
     */
    function Sticker(properties) {
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Sticker text.
     * @member {string} text
     * @memberof Sticker
     * @instance
     */
    Sticker.prototype.text = "";

    /**
     * Sticker mentionedJid.
     * @member {string} mentionedJid
     * @memberof Sticker
     * @instance
     */
    Sticker.prototype.mentionedJid = "";

    /**
     * Sticker creator.
     * @member {string} creator
     * @memberof Sticker
     * @instance
     */
    Sticker.prototype.creator = "";

    /**
     * Sticker locked.
     * @member {boolean} locked
     * @memberof Sticker
     * @instance
     */
    Sticker.prototype.locked = false;

    /**
     * Sticker at.
     * @member {number} at
     * @memberof Sticker
     * @instance
     */
    Sticker.prototype.at = 0;

    /**
     * Creates a new Sticker instance using the specified properties.
     * @function create
     * @memberof Sticker
     * @static
     * @param {ISticker=} [properties] Properties to set
     * @returns {Sticker} Sticker instance
     */
    Sticker.create = function create(properties) {
        return new Sticker(properties);
    };

    /**
     * Encodes the specified Sticker message. Does not implicitly {@link Sticker.verify|verify} messages.
     * @function encode
     * @memberof Sticker
     * @static
     * @param {ISticker} message Sticker message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Sticker.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.text != null && Object.hasOwnProperty.call(message, "text"))
            writer.uint32(/* id 1, wireType 2 =*/10).string(message.text);
        if (message.mentionedJid != null && Object.hasOwnProperty.call(message, "mentionedJid"))
            writer.uint32(/* id 2, wireType 2 =*/18).string(message.mentionedJid);
        if (message.creator != null && Object.hasOwnProperty.call(message, "creator"))
            writer.uint32(/* id 3, wireType 2 =*/26).string(message.creator);
        if (message.locked != null && Object.hasOwnProperty.call(message, "locked"))
            writer.uint32(/* id 4, wireType 0 =*/32).bool(message.locked);
        if (message.at != null && Object.hasOwnProperty.call(message, "at"))
            writer.uint32(/* id 5, wireType 0 =*/40).int32(message.at);
        return writer;
    };

    /**
     * Encodes the specified Sticker message, length delimited. Does not implicitly {@link Sticker.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Sticker
     * @static
     * @param {ISticker} message Sticker message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Sticker.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Sticker message from the specified reader or buffer.
     * @function decode
     * @memberof Sticker
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Sticker} Sticker
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Sticker.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Sticker();
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    message.text = reader.string();
                    break;
                }
            case 2: {
                    message.mentionedJid = reader.string();
                    break;
                }
            case 3: {
                    message.creator = reader.string();
                    break;
                }
            case 4: {
                    message.locked = reader.bool();
                    break;
                }
            case 5: {
                    message.at = reader.int32();
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Sticker message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Sticker
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Sticker} Sticker
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Sticker.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Sticker message.
     * @function verify
     * @memberof Sticker
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Sticker.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.text != null && message.hasOwnProperty("text"))
            if (!$util.isString(message.text))
                return "text: string expected";
        if (message.mentionedJid != null && message.hasOwnProperty("mentionedJid"))
            if (!$util.isString(message.mentionedJid))
                return "mentionedJid: string expected";
        if (message.creator != null && message.hasOwnProperty("creator"))
            if (!$util.isString(message.creator))
                return "creator: string expected";
        if (message.locked != null && message.hasOwnProperty("locked"))
            if (typeof message.locked !== "boolean")
                return "locked: boolean expected";
        if (message.at != null && message.hasOwnProperty("at"))
            if (!$util.isInteger(message.at))
                return "at: integer expected";
        return null;
    };

    /**
     * Creates a Sticker message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Sticker
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Sticker} Sticker
     */
    Sticker.fromObject = function fromObject(object) {
        if (object instanceof $root.Sticker)
            return object;
        var message = new $root.Sticker();
        if (object.text != null)
            message.text = String(object.text);
        if (object.mentionedJid != null)
            message.mentionedJid = String(object.mentionedJid);
        if (object.creator != null)
            message.creator = String(object.creator);
        if (object.locked != null)
            message.locked = Boolean(object.locked);
        if (object.at != null)
            message.at = object.at | 0;
        return message;
    };

    /**
     * Creates a plain object from a Sticker message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Sticker
     * @static
     * @param {Sticker} message Sticker
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Sticker.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.defaults) {
            object.text = "";
            object.mentionedJid = "";
            object.creator = "";
            object.locked = false;
            object.at = 0;
        }
        if (message.text != null && message.hasOwnProperty("text"))
            object.text = message.text;
        if (message.mentionedJid != null && message.hasOwnProperty("mentionedJid"))
            object.mentionedJid = message.mentionedJid;
        if (message.creator != null && message.hasOwnProperty("creator"))
            object.creator = message.creator;
        if (message.locked != null && message.hasOwnProperty("locked"))
            object.locked = message.locked;
        if (message.at != null && message.hasOwnProperty("at"))
            object.at = message.at;
        return object;
    };

    /**
     * Converts this Sticker to JSON.
     * @function toJSON
     * @memberof Sticker
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Sticker.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Sticker
     * @function getTypeUrl
     * @memberof Sticker
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Sticker.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Sticker";
    };

    return Sticker;
})();

$root.Database = (function() {

    /**
     * Properties of a Database.
     * @exports IDatabase
     * @interface IDatabase
     * @property {Object.<string,IUser>|null} [users] Database users
     * @property {Object.<string,IChat>|null} [chats] Database chats
     * @property {Object.<string,ISettings>|null} [settings] Database settings
     * @property {Object.<string,ISticker>|null} [stickers] Database stickers
     */

    /**
     * Constructs a new Database.
     * @exports Database
     * @classdesc Represents a Database.
     * @implements IDatabase
     * @constructor
     * @param {IDatabase=} [properties] Properties to set
     */
    function Database(properties) {
        this.users = {};
        this.chats = {};
        this.settings = {};
        this.stickers = {};
        if (properties)
            for (var keys = Object.keys(properties), i = 0; i < keys.length; ++i)
                if (properties[keys[i]] != null)
                    this[keys[i]] = properties[keys[i]];
    }

    /**
     * Database users.
     * @member {Object.<string,IUser>} users
     * @memberof Database
     * @instance
     */
    Database.prototype.users = $util.emptyObject;

    /**
     * Database chats.
     * @member {Object.<string,IChat>} chats
     * @memberof Database
     * @instance
     */
    Database.prototype.chats = $util.emptyObject;

    /**
     * Database settings.
     * @member {Object.<string,ISettings>} settings
     * @memberof Database
     * @instance
     */
    Database.prototype.settings = $util.emptyObject;

    /**
     * Database stickers.
     * @member {Object.<string,ISticker>} stickers
     * @memberof Database
     * @instance
     */
    Database.prototype.stickers = $util.emptyObject;

    /**
     * Creates a new Database instance using the specified properties.
     * @function create
     * @memberof Database
     * @static
     * @param {IDatabase=} [properties] Properties to set
     * @returns {Database} Database instance
     */
    Database.create = function create(properties) {
        return new Database(properties);
    };

    /**
     * Encodes the specified Database message. Does not implicitly {@link Database.verify|verify} messages.
     * @function encode
     * @memberof Database
     * @static
     * @param {IDatabase} message Database message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Database.encode = function encode(message, writer) {
        if (!writer)
            writer = $Writer.create();
        if (message.users != null && Object.hasOwnProperty.call(message, "users"))
            for (var keys = Object.keys(message.users), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 1, wireType 2 =*/10).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.User.encode(message.users[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        if (message.chats != null && Object.hasOwnProperty.call(message, "chats"))
            for (var keys = Object.keys(message.chats), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 2, wireType 2 =*/18).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.Chat.encode(message.chats[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        if (message.settings != null && Object.hasOwnProperty.call(message, "settings"))
            for (var keys = Object.keys(message.settings), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 3, wireType 2 =*/26).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.Settings.encode(message.settings[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        if (message.stickers != null && Object.hasOwnProperty.call(message, "stickers"))
            for (var keys = Object.keys(message.stickers), i = 0; i < keys.length; ++i) {
                writer.uint32(/* id 4, wireType 2 =*/34).fork().uint32(/* id 1, wireType 2 =*/10).string(keys[i]);
                $root.Sticker.encode(message.stickers[keys[i]], writer.uint32(/* id 2, wireType 2 =*/18).fork()).ldelim().ldelim();
            }
        return writer;
    };

    /**
     * Encodes the specified Database message, length delimited. Does not implicitly {@link Database.verify|verify} messages.
     * @function encodeDelimited
     * @memberof Database
     * @static
     * @param {IDatabase} message Database message or plain object to encode
     * @param {$protobuf.Writer} [writer] Writer to encode to
     * @returns {$protobuf.Writer} Writer
     */
    Database.encodeDelimited = function encodeDelimited(message, writer) {
        return this.encode(message, writer).ldelim();
    };

    /**
     * Decodes a Database message from the specified reader or buffer.
     * @function decode
     * @memberof Database
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @param {number} [length] Message length if known beforehand
     * @returns {Database} Database
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Database.decode = function decode(reader, length) {
        if (!(reader instanceof $Reader))
            reader = $Reader.create(reader);
        var end = length === undefined ? reader.len : reader.pos + length, message = new $root.Database(), key, value;
        while (reader.pos < end) {
            var tag = reader.uint32();
            switch (tag >>> 3) {
            case 1: {
                    if (message.users === $util.emptyObject)
                        message.users = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = null;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = $root.User.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.users[key] = value;
                    break;
                }
            case 2: {
                    if (message.chats === $util.emptyObject)
                        message.chats = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = null;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = $root.Chat.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.chats[key] = value;
                    break;
                }
            case 3: {
                    if (message.settings === $util.emptyObject)
                        message.settings = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = null;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = $root.Settings.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.settings[key] = value;
                    break;
                }
            case 4: {
                    if (message.stickers === $util.emptyObject)
                        message.stickers = {};
                    var end2 = reader.uint32() + reader.pos;
                    key = "";
                    value = null;
                    while (reader.pos < end2) {
                        var tag2 = reader.uint32();
                        switch (tag2 >>> 3) {
                        case 1:
                            key = reader.string();
                            break;
                        case 2:
                            value = $root.Sticker.decode(reader, reader.uint32());
                            break;
                        default:
                            reader.skipType(tag2 & 7);
                            break;
                        }
                    }
                    message.stickers[key] = value;
                    break;
                }
            default:
                reader.skipType(tag & 7);
                break;
            }
        }
        return message;
    };

    /**
     * Decodes a Database message from the specified reader or buffer, length delimited.
     * @function decodeDelimited
     * @memberof Database
     * @static
     * @param {$protobuf.Reader|Uint8Array} reader Reader or buffer to decode from
     * @returns {Database} Database
     * @throws {Error} If the payload is not a reader or valid buffer
     * @throws {$protobuf.util.ProtocolError} If required fields are missing
     */
    Database.decodeDelimited = function decodeDelimited(reader) {
        if (!(reader instanceof $Reader))
            reader = new $Reader(reader);
        return this.decode(reader, reader.uint32());
    };

    /**
     * Verifies a Database message.
     * @function verify
     * @memberof Database
     * @static
     * @param {Object.<string,*>} message Plain object to verify
     * @returns {string|null} `null` if valid, otherwise the reason why it is not
     */
    Database.verify = function verify(message) {
        if (typeof message !== "object" || message === null)
            return "object expected";
        if (message.users != null && message.hasOwnProperty("users")) {
            if (!$util.isObject(message.users))
                return "users: object expected";
            var key = Object.keys(message.users);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.User.verify(message.users[key[i]]);
                if (error)
                    return "users." + error;
            }
        }
        if (message.chats != null && message.hasOwnProperty("chats")) {
            if (!$util.isObject(message.chats))
                return "chats: object expected";
            var key = Object.keys(message.chats);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.Chat.verify(message.chats[key[i]]);
                if (error)
                    return "chats." + error;
            }
        }
        if (message.settings != null && message.hasOwnProperty("settings")) {
            if (!$util.isObject(message.settings))
                return "settings: object expected";
            var key = Object.keys(message.settings);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.Settings.verify(message.settings[key[i]]);
                if (error)
                    return "settings." + error;
            }
        }
        if (message.stickers != null && message.hasOwnProperty("stickers")) {
            if (!$util.isObject(message.stickers))
                return "stickers: object expected";
            var key = Object.keys(message.stickers);
            for (var i = 0; i < key.length; ++i) {
                var error = $root.Sticker.verify(message.stickers[key[i]]);
                if (error)
                    return "stickers." + error;
            }
        }
        return null;
    };

    /**
     * Creates a Database message from a plain object. Also converts values to their respective internal types.
     * @function fromObject
     * @memberof Database
     * @static
     * @param {Object.<string,*>} object Plain object
     * @returns {Database} Database
     */
    Database.fromObject = function fromObject(object) {
        if (object instanceof $root.Database)
            return object;
        var message = new $root.Database();
        if (object.users) {
            if (typeof object.users !== "object")
                throw TypeError(".Database.users: object expected");
            message.users = {};
            for (var keys = Object.keys(object.users), i = 0; i < keys.length; ++i) {
                if (typeof object.users[keys[i]] !== "object")
                    throw TypeError(".Database.users: object expected");
                message.users[keys[i]] = $root.User.fromObject(object.users[keys[i]]);
            }
        }
        if (object.chats) {
            if (typeof object.chats !== "object")
                throw TypeError(".Database.chats: object expected");
            message.chats = {};
            for (var keys = Object.keys(object.chats), i = 0; i < keys.length; ++i) {
                if (typeof object.chats[keys[i]] !== "object")
                    throw TypeError(".Database.chats: object expected");
                message.chats[keys[i]] = $root.Chat.fromObject(object.chats[keys[i]]);
            }
        }
        if (object.settings) {
            if (typeof object.settings !== "object")
                throw TypeError(".Database.settings: object expected");
            message.settings = {};
            for (var keys = Object.keys(object.settings), i = 0; i < keys.length; ++i) {
                if (typeof object.settings[keys[i]] !== "object")
                    throw TypeError(".Database.settings: object expected");
                message.settings[keys[i]] = $root.Settings.fromObject(object.settings[keys[i]]);
            }
        }
        if (object.stickers) {
            if (typeof object.stickers !== "object")
                throw TypeError(".Database.stickers: object expected");
            message.stickers = {};
            for (var keys = Object.keys(object.stickers), i = 0; i < keys.length; ++i) {
                if (typeof object.stickers[keys[i]] !== "object")
                    throw TypeError(".Database.stickers: object expected");
                message.stickers[keys[i]] = $root.Sticker.fromObject(object.stickers[keys[i]]);
            }
        }
        return message;
    };

    /**
     * Creates a plain object from a Database message. Also converts values to other types if specified.
     * @function toObject
     * @memberof Database
     * @static
     * @param {Database} message Database
     * @param {$protobuf.IConversionOptions} [options] Conversion options
     * @returns {Object.<string,*>} Plain object
     */
    Database.toObject = function toObject(message, options) {
        if (!options)
            options = {};
        var object = {};
        if (options.objects || options.defaults) {
            object.users = {};
            object.chats = {};
            object.settings = {};
            object.stickers = {};
        }
        var keys2;
        if (message.users && (keys2 = Object.keys(message.users)).length) {
            object.users = {};
            for (var j = 0; j < keys2.length; ++j)
                object.users[keys2[j]] = $root.User.toObject(message.users[keys2[j]], options);
        }
        if (message.chats && (keys2 = Object.keys(message.chats)).length) {
            object.chats = {};
            for (var j = 0; j < keys2.length; ++j)
                object.chats[keys2[j]] = $root.Chat.toObject(message.chats[keys2[j]], options);
        }
        if (message.settings && (keys2 = Object.keys(message.settings)).length) {
            object.settings = {};
            for (var j = 0; j < keys2.length; ++j)
                object.settings[keys2[j]] = $root.Settings.toObject(message.settings[keys2[j]], options);
        }
        if (message.stickers && (keys2 = Object.keys(message.stickers)).length) {
            object.stickers = {};
            for (var j = 0; j < keys2.length; ++j)
                object.stickers[keys2[j]] = $root.Sticker.toObject(message.stickers[keys2[j]], options);
        }
        return object;
    };

    /**
     * Converts this Database to JSON.
     * @function toJSON
     * @memberof Database
     * @instance
     * @returns {Object.<string,*>} JSON object
     */
    Database.prototype.toJSON = function toJSON() {
        return this.constructor.toObject(this, $protobuf.util.toJSONOptions);
    };

    /**
     * Gets the default type url for Database
     * @function getTypeUrl
     * @memberof Database
     * @static
     * @param {string} [typeUrlPrefix] your custom typeUrlPrefix(default "type.googleapis.com")
     * @returns {string} The default type url
     */
    Database.getTypeUrl = function getTypeUrl(typeUrlPrefix) {
        if (typeUrlPrefix === undefined) {
            typeUrlPrefix = "type.googleapis.com";
        }
        return typeUrlPrefix + "/Database";
    };

    return Database;
})();

module.exports = $root;

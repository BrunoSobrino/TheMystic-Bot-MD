import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import fs from 'fs';
import chalk from 'chalk';
import mddd5 from 'md5';
import ws from 'ws';
let mconn;

/**
 * @type {import('@whiskeysockets/baileys')}
 */
const { proto } = (await import('@whiskeysockets/baileys')).default;
const isNumber = (x) => typeof x === 'number' && !isNaN(x);
const delay = (ms) => isNumber(ms) && new Promise((resolve) => setTimeout(function () {
  clearTimeout(this);
  resolve();
}, ms));

/**
 * Handle messages upsert
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['messages.upsert']} groupsUpdate
 */
export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || [];
  this.uptime = this.uptime || Date.now();
  if (!chatUpdate) {
    return;
  }
  this.pushMessage(chatUpdate.messages).catch(console.error);
  let m = chatUpdate.messages[chatUpdate.messages.length - 1];
  if (!m) {
    return;
  }
  if (global.db.data == null) await global.loadDatabase();
  /* Creditos a Otosaka (https://wa.me/51993966345) */

  if (global.chatgpt.data === null) await global.loadChatgptDB();

  /* ------------------------------------------------*/
  try {
    m = smsg(this, m) || m;
    if (!m) {
      return;
    }
    global.mconn = m
    mconn = m
    m.exp = 0;
    m.money = false;
    m.limit = false;
    try {
      // better database... @skidy89
      // also check all types maybe some types are missing only in user database
      // 358 added of 404
      const user = global.db.data.users[m.sender]
      const userDatabase = (user) => ({
        afk: isNumber(user.afk) ? user.afk : -1,
        wait: isNumber(user.wait) ? user.wait : 0,
        afkReason: typeof user.afkReason === 'string' ? user.afkReason : '',
        age: isNumber(user.age) ? user.age : -1,
        agility: isNumber(user.agility) ? user.agility : 16,
        anakanjing: isNumber(user.anakanjing) ? user.anakanjing : 0,
        anakcentaur: isNumber(user.anakcentaur) ? user.anakcentaur : 0,
        anakgriffin: isNumber(user.anakgriffin) ? user.anakgriffin : 0,
        anakkucing: isNumber(user.anakkucing) ? user.anakkucing : 0,
        anakkuda: isNumber(user.anakkuda) ? user.anakkuda : 0,
        anakkyubi: isNumber(user.anakkyubi) ? user.anakkyubi : 0,
        anaknaga: isNumber(user.anaknaga) ? user.anaknaga : 0,
        anakpancingan: isNumber(user.anakpancingan) ? user.anakpancingan : 0,
        anakphonix: isNumber(user.anakphonix) ? user.anakphonix : 0,
        anakrubah: isNumber(user.anakrubah) ? user.anakrubah : 0,
        anakserigala: isNumber(user.anakserigala) ? user.anakserigala : 0,
        anggur: isNumber(user.anggur) ? user.anggur : 0,
        anjing: isNumber(user.anjing) ? user.anjing : 0,
        anjinglastclaim: isNumber(user.anjinglastclaim) ? user.anjinglastclaim : 0,
        antispam: isNumber(user.antispam) ? user.antispam : 0,
        antispamlastclaim: isNumber(user.antispamlastclaim) ? user.antispamlastclaim : 0,
        apel: isNumber(user.apel) ? user.apel : 0,
        aqua: isNumber(user.aqua) ? user.aqua : 0,
        arc: isNumber(user.arc) ? user.arc : 0,
        arcdurability: isNumber(user.arcdurability) ? user.arcdurability : 0,
        arlok: isNumber(user.arlok) ? user.arlok : 0,
        armor: isNumber(user.armor) ? user.armor : 0,
        armordurability: isNumber(user.armordurability) ? user.armordurability : 0,
        armormonster: isNumber(user.armormonster) ? user.armormonster : 0,
        as: isNumber(user.as) ? user.as : 0,
        atm: isNumber(user.atm) ? user.atm : 0,
        autolevelup: typeof user.autolevelup === 'boolean' ? user.autolevelup : true,
        axe: isNumber(user.axe) ? user.axe : 0,
        axedurability: isNumber(user.axedurability) ? user.axedurability : 0,
        ayam: isNumber(user.ayam) ? user.ayam : 0,
        ayamb: isNumber(user.ayamb) ? user.ayamb : 0,
        ayambakar: isNumber(user.ayambakar) ? user.ayambakar : 0,
        ayamg: isNumber(user.ayamg) ? user.ayamg : 0,
        ayamgoreng: isNumber(user.ayamgoreng) ? user.ayamgoreng : 0,
        babi: isNumber(user.babi) ? user.babi : 0,
        babihutan: isNumber(user.babihutan) ? user.babihutan : 0,
        babipanggang: isNumber(user.babipanggang) ? user.babipanggang : 0,
        bandage: isNumber(user.bandage) ? user.bandage : 0,
        bank: isNumber(user.bank) ? user.bank : 0,
        banned: typeof user.banned === 'boolean' ? user.banned : false,
        BannedReason: typeof user.BannedReason === 'string' ? user.BannedReason : '',
        Banneduser: typeof user.Banneduser === 'boolean' ? user.Banneduser : false,
        banteng: isNumber(user.banteng) ? user.banteng : 0,
        batu: isNumber(user.batu) ? user.batu : 0,
        bawal: isNumber(user.bawal) ? user.bawal : 0,
        bawalbakar: isNumber(user.bawalbakar) ? user.bawalbakar : 0,
        bayam: isNumber(user.bayam) ? user.bayam : 0,
        berlian: isNumber(user.berlian) ? user.berlian : 10,
        bibitanggur: isNumber(user.bibitanggur) ? user.bibitanggur : 0,
        bibitapel: isNumber(user.bibitapel) ? user.bibitapel : 0,
        bibitjeruk: isNumber(user.bibitjeruk) ? user.bibitjeruk : 0,
        bibitmangga: isNumber(user.bibitmangga) ? user.bibitmangga : 0,
        bibitpisang: isNumber(user.bibitpisang) ? user.bibitpisang : 0,
        botol: isNumber(user.botol) ? user.botol : 0,
        bow: isNumber(user.bow) ? user.bow : 0,
        bowdurability: isNumber(user.bowdurability) ? user.bowdurability : 0,
        boxs: isNumber(user.boxs) ? user.boxs : 0,
        brick: isNumber(user.brick) ? user.brick : 0,
        brokoli: isNumber(user.brokoli) ? user.brokoli : 0,
        buaya: isNumber(user.buaya) ? user.buaya : 0,
        buntal: isNumber(user.buntal) ? user.buntal : 0,
        cat: isNumber(user.cat) ? user.cat : 0,
        catlastfeed: isNumber(user.catlastfeed) ? user.catlastfeed : 0,
        catngexp: isNumber(user.catngexp) ? user.catngexp : 0,
        centaur: isNumber(user.centaur) ? user.centaur : 0,
        centaurexp: isNumber(user.centaurexp) ? user.centaurexp : 0,
        centaurlastclaim: isNumber(user.centaurlastclaim) ? user.centaurlastclaim : 0,
        centaurlastfeed: isNumber(user.centaurlastfeed) ? user.centaurlastfeed : 0,
        clay: isNumber(user.clay) ? user.clay : 0,
        coal: isNumber(user.coal) ? user.coal : 0,
        coin: isNumber(user.coin) ? user.coin : 0,
        common: isNumber(user.common) ? user.common : 0,
        crystal: isNumber(user.crystal) ? user.crystal : 0,
        cumi: isNumber(user.cumi) ? user.cumi : 0,
        cupon: isNumber(user.cupon) ? user.cupon : 0,
        diamond: isNumber(user.diamond) ? user.diamond : 3,
        dog: isNumber(user.dog) ? user.dog : 0,
        dogexp: isNumber(user.dogexp) ? user.dogexp : 0,
        doglastfeed: isNumber(user.doglastfeed) ? user.doglastfeed : 0,
        dory: isNumber(user.dory) ? user.dory : 0,
        dragon: isNumber(user.dragon) ? user.dragon : 0,
        dragonexp: isNumber(user.dragonexp) ? user.dragonexp : 0,
        dragonlastfeed: isNumber(user.dragonlastfeed) ? user.dragonlastfeed : 0,
        emas: isNumber(user.emas) ? user.emas : 0,
        emerald: isNumber(user.emerald) ? user.emerald : 0,
        esteh: isNumber(user.esteh) ? user.esteh : 0,
        exp: isNumber(user.exp) ? user.exp : 0,
        expg: isNumber(user.expg) ? user.expg : 0,
        exphero: isNumber(user.exphero) ? user.exphero : 0,
        expired: isNumber(user.expired) ? user.expired : 0,
        eleksirb: isNumber(user.eleksirb) ? user.eleksirb : 0,
        emasbatang: isNumber(user.emasbatang) ? user.emasbatang : 0,
        emasbiasa: isNumber(user.emasbiasa) ? user.emasbiasa : 0,
        fideos: isNumber(user.fideos) ? user.fideos : 0,
        fishingrod: isNumber(user.fishingrod) ? user.fishingrod : 0,
        fishingroddurability: isNumber(user.fishingroddurability) ? user.fishingroddurability : 0,
        fortress: isNumber(user.fortress) ? user.fortress : 0,
        fox: isNumber(user.fox) ? user.fox : 0,
        foxexp: isNumber(user.foxexp) ? user.foxexp : 0,
        foxlastfeed: isNumber(user.foxlastfeed) ? user.foxlastfeed : 0,
        fullatm: isNumber(user.fullatm) ? user.fullatm : 0,
        gadodado: isNumber(user.gadodado) ? user.gadodado : 0,
        gajah: isNumber(user.gajah) ? user.gajah : 0,
        gamemines: typeof user.gamemines === 'boolean' ? user.gamemines : false,
        mute: typeof user.mute === 'boolean' ? user.mute : false,
        ganja: isNumber(user.ganja) ? user.ganja : 0,
        gardenboxs: isNumber(user.gardenboxs) ? user.gardenboxs : 0,
        gems: isNumber(user.gems) ? user.gems : 0,
        glass: isNumber(user.glass) ? user.glass : 0,
        gold: isNumber(user.gold) ? user.gold : 0,
        griffin: isNumber(user.griffin) ? user.griffin : 0,
        griffinexp: isNumber(user.griffinexp) ? user.griffinexp : 0,
        griffinlastclaim: isNumber(user.griffinlastclaim) ? user.griffinlastclaim : 0,
        griffinlastfeed: isNumber(user.griffinlastfeed) ? user.griffinlastfeed : 0,
        gulai: isNumber(user.gulai) ? user.gulai : 0,
        gurita: isNumber(user.gurita) ? user.gurita : 0,
        harimau: isNumber(user.harimau) ? user.harimau : 0,
        haus: isNumber(user.haus) ? user.haus : 100,
        healt: isNumber(user.healt) ? user.healt : 100,
        health: isNumber(user.health) ? user.health : 100,
        healtmonster: isNumber(user.healtmonster) ? user.healtmonster : 100,
        hero: isNumber(user.hero) ? user.hero : 1,
        herolastclaim: isNumber(user.herolastclaim) ? user.herolastclaim : 0,
        hiu: isNumber(user.hiu) ? user.hiu : 0,
        horse: isNumber(user.horse) ? user.horse : 0,
        horseexp: isNumber(user.horseexp) ? user.horseexp : 0,
        horselastfeed: isNumber(user.horselastfeed) ? user.horselastfeed : 0,
        ikan: isNumber(user.ikan) ? user.ikan : 0,
        ikanbakar: isNumber(user.ikanbakar) ? user.ikanbakar : 0,
        intelligence: isNumber(user.intelligence) ? user.intelligence : 10,
        iron: isNumber(user.iron) ? user.iron : 0,
        jagung: isNumber(user.jagung) ? user.jagung : 0,
        jagungbakar: isNumber(user.jagungbakar) ? user.jagungbakar : 0,
        jeruk: isNumber(user.jeruk) ? user.jeruk : 0,
        job: typeof user.job === 'string' ? user.job : 'Pengangguran',
        joincount: isNumber(user.joincount) ? user.joincount : 2,
        joinlimit: isNumber(user.joinlimit) ? user.joinlimit : 1,
        judilast: isNumber(user.judilast) ? user.judilast : 0,
        kaleng: isNumber(user.kaleng) ? user.kaleng : 0,
        kambing: isNumber(user.kambing) ? user.kambing : 0,
        kangkung: isNumber(user.kangkung) ? user.kangkung : 0,
        kapak: isNumber(user.kapak) ? user.kapak : 0,
        kardus: isNumber(user.kardus) ? user.kardus : 0,
        katana: isNumber(user.katana) ? user.katana : 0,
        katanadurability: isNumber(user.katanadurability) ? user.katanadurability : 0,
        kayu: isNumber(user.kayu) ? user.kayu : 0,
        kentang: isNumber(user.kentang) ? user.kentang : 0,
        kentanggoreng: isNumber(user.kentanggoreng) ? user.kentanggoreng : 0,
        kepiting: isNumber(user.kepiting) ? user.kepiting : 0,
        kepitingbakar: isNumber(user.kepitingbakar) ? user.kepitingbakar : 0,
        kerbau: isNumber(user.kerbau) ? user.kerbau : 0,
        kerjadelapan: isNumber(user.kerjadelapan) ? user.kerjadelapan : 0,
        kerjadelapanbelas: isNumber(user.kerjadelapanbelas) ? user.kerjadelapanbelas : 0,
        kerjadua: isNumber(user.kerjadua) ? user.kerjadua : 0,
        kerjaduabelas: isNumber(user.kerjaduabelas) ? user.kerjaduabelas : 0,
        kerjaduadelapan: isNumber(user.kerjaduadelapan) ? user.kerjaduadelapan : 0,
        kerjaduadua: isNumber(user.kerjaduadua) ? user.kerjaduadua : 0,
        kerjaduaempat: isNumber(user.kerjaduaempat) ? user.kerjaduaempat : 0,
        kerjaduaenam: isNumber(user.kerjaduaenam) ? user.kerjaduaenam : 0,
        kerjadualima: isNumber(user.kerjadualima) ? user.kerjadualima : 0,
        kerjaduapuluh: isNumber(user.kerjaduapuluh) ? user.kerjaduapuluh : 0,
        kerjaduasatu: isNumber(user.kerjaduasatu) ? user.kerjaduasatu : 0,
        kerjaduasembilan: isNumber(user.kerjaduasembilan) ? user.kerjaduasembilan : 0,
        kerjaduatiga: isNumber(user.kerjaduatiga) ? user.kerjaduatiga : 0,
        kerjaduatujuh: isNumber(user.kerjaduatujuh) ? user.kerjaduatujuh : 0,
        kerjaempat: isNumber(user.kerjaempat) ? user.kerjaempat : 0,
        kerjaempatbelas: isNumber(user.kerjaempatbelas) ? user.kerjaempatbelas : 0,
        kerjaenam: isNumber(user.kerjaenam) ? user.kerjaenam : 0,
        kerjaenambelas: isNumber(user.kerjaenambelas) ? user.kerjaenambelas : 0,
        kerjalima: isNumber(user.kerjalima) ? user.kerjalima : 0,
        kerjalimabelas: isNumber(user.kerjalimabelas) ? user.kerjalimabelas : 0,
        kerjasatu: isNumber(user.kerjasatu) ? user.kerjasatu : 0,
        kerjasebelas: isNumber(user.kerjasebelas) ? user.kerjasebelas : 0,
        kerjasembilan: isNumber(user.kerjasembilan) ? user.kerjasembilan : 0,
        kerjasembilanbelas: isNumber(user.kerjasembilanbelas) ? user.kerjasembilanbelas : 0,
        kerjasepuluh: isNumber(user.kerjasepuluh) ? user.kerjasepuluh : 0,
        kerjatiga: isNumber(user.kerjatiga) ? user.kerjatiga : 0,
        kerjatigabelas: isNumber(user.kerjatigabelas) ? user.kerjatigabelas : 0,
        kerjatigapuluh: isNumber(user.kerjatigapuluh) ? user.kerjatigapuluh : 0,
        kerjatujuh: isNumber(user.kerjatujuh) ? user.kerjatujuh : 0,
        kerjatujuhbelas: isNumber(user.kerjatujuhbelas) ? user.kerjatujuhbelas : 0,
        korbanngocok: isNumber(user.korbanngocok) ? user.korbanngocok : 0,
        kubis: isNumber(user.kubis) ? user.kubis : 0,
        kucing: isNumber(user.kucing) ? user.kucing : 0,
        kucinglastclaim: isNumber(user.kucinglastclaim) ? user.kucinglastclaim : 0,
        kuda: isNumber(user.kuda) ? user.kuda : 0,
        kudalastclaim: isNumber(user.kudalastclaim) ? user.kudalastclaim : 0,
        kumba: isNumber(user.kumba) ? user.kumba : 0,
        kyubi: isNumber(user.kyubi) ? user.kyubi : 0,
        kyubilastclaim: isNumber(user.kyubilastclaim) ? user.kyubilastclaim : 0,
        labu: isNumber(user.labu) ? user.labu : 0,
        laper: isNumber(user.laper) ? user.laper : 100,
        lastadventure: isNumber(user.lastadventure) ? user.lastadventure : 0,
        lastberbru: isNumber(user.lastberbru) ? user.lastberbru : 0,
        lastberkebon: isNumber(user.lastberkebon) ? user.lastberkebon : 0,
        lastbunga: isNumber(user.lastbunga) ? user.lastbunga : 0,
        lastbunuhi: isNumber(user.lastbunuhi) ? user.lastbunuhi : 0,
        lastcoins: isNumber(user.lastcoins) ? user.lastcoins : 0,
        lastclaim: isNumber(user.lastclaim) ? user.lastclaim : 0,
        lastcode: isNumber(user.lastcode) ? user.lastcode : 0,
        lastcofre: isNumber(user.lastcofre) ? user.lastcofre : 0,
        lastcrusade: isNumber(user.lastcrusade) ? user.lastcrusade : 0,
        lastdaang: isNumber(user.lastdaang) ? user.lastdaang : 0,
        lastdagang: isNumber(user.lastdagang) ? user.lastdagang : 0,
        lastdiamantes: isNumber(user.lastdiamantes) ? user.lastdiamantes : 0,
        lastduel: isNumber(user.lastduel) ? user.lastduel : 0,
        lastdungeon: isNumber(user.lastdungeon) ? user.lastdungeon : 0,
        lasteasy: isNumber(user.lasteasy) ? user.lasteasy : 0,
        lastfight: isNumber(user.lastfight) ? user.lastfight : 0,
        lastfishing: isNumber(user.lastfishing) ? user.lastfishing : 0,
        lastgojek: isNumber(user.lastgojek) ? user.lastgojek : 0,
        lastgrab: isNumber(user.lastgrab) ? user.lastgrab : 0,
        lasthourly: isNumber(user.lasthourly) ? user.lasthourly : 0,
        lasthunt: isNumber(user.lasthunt) ? user.lasthunt : 0,
        lastjb: isNumber(user.lastjb) ? user.lastjb : 0,
        lastkill: isNumber(user.lastkill) ? user.lastkill : 0,
        lastlink: isNumber(user.lastlink) ? user.lastlink : 0,
        lastlumber: isNumber(user.lastlumber) ? user.lastlumber : 0,
        lastmancingeasy: isNumber(user.lastmancingeasy) ? user.lastmancingeasy : 0,
        lastmancingextreme: isNumber(user.lastmancingextreme) ? user.lastmancingextreme : 0,
        lastmancinghard: isNumber(user.lastmancinghard) ? user.lastmancinghard : 0,
        lastmancingnormal: isNumber(user.lastmancingnormal) ? user.lastmancingnormal : 0,
        lastmining: isNumber(user.lastmining) ? user.lastmining : 0,
        lastmisi: isNumber(user.lastmisi) ? user.lastmisi : 0,
        lastmonthly: isNumber(user.lastmonthly) ? user.lastmonthly : 0,
        lastmulung: isNumber(user.lastmulung) ? user.lastmulung : 0,
        lastnambang: isNumber(user.lastnambang) ? user.lastnambang : 0,
        lastnebang: isNumber(user.lastnebang) ? user.lastnebang : 0,
        lastngocok: isNumber(user.lastngocok) ? user.lastngocok : 0,
        lastngojek: isNumber(user.lastngojek) ? user.lastngojek : 0,
        lastopen: isNumber(user.lastopen) ? user.lastopen : 0,
        lastpekerjaan: isNumber(user.lastpekerjaan) ? user.lastpekerjaan : 0,
        lastpago: isNumber(user.lastpago) ? user.lastpago : 0,
        lastpotionclaim: isNumber(user.lastpotionclaim) ? user.lastpotionclaim : 0,
        lastramuanclaim: isNumber(user.lastramuanclaim) ? user.lastramuanclaim : 0,
        lastspam: isNumber(user.lastspam) ? user.lastspam : 0,
        lastrob: isNumber(user.lastrob) ? user.lastrob : 0,
        lastroket: isNumber(user.lastroket) ? user.lastroket : 0,
        lastseen: isNumber(user.lastseen) ? user.lastseen : 0,
        lastSetStatus: isNumber(user.lastSetStatus) ? user.lastSetStatus : 0,
        lastsironclaim: isNumber(user.lastsironclaim) ? user.lastsironclaim : 0,
        lastsmancingclaim: isNumber(user.lastsmancingclaim) ? user.lastsmancingclaim : 0,
        laststringclaim: isNumber(user.laststringclaim) ? user.laststringclaim : 0,
        lastswordclaim: isNumber(user.lastswordclaim) ? user.lastswordclaim : 0,
        lastturu: isNumber(user.lastturu) ? user.lastturu : 0,
        lastwarpet: isNumber(user.lastwarpet) ? user.lastwarpet : 0,
        lastweaponclaim: isNumber(user.lastweaponclaim) ? user.lastweaponclaim : 0,
        lastweekly: isNumber(user.lastweekly) ? user.lastweekly : 0,
        lastwork: isNumber(user.lastwork) ? user.lastwork : 0,
        lbars: typeof user.lbars === 'string' ? user.lbars : '[▒▒▒▒▒▒▒▒▒]',
        legendary: isNumber(user.legendary) ? user.legendary : 0,
        lele: isNumber(user.lele) ? user.lele : 0,
        leleb: isNumber(user.leleb) ? user.leleb : 0,
        lelebakar: isNumber(user.lelebakar) ? user.lelebakar : 0,
        leleg: isNumber(user.leleg) ? user.leleg : 0,
        level: isNumber(user.level) ? user.level : 0,
        limit: isNumber(user.limit) ? user.limit : 20,
        limitjoinfree: isNumber(user.limitjoinfree) ? user.limitjoinfree : 1,
        lion: isNumber(user.lion) ? user.lion : 0,
        lionexp: isNumber(user.lionexp) ? user.lionexp : 0,
        lionlastfeed: isNumber(user.lionlastfeed) ? user.lionlastfeed : 0,
        lobster: isNumber(user.lobster) ? user.lobster : 0,
        lumba: isNumber(user.lumba) ? user.lumba : 0,
        magicwand: isNumber(user.magicwand) ? user.magicwand : 0,
        magicwanddurability: isNumber(user.magicwanddurability) ? user.magicwanddurability : 0,
        makanan: isNumber(user.makanan) ? user.makanan : 0,
        makanancentaur: isNumber(user.makanancentaur) ? user.makanancentaur : 0,
        makanangriffin: isNumber(user.makanangriffin) ? user.makanangriffin : 0,
        makanankyubi: isNumber(user.makanankyubi) ? user.makanankyubi : 0,
        makanannaga: isNumber(user.makanannaga) ? user.makanannaga : 0,
        makananpet: isNumber(user.makananpet) ? user.makananpet : 0,
        makananphonix: isNumber(user.makananphonix) ? user.makananphonix : 0,
        makananserigala: isNumber(user.makananserigala) ? user.makananserigala : 0,
        mana: isNumber(user.mana) ? user.mana : 20,
        mangga: isNumber(user.mangga) ? user.mangga : 0,
        misi: typeof user.misi === 'string' ? user.misi : '',
        money: isNumber(user.money) ? user.money : 15,
        monyet: isNumber(user.monyet) ? user.monyet : 0,
        mythic: isNumber(user.mythic) ? user.mythic : 0,
        naga: isNumber(user.naga) ? user.naga : 0,
        nagalastclaim: isNumber(user.nagalastclaim) ? user.nagalastclaim : 0,
        name: typeof user.name === 'string' ? user.name : 'Pengguna',
        namecustom: typeof user.namecustom === 'string' ? user.namecustom : '',
        namecustomactive: typeof user.namecustomactive === 'boolean' ? user.namecustomactive : false,
        namecolor: typeof user.namecolor === 'string' ? user.namecolor : '',
        nature: isNumber(user.nature) ? user.nature : 0,
        nfish: isNumber(user.nfish) ? user.nfish : 0,
        nikan: isNumber(user.nikan) ? user.nikan : 0,
        nkk: isNumber(user.nkk) ? user.nkk : 0,
        npc: isNumber(user.npc) ? user.npc : 0,
        obor: isNumber(user.obor) ? user.obor : 0,
        obat: isNumber(user.obat) ? user.obat : 0,
        pet: isNumber(user.pet) ? user.pet : 0,
        petlastclaim: isNumber(user.petlastclaim) ? user.petlastclaim : 0,
        petname: typeof user.petname === 'string' ? user.petname : '',
        petnameset: typeof user.petnameset === 'boolean' ? user.petnameset : false,
        petnamecustom: typeof user.petnamecustom === 'string' ? user.petnamecustom : '',
        petnamecolor: typeof user.petnamecolor === 'string' ? user.petnamecolor : '',
        petnamelastclaim: isNumber(user.petnamelastclaim) ? user.petnamelastclaim : 0,
        pets: typeof user.pets === 'string' ? user.pets : '',
        phoenix: isNumber(user.phoenix) ? user.phoenix : 0,
        phoenixexp: isNumber(user.phoenixexp) ? user.phoenixexp : 0,
        phoenixlastfeed: isNumber(user.phoenixlastfeed) ? user.phoenixlastfeed : 0,
        pohon: isNumber(user.pohon) ? user.pohon : 0,
        power: isNumber(user.power) ? user.power : 0,
        powerlevel: isNumber(user.powerlevel) ? user.powerlevel : 0,
        premid: isNumber(user.premid) ? user.premid : 0,
        potion: isNumber(user.potion) ? user.potion : 0,
        potionlastclaim: isNumber(user.potionlastclaim) ? user.potionlastclaim : 0,
        profilpic: typeof user.profilpic === 'string' ? user.profilpic : '',
        prop: isNumber(user.prop) ? user.prop : 0,
        propavatar: isNumber(user.propavatar) ? user.propavatar : 0,
        puri: isNumber(user.puri) ? user.puri : 0,
        rage: isNumber(user.rage) ? user.rage : 0,
        ranking: isNumber(user.ranking) ? user.ranking : 0,
        rebirth: isNumber(user.rebirth) ? user.rebirth : 0,
        rumput: isNumber(user.rumput) ? user.rumput : 0,
        sapphire: isNumber(user.sapphire) ? user.sapphire : 0,
        satelit: isNumber(user.satelit) ? user.satelit : 0,
        scroll: isNumber(user.scroll) ? user.scroll : 0,
        scrollclaim: isNumber(user.scrollclaim) ? user.scrollclaim : 0,
        spade: isNumber(user.spade) ? user.spade : 0,
        spear: isNumber(user.spear) ? user.spear : 0,
        spellbook: isNumber(user.spellbook) ? user.spellbook : 0,
        spellbookdurability: isNumber(user.spellbookdurability) ? user.spellbookdurability : 0,
        spion: isNumber(user.spion) ? user.spion : 0,
        spionlastclaim: isNumber(user.spionlastclaim) ? user.spionlastclaim : 0,
        star: isNumber(user.star) ? user.star : 0,
        stones: isNumber(user.stones) ? user.stones : 0,
        swords: isNumber(user.swords) ? user.swords : 0,
        status: typeof user.status === 'string' ? user.status : 'Daring',
        summoning: isNumber(user.summoning) ? user.summoning : 0,
        tambang: isNumber(user.tambang) ? user.tambang : 0,
        tambangbatu: isNumber(user.tambangbatu) ? user.tambangbatu : 0,
        tambangemas: isNumber(user.tambangemas) ? user.tambangemas : 0,
        tambangintan: isNumber(user.tambangintan) ? user.tambangintan : 0,
        tambangperak: isNumber(user.tambangperak) ? user.tambangperak : 0,
        tambangrubies: isNumber(user.tambangrubies) ? user.tambangrubies : 0,
        tambangserpentine: isNumber(user.tambangserpentine) ? user.tambangserpentine : 0,
        tambangyogurt: isNumber(user.tambangyogurt) ? user.tambangyogurt : 0,
        tambangzinc: isNumber(user.tambangzinc) ? user.tambangzinc : 0,
        tempahp: isNumber(user.tempahp) ? user.tempahp : 0,
        tumpeng: isNumber(user.tumpeng) ? user.tumpeng : 0,
        ufo: isNumber(user.ufo) ? user.ufo : 0,
        upgrade: isNumber(user.upgrade) ? user.upgrade : 0,
        upgradeexp: isNumber(user.upgradeexp) ? user.upgradeexp : 0,
        weapon: isNumber(user.weapon) ? user.weapon : 0,
        weaponlastclaim: isNumber(user.weaponlastclaim) ? user.weaponlastclaim : 0,
        wind: isNumber(user.wind) ? user.wind : 0,
        wisdom: isNumber(user.wisdom) ? user.wisdom : 10,
        xp: isNumber(user.xp) ? user.xp : 0,
        xx: isNumber(user.xx) ? user.xx : 0,
        language: typeof user.language === 'string' ? user.language : 'es'
      })
      if (typeof user !== 'object') {
        global.db.data.users[m.sender] = {};
      }
      if (m.sender && !m.sender.endsWith('@lid')) {
        global.db.data.users[m.sender] = userDatabase(global.db.data.users[m.sender] || {})
      }
      /* Creditos a Otosaka (https://wa.me/51993966345) */

      const chatgptUser = global.chatgpt.data.users[m.sender];
      if (typeof chatgptUser !== 'object') {
        global.chatgpt.data.users[m.sender] = [];
      }

      /* ------------------------------------------------*/
      
      
      const akinator = global.db.data.users[m.sender].akinator;
      if (typeof akinator !== 'object') {
        global.db.data.users[m.sender].akinator = {};
      }
      const akiData = (akinator) => ({
          sesi: akinator.sesi || false,
          server: akinator.server || null,
          frontaddr: akinator.frontaddr || null,
          session: akinator.session || null,
          signature: akinator.signature || null,
          question: akinator.session || null,
          progression: akinator.progression || null,
          step: akinator.step || null,
          soal: akinator.soal || null,
      })
      if (akinator) {
        global.db.data.users[m.sender].akinator = akiData(akinator || {})
      }
      
      const gameglx = global.db.data.users[m.sender].gameglx
      if (typeof gameglx !== 'object') {
        gameglx = global.db.data.users[m.sender].gameglx = {}
      }
      if (gameglx) {

        if (!('status' in gameglx)) gameglx.status = false;
        if (!('notificacao' in gameglx)) gameglx.notificacao = {};
        if (!('recebidas' in gameglx.notificacao)) gameglx.notificacao.recebidas = [];
        // Perfil
        if (!('perfil' in gameglx)) gameglx.perfil = {};
        if (!('nome' in gameglx.perfil)) gameglx.perfil.nome = null;
        if (!('poder' in gameglx.perfil)) gameglx.perfil.poder = 500;
        if (!('nivel' in gameglx.perfil)) gameglx.perfil.nivel = {};
        if (!('nome' in gameglx.perfil.nivel)) gameglx.perfil.nivel.nome = 'Iniciante';
        if (!('id' in gameglx.perfil.nivel)) gameglx.perfil.nivel.id = 0;
        if (!('proximoNivel' in gameglx.perfil.nivel)) gameglx.perfil.nivel.proximoNivel = 1;
        if (!('xp' in gameglx.perfil)) gameglx.perfil.xp = 112;
        if (!('idioma' in gameglx.perfil)) gameglx.perfil.idioma = 'pt-br'; // Definindo padrão 
        if (!('minerando' in gameglx.perfil)) gameglx.perfil.minerando = false;
        if (!('id' in gameglx.perfil)) gameglx.perfil.id = null;
        if (!('username' in gameglx.perfil)) gameglx.perfil.username = null;
        // Casa
        if (!('casa' in gameglx.perfil)) gameglx.perfil.casa = {};
        if (!('id' in gameglx.perfil.casa)) gameglx.perfil.casa.id = null;
        if (!('idpelonome' in gameglx.perfil.casa)) gameglx.perfil.casa.idpelonome = 'terra';
        if (!('planeta' in gameglx.perfil.casa)) gameglx.perfil.casa.planeta = null;
        if (!('colonia' in gameglx.perfil.casa)) gameglx.perfil.casa.colonia = null; // Definir como null em vez de objeto vazio
        if (gameglx.perfil.casa.colonia === null) gameglx.perfil.casa.colonia = {}; // Verificar se é null antes de definir como objeto vazio
        if (!('nome' in gameglx.perfil.casa.colonia)) gameglx.perfil.casa.colonia.nome = null;
        if (!('id' in gameglx.perfil.casa.colonia)) gameglx.perfil.casa.colonia.id = 1;
        if (!('habitante' in gameglx.perfil.casa.colonia)) gameglx.perfil.casa.colonia.habitante = false;

        // Carteira Dinheiro
        if (!('carteira' in gameglx.perfil)) gameglx.perfil.carteira = {};
        if (!('currency' in gameglx.perfil.carteira)) gameglx.perfil.carteira.currency = 'BRL'; // Definindo padrão 
        if (!('saldo' in gameglx.perfil.carteira)) gameglx.perfil.carteira.saldo = 1500;
        // localizacao
        if (!('localizacao' in gameglx.perfil)) gameglx.perfil.localizacao = {};
        if (!('status' in gameglx.perfil.localizacao)) gameglx.perfil.localizacao.status = false;
        if (!('nomeplaneta' in gameglx.perfil.localizacao)) gameglx.perfil.localizacao.nomeplaneta = null;
        if (!('idpelonome' in gameglx.perfil.localizacao)) gameglx.perfil.localizacao.idpelonome = null;
        if (!('viajando' in gameglx.perfil.localizacao)) gameglx.perfil.localizacao.idpelonome = false;
        if (!('id' in gameglx.perfil.localizacao)) gameglx.perfil.localizacao.id = null;
        //Posição  na casa Colonia
        if (!('posicao' in gameglx.perfil.casa.colonia)) gameglx.perfil.casa.colonia.posicao = {};
        if (!('x' in gameglx.perfil.casa.colonia.posicao)) gameglx.perfil.casa.colonia.posicao.x = 0;
        if (!('y' in gameglx.perfil.casa.colonia.posicao)) gameglx.perfil.casa.colonia.posicao.y = 0;
        
        //Posição  em viagens se necessario
        if (!('posicao' in gameglx.perfil.localizacao)) gameglx.perfil.localizacao.posicao = {};
        if (!('x' in gameglx.perfil.localizacao.posicao)) gameglx.perfil.localizacao.posicao.x = 0;
        if (!('y' in gameglx.perfil.localizacao.posicao)) gameglx.perfil.localizacao.posicao.y = 0;
        // nave
        if (!('nave' in gameglx.perfil)) gameglx.perfil.nave = {};
        if (!('nome' in gameglx.perfil.nave)) gameglx.perfil.nave.status = false;
        if (!('id' in gameglx.perfil.nave)) gameglx.perfil.nave.id = null;
        if (!('nome' in gameglx.perfil.nave)) gameglx.perfil.nave.nome = null;
        if (!('velocidade' in gameglx.perfil.nave)) gameglx.perfil.nave.velocidade = null;
        if (!('poder' in gameglx.perfil.nave)) gameglx.perfil.nave.poder = null;
        if (!('valor' in gameglx.perfil.nave)) gameglx.perfil.nave.valor = null;
        // Bolsa
        if (!('bolsa' in gameglx.perfil)) gameglx.perfil.bolsa = {};
        if (!('itens' in gameglx.perfil.bolsa)) gameglx.perfil.bolsa.itens = {};
        if (!('madeira' in gameglx.perfil.bolsa.itens)) gameglx.perfil.bolsa.itens.madeira = 1
        if (!('ferro' in gameglx.perfil.bolsa.itens)) gameglx.perfil.bolsa.itens.ferro = 1
        if (!('diamante' in gameglx.perfil.bolsa.itens)) gameglx.perfil.bolsa.itens.diamante = 1
        if (!('esmeralda' in gameglx.perfil.bolsa.itens)) gameglx.perfil.bolsa.itens.esmeralda = 1
        if (!('carvao' in gameglx.perfil.bolsa.itens)) gameglx.perfil.bolsa.itens.carvao = 1
        if (!('ouro' in gameglx.perfil.bolsa.itens)) gameglx.perfil.bolsa.itens.ouro = 1
        if (!('quartzo' in gameglx.perfil.bolsa.itens)) gameglx.perfil.bolsa.itens.quartzo = 1
        // Bolsa - naves
        if (!('naves' in gameglx.perfil.bolsa)) gameglx.perfil.bolsa.naves = {};
        if (!('compradas' in gameglx.perfil.bolsa.naves)) gameglx.perfil.bolsa.naves.compradas = [];
        if (!('status' in gameglx.perfil.bolsa.naves)) gameglx.perfil.bolsa.naves.status = false;
        // Função de ataque 
        if(!('ataque' in gameglx.perfil)) gameglx.perfil.ataque = null
        if (gameglx.perfil.ataque === null) gameglx.perfil.ataque = {};
        if (!('sendoAtacado' in gameglx.perfil.ataque)) gameglx.perfil.ataque.sendoAtacado = {};
        if (!('status' in gameglx.perfil.ataque.sendoAtacado)) gameglx.perfil.ataque.sendoAtacado.status = false;
        if (!('atacante' in gameglx.perfil.ataque.sendoAtacado)) gameglx.perfil.ataque.sendoAtacado.atacante = null;
        if (!('forcaAtaque' in gameglx.perfil.ataque)) gameglx.perfil.ataque.forcaAtaque = {};
        if (!('ataque' in gameglx.perfil.ataque.forcaAtaque)) gameglx.perfil.ataque.forcaAtaque.ataque = 10;
        if (!('data' in gameglx.perfil.ataque)) gameglx.perfil.ataque.data = {};
        if (!('dia' in gameglx.perfil.ataque.data)) gameglx.perfil.ataque.data.dia = 0;
        if (!('hora' in gameglx.perfil.ataque.data)) gameglx.perfil.ataque.data.hora = 0;
        if (!('contagem' in gameglx.perfil.ataque.data)) gameglx.perfil.ataque.data.contagem = 0;
        // Defesa
        if(!('defesa' in gameglx.perfil)) gameglx.perfil.defesa = {};
        if(!('forca' in gameglx.perfil.defesa)) gameglx.perfil.defesa.forca = 100;
        if(!('ataque' in gameglx.perfil.defesa)) gameglx.perfil.defesa.ataque = 40 ;


      } else {
        global.db.data.users[m.sender].gameglx = {
          status: false,
          notificacao: {
            recebidas:[]
          },
          perfil: {
            xp: 112,
            nivel: {
              nome: 'Iniciante',
              id: 0,
              proximoNivel: 1
            },
            poder: 500,
            minerando: false,
            nome: null,
            username: null,
            id: null, // Id do Jogador
            idioma: 'pt-br',
            casa: {
              id: null, // id do grupo ou seja do planeta casa
              planeta: null,
              idpelonome: 'terra',
              colonia: {
                id: 1,
                nome: null,
                habitante: false,
                posicao: {
                  x: 0,
                  y: 0,
                }
              },

            },
            carteira: {
              currency: 'BRL',
              saldo: 1500,
            },
            localizacao: {
              status: false,
              nomeplaneta: null,  // id do grupo...
              id: null,
              idpelonome: null,
              viajando: false,
              posicao: {
                x: 0,
                y: 0,
              }
            },
            nave: {
              status: false,
              id: null,
              nome: null,
              velocidade: null,
              poder: null,
              valor: null,

            },
            bolsa: {
              itens: {
                madeira: 1,
                ferro: 1,
                diamante: 1,
                esmeralda: 2,
                carvao: 1,
                ouro: 1,
                quartzo: 1
              },
              naves: {
                status: false,
                compradas: []
              }
            },
            ataque: {
              data: {
                hora: 0,
                contagem: 0 
              },
              sendoAtacado: {
                status: false,
                atacante: null,
              },
              forcaAtaque : {
                ataque: 10
              }
            },
            defesa : {
              forca: 200,
              ataque: 30
            }
          }
        };
      }


      const chat = global.db.data.chats[m.chat];
      if (typeof chat !== 'object') {
        global.db.data.chats[m.chat] = {};
      }
      if (chat) {
        if (!('language' in chat)) chat.language = 'es';
        if (!('isBanned' in chat)) chat.isBanned = false;
        if (!('welcome' in chat)) chat.welcome = true;
        if (!('detect' in chat)) chat.detect = true;
        if (!('detect2' in chat)) chat.detect2 = false;
        if (!('sWelcome' in chat)) chat.sWelcome = '';
        if (!('sBye' in chat)) chat.sBye = '';
        if (!('sPromote' in chat)) chat.sPromote = '';
        if (!('sDemote' in chat)) chat.sDemote = '';
        if (!('delete' in chat)) chat.antidelete = false;
        if (!('modohorny' in chat)) chat.modohorny = false;
        if (!('autosticker' in chat)) chat.autosticker = false;
        if (!('audios' in chat)) chat.audios = false;
        if (!('antiLink' in chat)) chat.antiLink = false;
        if (!('antiLink2' in chat)) chat.antiLink2 = false;
        if (!('antiviewonce' in chat)) chat.antiviewonce = false;
        if (!('antiToxic' in chat)) chat.antiToxic = false;
        if (!('antiTraba' in chat)) chat.antiTraba = false;
        if (!('antiArab' in chat)) chat.antiArab = false;
        if (!('antiArab2' in chat)) chat.antiArab2 = false;
        if (!('antiporno' in chat)) chat.antiporno = false;
        if (!('game' in chat)) chat.game = true;
        if (!('modoadmin' in chat)) chat.modoadmin = false;
        if (!('simi' in chat)) chat.simi = false;
        if (!isNumber(chat.expired)) chat.expired = 0;
      } else {
        global.db.data.chats[m.chat] = {
          isBanned: false,
          welcome: true,
          detect: true,
          detect2: false,
          sWelcome: '',
          sBye: '',
          sPromote: '',
          sDemote: '',
          antidelete: false,
          modohorny: true,
          autosticker: false,
          audios: true,
          antiLink: false,
          antiLink2: false,
          antiviewonce: false,
          antiToxic: false,
          antiTraba: false,
          antiArab: false,
          antiArab2: false,
          antiporno: false,
          modoadmin: false,
          simi: false,
          game: true,
          expired: 0,
          language: 'es',
        };
      }
      const settings = global.db.data.settings[this.user.jid];
      if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {};
      if (settings) {
        if (!('self' in settings)) settings.self = false;
        if (!('autoread' in settings)) settings.autoread = false;
        if (!('autoread2' in settings)) settings.autoread2 = false;
        if (!('restrict' in settings)) settings.restrict = false;
        if (!('antiCall' in settings)) settings.antiCall = false;
        if (!('antiPrivate' in settings)) settings.antiPrivate = false;
        if (!('modejadibot' in settings)) settings.modejadibot = true;
        if (!('antispam' in settings)) settings.antispam = false;
        if (!('audios_bot' in settings)) settings.audios_bot = true;
        if (!('modoia' in settings)) settings.modoia = false;
      } else {
        global.db.data.settings[this.user.jid] = {
          self: false,
          autoread: false,
          autoread2: false,
          restrict: false,
          antiCall: false,
          antiPrivate: false,
          modejadibot: true,
          antispam: false,
          audios_bot: true,
          modoia: false
        };
      }
    } catch (e) {
      console.error(e);
    }

    const idioma = global.db.data.users[m.sender]?.language || 'es';
    const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
    const tradutor = _translate.handler.handler

    if (opts['nyimak']) {
      return;
    }
    if (!m.fromMe && opts['self']) {
      return;
    }
    if (opts['pconly'] && m.chat.endsWith('g.us')) {
      return;
    }
    if (opts['gconly'] && !m.chat.endsWith('g.us')) {
      return;
    }
    if (opts['swonly'] && m.chat !== 'status@broadcast') {
      return;
    }
    if (typeof m.text !== 'string') {
      m.text = '';
    }
    const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map((v) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
    const isOwner = isROwner || m.fromMe;
    const isMods = isOwner || global.mods.map((v) => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net').includes(m.sender);
    const isPrems = isROwner || isOwner || isMods || global.db.data.users[m.sender].premiumTime > 0; // || global.db.data.users[m.sender].premium = 'true'

    if (opts['queque'] && m.text && !(isMods || isPrems)) {
      const queque = this.msgqueque; const time = 1000 * 5;
      const previousID = queque[queque.length - 1];
      queque.push(m.id || m.key.id);
      setInterval(async function () {
        if (queque.indexOf(previousID) === -1) clearInterval(this);
        await delay(time);
      }, time);
    }

    if (m.isBaileys) {
      return;
    }
    m.exp += Math.ceil(Math.random() * 10);

    let usedPrefix;
    const _user = global.db.data && global.db.data.users && global.db.data.users[m.sender];

    const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch((_) => null)) : {}) || {};
    const participants = (m.isGroup ? groupMetadata.participants : []) || [];
    const user = (m.isGroup ? participants.find((u) => conn.decodeJid(u.id) === m.sender) : {}) || {}; // User Data
    const bot = (m.isGroup ? participants.find((u) => conn.decodeJid(u.id) == this.user.jid) : {}) || {}; // Your Data
    const isRAdmin = user?.admin == 'superadmin' || false;
    const isAdmin = isRAdmin || user?.admin == 'admin' || false; // Is User Admin?
    const isBotAdmin = bot?.admin || false; // Are you Admin?

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');
    for (const name in global.plugins) {
      const plugin = global.plugins[name];
      if (!plugin) {
        continue;
      }
      if (plugin.disabled) {
        continue;
      }
      const __filename = join(___dirname, name);
      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
            chatUpdate,
            __dirname: ___dirname,
            __filename,
          });
        } catch (e) {
          // if (typeof e === 'string') continue
          console.error(e);
          /* for (const [jid] of global.reportes_solicitudes.filter(([number]) => number)) {
            const data = (await conn.onWhatsApp(jid))[0] || {};
            if (data.exists) {
              await m.reply(`*[ ⚠️ 𝚁𝙴𝙿𝙾𝚁𝚃𝙴 𝙳𝙴 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙲𝙾𝙽 𝙵𝙰𝙻𝙻𝙾𝚂 ⚠️ ]*\n\n*—◉ 𝙿𝙻𝚄𝙶𝙸𝙽:* ${name}\n*—◉ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${m.sender}\n*—◉ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾:* ${m.text}\n\n*—◉ 𝙴𝚁𝚁𝙾𝚁:*\n\`\`\`${format(e)}\`\`\`\n\n*[❗] 𝚁𝙴𝙿𝙾𝚁𝚃𝙴𝙻𝙾 𝙰𝙻 𝙲𝚁𝙴𝙰𝙳𝙾𝚁 𝙳𝙴𝙻 𝙱𝙾𝚃 𝙿𝙰𝚁𝙰 𝙳𝙰𝚁𝙻𝙴 𝚄𝙽𝙰 𝚂𝙾𝙻𝚄𝙲𝙸𝙾𝙽, 𝙿𝚄𝙴𝙳𝙴 𝚄𝚂𝙰𝚁 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 #reporte*`.trim(), data.jid);
            }
          }*/
          const md5c = fs.readFileSync('./plugins/' + m.plugin);
          fetch('https://themysticbot.cloud:2083/error', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: conn.user.jid, plugin: m.plugin, command: `${m.text}`, reason: format(e), md5: mddd5(md5c) }),
          });
        }
      }
      if (!opts['restrict']) {
        if (plugin.tags && plugin.tags.includes('admin')) {
          // global.dfail('restrict', m, this)
          continue;
        }
      }
      const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      const _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;
      const match = (_prefix instanceof RegExp ? // RegExp Mode?
        [[_prefix.exec(m.text), _prefix]] :
        Array.isArray(_prefix) ? // Array?
          _prefix.map((p) => {
            const re = p instanceof RegExp ? // RegExp in Array?
              p :
              new RegExp(str2Regex(p));
            return [re.exec(m.text), re];
          }) :
          typeof _prefix === 'string' ? // String?
            [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
            [[[], new RegExp]]
      ).find((p) => p[1]);
      if (typeof plugin.before === 'function') {
        if (await plugin.before.call(this, m, {
          match,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename,
        })) {
          continue;
        }
      }
      if (typeof plugin !== 'function') {
        continue;
      }
      if ((usedPrefix = (match[0] || '')[0])) {
        const noPrefix = m.text.replace(usedPrefix, '');
        let [command, ...args] = noPrefix.trim().split` `.filter((v) => v);
        args = args || [];
        const _args = noPrefix.trim().split` `.slice(1);
        const text = _args.join` `;
        command = (command || '').toLowerCase();
        const fail = plugin.fail || global.dfail; // When failed
        const isAccept = plugin.command instanceof RegExp ? // RegExp Mode?
          plugin.command.test(command) :
          Array.isArray(plugin.command) ? // Array?
            plugin.command.some((cmd) => cmd instanceof RegExp ? // RegExp in Array?
              cmd.test(command) :
              cmd === command,
            ) :
            typeof plugin.command === 'string' ? // String?
              plugin.command === command :
              false;

        if (!isAccept) {
          continue;
        }
        m.plugin = name;
        if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
          const chat = global.db.data.chats[m.chat];
          const user = global.db.data.users[m.sender];
          const botSpam = global.db.data.settings[mconn.conn.user.jid];

          if (!['owner-unbanchat.js', 'info-creator.js'].includes(name) && chat && chat?.isBanned && !isROwner) return; // Except this
          if (name != 'owner-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && chat?.isBanned && !isROwner) return; // Except this
          //if ((name != 'owner-unbanchat.js' || name != 'owner-exec.js' || name != 'owner-exec2.js') && chat?.isBanned && !isROwner) return; // Except this

          if (m.text && user.banned && !isROwner) {
            if (typeof user.bannedMessageCount === 'undefined') {
              user.bannedMessageCount = 0;
            }

            if (user.bannedMessageCount < 3) {
              const messageNumber = user.bannedMessageCount + 1;
              const messageText = `${tradutor.texto1[0]}
${tradutor.texto1[1]} ${messageNumber}/3
 ${user.bannedReason ? `${tradutor.texto1[2]} ${user.bannedReason}` : `${tradutor.texto1[3]}`}
 ${tradutor.texto1[4]}`.trim();
              m.reply(messageText);
              user.bannedMessageCount++;
            } else if (user.bannedMessageCount === 3) {
              user.bannedMessageSent = true;
            } else {
              return;
            }
            return;
          }

          if (botSpam.antispam && m.text && user && user.lastCommandTime && (Date.now() - user.lastCommandTime) < 5000 && !isROwner) {
            if (user.commandCount === 2) {
              const remainingTime = Math.ceil((user.lastCommandTime + 5000 - Date.now()) / 1000);
              if (remainingTime > 0) {
                const messageText = `*[ ℹ️ ] Espera* _${remainingTime} segundos_ *antes de utilizar otro comando.*`;
                m.reply(messageText);
                return;
              } else {
                user.commandCount = 0;
              }
            } else {
              user.commandCount += 1;
            }
          } else {
            user.lastCommandTime = Date.now();
            user.commandCount = 1;
          }
        }
        const hl = _prefix;
        const adminMode = global.db.data.chats[m.chat].modoadmin;
        const mystica = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || hl || m.text.slice(0, 1) == hl || plugin.command}`;
        if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mystica) return;

        if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { // Both Owner
          fail('owner', m, this);
          continue;
        }
        if (plugin.rowner && !isROwner) { // Real Owner
          fail('rowner', m, this);
          continue;
        }
        if (plugin.owner && !isOwner) { // Number Owner
          fail('owner', m, this);
          continue;
        }
        if (plugin.mods && !isMods) { // Moderator
          fail('mods', m, this);
          continue;
        }
        if (plugin.premium && !isPrems) { // Premium
          fail('premium', m, this);
          continue;
        }
        if (plugin.group && !m.isGroup) { // Group Only
          fail('group', m, this);
          continue;
        } else if (plugin.botAdmin && !isBotAdmin) { // You Admin
          fail('botAdmin', m, this);
          continue;
        } else if (plugin.admin && !isAdmin) { // User Admin
          fail('admin', m, this);
          continue;
        }
        if (plugin.private && m.isGroup) { // Private Chat Only
          fail('private', m, this);
          continue;
        }
        if (plugin.register == true && _user.registered == false) { // Butuh daftar?
          fail('unreg', m, this);
          continue;
        }
        m.isCommand = true;
        const xp = 'exp' in plugin ? parseInt(plugin.exp) : 17; // XP Earning per command
        if (xp > 200) {
          m.reply('Ngecit -_-');
        } // Hehehe
        else {
          m.exp += xp;
        }
        if (!isPrems && plugin.limit && global.db.data.users[m.sender].limit < plugin.limit * 1) {
          mconn.conn.reply(m.chat, `${tradutor.texto2} _${usedPrefix}buyall_`, m);
          continue;
        }
        if (plugin.level > _user.level) {
          mconn.conn.reply(m.chat, `${tradutor.texto3[0]} ${plugin.level} ${tradutor.texto3[1]} ${_user.level}, ${tradutor.texto3[2]} ${usedPrefix}lvl ${tradutor.texto3[3]}`, m);
          continue;
        }
        const extra = {
          match,
          usedPrefix,
          noPrefix,
          _args,
          args,
          command,
          text,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename,
        };
        try {
          await plugin.call(this, m, extra);
          if (!isPrems) {
            m.limit = m.limit || plugin.limit || false;
          }
        } catch (e) {
          m.error = e;
          console.error(e);
          if (e) {
            let text = format(e);
            for (const key of Object.values(global.APIKeys)) {
              text = text.replace(new RegExp(key, 'g'), '#HIDDEN#');
            }
            if (e.name) {
              /* for (const [jid] of global.reportes_solicitudes.filter(([number]) => number)) {
                const data = (await conn.onWhatsApp(jid))[0] || {};
                if (data.exists) {
                  await m.reply(`*[ ⚠️ 𝚁𝙴𝙿𝙾𝚁𝚃𝙴 𝙳𝙴 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 𝙲𝙾𝙽 𝙵𝙰𝙻𝙻𝙾𝚂 ⚠️ ]*\n\n*—◉ 𝙿𝙻𝚄𝙶𝙸𝙽:* ${m.plugin}\n*—◉ 𝚄𝚂𝚄𝙰𝚁𝙸𝙾:* ${m.sender}\n*—◉ 𝙲𝙾𝙼𝙰𝙽𝙳𝙾:* ${usedPrefix}${command} ${args.join(' ')}\n\n\`\`\`${text}\`\`\`\n\n*[❗] 𝚁𝙴𝙿𝙾𝚁𝚃𝙴𝙻𝙾 𝙰𝙻 𝙲𝚁𝙴𝙰𝙳𝙾𝚁 𝙳𝙴𝙻 𝙱𝙾𝚃 𝙿𝙰𝚁𝙰 𝙳𝙰𝚁𝙻𝙴 𝚄𝙽𝙰 𝚂𝙾𝙻𝚄𝙲𝙸𝙾𝙽, 𝙿𝚄𝙴𝙳𝙴 𝚄𝚂𝙰𝚁 𝙴𝙻 𝙲𝙾𝙼𝙰𝙽𝙳𝙾 #reporte*`.trim(), data.jid);
                }
              }*/
              const md5c = fs.readFileSync('./plugins/' + m.plugin);
              fetch('https://themysticbot.cloud:2083/error', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ number: conn.user.jid, plugin: m.plugin, command: `${usedPrefix}${command} ${args.join(' ')}`, reason: text, md5: mddd5(md5c) }),
              }).then((res) => res.json()).then((json) => {
                console.log(json);
              }).catch((err) => {
                console.error(err);
              });
            }
            await m.reply(text);
          }
        } finally {
          // m.reply(util.format(_user))
          if (typeof plugin.after === 'function') {
            try {
              await plugin.after.call(this, m, extra);
            } catch (e) {
              console.error(e);
            }
          }
          if (m.limit) {
            m.reply(`${tradutor.texto4[0]} ` + +m.limit + ` ${tradutor.texto4[1]}`);
          }
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
  } finally {
    if (opts['queque'] && m.text) {
      const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id);
      if (quequeIndex !== -1) {
        this.msgqueque.splice(quequeIndex, 1);
      }
    }
    let user; const stats = global.db.data.stats;
    if (m) {
      if (m.sender && (user = global.db.data.users[m.sender])) {
        user.exp += m.exp;
        user.limit -= m.limit * 1;
      }

      let stat;
      if (m.plugin) {
        const now = +new Date;
        if (m.plugin in stats) {
          stat = stats[m.plugin];
          if (!isNumber(stat.total)) {
            stat.total = 1;
          }
          if (!isNumber(stat.success)) {
            stat.success = m.error != null ? 0 : 1;
          }
          if (!isNumber(stat.last)) {
            stat.last = now;
          }
          if (!isNumber(stat.lastSuccess)) {
            stat.lastSuccess = m.error != null ? 0 : now;
          }
        } else {
          stat = stats[m.plugin] = {
            total: 1,
            success: m.error != null ? 0 : 1,
            last: now,
            lastSuccess: m.error != null ? 0 : now,
          };
        }
        stat.total += 1;
        stat.last = now;
        if (m.error == null) {
          stat.success += 1;
          stat.lastSuccess = now;
        }
      }
    }

    try {
      if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this);
    } catch (e) {
      console.log(m, m.quoted, e);
    }
    const settingsREAD = global.db.data.settings[mconn.conn.user.jid] || {};
    if (opts['autoread']) await mconn.conn.readMessages([m.key]);
    if (settingsREAD.autoread2) await mconn.conn.readMessages([m.key]);
  }
}

/**
 * Handle groups participants update
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['group-participants.update']} groupsUpdate
 */
export async function participantsUpdate({ id, participants, action }) {
  /************************
   * Opção de tradução de idioma
   * 
   ***********************/
  const idioma = global.db.data.chats[id]?.language || 'es';
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.handler.participantsUpdate

  const m = mconn
  if (opts['self']) return;
  //if (m.conn.isInit) return;
  if (global.db.data == null) await loadDatabase();
  const chat = global.db.data.chats[id] || {};
  const botTt = global.db.data.settings[m.conn.user.jid] || {};
  let text = '';
  switch (action) {
    case 'add':
    case 'remove':
      if (chat.welcome && !chat?.isBanned) {
        const groupMetadata = await m.conn.groupMetadata(id) || (conn.chats[id] || {}).metadata;
        for (const user of participants) {
          let pp = 'https://raw.githubusercontent.com/BrunoSobrino/TheMystic-Bot-MD/master/src/avatar_contact.png';
          try {
            pp = await m.conn.profilePictureUrl(user, 'image');
          } catch (e) {
          } finally {
            const apii = await m.conn.getFile(pp);
            const antiArab = JSON.parse(fs.readFileSync('./src/antiArab.json'));
            const userPrefix = antiArab.some((prefix) => user.startsWith(prefix));
            const botTt2 = groupMetadata.participants.find((u) => m.conn.decodeJid(u.id) == m.conn.user.jid) || {};
            const isBotAdminNn = botTt2?.admin === 'admin' || false;
            text = (action === 'add' ? (chat.sWelcome || tradutor.texto1 || conn.welcome || 'Welcome, @user!').replace('@subject', await m.conn.getName(id)).replace('@desc', groupMetadata.desc?.toString() || '*𝚂𝙸𝙽 𝙳𝙴𝚂𝙲𝚁𝙸𝙿𝙲𝙸𝙾𝙽*') :
              (chat.sBye || tradutor.texto2 || conn.bye || 'Bye, @user!')).replace('@user', '@' + user.split('@')[0]);
            if (userPrefix && chat.antiArab && botTt.restrict && isBotAdminNn && action === 'add') {
              const responseb = await m.conn.groupParticipantsUpdate(id, [user], 'remove');
              if (responseb[0].status === '404') return;
              const fkontak2 = { 'key': { 'participants': '0@s.whatsapp.net', 'remoteJid': 'status@broadcast', 'fromMe': false, 'id': 'Halo' }, 'message': { 'contactMessage': { 'vcard': `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${user.split('@')[0]}:${user.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD` } }, 'participant': '0@s.whatsapp.net' };
              await m.conn.sendMessage(id, { text: `*[❗] @${user.split('@')[0]} ᴇɴ ᴇsᴛᴇ ɢʀᴜᴘᴏ ɴᴏ sᴇ ᴘᴇʀᴍɪᴛᴇɴ ɴᴜᴍᴇʀᴏs ᴀʀᴀʙᴇs ᴏ ʀᴀʀᴏs, ᴘᴏʀ ʟᴏ ϙᴜᴇ sᴇ ᴛᴇ sᴀᴄᴀʀᴀ ᴅᴇʟ ɢʀᴜᴘᴏ*`, mentions: [user] }, { quoted: fkontak2 });
              return;
            }
            await m.conn.sendFile(id, apii.data, 'pp.jpg', text, null, false, { mentions: [user] });
          }
        }
      }
      break;
    case 'promote':
    case 'daradmin':
    case 'darpoder':
      text = (chat.sPromote || tradutor.texto3 || conn.spromote || '@user ```is now Admin```');
    case 'demote':
    case 'quitarpoder':
    case 'quitaradmin':
      if (!text) {
        text = (chat.sDemote || tradutor.texto4 || conn.sdemote || '@user ```is no longer Admin```');
      }
      text = text.replace('@user', '@' + participants[0].split('@')[0]);
      if (chat.detect && !chat?.isBanned) {
        mconn.conn.sendMessage(id, { text, mentions: mconn.conn.parseMention(text) });
      }
      break;
  }
}

/**
 * Handle groups update
 * @param {import('@whiskeysockets/baileys').BaileysEventMap<unknown>['groups.update']} groupsUpdate
 */
export async function groupsUpdate(groupsUpdate) {
  //console.log(groupsUpdate)
  const idioma = global.db.data.chats[groupsUpdate[0].id]?.language || 'es';
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.handler.participantsUpdate

  if (opts['self']) {
    return;
  }
  for (const groupUpdate of groupsUpdate) {
    const id = groupUpdate.id;
    if (!id) continue;
    if (groupUpdate.size == NaN) continue;
    if (groupUpdate.subjectTime) continue;
    const chats = global.db.data.chats[id]; let text = '';
    if (!chats?.detect) continue;
    if (groupUpdate.desc) text = (chats.sDesc || tradutor.texto5 || conn.sDesc || '```Description has been changed to```\n@desc').replace('@desc', groupUpdate.desc);
    if (groupUpdate.subject) text = (chats.sSubject || tradutor.texto6 || conn.sSubject || '```Subject has been changed to```\n@subject').replace('@subject', groupUpdate.subject);
    if (groupUpdate.icon) text = (chats.sIcon || tradutor.texto7 || conn.sIcon || '```Icon has been changed to```').replace('@icon', groupUpdate.icon);
    if (groupUpdate.revoke) text = (chats.sRevoke || tradutor.texto8 || conn.sRevoke || '```Group link has been changed to```\n@revoke').replace('@revoke', groupUpdate.revoke);
    if (!text) continue;
    await mconn.conn.sendMessage(id, { text, mentions: mconn.conn.parseMention(text) });
  }
}

export async function callUpdate(callUpdate) {
  const isAnticall = global.db.data.settings[mconn.conn.user.jid].antiCall;
  if (!isAnticall) return;
  for (const nk of callUpdate) {
    if (nk.isGroup == false) {
      if (nk.status == 'offer') {
        const callmsg = await mconn.conn.reply(nk.from, `Hola *@${nk.from.split('@')[0]}*, las ${nk.isVideo ? 'videollamadas' : 'llamadas'} no están permitidas, serás bloqueado.\n-\nSi accidentalmente llamaste póngase en contacto con mi creador para que te desbloquee!`, false, { mentions: [nk.from] });
        // let data = global.owner.filter(([id, isCreator]) => id && isCreator)
        // await this.sendContact(nk.from, data.map(([id, name]) => [id, name]), false, { quoted: callmsg })
        const vcard = `BEGIN:VCARD\nVERSION:3.0\nN:;𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑;;;\nFN:𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑\nORG:𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑\nTITLE:\nitem1.TEL;waid=5219992095479:+521 999 209 5479\nitem1.X-ABLabel:𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑\nX-WA-BIZ-DESCRIPTION:[❗] ᴄᴏɴᴛᴀᴄᴛᴀ ᴀ ᴇsᴛᴇ ɴᴜᴍ ᴘᴀʀᴀ ᴄᴏsᴀs ɪᴍᴘᴏʀᴛᴀɴᴛᴇs.\nX-WA-BIZ-NAME:𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑\nEND:VCARD`;
        await mconn.conn.sendMessage(nk.from, { contacts: { displayName: '𝐁𝐫𝐮𝐧𝐨 𝐒𝐨𝐛𝐫𝐢𝐧𝐨 👑', contacts: [{ vcard }] } }, { quoted: callmsg });
        await mconn.conn.updateBlockStatus(nk.from, 'block');
      }
    }
  }
}

export async function deleteUpdate(message) {
  const datas = global
  const id = message.participant // Obtenga la identificación del usuario, solo dentro de esta función "deleteUpdate"
  const idioma = datas.db.data.users[id]?.language || 'es';
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.handler.deleteUpdate


  let d = new Date(new Date + 3600000)
  let date = d.toLocaleDateString('es', { day: 'numeric', month: 'long', year: 'numeric' })
  let time = d.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })
  try {
    const { fromMe, id, participant } = message
    if (fromMe) return
    let msg = mconn.conn.serializeM(mconn.conn.loadMessage(id))
    let chat = global.db.data.chats[msg?.chat] || {}
    if (!chat?.antidelete) return
    if (!msg) return
    if (!msg?.isGroup) return
    const antideleteMessage = `${tradutor.texto1[0]}
${tradutor.texto1[1]} @${participant.split`@`[0]}
${tradutor.texto1[2]} ${time}
${tradutor.texto1[3]} ${date}\n
${tradutor.texto1[4]}
${tradutor.texto1[5]}`.trim();
    await mconn.conn.sendMessage(msg.chat, { text: antideleteMessage, mentions: [participant] }, { quoted: msg })
    mconn.conn.copyNForward(msg.chat, msg).catch(e => console.log(e, msg))
  } catch (e) {
    console.error(e)
  }
}

global.dfail = (type, m, conn) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || 'es';
  const _translate = JSON.parse(fs.readFileSync(`./language/${idioma}.json`))
  const tradutor = _translate.handler.dfail

  const msg = {
    rowner: tradutor.texto1,
    owner: tradutor.texto2,
    mods: tradutor.texto3,
    premium: tradutor.texto4,
    group: tradutor.texto5,
    private: tradutor.texto6,
    admin: tradutor.texto7,
    botAdmin: tradutor.texto8,
    unreg: tradutor.texto9,
    restrict: tradutor.texto10,
  }[type];
  const aa = { quoted: m, userJid: conn.user.jid };
  const prep = generateWAMessageFromContent(m.chat, { extendedTextMessage: { text: msg, contextInfo: { externalAdReply: { title: tradutor.texto11[0], body: tradutor.texto11[1], thumbnail: imagen1, sourceUrl: tradutor.texto11[2] } } } }, aa);
  if (msg) return conn.relayMessage(m.chat, prep.message, { messageId: prep.key.id });
};

const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
  unwatchFile(file);
  console.log(chalk.redBright('Update \'handler.js\''));
  if (global.reloadHandler) console.log(await global.reloadHandler());

  if (global.conns && global.conns.length > 0) {
    const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
    for (const userr of users) {
      userr.subreloadHandler(false)
    }
  }

});

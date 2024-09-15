import fetch from 'node-fetch';


const cooldown = 1500000; // 25 minutos
const handler = async (m, {usedPrefix, conn}) => {
  const datas = global
  const idioma = datas.db.data.users[m.sender].language || global.defaultLenguaje
  const _translate = JSON.parse(fs.readFileSync(`./src/languages/${idioma}.json`))
  const tradutor = _translate.plugins.rpg_adventure

  try {
    const ct = [
      'AF',
      'AX',
      'AL',
      'DZ',
      'AS',
      'AD',
      'AO',
      'AI',
      'AQ',
      'AG',
      'AR',
      'AM',
      'AW',
      'AU',
      'AT',
      'AZ',
      'BS',
      'BH',
      'BD',
      'BB',
      'BY',
      'BE',
      'BZ',
      'BJ',
      'BM',
      'BT',
      'BO',
      'BQ',
      'BA',
      'BW',
      'BV',
      'BR',
      'IO',
      'BN',
      'BG',
      'BF',
      'BI',
      'KH',
      'CM',
      'CA',
      'CV',
      'KY',
      'CF',
      'TD',
      'CL',
      'CN',
      'CX',
      'CC',
      'CO',
      'KM',
      'CG',
      'CD',
      'CK',
      'CR',
      'CI',
      'HR',
      'CU',
      'CW',
      'CY',
      'CZ',
      'DK',
      'DJ',
      'DM',
      'DO',
      'EC',
      'EG',
      'SV',
      'GQ',
      'ER',
      'EE',
      'ET',
      'FK',
      'FO',
      'FJ',
      'FI',
      'FR',
      'GF',
      'PF',
      'TF',
      'GA',
      'GM',
      'GE',
      'DE',
      'GH',
      'GI',
      'GR',
      'GL',
      'GD',
      'GP',
      'GU',
      'GT',
      'GG',
      'GN',
      'GW',
      'GY',
      'HT',
      'HM',
      'VA',
      'HN',
      'HK',
      'HU',
      'IS',
      'IN',
      'ID',
      'IR',
      'IQ',
      'IE',
      'IM',
      'IL',
      'IT',
      'JM',
      'JP',
      'JE',
      'JO',
      'KZ',
      'KE',
      'KI',
      'KP',
      'KR',
      'XK',
      'KW',
      'KG',
      'LA',
      'LV',
      'LB',
      'LS',
      'LR',
      'LY',
      'LI',
      'LT',
      'LU',
      'MO',
      'MK',
      'MG',
      'MW',
      'MY',
      'MV',
      'ML',
      'MT',
      'MH',
      'MQ',
      'MR',
      'MU',
      'YT',
      'MX',
      'FM',
      'MD',
      'MC',
      'MN',
      'ME',
      'MS',
      'MA',
      'MZ',
      'MM',
      'NA',
      'NR',
      'NP',
      'NL',
      'AN',
      'NC',
      'NZ',
      'NI',
      'NE',
      'NG',
      'NU',
      'NF',
      'MP',
      'NO',
      'OM',
      'PK',
      'PW',
      'PS',
      'PA',
      'PG',
      'PY',
      'PE',
      'PH',
      'PN',
      'PL',
      'PT',
      'PR',
      'QA',
      'RS',
      'RE',
      'RO',
      'RU',
      'RW',
      'BL',
      'SH',
      'KN',
      'LC',
      'MF',
      'PM',
      'VC',
      'WS',
      'SM',
      'ST',
      'SA',
      'SN',
      'CS',
      'SC',
      'SL',
      'SG',
      'SX',
      'SK',
      'SI',
      'SB',
      'SO',
      'ZA',
      'GS',
      'SS',
      'ES',
      'LK',
      'SD',
      'SR',
      'SJ',
      'SZ',
      'SE',
      'CH',
      'SY',
      'TW',
      'TJ',
      'TZ',
      'TH',
      'TL',
      'TG',
      'TK',
      'TO',
      'TT',
      'TN',
      'TR',
      'XT',
      'TM',
      'TC',
      'TV',
      'UG',
      'UA',
      'AE',
      'GB',
      'US',
      'UM',
      'UY',
      'UZ',
      'VU',
      'VE',
      'VN',
      'VG',
      'VI',
      'WF',
      'EH',
      'YE',
      'ZM',
      'ZW',
    ];
    const ke = await fetch(
        `https://api.worldbank.org/v2/country/${ct.getRandom()}?format=json`,
    );
    const kt = await ke.json();
    // let imgr = flaaa.getRandom()
    const user = global.db.data.users[m.sender];
    const timers = cooldown - (new Date() - user.lastadventure);
    if (user.health < 80) {
      return conn.reply(
          m.chat,
          `_${htki} ${tradutor.texto1[0]} ${htka}_\n\n${tradutor.texto1[1]}`,
          m,
      );
    }
    if (new Date() - user.lastadventure <= cooldown) {
      return conn.reply(
          m.chat,
          `${htki} ${tardutor.texto2[0]} ${htka}\n\n${tardutor.texto2[1]} ${timers.toTimeString()} ${tardutor.texto2[2]}`,
          m,
      );
    }
    const rewards = reward(user);
    let text = `${tardutor.texto2[3]}  *» ${kt[1][0].name}*

${cmenut}
${cmenub} ${tradutor.texto3[0]} ${kt[1][0].id}
${cmenub} ${tradutor.texto3[1]} ${kt[1][0].capitalCity}
${cmenub} ${tradutor.texto3[2]} ${kt[1][0].longitude}
${cmenub} ${tradutor.texto3[3]} ${kt[1][0].latitude}
${cmenuf}

${tradutor.texto3[4]}
${cmenua}`;

    for (const lost in rewards.lost) {
      if (user[lost]) {
        const total = rewards.lost[lost].getRandom();
        user[lost] -= total * 1;
        if (total) text += `\n${global.rpg.emoticon(lost)} ${total}`;
      }
    }
    text += tradutor.texto4;
    for (const rewardItem in rewards.reward) {
      if (rewardItem in user) {
        const total = rewards.reward[rewardItem].getRandom();
        user[rewardItem] += total * 1;
        if (total) text += `\n» ${global.rpg.emoticon(rewardItem)} ${total}`;
      }
    }
    conn.reply(m.chat, `${htki} ${tradutor.texto5[0]} ${htka}\n\n${text}`, m);
    user.lastadventure = new Date() * 1;
  } catch {
    conn.reply(
        m.chat,
        `${tradutor.texto5[1]}`,
        m,
    );
  }
};
handler.help = ['adventure'];
handler.tags = ['rpg'];
handler.command = /^(adventure|adv|aventura|aventurar)$/i;
handler.cooldown = cooldown;
handler.disabled = false;
export default handler;

function reward(user = {}) {
  const rewards = {
    reward: {
      money: 400,
      exp: 300,
      trash: 150,
      potion: 3,
      rock: 2,
      joincount: 2,
      wood: 3,
      string: 2,
      common: 2 * ((user.dog && (user.dog > 2 ? 2 : user.dog) * 1.2) || 1),
      uncoommon: [0, 0, 0, 1, 0].concat(
          new Array(
              5 -
            ((user.dog > 2 && user.dog < 6 && user.dog) ||
              (user.dog > 5 && 5) ||
              2),
          ).fill(0),
      ),
      mythic: [0, 0, 0, 0, 0, 1, 0, 0, 0].concat(
          new Array(
              8 -
            ((user.dog > 5 && user.dog < 8 && user.dog) ||
              (user.dog > 7 && 8) ||
              3),
          ).fill(0),
      ),
      legendary: [0, 0, 0, 0, 0, 0, 0, 1, 0, 0].concat(
          new Array(10 - ((user.dog > 8 && user.dog) || 4)).fill(0),
      ),
      cat: [0, 1, 0, 0, 0],
      centaur: [0, 1, 0, 0, 0],
      dog: [0, 1, 0, 0, 0],
      dragon: [0, 1, 0, 0, 0],
      emerald: [0, 1, 0, 0, 0],
      fox: [0, 1, 0, 0, 0],
      griffin: [0, 1, 0, 0, 0],
      horse: [0, 1, 0, 0, 0],
      kyubi: [0, 1, 0, 0, 0],
      lion: [0, 1, 0, 0, 0],
      pet: [0, 1, 0, 0, 0],
      phonix: [0, 1, 0, 0, 0],
      rhinoceros: [0, 1, 0, 0, 0],
      robo: [0, 1, 0, 0, 0],
      wolf: [0, 1, 0, 0, 0],
      iron: [0, 0, 0, 1, 0, 0],
      gold: [0, 0, 0, 0, 0, 1, 0],
      diamond: [0, 0, 0, 0, 0, 0, 1, 0].concat(
          new Array(
              5 - ((user.fox < 6 && user.fox) || (user.fox > 5 && 5) || 0),
          ).fill(0),
      ),
    },
    lost: {
      health: 101 - user.cat * 4,
      armordurability: (15 - user.armor) * 7,
    },
  };
  return rewards;
}

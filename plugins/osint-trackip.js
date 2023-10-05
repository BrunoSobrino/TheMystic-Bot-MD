// # /////////////////////////////////////////////////////////////////////////// #
// #                                                                             #
// #                      Copyright 2022 TheH2SO4 (Hiro)                         #
// #                                                                             #
// #   Licensed under the Apache License, Version 2.0 (the "License");           #
// #   you may not use this file except in compliance with the License.          #
// #   You may obtain a copy of the License at                                   #
// #                                                                             #
// #       http://www.apache.org/licenses/LICENSE-2.0                            #
// #                                                                             #
// #   Unless required by applicable law or agreed to in writing, software       #
// #   distributed under the License is distributed on an "AS IS" BASIS,         #
// #   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.  #
// #   See the License for the specific language governing permissions and       #
// #   limitations under the License.                                            #
// #                                                                             #
// # /////////////////////////////////////////////////////////////////////////// #

// # ////////////////| [🥽] | TheH2SO4 | [⚗️] |//////////////// #

// # || Start [📍] || #

import { getCustomIpDetails } from '@sarequl/client-ip-details';
import { isIP } from 'is-ip';
import getSymbolFromCurrency from 'currency-symbol-map';
import clm from 'country-locale-map';
import country from 'countryjs';

const PLUGIN_VERSION="1.1.2"

let handler = async (m, { text, conn, args, usedPrefix, command }) => {

    function message(text) {
        conn.sendMessage(m.chat, { text: `${text}` }, {quoted: m})
    }
    
        try {
            if (! text) {
                message(`╭══════⊂(^(工)^)⊃══════╮\n\n[❌] Hey! Esta no es la manera correcta de usar *${usedPrefix}trackip*. La manera correcta de usarla es *${usedPrefix}trackip + <(IPv4/IPv6) publica del archivo>*! Ejemplo: *${usedPrefix}trackip 179.24.239.201*.\n\n----| *v${PLUGIN_VERSION}* - *TheH2SO4/Mystic-Plugins* |---\n\n╰══════⊂(^(工)^)⊃══════╯`)
            } else {
                if (isIP(args[0])) {
                    const publicIP = await getCustomIpDetails(args[0])
                        const countryClm = clm.getCountryByAlpha2(publicIP.countryCode)
                            const countryJs = country.info(publicIP.countryCode)
                                for (var i = 0; i < countryJs.tld.length; i++) {
                                    message(`╭══════⊂(^(工)^)⊃══════╮\n\n[✅] Se ha encontrado informacion acerca de: ' *${args[0]}* '!\n\n➤ _(IPv4/IPv6): *${publicIP.query}*_\n➤ _Red Movil: *${publicIP.mobile ? '✅':'❌'}*_\n➤ _(Proxy/VPN): *${publicIP.proxy ? '✅':'❌'}*_\n➤ _Hosting (VPS/VDS/DEDI): *${publicIP.hosting ? '✅':'❌'}*_\n➤ _Pais: *${publicIP.country}*_\n➤ _Nombre del Pais (ES): *${countryJs.translations.es}*_\n➤ _Nombre nativo del Pais: *${countryJs.nativeName}*_\n➤ _Numero de Fronteras: *${countryJs.borders.length}*_\n➤ _Area total del Pais: *${countryJs.area} (KM^2)*_\n➤ _Capital del Pais: *${countryClm.capital}*_\n➤ _Numero de provincias del Pais: *${countryJs.provinces.length}*_\n➤ _Bandera del Pais: *${countryClm.emoji}*_\n➤ _Codigo de Bandera: *${countryClm.emojiU}*_\n➤ _Codigo de Pais: *${publicIP.countryCode}*_\n➤ _Codigo de Pais (Numerico): *${countryClm.numeric}*_\n➤ _Idioma del Pais: *${countryJs.languages[0]}*_\n➤ _Numero de diomas del Pais: *${countryJs.languages.length}*_\n➤ _Prefijo del Pais: *+${countryJs.callingCodes[0]}*_\n➤ _Numero de prefijos del Pais: *${countryJs.callingCodes.length}*_\n➤ _Dominios del Pais: *${countryJs.tld[i]}*_\n➤ _Numero de dominios del Pais: *${countryJs.tld.length}*_\n➤ _Continente (EN): *${publicIP.continent}*_\n➤ _Codigo del Continente: *${publicIP.continentCode}*_\n➤ _Wikipedia: *${countryJs.wiki}*_\n➤ _Region: *${publicIP.regionName}*_\n➤ _Codigo de Region: *${publicIP.region}*_\n➤ _Ciudad: *${publicIP.city}*_\n➤ _Codigo Postal: *${publicIP.zip}*_\n➤ _Latitud: *${publicIP.lat}*_\n➤ _Longitud: *${publicIP.lon}*_\n➤ _Zona Horaria: *${publicIP.timezone}*_\n➤ _Moneda Local: *${publicIP.currency}*_\n➤ _Simbolo de Moneda Local: *${getSymbolFromCurrency(publicIP.currency)}*_\n➤ _Numero de monedas: *${countryJs.currencies.length}*_\n➤ _Numero de Habitantes: *${countryJs.population}*_\n➤ _Gentilicio (EN): *${countryJs.demonym}*_\n➤ _ISP: *${publicIP.isp}*_\n➤ _Organizacion: *${publicIP.org}*_\n➤ _ASN: *${publicIP.as}*_\n➤ _Nombre del ASN: *${publicIP.asname}*_\n➤ _Reverse Proxy: *${publicIP.reverse}*_\n\n_Esta informacion sobre la direccion (IPv4/IPv6) ' *${publicIP.query}* ' no es 100% exacta, favor de abstenerse a afirmar lo contrario._\n\nAlgun error? Reportalo abriendo una issue en GitHub!\n\n----| *v${PLUGIN_VERSION}* - *TheH2SO4/Mystic-Plugins* |---\n\n╰══════⊂(^(工)^)⊃══════╯`)   
                                }
                } else {
                    message(`╭══════⊂(^(工)^)⊃══════╮\n\n[❌] Esta direccion (IPv4/IPv6) no es valida. Por favor, abra una issue en GitHub para reportar el error.\n\n----| *v${PLUGIN_VERSION}* - *TheH2SO4/Mystic-Plugins* |---\n\n╰══════⊂(^(工)^)⊃══════╯`)
                }
            }
        } catch(error) {
            message(`╭══════⊂(^(工)^)⊃══════╮\n\n[❌] Ha ocurrido un error "${error}". Por favor, abra una issue en GitHub para reportar el error.\n\n----| *v${PLUGIN_VERSION}* - *TheH2SO4/Mystic-Plugins* |---\n\n╰══════⊂(^(工)^)⊃══════╯`)
        }
}

handler.help = ['trackip + <(IPv4/IPv6) publica>']
handler.tags = ['tools']
handler.command = ['trackip']
export default handler
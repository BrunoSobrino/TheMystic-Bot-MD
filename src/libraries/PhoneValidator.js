/**
 * Módulo de validación de números telefónicos para WhatsApp
 * Detecta si un LID es realmente un número de teléfono válido
 */
class PhoneValidator {
  constructor() {
    // Patrones de números telefónicos por país/región más comunes
    this.phonePatterns = {
      // México (52)
      mexico: /^52(1)?\d{10}$/,
      // Argentina (54)
      argentina: /^54(9)?\d{8,10}$/,
      // Colombia (57)
      colombia: /^57\d{7,10}$/,
      // Chile (56)
      chile: /^56\d{8,9}$/,
      // Perú (51)
      peru: /^51\d{8,9}$/,
      // Venezuela (58)
      venezuela: /^58\d{7,10}$/,
      // Ecuador (593)
      ecuador: /^593\d{8,9}$/,
      // Uruguay (598)
      uruguay: /^598\d{7,8}$/,
      // Paraguay (595)
      paraguay: /^595\d{7,9}$/,
      // Bolivia (591)
      bolivia: /^591\d{7,8}$/,
      // Brasil (55)
      brasil: /^55\d{10,11}$/,
      // Estados Unidos/Canadá (1)
      northamerica: /^1\d{10}$/,
      // España (34)
      spain: /^34\d{9}$/,
      // Reino Unido (44)
      uk: /^44\d{10,11}$/,
      // Francia (33)
      france: /^33\d{9,10}$/,
      // Alemania (49)
      germany: /^49\d{10,12}$/,
      // Italia (39)
      italy: /^39\d{9,11}$/,
      // Países Bajos (31)
      netherlands: /^31\d{8,9}$/,
      // India (91)
      india: /^91\d{10}$/,
      // Pakistán (92)
      pakistan: /^92\d{9,10}$/,
      // China (86)
      china: /^86\d{11}$/,
      // Japón (81)
      japan: /^81\d{9,11}$/,
      // Corea del Sur (82)
      southkorea: /^82\d{9,10}$/,
      // Australia (61)
      australia: /^61\d{9}$/,
      // Sudáfrica (27)
      southafrica: /^27\d{9}$/,
      // Egipto (20)
      egypt: /^20\d{9,10}$/,
      // Nigeria (234)
      nigeria: /^234\d{7,10}$/,
      // Kenia (254)
      kenya: /^254\d{9}$/,
      // Marruecos (212)
      morocco: /^212\d{9}$/,
      // Túnez (216)
      tunisia: /^216\d{8}$/,
      // Argelia (213)
      algeria: /^213\d{8,9}$/,
      // Turquía (90)
      turkey: /^90\d{10}$/,
      // Rusia (7)
      russia: /^7\d{10}$/,
      // Ucrania (380)
      ukraine: /^380\d{9}$/,
      // Polonia (48)
      poland: /^48\d{9}$/,
      // República Checa (420)
      czech: /^420\d{9}$/,
      // Hungría (36)
      hungary: /^36\d{8,9}$/,
      // Rumania (40)
      romania: /^40\d{9}$/,
      // Grecia (30)
      greece: /^30\d{10}$/,
      // Portugal (351)
      portugal: /^351\d{9}$/,
      // Suecia (46)
      sweden: /^46\d{8,9}$/,
      // Noruega (47)
      norway: /^47\d{8}$/,
      // Dinamarca (45)
      denmark: /^45\d{8}$/,
      // Finlandia (358)
      finland: /^358\d{8,9}$/,
      // Bélgica (32)
      belgium: /^32\d{8,9}$/,
      // Suiza (41)
      switzerland: /^41\d{9}$/,
      // Austria (43)
      austria: /^43\d{10,11}$/,
      // Israel (972)
      israel: /^972\d{8,9}$/,
      // Emiratos Árabes Unidos (971)
      uae: /^971\d{8,9}$/,
      // Arabia Saudita (966)
      saudiarabia: /^966\d{8,9}$/,
      // Tailandia (66)
      thailand: /^66\d{8,9}$/,
      // Vietnam (84)
      vietnam: /^84\d{9,10}$/,
      // Malasia (60)
      malaysia: /^60\d{8,10}$/,
      // Singapur (65)
      singapore: /^65\d{8}$/,
      // Filipinas (63)
      philippines: /^63\d{9,10}$/,
      // Indonesia (62)
      indonesia: /^62\d{8,12}$/
    };

    // Códigos de país más comunes (para validación adicional)
    this.countryCodes = [
      '1', '7', '20', '27', '30', '31', '32', '33', '34', '36', '39', '40', '41', '43', '44', '45', '46', '47', '48', '49',
      '51', '52', '53', '54', '55', '56', '57', '58', '60', '61', '62', '63', '64', '65', '66', '81', '82', '84', '86',
      '90', '91', '92', '93', '94', '95', '98', '212', '213', '216', '218', '220', '221', '222', '223', '224', '225',
      '226', '227', '228', '229', '230', '231', '232', '233', '234', '235', '236', '237', '238', '239', '240', '241',
      '242', '243', '244', '245', '246', '247', '248', '249', '250', '251', '252', '253', '254', '255', '256', '257',
      '258', '260', '261', '262', '263', '264', '265', '266', '267', '268', '269', '290', '291', '297', '298', '299',
      '350', '351', '352', '353', '354', '355', '356', '357', '358', '359', '370', '371', '372', '373', '374', '375',
      '376', '377', '378', '380', '381', '382', '383', '385', '386', '387', '389', '420', '421', '423', '500', '501',
      '502', '503', '504', '505', '506', '507', '508', '509', '590', '591', '592', '593', '594', '595', '596', '597',
      '598', '599', '670', '672', '673', '674', '675', '676', '677', '678', '679', '680', '681', '682', '683', '684',
      '685', '686', '687', '688', '689', '690', '691', '692', '850', '852', '853', '855', '856', '880', '882', '883',
      '886', '888', '960', '961', '962', '963', '964', '965', '966', '967', '968', '970', '971', '972', '973', '974',
      '975', '976', '977', '992', '993', '994', '995', '996', '998'
    ];
  }

  /**
   * Valida si un string es un número de teléfono válido
   * @param {string} phoneNumber - El número a validar
   * @returns {boolean} - True si es un número válido
   */
  isValidPhoneNumber(phoneNumber) {
    if (!phoneNumber || typeof phoneNumber !== 'string') {
      return false;
    }

    // Limpiar el número de espacios, guiones, etc.
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');

    // Debe ser solo números
    if (!/^\d+$/.test(cleanNumber)) {
      return false;
    }

    // Longitud mínima y máxima razonable
    if (cleanNumber.length < 7 || cleanNumber.length > 15) {
      return false;
    }

    // Verificar contra patrones específicos
    for (const pattern of Object.values(this.phonePatterns)) {
      if (pattern.test(cleanNumber)) {
        return true;
      }
    }

    // Verificación adicional: debe empezar con un código de país válido
    return this.hasValidCountryCode(cleanNumber);
  }

  /**
   * Verifica si el número tiene un código de país válido
   * @param {string} phoneNumber - Número limpio
   * @returns {boolean}
   */
  hasValidCountryCode(phoneNumber) {
    for (const code of this.countryCodes) {
      if (phoneNumber.startsWith(code)) {
        // Verificar que después del código de país hay suficientes dígitos
        const remainingDigits = phoneNumber.slice(code.length);
        if (remainingDigits.length >= 6 && remainingDigits.length <= 12) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Convierte un número de teléfono a formato JID de WhatsApp
   * @param {string} phoneNumber - El número de teléfono
   * @returns {string} - JID formateado
   */
  toWhatsAppJID(phoneNumber) {
    if (!this.isValidPhoneNumber(phoneNumber)) {
      return null;
    }

    const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+]/g, '');
    return `${cleanNumber}@s.whatsapp.net`;
  }

  /**
   * Detecta si un LID es realmente un número de teléfono
   * @param {string} lidString - String que podría ser LID o número
   * @returns {object} - {isPhone: boolean, jid: string|null, originalLid: string}
   */
  detectPhoneInLid(lidString) {
    if (!lidString || typeof lidString !== 'string') {
      return { isPhone: false, jid: null, originalLid: lidString };
    }

    // Remover @lid si está presente
    const cleanLid = lidString.replace('@lid', '');

    // Verificar si es un número de teléfono válido
    if (this.isValidPhoneNumber(cleanLid)) {
      return {
        isPhone: true,
        jid: this.toWhatsAppJID(cleanLid),
        originalLid: lidString,
        phoneNumber: cleanLid
      };
    }

    return { isPhone: false, jid: null, originalLid: lidString };
  }

  /**
   * Obtiene información del país basado en el número
   * @param {string} phoneNumber - Número de teléfono
   * @returns {object|null} - Información del país
   */
  getCountryInfo(phoneNumber) {
    const cleanNumber = phoneNumber.replace(/[\s\-\(\)\+@lid]/g, '');

    const countryMap = {
      '52': { country: 'México', code: 'MX', pattern: this.phonePatterns.mexico },
      '54': { country: 'Argentina', code: 'AR', pattern: this.phonePatterns.argentina },
      '57': { country: 'Colombia', code: 'CO', pattern: this.phonePatterns.colombia },
      '56': { country: 'Chile', code: 'CL', pattern: this.phonePatterns.chile },
      '51': { country: 'Perú', code: 'PE', pattern: this.phonePatterns.peru },
      '58': { country: 'Venezuela', code: 'VE', pattern: this.phonePatterns.venezuela },
      '593': { country: 'Ecuador', code: 'EC', pattern: this.phonePatterns.ecuador },
      '598': { country: 'Uruguay', code: 'UY', pattern: this.phonePatterns.uruguay },
      '595': { country: 'Paraguay', code: 'PY', pattern: this.phonePatterns.paraguay },
      '591': { country: 'Bolivia', code: 'BO', pattern: this.phonePatterns.bolivia },
      '55': { country: 'Brasil', code: 'BR', pattern: this.phonePatterns.brasil },
      '1': { country: 'Estados Unidos/Canadá', code: 'US/CA', pattern: this.phonePatterns.northamerica },
      '34': { country: 'España', code: 'ES', pattern: this.phonePatterns.spain },
      '33': { country: 'Francia', code: 'FR', pattern: this.phonePatterns.france },
      '49': { country: 'Alemania', code: 'DE', pattern: this.phonePatterns.germany },
      '44': { country: 'Reino Unido', code: 'GB', pattern: this.phonePatterns.uk },
      '91': { country: 'India', code: 'IN', pattern: this.phonePatterns.india },
      '92': { country: 'Pakistán', code: 'PK', pattern: this.phonePatterns.pakistan }
    };

    // Buscar el código de país más largo que coincida
    let bestMatch = null;
    let longestMatch = 0;

    for (const [code, info] of Object.entries(countryMap)) {
      if (cleanNumber.startsWith(code) && code.length > longestMatch) {
        if (info.pattern.test(cleanNumber)) {
          bestMatch = info;
          longestMatch = code.length;
        }
      }
    }

    return bestMatch;
  }

  /**
   * Limpia y corrige un número de teléfono
   * @param {string} phoneNumber - Número original
   * @returns {string} - Número limpiado
   */
  cleanPhoneNumber(phoneNumber) {
    if (!phoneNumber) return phoneNumber;
    
    return phoneNumber
      .replace(/[\s\-\(\)\+]/g, '') // Remover espacios, guiones, paréntesis, +
      .replace(/^00/, '') // Remover 00 del inicio (prefijo internacional)
      .replace(/^0+/, ''); // Remover ceros del inicio
  }

  /**
   * Valida una lista de números y devuelve estadísticas
   * @param {Array} phoneNumbers - Array de números a validar
   * @returns {object} - Estadísticas de validación
   */
  validateBatch(phoneNumbers) {
    const results = {
      valid: [],
      invalid: [],
      phoneDetected: [],
      stats: {
        total: phoneNumbers.length,
        validCount: 0,
        invalidCount: 0,
        phoneDetectedCount: 0
      }
    };

    for (const phone of phoneNumbers) {
      const detection = this.detectPhoneInLid(phone);
      
      if (detection.isPhone) {
        results.phoneDetected.push({
          original: phone,
          jid: detection.jid,
          phoneNumber: detection.phoneNumber,
          country: this.getCountryInfo(detection.phoneNumber)
        });
        results.stats.phoneDetectedCount++;
      } else if (this.isValidPhoneNumber(phone)) {
        results.valid.push(phone);
        results.stats.validCount++;
      } else {
        results.invalid.push(phone);
        results.stats.invalidCount++;
      }
    }

    return results;
  }
}

export default PhoneValidator;

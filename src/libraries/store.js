/*
 * store.js con LidResolver integrado
 * - Reemplazo inteligente de LIDs usando la lógica del LidResolver
 * - Validación de números telefónicos integrada
 * - Cache persistente mejorado con análisis automático
 * - Detección y corrección automática de números mal categorizados
 */

import fs from 'fs';
import path from 'path';

const baileys = (await import('baileys')).default;
const {
  BufferJSON,
  proto,
  isJidBroadcast,
  WAMessageStubType,
  updateMessageWithReceipt,
  updateMessageWithReaction,
  jidNormalizedUser
} = baileys;

// Timeouts / retries
const TIME_TO_DATA_STALE = 5 * 60 * 1000;
const RETRY_DELAY = 3000;
const MAX_RETRIES = 6;
const WS_WAIT_TIMEOUT = 30000;
const WS_WAIT_STEP = 300;
const SEND_RETRY_ATTEMPTS_PER_CYCLE = 3;

/**
 * Validador de números telefónicos integrado
 */
class PhoneValidator {
  constructor() {
    // Patrones de números internacionales más comunes
    this.countryPatterns = {
      // América
      '1': { country: 'US/CA', name: 'Estados Unidos/Canadá' },
      '52': { country: 'MX', name: 'México' },
      '54': { country: 'AR', name: 'Argentina' },
      '55': { country: 'BR', name: 'Brasil' },
      '56': { country: 'CL', name: 'Chile' },
      '57': { country: 'CO', name: 'Colombia' },
      '58': { country: 'VE', name: 'Venezuela' },
      '51': { country: 'PE', name: 'Perú' },
      '593': { country: 'EC', name: 'Ecuador' },
      
      // Europa
      '34': { country: 'ES', name: 'España' },
      '33': { country: 'FR', name: 'Francia' },
      '39': { country: 'IT', name: 'Italia' },
      '49': { country: 'DE', name: 'Alemania' },
      '44': { country: 'GB', name: 'Reino Unido' },
      '351': { country: 'PT', name: 'Portugal' },
      '31': { country: 'NL', name: 'Países Bajos' },
      '32': { country: 'BE', name: 'Bélgica' },
      '41': { country: 'CH', name: 'Suiza' },
      '43': { country: 'AT', name: 'Austria' },
      
      // Asia-Pacífico
      '81': { country: 'JP', name: 'Japón' },
      '82': { country: 'KR', name: 'Corea del Sur' },
      '86': { country: 'CN', name: 'China' },
      '91': { country: 'IN', name: 'India' },
      '61': { country: 'AU', name: 'Australia' },
      '64': { country: 'NZ', name: 'Nueva Zelanda' },
      '62': { country: 'ID', name: 'Indonesia' },
      '63': { country: 'PH', name: 'Filipinas' },
      '65': { country: 'SG', name: 'Singapur' },
      '66': { country: 'TH', name: 'Tailandia' },
      '60': { country: 'MY', name: 'Malasia' },
      
      // Medio Oriente y África
      '971': { country: 'AE', name: 'Emiratos Árabes Unidos' },
      '966': { country: 'SA', name: 'Arabia Saudí' },
      '972': { country: 'IL', name: 'Israel' },
      '20': { country: 'EG', name: 'Egipto' },
      '27': { country: 'ZA', name: 'Sudáfrica' }
    };
  }

  /**
   * Detectar si un LID contiene un número telefónico válido
   */
  detectPhoneInLid(lidKey) {
    if (!lidKey || typeof lidKey !== 'string') {
      return { isPhone: false, phoneNumber: null, jid: null };
    }

    // Remover caracteres no numéricos y extraer el número base
    let cleanNumber = lidKey.replace(/[^0-9]/g, '');
    
    // Si contiene ':', tomar la parte antes del ':'
    if (lidKey.includes(':')) {
      cleanNumber = lidKey.split(':')[0].replace(/[^0-9]/g, '');
    }

    // Verificar longitud mínima (al menos 7 dígitos)
    if (cleanNumber.length < 7) {
      return { isPhone: false, phoneNumber: null, jid: null };
    }

    // Verificar patrones de códigos de país
    for (const [countryCode, info] of Object.entries(this.countryPatterns)) {
      if (cleanNumber.startsWith(countryCode)) {
        // Verificar longitud total del número según el código de país
        const expectedLength = this.getExpectedLength(countryCode);
        if (cleanNumber.length >= expectedLength.min && cleanNumber.length <= expectedLength.max) {
          return {
            isPhone: true,
            phoneNumber: cleanNumber,
            jid: `${cleanNumber}@s.whatsapp.net`,
            countryCode: countryCode,
            country: info.country
          };
        }
      }
    }

    // Verificar números locales (sin código de país) - asumir que son válidos si tienen 8+ dígitos
    if (cleanNumber.length >= 8 && cleanNumber.length <= 15) {
      return {
        isPhone: true,
        phoneNumber: cleanNumber,
        jid: `${cleanNumber}@s.whatsapp.net`,
        isLocal: true
      };
    }

    return { isPhone: false, phoneNumber: null, jid: null };
  }

  /**
   * Obtener longitud esperada según código de país
   */
  getExpectedLength(countryCode) {
    const lengthMap = {
      '1': { min: 11, max: 11 },     // US/CA
      '52': { min: 12, max: 13 },    // MX
      '34': { min: 11, max: 12 },    // ES
      '33': { min: 11, max: 12 },    // FR
      '49': { min: 11, max: 12 },    // DE
      '44': { min: 11, max: 12 },    // GB
      '81': { min: 11, max: 12 },    // JP
      '86': { min: 11, max: 13 },    // CN
      '91': { min: 10, max: 12 },    // IN
    };
    
    return lengthMap[countryCode] || { min: 8, max: 15 };
  }

  /**
   * Obt

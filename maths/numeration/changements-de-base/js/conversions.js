(function () {
  'use strict';
  const safe = value => Number.isSafeInteger(value) && value >= 0;
  function parseDigits(input, radix, pattern, width) {
    if (typeof input !== 'string') return null;
    const text = radix === 2 ? input.trim().replace(/\s/g, '') : input.trim();
    if (!pattern.test(text) || (width !== undefined && text.length !== width)) return null;
    // BigInt prevents rounding a large invalid answer into a valid one.
    const value = BigInt((radix === 2 ? '0b' : radix === 16 ? '0x' : '') + text);
    return value <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(value) : null;
  }
  function encode(value, radix, width) {
    if (!safe(value)) throw new RangeError('Un entier non signé sûr est requis.');
    const text = value.toString(radix).toUpperCase();
    if (width !== undefined && (!Number.isSafeInteger(width) || width < 1 || width > 1024 || text.length > width)) {
      throw new RangeError('La valeur ne tient pas dans la largeur demandée.');
    }
    return width === undefined ? text : text.padStart(width, '0');
  }
  window.MissionBinaire.conversions = {
    parseDecimal: input => parseDigits(input, 10, /^[0-9]+$/),
    fromBinary: (input, width) => parseDigits(input, 2, /^[01]+$/, width),
    toBinary: (value, width) => encode(value, 2, width),
    fromHex: (input, width) => parseDigits(input, 16, /^[0-9a-fA-F]+$/, width),
    toHex: (value, width) => encode(value, 16, width),
    parseColor(input) {
      if (typeof input !== 'string' || !/^#?[0-9a-f]{6}$/i.test(input.trim())) return null;
      return '#' + input.trim().replace(/^#/, '').toUpperCase();
    },
    asciiCode: input => typeof input === 'string' && /^[\x20-\x7e]$/.test(input) ? input.charCodeAt(0) : null
  };
}());

"use strict";

function _instanceof(left, right) { if (right != null && typeof Symbol !== "undefined" && right[Symbol.hasInstance]) { return right[Symbol.hasInstance](left); } else { return left instanceof right; } }

function _classCallCheck(instance, Constructor) { if (!_instanceof(instance, Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

// The following has been transpiled from the original ES6 - ES5. The code above was added by BabelJS.


// tea-block.js from https://github.com/chrisveness/crypto
/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/* Block TEA (xxtea) Tiny Encryption Algorithm                        (c) Chris Veness 2002-2018  */

/*                                                                                   MIT Licence  */

/* www.movable-type.co.uk/scripts/tea-block.html                                                  */

/* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

/**
 * Tiny Encryption Algorithm. David Wheeler & Roger Needham, Cambridge University Computer Lab.
 *
 * www.movable-type.co.uk/scripts/tea.pdf   - TEA, a Tiny Encryption Algorithm (1994)
 * www.movable-type.co.uk/scripts/xtea.pdf  - Tea extensions (1997)
 * www.movable-type.co.uk/scripts/xxtea.pdf - Correction to xtea (1998)
 */
var Tea =
/*#__PURE__*/
function () {
  function Tea() {
    _classCallCheck(this, Tea);
  }

  _createClass(Tea, null, [{
    key: "encrypt",

    /**
     * Encrypts text using Corrected Block TEA (xxtea) algorithm.
     *
     * @param   {string} plaintext - String to be encrypted (multi-byte safe).
     * @param   {string} password - Password to be used for encryption (1st 16 chars).
     * @returns {string} Encrypted text (encoded as base64).
     */
    value: function encrypt(plaintext, password) {
      plaintext = String(plaintext);
      password = String(password);
      if (plaintext.length == 0) return ''; // nothing to encrypt
      //  v is n-word data vector; converted to array of longs from UTF-8 string

      var v = Tea.strToLongs(Tea.utf8Encode(plaintext)); //  k is 4-word key; simply convert first 16 chars of password as key

      var k = Tea.strToLongs(Tea.utf8Encode(password).slice(0, 16));
      var cipher = Tea.encode(v, k); // convert array of longs to string

      var ciphertext = Tea.longsToStr(cipher); // convert binary string to base64 ascii for safe transport

      var cipherbase64 = Tea.base64Encode(ciphertext);
      return cipherbase64;
    }
    /**
     * Decrypts text using Corrected Block TEA (xxtea) algorithm.
     *
     * @param   {string} ciphertext - String to be decrypted.
     * @param   {string} password - Password to be used for decryption (1st 16 chars).
     * @returns {string} Decrypted text.
     * @throws  {Error}  Invalid ciphertext
     */

  }, {
    key: "decrypt",
    value: function decrypt(ciphertext, password) {
      ciphertext = String(ciphertext);
      password = String(password);
      if (ciphertext.length == 0) return ''; // nothing to decrypt
      //  v is n-word data vector; converted to array of longs from base64 string

      var v = Tea.strToLongs(Tea.base64Decode(ciphertext)); //  k is 4-word key; simply convert first 16 chars of password as key

      var k = Tea.strToLongs(Tea.utf8Encode(password).slice(0, 16));
      var plain = Tea.decode(v, k);
      var plaintext = Tea.longsToStr(plain); // strip trailing null chars resulting from filling 4-char blocks:

      var plainUnicode = Tea.utf8Decode(plaintext.replace(/\0+$/, ''));
      return plainUnicode;
    }
    /**
     * XXTEA: encodes array of unsigned 32-bit integers using 128-bit key.
     *
     * @param   {number[]} v - Data vector.
     * @param   {number[]} k - Key.
     * @returns {number[]} Encoded vector.
     */

  }, {
    key: "encode",
    value: function encode(v, k) {
      if (v.length < 2) v[1] = 0; // algorithm doesn't work for n<2 so fudge by adding a null

      var n = v.length;
      var delta = 0x9e3779b9;
      var q = Math.floor(6 + 52 / n);
      var z = v[n - 1],
          y = v[0];
      var mx,
          e,
          sum = 0;

      while (q-- > 0) {
        // 6 + 52/n operations gives between 6 & 32 mixes on each word
        sum += delta;
        e = sum >>> 2 & 3;

        for (var p = 0; p < n; p++) {
          y = v[(p + 1) % n];
          mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
          z = v[p] += mx;
        }
      }

      return v;
    }
    /**
     * XXTEA: decodes array of unsigned 32-bit integers using 128-bit key.
     *
     * @param   {number[]} v - Data vector.
     * @param   {number[]} k - Key.
     * @returns {number[]} Decoded vector.
     */

  }, {
    key: "decode",
    value: function decode(v, k) {
      var n = v.length;
      var delta = 0x9e3779b9;
      var q = Math.floor(6 + 52 / n);
      var z = v[n - 1],
          y = v[0];
      var mx,
          e,
          sum = q * delta;

      while (sum != 0) {
        e = sum >>> 2 & 3;

        for (var p = n - 1; p >= 0; p--) {
          z = v[p > 0 ? p - 1 : n - 1];
          mx = (z >>> 5 ^ y << 2) + (y >>> 3 ^ z << 4) ^ (sum ^ y) + (k[p & 3 ^ e] ^ z);
          y = v[p] -= mx;
        }

        sum -= delta;
      }

      return v;
    }
    /**
     * Converts string to array of longs (each containing 4 chars).
     * @private
     */

  }, {
    key: "strToLongs",
    value: function strToLongs(s) {
      // note chars must be within ISO-8859-1 (Unicode code-point <= U+00FF) to fit 4/long
      var l = new Array(Math.ceil(s.length / 4));

      for (var i = 0; i < l.length; i++) {
        // note little-endian encoding - endianness is irrelevant as long as it matches longsToStr()
        l[i] = s.charCodeAt(i * 4) + (s.charCodeAt(i * 4 + 1) << 8) + (s.charCodeAt(i * 4 + 2) << 16) + (s.charCodeAt(i * 4 + 3) << 24);
      } // note running off the end of the string generates nulls since bitwise operators treat NaN as 0


      return l;
    }
    /**
     * Converts array of longs to string.
     * @private
     */

  }, {
    key: "longsToStr",
    value: function longsToStr(l) {
      var str = '';

      for (var i = 0; i < l.length; i++) {
        str += String.fromCharCode(l[i] & 0xff, l[i] >>> 8 & 0xff, l[i] >>> 16 & 0xff, l[i] >>> 24 & 0xff);
      }

      return str;
    }
    /* - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -  */

    /**
     * Encodes multi-byte string to utf8 - monsur.hossa.in/2012/07/20/utf-8-in-javascript.html
     */

  }, {
    key: "utf8Encode",
    value: function utf8Encode(str) {
      return unescape(encodeURIComponent(str));
    }
    /**
     * Decodes utf8 string to multi-byte
     */

  }, {
    key: "utf8Decode",
    value: function utf8Decode(utf8Str) {
      try {
        return decodeURIComponent(escape(utf8Str));
      } catch (e) {
        return utf8Str; // invalid UTF-8? return as-is
      }
    }
    /**
     * Encodes base64 - developer.mozilla.org/en-US/docs/Web/API/window.btoa, nodejs.org/api/buffer.html
     */

  }, {
    key: "base64Encode",
    value: function base64Encode(str) {
      if (typeof btoa != 'undefined') return btoa(str); // browser

      if (typeof Buffer != 'undefined') return new Buffer(str, 'binary').toString('base64'); // Node.js

      throw new Error('No Base64 Encode');
    }
    /**
     * Decodes base64
     */

  }, {
    key: "base64Decode",
    value: function base64Decode(b64Str) {
      if (typeof atob == 'undefined' && typeof Buffer == 'undefined') throw new Error('No base64 decode');

      try {
        if (typeof atob != 'undefined') return atob(b64Str); // browser

        if (typeof Buffer != 'undefined') return new Buffer(b64Str, 'base64').toString('binary'); // Node.js
      } catch (e) {
        throw new Error('Invalid ciphertext');
      }
    }
  }]);

  return Tea;
}();

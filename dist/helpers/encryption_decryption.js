"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handle_encrypt = exports.handle_decrypt = void 0;
const crypto_1 = __importDefault(require("crypto"));
const constants_1 = require("./constants");
const handle_decrypt = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passphrase = constants_1.pass_phrase;
        const key = yield crypto_1.default.subtle.importKey("raw", new TextEncoder().encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
        const derived_key = yield crypto_1.default.subtle.deriveKey({ name: "PBKDF2", salt: new Uint8Array([]), iterations: 100000, hash: "SHA-256" }, key, { name: "AES-CBC", length: 256 }, true, ["decrypt"]);
        const passphrase_buffer = new TextEncoder().encode(passphrase);
        const hash_buffer = yield crypto_1.default.subtle.digest('SHA-256', passphrase_buffer);
        const iv = new Uint8Array(hash_buffer.slice(0, 16));
        const encrypted_bytes = new Uint8Array(atob(data).split('').map(char => char.charCodeAt(0)));
        const encrypted_array_buffer = encrypted_bytes.buffer;
        const decrypted_array_buffer = yield crypto_1.default.subtle.decrypt({ name: "AES-CBC", iv: iv }, derived_key, encrypted_array_buffer);
        let decrypted_data = new TextDecoder().decode(decrypted_array_buffer);
        return decrypted_data;
    }
    catch (error) {
        console.error("Decryption failed:", error);
    }
});
exports.handle_decrypt = handle_decrypt;
const handle_encrypt = (data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const passphrase = constants_1.pass_phrase;
        const textEncoder = new TextEncoder();
        const encodedData = textEncoder.encode(data);
        const passphrase_buffer = new TextEncoder().encode(passphrase);
        const hash_buffer = yield crypto_1.default.subtle.digest('SHA-256', passphrase_buffer);
        const iv = new Uint8Array(hash_buffer.slice(0, 16));
        const imported_key = yield crypto_1.default.subtle.importKey("raw", textEncoder.encode(passphrase), { name: "PBKDF2" }, false, ["deriveKey"]);
        const key = yield crypto_1.default.subtle.deriveKey({
            name: "PBKDF2",
            salt: new Uint8Array([]),
            iterations: 100000,
            hash: "SHA-256"
        }, imported_key, { name: "AES-CBC", length: 256 }, true, ["encrypt"]);
        const encrypted = yield crypto_1.default.subtle.encrypt({
            name: 'AES-CBC',
            iv: iv,
        }, key, encodedData);
        const encryptedData = btoa(String.fromCharCode(...Array.from(new Uint8Array(encrypted))));
        return encryptedData;
    }
    catch (error) {
        console.error("Encryption failed:", error);
    }
});
exports.handle_encrypt = handle_encrypt;
//# sourceMappingURL=encryption_decryption.js.map
import { Injectable } from '@angular/core';
import * as CryptoJS from 'crypto-js';
// https://javascript.plainenglish.io/a-simple-encryption-library-in-node-js-with-typescript-d72c294998bf
@Injectable({
  providedIn: 'root'
})
export class EncryptionService {

  constructor() { }

  encrypt(text, key) {
    const encryptedPass = CryptoJS.AES.encrypt(text.trim(),key)
    return encryptedPass;
  }

  decrypt(text, key) {
    // /this.plainText.trim(), this.encPassword.trim()
    const decryptedPass = CryptoJS.AES.encrypt(text.trim(), key)
    return decryptedPass;
  }

}

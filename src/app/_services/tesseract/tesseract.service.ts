import { Injectable } from '@angular/core';
import * as Tesseract from 'tesseract.js';

@Injectable({
  providedIn: 'root'
})
export class TesseractService {

  constructor() { }


  readDriversLicense(filePath: string) {

    Tesseract.recognize(
      `filePath`,
      'eng',
        { logger: m => console.log(m) }
      ).then(({ data: { text } }) => {
        console.log(text);
      })
  }

}

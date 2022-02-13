import { Injectable } from '@angular/core';
import * as _ from "lodash";
import { ISetting,  } from 'src/app/_interfaces';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ElectronService } from 'ngx-electron';
import { IPOSOrder } from 'src/app/_interfaces/transactions/posorder';
import { BtPrintingService } from './bt-printing.service';
import  EscPosEncoder  from 'esc-pos-encoder-ionic';

@Injectable({
  providedIn: 'root'
})
export class PrintingAndroidService {

  zplSetting            : ISetting;
  receiptLayoutSetting  : ISetting;
  receiptStyles         : ISetting;
  item                  : IInventoryAssignment;
  order                 : IPOSOrder
  isElectronServiceInitiated = false

  constructor(  private electronService: ElectronService,
                private snack: MatSnackBar,
                private btPrintingService: BtPrintingService,
              ) {
    if (this.electronService.remote != null) {
      this.isElectronServiceInitiated = true
    }
  }

  async printAndroidImage(image: any, macAddress: string) {

    if (!image) {
      this.snack.open('no image!', 'image')
      return
    }

    let encoder = new EscPosEncoder();
    let result = encoder
      .initialize()
      .image(image, 128, 128, 'atkinson')
      .encode()
    this.btPrintingService.sendToBluetoothPrinter(macAddress, result)
}

// https://github.com/Ans0n-Ti0/EscPosEncoder
  async printAndroidPOSReceipt( order: IPOSOrder, macAddress: string) {
    const result = this.encoodReceipt(order);
    this.printFromAndroid(macAddress, result)
  }

  encoodReceipt(Order: IPOSOrder) {
    const encoder = new EscPosEncoder();
    let result = encoder
    .encode()
    return result
  }

  printFromAndroid(printerName: string, content: any) {
    // this.snack.open('printed something', printerName)
    this.btPrintingService.sendToBluetoothPrinter(printerName, content)
  }

  printTestAndroidReceipt(printerName: string)  {
    this.setLastAndroidPOSPrinterName('androidPOSPrinter', printerName);
    const content = this.testContent()
    this.printFromAndroid(printerName, content)
  }

  testContent() {
    const encoder = new EscPosEncoder();
    let result = encoder

    .align('center')
    .line('Biz Name')
    .align('center')
    .line('1234 Washington St.')
    .align('center')
    .line('San Diego, CA 92111')
    .align('center')
    .line('866-973-8099')
    .newline()
    .newline()
    .line('_____________________')
    .line('1  Blueberry Pie   $4.95')
    .line('2  Blueberry Pie  $14.95')
    .line('3  Blueberry Pie  $34.95')
    .line('_____________________')
    .newline()
    .newline()
    .align('right')
    .line('Subtotal. $54.85')
    .align('right')
    .line('Tax        $2.95')
    .align('right')
    .line('Total     $58.69')
    .newline()
    .newline()
    .newline()
    .newline()
    .encode()
    return result
  }

  printAndroidOrder(order: IPOSOrder) {

  }

  getLastAndroidPOSPrinterName(): string {
    return  localStorage.getItem('androidPOSPrinter')
  }

  setLastAndroidPOSPrinterName(printerType: string, printerName: string) {
    localStorage.setItem('androidPOSPrinter', printerName)
  }

}

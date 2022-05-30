import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
// import { esc-pos-encoder} from 'esc-pos-encoder';
// import 'esc-pos-encoder'
@Injectable({
  providedIn: 'root'
})
export class BtPrintingService {

  constructor(
    public snackBar: MatSnackBar,
    public btSerial: BluetoothSerial) { }

  searchBluetoothPrinter()
  {
    //This will return a list of bluetooth devices
     return this.btSerial.list();
  }

  connectToBluetoothPrinter(macAddress)
  {
    //This will connect to bluetooth printer via the mac address provided
    return this.btSerial.connect(macAddress)
  }

  disconnectBluetoothPrinter()
  {
    //This will disconnect the current bluetooth connection
    return this.btSerial.disconnect();
  }

  // printData(data){
  //   return this.btSerial.write(data);
  // }
  sendToBluetoothPrinter(macAddress, data_string)  {
    //1. Try connecting to bluetooth printer
    const printer$ = this.connectToBluetoothPrinter(macAddress)
    printer$.subscribe(
       data =>{
        //2. Connected successfully
      this.btSerial.write(data_string)

      .then( newData =>{
          //3. Print successful
          //If you want to tell user print is successful,
          //handle it here
          //4. IMPORTANT! Disconnect bluetooth after printing
          this.disconnectBluetoothPrinter()
          // this.snackBar.open('disconnected', 'Printing')
        },
        err=>{
          //If there is an error printing to bluetooth printer
        //handle it here
          this.snackBar.open(err.toString(), 'Printing')
        })
      },err=>{
        this.snackBar.open(err.toString(), 'Printing')
      }
    )
  }


}

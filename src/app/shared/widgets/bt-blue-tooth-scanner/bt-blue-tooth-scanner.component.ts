import { Component, OnInit, Input,OnDestroy } from '@angular/core';
// import { BarcodeScanner } from '@ionic-native/barcode-scanner';
// import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Capacitor, Plugins } from '@capacitor/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
// import { BluetoothSerial } from '@ionic-native/bluetooth-serial/ngx';
import { Observable, Subscription } from 'rxjs';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
const { BluetoothSerial } = Plugins;

@
 Component({
  selector: 'app-bt-blue-tooth-scanner',
  templateUrl: './bt-blue-tooth-scanner.component.html',
  styleUrls: ['./bt-blue-tooth-scanner.component.scss']
})

export class BtBlueToothScannerComponent implements OnInit,OnDestroy {

  @Input() toolbarScanner: boolean;

  inputForm:  UntypedFormGroup;
  get platForm() {  return Capacitor.getPlatform(); }
  scanningOn: boolean;
  data      : string;
  deviceAdddress: string;
  unpairedDevices : any[];

  pairedDevices   : any;
  gettingDevices  : Boolean;
  inputData       = "";
  scanningEnabled : boolean
  device          : any;
  dataSelected    : any;
  // https://www.npmjs.com/package/usb-barcode-scanner
    // https://ionicframework.com/docs/native/bluetooth-serial
  // https://www.npmjs.com/package/capacitor-bluetooth-serial
  // const { BluetoothSerial } = Plugins;

  // openScanner = async () => {
  //   const data = await BarcodeScanner.scan();
  //   console.log(`Barcode data: ${data.text}`);
  //   this.snackBar.open(`Data Read ${data.text}`, 'success')
  //   this.data = data.text
  // };

  // initSubscription() {
  //   this.inputForm.controls['device'].valueChanges.subscribe(value => {
  //     console.log(value);
  //   });
  //   this._select = this.inputForm.valueChanges.subscribe(data=>{
  //     // this.saveDevice(data)
  //   });
  // }

  _scanner    : Subscription;
  scannerData : any;
  scanner$    : Observable<any>;

  replacerFunc = () => {
    const visited = new WeakSet();
    return (key, value) => {
      if (typeof value === "object" && value !== null) {
        if (visited.has(value)) {
          return;
        }
        visited.add(value);
      }
      return value;
    };
  };

  constructor(
              private snackBar: MatSnackBar,
              ) {

    BluetoothSerial.enable();
  }

  ngOnInit(): void {
    console.log('this.platForm', this.platForm);
    if (this.platForm != 'web') {
      this.scanningOn = true
    }
    this.startScanning();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._scanner.unsubscribe()
    this.disconnect()
  }

  async bluetoothSerialConnect(address) {

    // this.snackBar.open('Item bluetoothSerialConnect', address )
    const bt$ =  BluetoothSerial.connect(address);

    bt$.subscribe(data =>{
      this.bluetoothSerialRead();
      this.snackBar.open('Item Assigned', data)
    }, err =>
    {
      this.snackBar.open('Item scanner connect failed ' + address,err)
    })

  }

  bluetoothSerialRead() {
    if (BluetoothSerial.isConnected()){
      this.scanner$  = BluetoothSerial.subscribe('')
      this.snackBar.open('Item scanner')
      this._scanner = this.scanner$.subscribe(data=> {
        this.scannerData = data;
        console.log(data)
      }, err =>
      {
        this.snackBar.open('Item scanner',err)
      })
    }

  }

  // initBarSubscription() {
  //   this._openBar = this.toolbarUIService.orderBar$.subscribe(data => {
  //     this.openBar = data
  //   })
  // }
  refreshScan() {
    this.startScanning();
  }

  success = (data) => alert('success ' + data);
  fail = (error) => alert('failure ' + error);

  startScanning() {

    this.pairedDevices = null;
    this.unpairedDevices = null;
    this.gettingDevices = true;

    BluetoothSerial.scan().then( data => {
      this.unpairedDevices = data;
      this.pairedDevices = data
      this.snackBar.open('Discovery Success', JSON.stringify(data), {duration: 2000})
      this.gettingDevices = false;
    }, err => {
      this.snackBar.open('Blue tooth discovery error', JSON.stringify(err), {duration: 2000})
    })
  }

  selectDevice() {
    try {
      // const result = JSON.stringify(address, this.replacerFunc())

      this.snackBar.open('item connecting', this.deviceAdddress, {duration: 2000})

      this.dataSelected = this.deviceAdddress;
      if (this.dataSelected != '') {
        BluetoothSerial.connect( { address: this.dataSelected} ).then(this.success, this.fail);

        // BluetoothSerial.available().then(data =>{
        //   this.snackBar.open('item avalible', data, {duration: 2000})
        //   BluetoothSerial.read().then(data =>{
        //     this.snackBar.open('Item Assigned', data, {duration: 2000})
        //   });
        // });
      }
    } catch (error) {
      this.snackBar.open('err', error , {duration: 3000})
    }

  }




  saveDevice(event){
    console.log(this.deviceAdddress);
    this.bluetoothSerialConnect(this.deviceAdddress)
    //  this.snackBar.open('Item selected', this.deviceAdddress)
    //  this.selectDevice(this.deviceAdddress);
    // console.log(`saveDevice ${item}`)
    // if (item) {
    //   if (item.address) {
    //     console.log(`saveDevice ${item}`)
    //     this.selectDevice(item)
    //     if (item) {
    //       // localStorage.setItem('btScanner', item)
    //     }
    //   }
    // }
  }



  disconnect() {
    BluetoothSerial.disconnect();
  }

}

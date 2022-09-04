import { Injectable } from '@angular/core';
import { Admin, Amount, Transaction } from './../models/models';

@Injectable({
  providedIn: 'root'
})
export class PointlessCCDsiAngularService {

  constructor() { }

  // private static final int PERMISSION_REQUEST_FINE_LOCATION = 1;
  // private static final int PERMISSION_REQUEST_BACKGROUND_LOCATION = 2;
  // private static final int REQUEST_ENABLE_BT = 3;
  // private static final String VP300_USB = "IDTECH-VP3300-USB";
  // private static final String VP300_RS232 = "IDTECH-VP3300-RS232";
  // private static final String LANE3000_IP = "INGENICO_LANE_3000_IP";
  // private BluetoothAdapter mBtAdapter;
  // private DialogInterface.OnClickListener mDeviceSelection;
  // private String mConnectedDevice = "";
  // private int mNamePos = 1;
  // private String[] mDeviceList = {"", "", "", "", "", "", "", ""};
  // private AlertDialog mBTdialog;

  setupSale(device: string, amount: string, merchantID: string, padIP: string, padPort: string, operationMode: string, refNo: string, secureDevice: string) {
      const amt      = {} as Amount
      amt.amount     = amount;
      const  newSale = {} as Transaction
      newSale.userTrace     = merchantID
      newSale.pOSPackageID  = "PointlessPOS1.0"
      newSale.secureDevice  = "EMVUSClient:1.27"
      newSale.tranCode      = "EMVSale"
      newSale.secureDevice  = "10"
      newSale.sequenceNo    = "0010010010"
      newSale.operationMode = operationMode
      newSale.secureDevice  = "RecordNumberRequested"
      // newSale.amount        = amt.amount
      newSale.refNo         = refNo

      if (secureDevice) {
        newSale.secureDevice  = secureDevice
      }

      if (device === 'LANE3000_IP') {
        if (padIP) {
          newSale.pinPadIpAddress  =  padIP
        }

        if (padPort) {
          newSale.padPort       = padPort
        }

        if (secureDevice) {
          newSale.secureDevice  = secureDevice // "EMV_LANE3000_DATACAP_E2E",
        }
      }

      if (device === 'VP300_USB' || device === 'VP300_RS232') {
          secureDevice = "EMV_VP3300_DATACAP";
          //RS232 takes a different secure device name
          if (device === 'VP300_RS232') {
            secureDevice = "EMV_VP3300_DATACAP_RS232";
          }
          newSale.secureDevice  = secureDevice
      }

      const tStream = new TStream();
      const admin = {} as Admin;
      tStream.TStream(newSale, admin);


  }

  setupParamDownload(device: string,merchantID: string, padIP: string, padPort: string, operationMode: string, refNo: string, secureDevice: string) {

    const admin         = {} as Admin;
    admin.userTrace     = merchantID
    admin.pOSPackageID  = "PointlessPOS1.0"
    admin.secureDevice  = "EMVUSClient:1.27"
    admin.tranCode      = "EMVSale"
    admin.secureDevice  = "10"
    admin.sequenceNo    = "0010010010"
    admin.operationMode = operationMode

    if (device === 'LANE3000_IP') {

    }

    if (device === 'VP300_USB' || device === 'VP300_RS232') {
      secureDevice = "EMV_VP3300_DATACAP";
      if (device === 'VP300_RS232') {
        secureDevice = "EMV_VP3300_DATACAP_RS232";
      }
      admin.secureDevice  = secureDevice
    }

  }

}

@Injectable({
  providedIn: 'root'
})
export class TStream {

  Transaction = {} as Transaction;
  Admin = {} as Admin;

  constructor() {
  }

  TStream(transaction: Transaction, admin: Admin){
    this.Transaction = transaction;
    this.Admin = admin;
  }

  getAdmin() {
    return this.Admin;
  }

  setAdmin(admin: Admin ) {
      this.Admin = admin;
  }

  getTransaction() {
    return this.Transaction;
  }

  setTransaction(transaction: Transaction) {
    this.Transaction = transaction;
  }
}

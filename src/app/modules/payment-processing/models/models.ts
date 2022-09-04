export interface Amount {
  purchase: string;
  authorize: string;
  amount: string;
}

export interface TranResponse {
  Amount: Amount;
  EntryMethod: string;
  TranCode: string;
  AuthCode: string;
  CaptureStatus: string;
  RefNo: string;
  InvoiceNo: string;
  RecordNo: string;
  TextResponse: string;
  Date: string;
  Time: string;
  AcctNo: string;
  AcqRefData: string;
}
export interface Transaction {
   merchantID: string;
   userTrace: string;
   pOSPackageID: string;
   tranCode: string;
   secureDevice: string;
   invoiceNo: string;
   amount: string;
   sequenceNo: string;
   bluetoothDeviceName: string;
   operationMode: string;
   recordNo: string;
   refNo: string;
   pinPadIpAddress: string;
   padPort: string;
}

export interface Admin {
   merchantID: string;
   userTrace: string;
   pOSPackageID: string;
   tranCode: string;
   secureDevice: string;
   sequenceNo: string;
   bluetoothDeviceName: string;
   operationMode: string;
}

export interface BoltTerminal {
  site: string;
  url: string;
  authorization: string;
  merchantID: string;
  hsn: string;
  xSessionKey: string;
  expiry: string;
}

export interface BoltInfo {
  hsn: string;
  merchID: string;
  deviceName: string;
  apiURL: string;
}

export interface CardPointGateWay {
  site: string;
  url: string;
  csurl: string;
  merchid: string;
  currency: string;
  expiry: string;
  account: string;
  token: string;
  retref: string;
  profileid: string;
  acctid: string;
  batchid: string;
  date: string;
}

export interface  BoltConnectResponse {
    errorCode : string;
    errorMessage : string;
    token : string;
    expiry : string;
    name : string;
    xSessionKey: string;
}

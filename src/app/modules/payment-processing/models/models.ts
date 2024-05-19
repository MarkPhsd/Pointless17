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
   gratuity: string;
   sequenceNo: string;
   bluetoothDeviceName: string;
   operationMode: string;
   recordNo: string;
   refNo: string;
   pinPadIpAddress: string;
   pinPadIpPort: string;
   prodCertMode: string;
   Line1: string;
   Line2: string;
   Line3: string;
   Line4: string;
   Line5: string;
   Line6: string;
   Line7: string;
   Line8: string;
   Line9: string;
   Line10: string;
   Line11: string;
   Line12: string;
   Line13: string;
   Line14: string;
   Line15: string;
   Line16: string;
   Line17: string;
   Line18: string;
   Line19: string;
   Line20: string;
   Line21: string;
   Line22: string;
   Line23: string;
   Line24: string;
   Line25: string;
   Line26: string;
   Line27: string;
   Line28: string;
   Line29: string;
   Line30: string;
   Line31: string;
   Line32: string;
   Line33: string;
   Line34: string;
   Line35: string;
   Line36: string;
   Line37: string;
   Line38: string;
   Line39: string;
   Line40: string;
   Line41: string;
   Line42: string;
   Line43: string;
   Line44: string;
   Line45: string;
   Line46: string;
   Line47: string;
   Line48: string;
   Line49: string;
   Line50: string;
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
  id: number;
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

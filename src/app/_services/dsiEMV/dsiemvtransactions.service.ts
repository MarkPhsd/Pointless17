import { Injectable } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { XMLParser, XMLBuilder, XMLValidator} from 'fast-xml-parser';
import { DSIEMVSettings, UISettingsService } from '../system/settings/uisettings.service';
import { Subscription } from 'rxjs';

export interface topLevel {
  TStream: TStream;
}
export interface TStream {
  Transaction: Transaction;
}

export interface Transaction {
  HostOrIP:                        string;
  IpPort:                          string;
  MerchantID:                      string;
  TerminalID:                      string;
  POSPackageID:                    string;
  OperatorID:                      string;
  UserTrace:                       string;
  CardType:                        string;
  TranCode:                        string;
  TranType:                        string;
  CollectData:                     string;
  SecureDevice:                    string;
  ComPort:                         string;
  PinPadIpAddress:                 string;
  PinPadIpPort:                    string;
  Account:                         Account;
  InvoiceNo:                       string;
  RefNo:                           string;
  ReturnClearExpDate:              string;
  Amount                          :Amount;
  FSABins:                         string;
  SequenceNo:                      string;
  OKAmount:                        string;
  ReturnClearCardBin:              string;
  LaneID:                          string;
  Duplicate:                       string;
  AVS:                             Avs;
  TranInfo:                        TranInfo;
  AuthCode:                        string;
  AcqRefData:                      string;
  PartialAuth:                     string;
  RecordNo:                        string;
  Frequency:                       string;
  RecurringData:                   string;
  DisplayTextHandle:               string;
  ForceOffline:                    string;
  MaxTransactions:                 string;
  OfflineTransactionPurchaseLimit: string;
  ProcessData:                     string;
}

export interface Avs {
  Address: string;
  Zip:     string;
}

export interface Account {
  AcctNo: string;
}

export interface Amount {
  Purchase: string;
  Gratuity: string;
  CashBack: number;
  Tax: number;
  SurchargeWithLookup: string;
  FSAPrescription: string;
  FSAVision: number;
  FSAClinical: number;
  FSADental: number;
  FSATotalAmount: number;
}

export interface TranInfo {
  CustomerCode: string;
}

// Generated by https://quicktype.io
export interface RStream {
  CmdResponse:  CmdResponse;
  TranResponse: TranResponse;
  PrintData:    PrintData;
}

export interface TranResponse {
  MerchantID:       string;
  TerminalID:       string;
  AcctNo:           string;
  CardType:         string;
  TranCode:         string;
  AuthCode:         string;
  AVSResult:        string;
  CVVResult:        string;
  CaptureStatus:    string;
  RefNo:            string;
  InvoiceNo:        string;
  OperatorID:       string;
  ExpDate:          string;
  ExpDateMonth:     string;
  ExpDateYear:      string;
  CardBin:          string;
  Amount:           Amount;
  CardholderName:   string;
  AcqRefData:       string;
  PostProcess:      string;
  ProcessData:      string;
  RecordNo:         string;
  RecurringData:    string;
  EntryMethod:      string;
  Date:             string;
  Time:             string;
  ApplicationLabel: string;
  AID:              string;
  TVR:              string;
  IAD:              string;
  TSI:              string;
  ARC:              string;
  CVM:              string;
}

export interface CmdResponse {
  ResponseOrigin: string;
  DSIXReturnCode: string;
  CmdStatus:      string;
  TextResponse:   string;
  SequenceNo:     string;
  UserTrace:      string;
}

export interface PrintData {
  Line1: string;
  LineN: string;
}

@Injectable({
  providedIn: 'root'
})
export class DSIEMVTransactionsService {

  options = {
      attributeNamePrefix : "@_",
      //attrNodeName: false,
      //textNodeName : "#text",
      ignoreAttributes: true,
      ignoreNameSpace: false,
  };

  jsonOptions = {
      attributeNamePrefix : "@_",
      //attrNodeName: false,
      //textNodeName : "#text",
      ignoreAttributes : false,
      ignoreNameSpace: false,
      //format: true,
      //indentBy: "  ",
      //supressEmptyNode: false,
  };

  private dsiResponse         : any;
  private dsiEMVSettings      : DSIEMVSettings;
  private dsiEMVSubscriptions$: Subscription;

  initSubscriptions() {
    this.uiSettingService.dsiEMVSettings$.subscribe(data => {
      this.dsiEMVSettings = data
    })
  }

  constructor
      (private electronService: ElectronService,
        private uiSettingService : UISettingsService,
      ) {
      this.initSubscriptions();
  }

  async mercuryPinPadReset(transaction: Transaction): Promise<RStream> {
    if (!transaction) { return }
    const tstream       = {} as TStream;
    tstream.Transaction = transaction
    const builder       = new XMLBuilder(null)
    const xml           = builder.build(tstream);
    console.log(xml)
    let response        : any;
    try {
      const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
      response = await emvTransactions.PINPadReset(xml)
    } catch (error) {
      console.log('error', error)
    }
    if (response === 'reset failed') {
      this.dsiResponse = 'Pin Pad Reset Failed'
      return;
    }
    if (response) {
      const parser  = new XMLParser(null);
      this.dsiResponse =  parser.parse(response)
      return this.dsiResponse;
    }
    const dsiResponse = {} as RStream;
    return dsiResponse;
  }

  async pinPadReset(transaction: Transaction): Promise<RStream> {
    if (!transaction) { return }
    const tstream       = {} as TStream;
    tstream.Transaction = transaction
    const topLevel = {} as topLevel;
    topLevel.TStream = tstream;
    const builder       = new XMLBuilder(this.options)
    const xml           = builder.build(topLevel);
    let response        : any;
    try {
      const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
      response = await emvTransactions.PINPadReset(xml)
    } catch (error) {
      console.log('error', error)
      return  error
    }
    if (response === 'reset failed') {
      this.dsiResponse = 'Pin Pad Reset Failed'
      return  this.dsiResponse
    }
    if (response) {
      const parser  = new XMLParser(null);
      this.dsiResponse =  parser.parse(response)
      return this.dsiResponse;
    }
    const dsiResponse = {} as RStream;
    return dsiResponse;
  }

  async mercuryPinPadTest(): Promise<any> {
    let transaction = {} as Transaction;
    transaction  = this.getPadSettings(transaction)
    if (transaction) {
      const tstream = {} as TStream;
      tstream.Transaction = transaction
      const builder = new XMLBuilder(this.options)
      const xml = builder.build(tstream);
      console.log(xml)
      const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
      const response = await emvTransactions.MercuryPinPadTest(xml)
      console.log('response', response)
      return response
    }
  }

  async emvTransaction(transaction: Transaction): Promise<RStream> {
    if (!transaction) { return }
    const tstream       = {} as TStream;
    tstream.Transaction = transaction
    const topLevel      = {} as topLevel;
    topLevel.TStream    = tstream;
    const builder       = new XMLBuilder(this.options)
    const xml           = builder.build(topLevel);
    let response        : any;
    try {
      const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
      response              = await emvTransactions.EMVTransaction(xml)

    } catch (error) {
      console.log('error', error)
      return  error
    }
    if (response === 'reset failed') {
      this.dsiResponse = 'Pin Pad Reset Failed'
      return  this.dsiResponse
    }
    if (response) {
      const parser  = new XMLParser(null);
      let dsiResponse =  parser.parse(response)
      return dsiResponse;
    }
  }


  async testADODBConnection() {
    const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
    const response = await emvTransactions.testADODBConnection()
    console.log('response', response)
    return response
  }

  async textActiveX(pathName: string) {
    const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
    const response = await emvTransactions.textActiveX(pathName)
    console.log('response', response)
    return response
  }

  runOpenWord() {
    const xml = this.getResetXML()
    const PadReset = this.electronService.remote.require('./datacap/transactions.js');
    const response = PadReset.openWord();
    return response
  }

  runEMVPadReset() {
    const xml = this.getResetXML()
    const winax = this.electronService.remote.require('./datacap/transactions.js');
    const response = winax.EMVPadReset(xml);
    return response
  }

  runCreateFile() {
    const xml = this.getResetXML()
    const winax = this.electronService.remote.require('./datacap/transactions.js');
    const response = winax.createFile();
    return response
  }

  async getResetXML() {
    //  const settings = await this.uiSettingService.getDSIEMVSettings();
    //  const item = {} as TStream
    //  const transaction = {} as Transaction;
  }

  private getPadSettings(transaction: Transaction): Transaction {
    if (this.dsiEMVSettings && transaction) {
      transaction.IpPort        = this.dsiEMVSettings.IpPort
      transaction.TerminalID    = this.dsiEMVSettings.TerminalID
      transaction.OperatorID    = this.dsiEMVSettings.OperatorID
      transaction.UserTrace     = this.dsiEMVSettings.UserTrace
      transaction.TranCode      = this.dsiEMVSettings.TranCode
      transaction.SecureDevice  = this.dsiEMVSettings.SecureDevice
      transaction.ComPort       = this.dsiEMVSettings.ComPort
      transaction.PinPadIpPort  = this.dsiEMVSettings.PinPadIpPort
      transaction.SequenceNo    = '0010010010'
      transaction.HostOrIP      = this.dsiEMVSettings.HostOrIP;
      return transaction
    }
    return null
  }

}


    // <HostOrIP>127.0.0.1</HostOrIP>
    //       <IpPort>9000</IpPort>
    //       <MerchantID>700000012262</MerchantID>
    //       <TerminalID>001</TerminalID>
    //       <POSPackageID>EMVUSClient:1.26</POSPackageID>
    //       <OperatorID>TEST</OperatorID>
    //       <UserTrace>Dev1</UserTrace>
    //       <TranCode>EMVPadReset</TranCode>
    //       <SecureDevice>EMV_VX805_PAYMENTECH</SecureDevice>
    //       <ComPort>1</ComPort>
    //       <PinPadIpAddress>192.168.0.18</PinPadIpAddress>
    //       <PinPadIpPort>12000</PinPadIpPort>
    //       <SequenceNo>0010010010</SequenceNo>
    //       <DisplayTextHandle>00101484</DisplayTextHandle>

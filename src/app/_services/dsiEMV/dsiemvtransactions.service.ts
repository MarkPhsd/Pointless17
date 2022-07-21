import { Injectable, OnDestroy } from '@angular/core';
import { ElectronService } from 'ngx-electron';
import { XMLParser, XMLBuilder, XMLValidator} from 'fast-xml-parser';
import { DSIEMVSettings, UISettingsService } from '../system/settings/uisettings.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

export interface topLevel {
  TStream: TStream;
}
export interface TStream {
  Transaction: Transaction;
  Admin      : Transaction;
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
  BatchNo:                         string;
  BatchItemCount:                  string;
  NetBatchTotal:                   string;
}

export interface Avs {
  Address: string;
  Zip:     string;
}

export interface Account {
  AcctNo: string;
}

export interface Amount {
  Authorize: string;
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
  BatchSummary: BatchSummary
}

export interface BatchSummary {
  MerchantID: string;
  BatchNo: string;
  BatchItemCount: string;
  NetBatchTotal: string;
}

export interface BatchClose {
	MerchantID: string;
	BatchNo: string;
	BatchItemCount: string;
	NetBatchTotal: string;
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
export class DSIEMVTransactionsService implements OnDestroy {

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

  private dsiResponse          : any;
  private dsiEMVSettings       : DSIEMVSettings;
  private _dsiEMVSubscriptions : Subscription;

  initSubscriptions() {
    this._dsiEMVSubscriptions = this.uiSettingService.dsiEMVSettings$.subscribe(data => {
      this.dsiEMVSettings = data
    })
  }

  constructor
      (private electronService: ElectronService,
        private matSnack        : MatSnackBar,
        private uiSettingService : UISettingsService,
      ) {
      this.initSubscriptions();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._dsiEMVSubscriptions) {this._dsiEMVSubscriptions.unsubscribe()}
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
      const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
      const response = await emvTransactions.MercuryPinPadTest(xml)
      console.log('response', response)
      return response
    }
  }

  async emvBatch(transaction: Transaction, batchSummary: BatchSummary): Promise<any> {

    if (!transaction || !batchSummary) {
      this.matSnack.open('Issue retrieving transaction or batch summary.', 'Alert', {duration: 1500});
      return
    }

    transaction.OperatorID     = 'Admin';
    transaction.TranType       = 'Administrative'
    transaction.TranCode       = 'BatchClose'
    transaction.SequenceNo     = '0010010010'
    transaction.BatchItemCount = batchSummary.BatchItemCount;
    transaction.NetBatchTotal  = batchSummary.NetBatchTotal;
    transaction.BatchNo        = batchSummary.BatchNo;
    console.log('emvBatch transaction 1', transaction)

    if (!transaction) { return };
    console.log('emvBatch transaction 2', transaction)

    const tstream       = {} as TStream;
    tstream.Admin       = transaction
    const topLevel      = {} as topLevel;
    topLevel.TStream    = tstream;
    const builder       = new XMLBuilder(this.options)
    const xml           = builder.build(topLevel);
    let response        : any;
    console.log('emvBatch xml', xml)
    try {
      const emvTransactions = this.electronService.remote.require('./datacap/transactions.js');
      response              = await emvTransactions.EMVTransaction(xml)
      console.log('EMV Batch Response', response)
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

  async emvBatchInquire(transaction: Transaction): Promise<RStream> {
    if (!transaction) { return }

    transaction.TranType      = 'Administrative'
    transaction.TranCode      = 'BatchSummary'
    transaction.SequenceNo    = '0010010010'

    if (!transaction) { return }

    const tstream       = {} as TStream;
    tstream.Admin       = transaction
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

  async getBatchInquireValues(transaction: Transaction): Promise<any> {
    const dsiResponse     = await this.emvBatchInquire(transaction)
    try {
      if (dsiResponse?.CmdResponse?.TextResponse.toLowerCase() != 'success'.toLowerCase()) {
        this.matSnack.open(`Batch inquire problem: ${dsiResponse.CmdResponse.TextResponse}`, 'Check Batching Info')
        return null;
      }
    } catch (error) {

    }
    return dsiResponse;
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
      if (transaction.SecureDevice.toLowerCase() === 'test') {

        const cmdResponse = {} as CmdResponse;
        cmdResponse.TextResponse = 'Approved';
        const rStream = {} as RStream;
        rStream.CmdResponse = cmdResponse;
        const TranResponse  = {}  as TranResponse;
        if (transaction.TranCode.toLowerCase() === 'EMVVoid'.toLowerCase()) {
          const tran = this.getFakeVoidResponse(transaction)
          rStream.TranResponse = tran;
        }
        if (transaction.TranCode.toLowerCase() === 'EMVSale'.toLowerCase()) {
          const tran = this.getFakeSaleReponse(transaction)
          rStream.TranResponse = tran;
        }
        return rStream
      }
    } catch (error) {
      console.log('error', error)
      return  error
    }


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

  private getPadSettings(transaction: Transaction)  {
      transaction.OperatorID    = this.dsiEMVSettings.operatorID
      transaction.UserTrace     = this.dsiEMVSettings.userTrace
      transaction.TranCode      = this.dsiEMVSettings.tranCode
      transaction.SecureDevice  = this.dsiEMVSettings.secureDevice
      transaction.ComPort       = this.dsiEMVSettings.comPort
      transaction.PinPadIpPort  = this.dsiEMVSettings.pinPadIpPort
      transaction.SequenceNo    = '0010010010'
      transaction.HostOrIP      = this.dsiEMVSettings.hostOrIP;
      return transaction
  }

  getFakeSaleReponse(transaction: Transaction): TranResponse {
    const response = {} as TranResponse;
    response.Amount = transaction.Amount;
    response.CaptureStatus = 'Approved';
    response.EntryMethod = 'Test';
    response.TranCode = 'EMVSale';
    response.CardType = 'VISA'
    return response
  }

  getFakeVoidResponse(transaction: Transaction): TranResponse {
    const response = {} as TranResponse;
    response.Amount = transaction.Amount;
    response.CaptureStatus = 'Approved';
    response.EntryMethod = 'Test';
    response.TranCode = 'EMVSale';
    response.CardType = 'VISA'
    return response
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

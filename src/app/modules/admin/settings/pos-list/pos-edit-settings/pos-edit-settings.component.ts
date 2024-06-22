import { Component,  OnInit,  ViewChild,  TemplateRef , Inject} from '@angular/core';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Observable, of, switchMap } from 'rxjs';
import { CardPointBoltService, PointlessCCDSIEMVAndroidService } from 'src/app/modules/payment-processing/services';
import { IServiceType, ISetting } from 'src/app/_interfaces';
import { FileSystemService } from 'src/app/_services/fileSystem/file-system.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { DSIEMVSettings, TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { ActivatedRoute, Route } from '@angular/router';
import { DcapService } from 'src/app/modules/payment-processing/services/dcap.service';
@Component({
  selector: 'app-pos-edit-settings',
  templateUrl: './pos-edit-settings.component.html',
  styleUrls: ['./pos-edit-settings.component.scss']
})
export class PosEditSettingsComponent implements OnInit {

  triPOSMarkets = [{name: 'FoodRestaurant', id:7},{name: 'Retail', id:4}]
  action$ : Observable<any>;
  @ViewChild('androidPrintingTemplate') androidPrintingTemplate: TemplateRef<any>;
  @ViewChild('androidDCapButtonView') androidDCapButtonView: TemplateRef<any>;
  //getDcapAndroidDeviceList
  dcapAndroidDeviceList: string[]
  inputForm: UntypedFormGroup;
  dsiEMVSettings: FormGroup;
  setting  : any;
  terminal : ITerminalSettings;
  saving$  : Observable<ISetting>;
  saving   : boolean;
  blueToothDeviceList: any;

  btPrinter: string;
  btPrinters$: any;
  btPrinters: any;
  serviceType$    : Observable<IServiceType[]>;
  electronPrinterList : any;
  receiptPrinter: string;
  uisettings$: Observable<TransactionUISettings>;
  uiSettings: TransactionUISettings;
  pingCardPointTerminals$: Observable<any>;
  cardPointTerminals$ : Observable<any>;
  cardPointTerminals = [] as string[];
  id: any;
  androidDisplay: any;
  processing$: Observable<any>;

  medOrRecStoreList = [
    {id:0,name:'Any'},  {id:1,name:'Med'},  {id:2,name:'Rec'}
  ]

  constructor(
    private fb                  : UntypedFormBuilder,
    private sitesService        : SitesService,
    private settingsService     : SettingsService,
    public  deviceService       : DeviceDetectorService,
    private dSIEMVAndroidService: PointlessCCDSIEMVAndroidService,
    private platFormService     : PlatformService,
    private btPrinterService    : BtPrintingService,
    private printingService     : PrintingService,
    private uiSettingService    : UISettingsService,
    private fileSystemService   : FileSystemService,
    private serviceTypeService: ServiceTypeService,
    public  labelingService: LabelingService,
    private cardPointBoltService: CardPointBoltService,
    public route        : ActivatedRoute,
    private dCapService           : DcapService,
    private dialogRef   : MatDialogRef<PosEditSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number ) {

      this.initUiSettings()
      this.id = this.route.snapshot.paramMap.get('id');
      console.log('id',  this.id)
      if (this.id) {
        const site = this.sitesService.getAssignedSite()
        console.log('site url', site.url)
        this.action$ = this.settingsService.getSetting(site, this.id).pipe(switchMap(data => {
          console.log('data', data)
          this.initData(data)
          return of(data)
        }))
        return;
      }

      this.initData(data)
  }

  initUiSettings() {
    this.uisettings$ = this.settingsService.getUITransactionSetting().pipe(switchMap(data => {
      this.uiSettings = data;
      if (data.cardPointBoltEnabled) {
        this.setCardPointTermialsObservable()
      }
      return of(data)
    }))
  }

  initData(data) {
    if (data) {
      this.setting = data
      if (!this.setting.text) {
        this.terminal  = {} as ITerminalSettings;
        this.terminal.name = this.setting.name = 'New Terminal'
        this.terminal.enabled = true;
        this.terminal.resetOrdersFilter = true;
        this.terminal.medicalRecSales = 0
        this.initForm()
        return
      }
      if (this.setting.text){
        try {
          this.terminal = JSON.parse(this.setting.text)  as ITerminalSettings;
        } catch (error) {
          this.terminal  = {} as ITerminalSettings;
          this.terminal.name = this.setting.name = 'New Terminal'
          this.terminal.enabled = true;
          this.terminal.resetOrdersFilter = true;
          this.terminal.medicalRecSales = 0
        }
        this.initForm()
      }
    }
  }

  pingTermialObservable() {
    const site = this.sitesService.getAssignedSite()

    const hsn = this.inputForm.controls['cardPointeHSN'].value;
    if (hsn) {
      this.pingCardPointTerminals$ = this.cardPointBoltService.ping(site.url, hsn)
    }
  }

  androidDCapButtonTemplate() {
    if (this.dcapAndroidDeviceList) {
      return this.androidDCapButtonTemplate
    }
    return null;
  }

  get isAndroid() {
    if (this.platFormService.androidApp) {
      return true
    }
    return false
  }

  async getDcapAndroidDeviceList() {
      const list = await this.dSIEMVAndroidService.getDeviceInfo()
      this.dcapAndroidDeviceList = list;
  }

  setCardPointTermialsObservable() {
    const site = this.sitesService.getAssignedSite()
    this.cardPointTerminals$ = this.cardPointBoltService.listTerminals(site.url).pipe(switchMap(data => {
      // console.log('setCardPointTermialsObservable', data)
      this.cardPointTerminals = []
      data?.terminals.forEach(item => {
        this.cardPointTerminals.push(item)
      });
      return of(data)
    }))
  }

  async ngOnInit() {
    this.initForm()
    await this.listBTDevices();
    await this.getAndroidPrinterAssignment()
    const site = this.sitesService.getAssignedSite()
    this.serviceType$ = this.serviceTypeService.getAllServiceTypes(site);
  }

  async createZPLFolderData() {
    // if (this.app)
    await this.fileSystemService.makeDirectory('c:\\pointless');
    await this.fileSystemService.makeFile('c:\\pointless', 'print.txt')
  }

  async  getAndroidPrinterAssignment() {
    if (this.platFormService.androidApp) {
      this.btPrinters   = await this.btPrinterService.searchBluetoothPrinter()
      this.btPrinters$  = this.btPrinterService.searchBluetoothPrinter();
    }
  }

  listPrinters(): any {
    this.electronPrinterList = this.printingService.listPrinters();
  }

  setElectronPrinterName(event) {
    this.receiptPrinter = event
  }

  async listBTDevices() {
    this.blueToothDeviceList = await this.dSIEMVAndroidService.listBTDevices();
  }

  initForm() {
    this.inputForm = this.fb.group({
      medicalRecSales    : [],
      receiptPrinter     : [],
      labelPrinter       : [],
      labelPrinter2      : [],
      enabled            : [],
      resetOrdersFilter  : [],
      name:                ['', [ Validators.required, Validators.maxLength(5) ]],
      deviceName         : [],
      dSISecureDevice    : [],
      cardPointeHSN      : [],
      btPrinter          : [],
      bluetoothDeviceName: [],
      electronZoom       : [],
      triposLaneID       : [],
      enableExitLabel    : [],
      exitOrderOnFire    : [],
      enableScale        : [],
      ignoreTimer        : [],
      defaultOrderTypeID: [],
      triPOSMarketCode: [],
      enablePrepView  : [],
      defaultLabel    : [],
      dsiEMVSettings  :[],
      printServerTime   :[], //: number;
      printServerEnable :[],// : boolean;
      remoteReceipt:[],//
      remotePrint: [],
      remotePrepPrint: [],
      disableImages: [],
      disableMenuImages: [],
      quickScanningDevice: [],
    })

    this.dsiEMVSettings = this.fb.group({
      id         :[],
      HostOrIP   :[],
      IpPort          :[],
      MerchantID       :[],
      TerminalID      :[],
      OperatorID      :[],
      POSPackageID    :['PointlessPOS/3.1'],
      TranDeviceID    :[],
      UserTrace       :[],
      TranCode        :[],
      SecureDevice    :[],
      ComPort         :[],
      PinPadIpAddress :[],
      PinPadIpPort    :[],
    SequenceNo      :[],
      DisplayTextHandle :[],
      enabled           :[],
      partialAuth       :[],
      deviceValue     : [],
      supressedForms  : [],
    })

    if (this.terminal) {
      this.inputForm.patchValue(this.terminal)
    }
    if (this.terminal) {
      this.dsiEMVSettings.patchValue(this.terminal?.dsiEMVSettings)
    }

  }

  get isDSIEnabled() {
    if (this.uiSettings) {
     if (this.uiSettings.dsiEMVNeteEpayEnabled ||
      this.uiSettings.dsiEMVIP ||
      this.uiSettings.dsiEMVAndroidEnabled ||
      this.uiSettings.dCapEnabled)
      return true
    }
    return false
  }

  get  isAndroidPrintingTemplate() {
    if (this.platFormService.androidApp) {
      return this.androidPrintingTemplate
    }
    return null
  }



  saveTerminalSetting(close: boolean) {
    const site = this.sitesService.getAssignedSite()
    const item = this.inputForm.value as ITerminalSettings;
    item.dsiEMVSettings = this.dsiEMVSettings.value as DSIEMVSettings
    const text = JSON.stringify(item);
    this.setting.name   = item.name;
    this.setting.text   = text;
    this.setting.filter = 421
    const id = this.setting.id;
    const setting = this.setting;

    this.saving$ = this.settingsService.putSetting(site, id, setting).pipe(
      switchMap( data => {
      if (close) {
        this.onCancel(true);
      }
      this.saving = true;
      this.uiSettingService.updatePOSDevice(item)
      return of(data)
    }));

  }

  setZoomValue(event) {
    this.inputForm.controls['electronZoom'].setValue(event)
  }

  saveSetting(event) {
    this.saveTerminalSetting(false)
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  updateExit(event) {
    this.saveTerminalSetting(true)
  }

  delete(event) {
    // const warn = window.confirm('Are you sure you want to delete this terminal?')
    // if (warn) {
      const site = this.sitesService.getAssignedSite()
      this.saving$ = this.settingsService.deleteSetting(site, this.setting.id)
      this.saving = true;
      this.saving$.subscribe(data => {
        this.onCancel(true);
      })
    // }
  }

  reset() {
    this.processing$ = this._reset();
  }

  _reset() {
    if (this.inputForm.controls['name'].value) {
      const device = this.inputForm.controls['name'].value;
      // this.initMessaging()

      return  this.dCapService.resetDevice(device).pipe(switchMap(data => {
        // this.processing = false;
        // this.result = data;
        this.sitesService.notify(JSON.stringify(data), 'close', 10000)
        return of(data);
      }))
    }
    return of(null)
  }

}

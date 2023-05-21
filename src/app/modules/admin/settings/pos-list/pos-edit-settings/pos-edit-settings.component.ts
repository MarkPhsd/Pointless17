import { Component, ElementRef, OnInit,  ViewChild, AfterViewInit, Input, TemplateRef , Inject} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DeviceDetectorService } from 'ngx-device-detector';
import { ElectronService } from 'ngx-electron';
import { Observable, of, switchMap } from 'rxjs';
import { PointlessCCDSIEMVAndroidService } from 'src/app/modules/payment-processing/services';
import { ISetting } from 'src/app/_interfaces';
import { FileSystemService } from 'src/app/_services/fileSystem/file-system.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BtPrintingService } from 'src/app/_services/system/bt-printing.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { ITerminalSettings,  SettingsService } from 'src/app/_services/system/settings.service';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { TriPOSMethodService } from 'src/app/_services/tripos/tri-posmethod.service';

@Component({
  selector: 'app-pos-edit-settings',
  templateUrl: './pos-edit-settings.component.html',
  styleUrls: ['./pos-edit-settings.component.scss']
})
export class PosEditSettingsComponent implements OnInit {
  @ViewChild('androidPrintingTemplate') androidPrintingTemplate: TemplateRef<any>;
  inputForm: UntypedFormGroup;
  setting  : any;
  terminal : ITerminalSettings;
  saving$  : Observable<ISetting>;
  saving   : boolean;
  blueToothDeviceList: any;

  btPrinter: string;
  btPrinters$: any;
  btPrinters: any;

  electronPrinterList : any;
  receiptPrinter: string;

  medOrRecStoreList = [
    {id:0,name:'Any'},  {id:1,name:'Med'},  {id:2,name:'Rec'}
  ]

  constructor(
    private _snackBar           : MatSnackBar,
    private fb                  : UntypedFormBuilder,
    private sitesService        : SitesService,
    private settingsService     : SettingsService,
    public  deviceService       : DeviceDetectorService,
    private dSIEMVAndroidService: PointlessCCDSIEMVAndroidService,
    private platFormService     : PlatformService,
    private btPrinterService    : BtPrintingService,
    private triPOSService       : TriPOSMethodService,
    private printingService     : PrintingService,
      private uiSettingService  : UISettingsService,
    private fileSystemService   : FileSystemService,
    private dialogRef           : MatDialogRef<PosEditSettingsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: number
  )
 {


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
          this.initForm()
        }
      }
    }
 }

  async ngOnInit() {
    this.initForm()
    await this.listBTDevices();
    await this.getAndroidPrinterAssignment()
  }

  async createZPLFolderData() {

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
      enableExitLabel : [],
      enableScale: [],
      ignoreTimer: [],
    })

    if (this.terminal) {
      this.inputForm.patchValue(this.terminal)
    }
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
    const text = JSON.stringify(item);
    this.setting.name   = item.name;
    this.setting.text   = text;
    this.setting.filter = 421
    const id = this.setting.id;

    const setting = this.setting;

    console.log(id, setting)
    this.saving$ = this.settingsService.putSetting(site, id, setting).pipe(
      switchMap( data => {
      if (close) {
        this.onCancel(true);
      }
      this.saving = true;
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
}

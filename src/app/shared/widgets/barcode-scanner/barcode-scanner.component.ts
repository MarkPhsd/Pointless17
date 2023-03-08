import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DlParserService } from 'src/app/_services/people/dl-parser.service';
import { ISetting, IUserProfile } from 'src/app/_interfaces';
import { ActionSheetController } from '@ionic/angular';
import { Plugins} from '@capacitor/core';
import { CameraPreviewOptions }  from '@capacitor-community/camera-preview';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';
import '@capacitor-community/camera-preview';

const { CameraPreview } = Plugins;
// https://medium.com/cashify-engineering/barcode-reader-using-google-mobile-vision-88b3e9f31668
// https://www.ionicanddjangotutorial.com/ionic-qrcode-scanning/
// https://github.com/DutchConcepts/capacitor-barcode-scanner#usage
// (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');
import { catchError, Observable, of, switchMap } from 'rxjs';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-barcode-scanner',
  templateUrl: './barcode-scanner.component.html',
  styleUrls: ['./barcode-scanner.component.scss']
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {

  window: any;
  err   : string;

  user      : IUserProfile;
  result    : any;
  // barcodeScanner: BarcodeScannerPlugin
  // BarcodeScanner = Plugins;
  qrResults: string;
  status: any;
  error: string;
  scanActive: boolean ;
  image: any;
  scanStatus: string;
  scanResult: string;
  statusCheckPermision: string;
  uiTransactions  = {} as TransactionUISettings;
  uiTransactions$  : Observable<TransactionUISettings>;
  // Dim UI = Await settingController._GetUITransactionSetting()
  // Dim doNotSaveValues = UI.idParseOnlyAgeConfirmation

  @ViewChild('video') video: ElementRef
  videoElement: any;

  cameraActive = false;
  parser$: Observable<IUserProfile>;

  startScanSub = async () => {
    BarcodeScanner.hideBackground(); // make background of WebView transparent
    const result = await BarcodeScanner.startScan(); // start scanning and wait for a result
    // if the result has content
    if (result.hasContent) {
      this.result = result.content;
      // console.log(result.content); // log the raw scanned content
    }
  };

  constructor(private _snackBar             : MatSnackBar,
              private dlParserService       : DlParserService,
              private siteService           : SitesService,
              public actionSheetController  : ActionSheetController,
              private uISettingsService: UISettingsService,
              private router                : Router,
              ) { }

  ngOnInit() {
    if (this.checkPermission()) {
      this.startScan();
    }
    window.document.body.style.background = "transparent"

    this.uiTransactions$ = this.uISettingsService.getSetting('UITransactionSetting').pipe(switchMap(data => {
      if (data && data.text) {
        this.uiTransactions = JSON.parse(data.text) as TransactionUISettings
      }
      return of(this.uiTransactions)
    }))
  }

  ngOnDestroy(): void {
    this.stopScan();
    this.stopReadingCamera();
  }

  public  cameraOn() {
    this.initDisplayResults();
    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      parent: 'cameraPreview',
      className: 'cameraPreview',
      toBack: true,
    };

    //window.document.querySelector('ion-app').classList.add('lowOpacity');
    CameraPreview.start(cameraPreviewOptions);
    this.cameraActive = true;
    this.scanStatus = 'Scanning'
  }

  initDisplayResults() {
    this.result = ''
    this.err = ''
    this.scanStatus = ''
  }

  async cameraOff() {
    this.initDisplayResults();
    this.cameraActive = false
    try {
      await CameraPreview.stop();
    } catch (error) {
    }
    try {
      await BarcodeScanner.stopScan();
    } catch (error) {
    }
    this.stopScan();
    this.goHome();
  }

  async checkPermission() {
    const status = await BarcodeScanner.checkPermission({ force: true });
    if (status.granted) {
      return true;
    }
    this.statusCheckPermision = this.status
    return false;
  }

  async startScan() {
    await BarcodeScanner.prepare();
    await BarcodeScanner.hideBackground();
    this.scanStatus = 'Scanning Started';
    const result = await BarcodeScanner.startScan();

    if (result.hasContent) {
      this.stopScan();
      this.scanResult = 'Content Resolved ' + result.content
      // console.log(result.content)
      this.resolveContent(result)
    } else {
      this.stopScan();
      this.scanResult = 'Content not resolved '
      this.status = 'no content';
    }
  }

  resolveContent(result: any) {
    if (this.uiTransactions.idParseOnlyAgeConfirmation) {
      this.saveCustomer(result)
      return
    }

    if (!this.uiTransactions.idParseOnlyAgeConfirmation) {
      this.saveCustomer(result)
      return
    }
  }

  validateCustomerOnly(result: any) {
    const site    = this.siteService.getAssignedSite();
    const data    =  result.content.replace(/(\r\n|\n|\r)/gm, "--");
    const parser$ =  this.dlParserService.checkIfIDisValid(site, data)
    this.parser$  =  parser$.pipe(
      switchMap(data => {
        if (!data) {
          this.notifyEvent('No response', 'Try again')
          return of (null)
        }
        if (!data.result || data.errorMessage || data.message == 'failure') {
          this.notifyEvent(data.errorMessage, data.message)
          return of (data)
        }
        // this.scanStatus = 'Scanned and valid';
        this.notifyEvent('Client is valid', 'Success')
        return of(data)
    }),
    catchError( err => {
      this.notifyEvent(err, 'Unexpected Error')
      this.error = err
      return of(err)
    }))
  }

  saveCustomer(result: any) {
    const data   =  result.content.replace(/(\r\n|\n|\r)/gm, "--");
    this.result = result.content;
    const site = this.siteService.getAssignedSite();
    const parser$ =  this.dlParserService.parseDriverLicense(site, data)
    this.parser$ =  parser$.pipe(
      switchMap(data => {
        if (!data) {
          this.notifyEvent('No response', 'Try again')
          return of (null)
        }
        if (data.errorMessage || data.message == 'failure') {
          this.notifyEvent(data.errorMessage, data.message)
          return of (data)
        }
        if (data.id) {
          this.router.navigate(["/profileEditor/", {id: data.id}]);
        }
        return of(data)
    }),
    catchError( err => {
      this.notifyEvent(err, 'Unexpected Error')
      this.error = err
      return of(err)
    }))
  }

  async stopScan() {
    this.initDisplayResults();
    this.scanActive = false;
    await BarcodeScanner.showBackground();

    try {
      await BarcodeScanner.stopScan();
    } catch (error) {
    }

  }

  flipCamera() {
    CameraPreview.flip()
  }

  deactivated() {
     this.stopReadingCamera()
  }

  beforeDestroy() {
    this.stopReadingCamera()
  }

  async stopReadingCamera() {
    await this.cameraOff();
    this.stopScan();
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  goHome() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/app-main-menu']);
    });
  }
}

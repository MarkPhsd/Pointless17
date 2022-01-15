import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DlParserService } from 'src/app/_services/people/dl-parser.service';
import { IUserProfile } from 'src/app/_interfaces';
import { ActionSheetController } from '@ionic/angular';

import { Plugins} from '@capacitor/core';
import { CameraPreviewOptions }  from '@capacitor-community/camera-preview';
import { BarcodeScanner } from '@capacitor-community/barcode-scanner';

const { CameraPreview } = Plugins;

import '@capacitor-community/camera-preview';
import { environment } from 'src/environments/environment';
// https://medium.com/cashify-engineering/barcode-reader-using-google-mobile-vision-88b3e9f31668
// https://www.ionicanddjangotutorial.com/ionic-qrcode-scanning/
// https://github.com/DutchConcepts/capacitor-barcode-scanner#usage
// (window.document.querySelector('ion-app') as HTMLElement).classList.remove('cameraView');

import { Observable } from 'rxjs';


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
      console.log(result.content); // log the raw scanned content
    }
  };

  constructor(private _snackBar             : MatSnackBar,
              private dlParserService       : DlParserService,
              private siteService           : SitesService,
              public actionSheetController  : ActionSheetController,
              private router                : Router,
              ) { }

  async ngOnInit() {
    // this.image = `${environment.logo}`
    if (this.checkPermission()) {
      this.startScan();
    }
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
    await CameraPreview.stop();
    await BarcodeScanner.stopScan();
    this.stopScan();
  }

  async checkPermission() {
    // const { BarcodeScanner } = Plugins;
    const status = await BarcodeScanner.checkPermission({ force: true });
    if (status.granted) {
      return true;
    }
    this.statusCheckPermision = this.status
    return false;
  }

  async startScan() {

    BarcodeScanner.prepare();
    BarcodeScanner.hideBackground();
    this.scanStatus = 'Scanning Started';

    const result = await BarcodeScanner.startScan();

    if (result.hasContent) {
      this.stopScan();
      this.scanResult = 'Content Resolved ' + result.content
      console.log(result.content)
      this.resolveContent(result)
    } else {
      this.stopScan();
      this.scanResult = 'Content not resolved '
      this.status = 'no content';
    }

    // this.cameraOff();

  }

  resolveContent(result: any) {

    const data   =  result.content.replace(/(\r\n|\n|\r)/gm, "--");
    const site = this.siteService.getAssignedSite();
    this.result = result.content;
    console.log(data)
    const parser$ =  this.dlParserService.parseDriverLicense(site, data)

    parser$.subscribe(data => {

      if (data.errorMessage || data.message == 'failure') {
        this.notifyEvent(data.errorMessage, data.message)
        return
      }

      if (data.id) {
        this.router.navigate(["/profileEditor/", {id: data.id}]);
      }

    }, error => {
      this.notifyEvent(error, 'Unexpected Error')
      this.error = error
    })

  }

  async stopScan() {
    this.initDisplayResults();
    this.scanActive = false;
    BarcodeScanner.showBackground();
    BarcodeScanner.stopScan();
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

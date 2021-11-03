import { Component, ElementRef, OnDestroy, OnInit, ViewChild, Input } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DlParserService } from 'src/app/_services/people/dl-parser.service';
import { IUserProfile } from 'src/app/_interfaces';
import { ActionSheetController } from '@ionic/angular';

import { Plugins} from '@capacitor/core';
import { CameraPreviewOptions }  from '@capacitor-community/camera-preview';

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

  @ViewChild('video') video: ElementRef
  videoElement: any;

  cameraActive = false;
  parser$: Observable<IUserProfile>;

  constructor(private _snackBar: MatSnackBar,
              private dlParserService: DlParserService,
              private siteService: SitesService,
              public actionSheetController: ActionSheetController,
              private router: Router,
              ) { }

  async ngOnInit() {
    this.image = `${environment.logo}`

    if (this.checkPermission) {
      this.startScan();
      // this.rearCameraOn();
    }

  }

  ngOnDestroy(): void {
    this.stopReadingCamera();
  }

  public  cameraOn() {

    const cameraPreviewOptions: CameraPreviewOptions = {
      position: 'rear',
      parent: 'cameraPreview',
      className: 'cameraPreview',
      toBack: true,
    };

  //  window.document.querySelector('ion-app').classList.add('lowOpacity');
    CameraPreview.start(cameraPreviewOptions);
    this.cameraActive = true;

  }

  async cameraOff() {
    this.cameraActive = false
    await CameraPreview.stop();
    this.stopScan();
  }

  async checkPermission() {
    const { BarcodeScanner } = Plugins;
    const status = await BarcodeScanner.checkPermission({ force: true });
    if (status.granted) {
      return true;
    }
    return false;
  }

  prepare() {
    const { BarcodeScanner } = Plugins;
    this.scanActive = true
    try {
      BarcodeScanner.prepare();
    } catch (error) {
      this.err = `${this.err}. ${error}`
    }
    this.status = "prepared"
  }

  initData() {
    this.status = 'Scanning'
    this.error =''
    this.result = ''
    this.user = null;
    this.status = 'Capturing Content.'
    this.cameraActive = true
    this.scanActive = true;
  }

  async startScan() {
    this.initData()

    const { BarcodeScanner } = Plugins;
    BarcodeScanner.hideBackground();

    const result = await BarcodeScanner.startScan();

    if (result.hasContent) {
      this.resolveContent(result)
    } else {
      this.status = 'no content';
    }

    // this.cameraOff();
    this.stopScan();

  }

  resolveContent(result: any) {

    this.result  =  result.content.replace(/(\r\n|\n|\r)/gm, "--");
    const parser$ =  this.dlParserService.parseDriverLicense(this.siteService.getAssignedSite(),  this.result)

    parser$.subscribe(data => {
      this.user = data
      if (this.user.id) {
        this.router.navigate(["/profileEditor/", {id:this.user.id}]);
      }

    }, error => {
      this.error = error
    })

  }

  async stopScan() {

    this.scanActive = false;

    const { BarcodeScanner } = Plugins;

    BarcodeScanner.showBackground();

    BarcodeScanner.stopScan();

    this.status = "Not scanning";

  }

  askUser() {

    this.prepare();
    const c = confirm('Do you want to scan a barcode?');
    if (c) {
      this.startScan();
    } else {
      this.stopScan();
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
    // await this.cameraOff();
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

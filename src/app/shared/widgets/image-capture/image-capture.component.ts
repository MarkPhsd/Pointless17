import { Component, OnInit, ViewChild, ElementRef, Renderer2, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { TextractService } from 'src/app/_services/aws/textract.service';
import { AWSBucketService } from 'src/app/_services';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { IDriversLicense } from 'src/app/_interfaces/people/drivers-license';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { Router } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IUserProfile } from 'src/app/_interfaces';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-image-capture',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './image-capture.component.html',
  styleUrls: ['./image-capture.component.scss']
})
export class ImageCaptureComponent implements OnInit, OnDestroy {
  //image uploading
  _logger: any;
  progressForFile: any;
  uploadResult: any

  logger: string;

  scannerButton:    false;
  driversLicense: IDriversLicense;

  @ViewChild('video')
  public video: ElementRef;

  @ViewChild('canvas')
  public canvas: ElementRef;

  @Input() clientID: string;

  captures: Array<any>;
  fileUploaded = false;
  showData      = false;
  tryAgainOn    = false;
  captureOn     = true;
  profileReady = false;

  imageSrc: any;
  status: string;

  videoTagRef: any;
  videoWidth: any;
  videoHeight: any;
  numberOfTicks = 0;

  client: IUserProfile
  file: File;
  driversLicence: IDriversLicense;
  preassignedURL: string;

  loading: boolean ;

  constructor(
              private awsBucketService: AWSBucketService,
              private textractService: TextractService,
              private _snackBar: MatSnackBar,
              private ref: ChangeDetectorRef,
              private clientTableService: ClientTableService,
              private router: Router,
              private siteService: SitesService
      ) {
        setInterval(() => {
          this.numberOfTicks++;
          // require view to be updated
          this.ref.markForCheck();
        }, 1000);

      this.captures = [];
  }

  ngOnInit(): void {
    this.initVideo()
  }

  initVideo() {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {

          this.video.nativeElement.srcObject = stream;
          this.video.nativeElement.play();

      });
    }
  }

  handleError(error) {
    console.log('Error: ', error);
  }

  capture() {
    this.captures.pop();

    this.canvas.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, 640, 480);
    this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));
    this.resetCaptureProcess()

  }

  resetCaptureProcess() {

    this.captureOn = false
    this.profileReady = false

  }

  getCanvasFromArray(index: any) {
    if (this.captures[index]) {
      return  this.captures[index]
    }
  }


  getFileImageCapture($event) {

  }

  clearCaptures() {
    this.logger = ""
    this.driversLicence = {} as IDriversLicense
    this.captures = [];
    this.captureOn = true;
    this.profileReady = false;
    this.initVideo();

  }

  convertCanvasToImage(canvas: any, name: string): File  {

    if (canvas) {
      const blob =  this.dataURItoBlob(canvas)
      const file = new File([blob], name ,{type: "image/png"})

      return file
    }

  }

  async processDriversLicenseFromVideo() {

    this.capture()
    this.logger = "Captured."

    const file = await this.saveImageCaptureASNewFile(0);

    this.processDriversLicense(file)

  }

  onFileDropped($event) {
    this.processDriversLicense($event[0]);
  }

  fileBrowseHandler(files) {
    this.processDriversLicense(files[0]);
  }

  // this method both saves, and then processes
  // saveImageCaptureASNewFile
  // processImage
  // after that completes, we can determine if we can open the contact.
  // updateFindContact();
  async processDriversLicense(file: File): Promise<any> {

    this.loading = true


    this.logger = "ID saved, getting secure upload."

    if (file) {

      let promise = await this.getPressignedURL(file)

      let url = promise.preassignedURL
      this.logger = "Secured url recieved. Uploading ID."

      if (url) {
        // let promise =  await this.uploadFile_alt(file, url)
        this.awsBucketService.uploadFile(file, url)
          .subscribe(
            async (  event: HttpEvent<any> ) => {
            switch (event.type) {

            case HttpEventType.Response:
              this.progressForFile = 100;
              this.uploadResult = true

              setTimeout(() => {console.log('1 second finished!')}, 2000);
              this.logger = "DL uploaded, processing ID text."

              let driversLicense = await this.processImage(file)

              this.driversLicence = driversLicense
              this.showData = true

              if (  (driversLicense.firstName != '' || driversLicense.firstName != undefined)
                    && (driversLicense.lastName != '' || driversLicense.lastName != undefined)
                    && (driversLicense.accountNumber != '' || driversLicense.accountNumber != undefined)
                    && (driversLicense.dob != '' || driversLicense.dob != undefined)
                    && (driversLicense.exp != '' || driversLicense.exp != undefined)
                  )

              {

                await this.updateFindContact(driversLicense);

              } else
              {
                this.notifyEvent(`Success`, `succes`)
                this.logger = "DL Information not properly read. Please retry to capture ID."
              }
            }
          }
        )
      }
    }
  }

  isDriversLicense(object: any): object is IDriversLicense {
    return 'fooProperty' in object;
  }

  async saveImageCaptureASNewFile(index: any): Promise<File> {
    // return new  Promise((resolve, reject) => {
    const name = `DL_${this.makeid(10)}.png`
    return this.convertCanvasToImage(this.getCanvasFromArray(index), name)
  }

  async processImage(file: File) {
    let awsText$ =  this.textractService.readDriversLicense(file.name)
    // return new Promise((resolve, reject) => {
    return awsText$.pipe().toPromise()
  }

  async updateFindContact(driversLicense: IDriversLicense) {
    // if  (this.driversLicense)

    let clientTableService$ =  this.clientTableService.postDriversLicense(this.siteService.getAssignedSite(), driversLicense)

    clientTableService$.subscribe( data => {

        this.client = data

        if ( !this.client) {
          this.clearCaptures()
          this.notifyEvent("Failed to create or update contact, please try again.", "Failure")

        } else {
          if (this.client.id) {
            this.notifyEvent(`Success`, `succes`)
            this.profileReady = true
            this.logger = "Saving information."
            this.router.navigate(["/profileEditor/", {id: this.client.id }]);

          } else {

            this.clearCaptures()
            this.notifyEvent("Failed to create or update contact, please try again.", "Failure")

          }
        }

      }, error => {
        this.clearCaptures()
        this.notifyEvent("Failed to create or update contact, please try again.", "Failure")

      }
    )

  }

  async getPressignedURL(file: File) {

    let url = ''
    let aws$ =  this.awsBucketService.getPresignedURLObservable(file)

    return aws$.pipe().toPromise()

  }



  resize_image( src, dst, type, quality ) {
    let newFile = new Image(), canvas, context, cW, cH;

    type = type || 'image/png';
    quality = quality || 0.92;

    cW = src.naturalWidth;
    cH = src.naturalHeight;

    newFile.src = src.src;
    newFile.onload = function() {

    canvas = document.createElement( 'canvas' );

    cW /= 2;
    cH /= 2;

    if ( cW < src.width ) cW = src.width;
    if ( cH < src.height ) cH = src.height;

    canvas.width = cW;
    canvas.height = cH;
    context = canvas.getContext( '2d' );
    context.drawImage( newFile, 0, 0, cW, cH );

    dst.src = canvas.toDataURL( type, quality );

    if ( cW <= src.width || cH <= src.height )
      return;

    newFile.src = dst.src;

   }

  }

  //utility
  async  uploadFile_alt(file: any, url: string) {

      this.awsBucketService.uploadFile(file, url)

      .subscribe(
        (event: HttpEvent<any>) => {
          switch (event.type) {
            case HttpEventType.Sent:
                this._logger =  'Upload started'
                break;

            case HttpEventType.DownloadProgress:
              console.log('')
                // Live stats are also possible for downloads
                // case HttpEventType.UploadProgress:
                //     if (event.total) {
                //         break;
                //       }
               break;

            case HttpEventType.Response:
                 console.log('')
                this.progressForFile = 100;
                this.uploadResult = true
                return true;
          }
        }
      )

  }

  //utility
  makeid(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  }

  //utility
  dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);
    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ia], {type:mimeString});
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

  stopCapture() {
    // later you can do below
    // stop both video and audio
    try {
      this.video.nativeElement.srcObject.getTracks().forEach( (track) => {
        track.stop();
      });
    } catch (error) {
      console.log(error)
    }
    try {
        // stop only audio
        this.video.nativeElement.srcObject.getAudioTracks()[0].stop();
    } catch (error) {

    }

    try {
      // stop only video
      this.video.nativeElement.srcObject.getVideoTracks()[0].stop();
    } catch (error) {
      console.log(error)
    }
  }

  // ---- Definitions ----- //


  ngOnDestroy(): void {
    this.stopCapture();
  }

}

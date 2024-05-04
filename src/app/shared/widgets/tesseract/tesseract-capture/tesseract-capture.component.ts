// import { Component, OnInit, ViewChild, ElementRef, Renderer2, Input, OnDestroy, ChangeDetectorRef } from '@angular/core';
// import { errorMonitor } from 'events';
// import { TextractService } from 'src/app/_services/aws/textract.service';
// import { AWSBucketService } from 'src/app/_services';
// import { HttpEvent, HttpEventType } from '@angular/common/http';
// import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
// import { IDriversLicense } from 'src/app/_interfaces/people/drivers-license';
// import { catchError } from 'rxjs/operators';
// import { TesseractService } from 'src/app/_services/tesseract/tesseract.service';
// import * as Tesseract from 'tesseract.js';

// import * as cocoSSD from '@tensorflow-models/coco-ssd';

// // https://docs.aws.amazon.com/rekognition/latest/dg/labels-detecting-labels-video.html
// // https://docs.aws.amazon.com/rekognition/latest/dg/labels.html
// // https://us-west-1.console.aws.amazon.com/rekognition/home?region=us-west-1#/label-detection
// // node_modules\@angular-devkit\build-angular\src\angular-cli-files\models\webpack-configs\browser.js
// // change browser.js node: false to  node: { crypto: true, stream: true },
// // https://github.com/tensorflow/tfjs/issues/494
// // https://towardsdatascience.com/build-a-realtime-object-detection-web-app-in-30-minutes-7ad0cb2231fb
// // https://rubikscode.net/2019/09/09/integration-of-tensorflow-model-into-angular-application/
// // https://www.tensorflow.org/js/models
// @Component({
//   selector: 'app-tesseract-capture',
//   templateUrl: './tesseract-capture.component.html',
//   styleUrls: ['./tesseract-capture.component.scss']
// })

// export class TesseractCaptureComponent implements OnInit, OnDestroy {
//   //image uploading
//   _logger: any;
//   progressForFile: any;
//   uploadResult: any

//   file: File;

//   scannerButton: boolean = false;
//   driversLicense: IDriversLicense;

//   @ViewChild('video')
//   private video: HTMLVideoElement;

//   @ViewChild('canvas')
//   public canvas: ElementRef;

//   @Input() clientID: string;

//   captures: Array<any>;
//   fileUploaded: boolean = false;
//   showData: boolean = false;
//   tryAgainOn: boolean = false;
//   captureOn: boolean = true;

//   imageSrc: any;
//   status: string;

//   videoTagRef: any;
//   videoWidth: any;
//   videoHeight: any;
//   numberOfTicks = 0;

//   textResult: any;



//   constructor(
//               private renderer: Renderer2,
//               private awsBucketService: AWSBucketService,
//               private textractService: TextractService,
//               private _snackBar: MatSnackBar,
//               private ref: ChangeDetectorRef,
//               private tesseractService: TesseractService,
//       ) {
//         setInterval(() => {
//           this.numberOfTicks++;
//           // require view to be updated
//           this.ref.markForCheck();
//         }, 1000);

//       this.captures = [];
//   }

//   ngOnInit(): void {
//     if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
//       navigator.mediaDevices.getUserMedia({ video: true }).then(stream => {

//           // this.video.nativeElement.srcObject = stream;
//           // this.video.nativeElement.play();

//       });
//     }
//     this.predictWithCocoModel()

//   }

//   handleError(error) {
//     console.log('Error: ', error);
//   }

//   capture() {
//     this.captures.pop();

//     // this.canvas.nativeElement.getContext("2d").drawImage(this.video.nativeElement, 0, 0, 640, 480);

//     this.captures.push(this.canvas.nativeElement.toDataURL("image/png"));

//   }

//   getCanvasFromArray(index: any) {
//     if (this.captures[index]) {
//       return  this.captures[index]
//     }
//   }

//   clearCaptures() {
//     this.captures = [];
//   }

//   convertCanvasToImage(canvas: any, name: string): File  {

//     if (canvas) {
//       console.log("convert")
//       const blob =  this.dataURItoBlob(canvas)
//       return new File([blob], name ,{type: "image/png"})
//     }

//   }

//   saveImageCaptureASNewFile(index: any) {

//     //use the index to the correct capture.
//     const name = `DL_${this.makeid(10)}.png`

//     const file =  this.convertCanvasToImage(this.getCanvasFromArray(index), name)

//     console.log(file)

//     this.saveSecureImagetoAWS(file, name);

//   }

//   processImage() {

//     console.log("attempting")
//     //use the index to the correct capture.
//     const name = `DL_${this.makeid(10)}.png`

//     const file =  this.convertCanvasToImage(this.getCanvasFromArray(0), name)

//     Tesseract.recognize(file)
//         .then((result) => {
//           console.log(result, '$$$$');
//           this.textResult = result.data.text

//         })

//   }

//   processVideo() {

//     let awsText$ =  this.textractService.readDriversLicense(this.file.name)

//     const filePath = this.awsBucketService.awsBucketURL

//     const url = `${filePath}${this.file.name}`

//     this.tesseractService.readDriversLicense(this.file.name)

//     // this.canvas.nativeElement.toDataURL("image/png")
//     Tesseract.recognize(this.canvas.nativeElement.toDataURL()).then((result) => {
//       console.log(result, '$$$$');
//     })

//   }


//   //utiliity
//   saveSecureImagetoAWS(file: File, name: string) {

//     this.fileUploaded = false
//     if (file) {
//       //use the file to get the presinged url
//       // let aws$ = this.awsBucketService.getPreSignedURLforIDCard(file.name)
//       let aws$ = this.awsBucketService.getPresignedURLObservable(file)

//      aws$.subscribe(data =>
//         {
//         const url = data.preassignedURL
//         this.file = file
//         this.uploadFile_alt(file, url);
//         this.fileUploaded = true
//       })

//       this.fileUploaded = true

//     }
//   }

//   resize_image( src, dst, type, quality ) {
//     let newFile = new Image(), canvas, context, cW, cH;

//     type = type || 'image/png';
//     quality = quality || 0.92;

//     cW = src.naturalWidth;
//     cH = src.naturalHeight;

//     newFile.src = src.src;
//     newFile.onload = function() {

//     canvas = document.createElement( 'canvas' );

//     cW /= 2;
//     cH /= 2;

//     if ( cW < src.width ) cW = src.width;
//     if ( cH < src.height ) cH = src.height;

//     canvas.width = cW;
//     canvas.height = cH;
//     context = canvas.getContext( '2d' );
//     context.drawImage( newFile, 0, 0, cW, cH );

//     dst.src = canvas.toDataURL( type, quality );

//     if ( cW <= src.width || cH <= src.height )
//       return;

//     newFile.src = dst.src;

//    }

//   }

//   //utility
//   async uploadFile_alt(file: any, url: string) {

//     let uploader$ = this.awsBucketService.uploadFile(file, url)

//     let startTime: any;

//      uploader$.subscribe(

//       (event: HttpEvent<any>) => {

//         switch (event.type) {
//           case HttpEventType.Sent:
//               this._logger =  'Upload started'
//               break;
//           case HttpEventType.DownloadProgress:
//               // Live stats are also possible for downloads
//           case HttpEventType.UploadProgress:
//               if (event.total) {
//                    const progress: any = Math.round(event.loaded / event.total * 100);
//                    const timeElapsed: any = Date.now() - startTime;
//                    const uploadSpeed: any = event.loaded / (timeElapsed / 1000);
//                    const uploadTimeRemaining: any = Math.ceil((event.total - event.loaded) / uploadSpeed);
//                    const uploadTimeElapsed: any = Math.ceil(timeElapsed / 1000);
//                   //  const uploadSpeed = uploadSpeed / 1024 / 1024;
//                   //${timeElapsed}${uploadSpeed}${uploadTimeRemaining}${uploadTimeElapsed}${uploadSpeed}
//                    this._logger = `Upload stats: ${progress}`

//                    break;
//                 }

//           case HttpEventType.Response:
//               this.progressForFile = 100;
//               this.uploadResult = event
//               console.log(event)
//               this.notifyEvent

//       }
//     })

//   }

//   //utility
//   makeid(length) {
//     var result           = '';
//     var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
//     var charactersLength = characters.length;
//     for ( var i = 0; i < length; i++ ) {
//        result += characters.charAt(Math.floor(Math.random() * charactersLength));
//     }
//     return result;
//   }

//   //utility
//   dataURItoBlob(dataURI) {
//     // convert base64/URLEncoded data component to raw binary data held in a string
//     var byteString;
//     if (dataURI.split(',')[0].indexOf('base64') >= 0)
//         byteString = atob(dataURI.split(',')[1]);
//     else
//         byteString = unescape(dataURI.split(',')[1]);
//     // separate out the mime component
//     var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
//     // write the bytes of the string to a typed array
//     var ia = new Uint8Array(byteString.length);
//     for (var i = 0; i < byteString.length; i++) {
//         ia[i] = byteString.charCodeAt(i);
//     }
//     return new Blob([ia], {type:mimeString});
//   }

//   notifyEvent(message: string, action: string) {
//     this._snackBar.open(message, action, {
//       duration: 2000,
//     });
//   }

//   stopCapture() {
//     // later you can do below
//     // stop both video and audio
//     try {
//       this.video.nativeElement.srcObject.getTracks().forEach( (track) => {
//         track.stop();
//       });
//     } catch (error) {
//       console.log(error)
//     }
//     try {
//             // stop only audio
//             this.video.nativeElement.srcObject.getAudioTracks()[0].stop();
//     } catch (error) {

//     }

//     try {
//       // stop only video
//       this.video.nativeElement.srcObject.getVideoTracks()[0].stop();
//     } catch (error) {
//       console.log(error)
//     }
//   }

//   public async predictWithCocoModel()
//   {

//     //  modelConfig = { {config: 'lite_mobilenet_v2'} }
//     const model = await cocoSSD.load();
//     this.detectFrame(this.video, model);

//   }

//   detectFrame = (video, model) => {
//     model.detect(video).then(predictions => {
//     this.renderPredictions(predictions);
//     requestAnimationFrame(() => {
//     this.detectFrame(video, model);});
//     });
//   }

//   renderPredictions = predictions => {
//       const canvas = <HTMLCanvasElement> document.getElementById     ("canvas");

//         const ctx = canvas.getContext("2d");
//         canvas.width  = 300;
//         canvas.height = 300;
//         ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

//         // Fonts
//         const font = "16px sans-serif";
//         ctx.font = font;
//         ctx.textBaseline = "top";
//         ctx.drawImage(this.video, 0, 0 ,300,300);

//         predictions.forEach(prediction => {

//         // Bounding boxes's coordinates and sizes
//         const x = prediction.bbox[0];
//         const y = prediction.bbox[1];
//         const width = prediction.bbox[2];
//         const height = prediction.bbox[3];// Bounding box style
//         ctx.strokeStyle = "#00FFFF";
//         ctx.lineWidth = 2;// Draw the bounding
//         ctx.strokeRect(x, y, width, height);

//         // Label background
//         ctx.fillStyle = "#00FFFF";
//         const textWidth = ctx.measureText(prediction.class).width;
//         const textHeight = parseInt(font, 10); // base 10
//         ctx.fillRect(x, y, textWidth + 4, textHeight + 4);
//         });

//         predictions.forEach(prediction => {
//           // Write prediction class names
//           const x = prediction.bbox[0];
//           const y = prediction.bbox[1];
//           ctx.fillStyle = "#000000";
//           ctx.fillText(prediction.class, x, y);});
//     };

//   // ---- Definitions ----- //


//   ngOnDestroy(): void {
//     this.stopCapture();
//   }

// }

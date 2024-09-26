import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AWSBucketService, IAWS_Temp_Key, IKey } from 'src/app/_services';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';

import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { catchError, switchMap } from 'rxjs/operators';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, of } from 'rxjs';
import { NgxImageCompressService } from 'ngx-image-compress';

@Component({
  selector: 'app-widget-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  providers: [ TruncateTextPipe ]
})
export class UploaderComponent implements OnInit {

  files: File[] = [];
  upload$: Observable<any>;
  errorMessage: string;

  @Input() width : number;
  @Input() height: number;
  @Input() fileNames: string ; 
  @Output() messageOut = new EventEmitter<string>();
  @Input() id:            string;
  @Input() createThumbNail: boolean;
  @Input() isThumbNail: boolean;
  @Output()  outPutThumbNail = new EventEmitter<string>();

  _logger:                any = "";
  progressForFile:        any = "";
  uploadResult:           any ;
  bucketName:             string;
  awsBucketURL:           string;
  imageUrlToCheck:        string;
  notificationDurationInSeconds = 5;//snackbar
  aws$:  Observable<IAWS_Temp_Key>;
  uploading  = false

  constructor(private awsBucket: AWSBucketService,
             private _snackBar: MatSnackBar,
             private siteService: SitesService,
             private imageCompress: NgxImageCompressService
             ) {
            }

  async ngOnInit() {
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.imageRefresh();
  }

  get fileNamesList(): string[] {
    return (this.fileNames || '').split(',');
  }

  imageRefresh() {
  }

  onFileDropped($event) {
    this.uploadFiles($event);
  }

  fileBrowseHandler(files) {
    this.uploadFiles(files);
  }

  getImageURL(fileName: string): any {
    if (fileName) { 
      const image =  this.awsBucket.getImageURLPath(this.bucketName, fileName)
      return image
     }
  }

  getItemName(itemName) {
    if (itemName) {
      itemName = itemName.substr(0, itemName.length - 4 )
      return itemName.substr(0,10)
    }
  }

  async uploadFiles(files: Array<any>) {
    if (files) {
      for(const file of files){
          await this.compressAndUpload(file);
          if (this.isThumbNail) { return }

          if (this.createThumbNail) { 
            if (this.height == 0 || this.width == 0) { 
              this.isThumbNail = true;
              this.height = 200
              this.width  = 200
              await this.compressAndUpload(file);
              this.isThumbNail = false;
              console.log('upload file', file)
            }
          }
        }
      }
    }

    // This method compresses the file and appends 'thumbnail' to its name before upload
    async compressAndUpload(file: File) {
      const isImage = file.type.startsWith('image/') || file.type === 'image/webp';
      
      if (isImage) {

        
        if (this.width == 0 || !this.width) { 
          console.log('upload regular file ', file)
          this.confirmFileUpload(file);
          return;
        }

   
        let image = await this.imageCompress.compressFile(
          URL.createObjectURL(file),
              1,
              100,
              100,
              this.width,
              this.height,
        );
  
        // Create a new file with the compressed image data and append 'thumbnail'
        let blob = this.dataURLToBlob(image);

        let fileName = this.appendThumbnailToName(file.name);

        let compressedFile = new File([blob], fileName, { type: file.type });
  
        if (!this.isThumbNail) { 
          this.confirmFileUpload(compressedFile);
          return;
        }

        // Proceed with uploading the compressed file
        this.confirmThumbNailFileUpload(compressedFile);
      } else {
        // For non-image files, proceed with the original upload
        this.confirmFileUpload(file);
      }
    }

    confirmFileUpload(file: any ){
      this.uploading = true;
      this.imageUrlToCheck = this.getImageURL(file.name)

      try {
        const presign$ = this.awsBucket.getPresignedURLObservable(file)

        presign$.pipe(
          switchMap( data => {

            if (data && !data?.preassignedURL) {
              this.errorMessage = JSON.stringify(data)
              return of(null)
            }

            if (data.preassignedURL)
              return this.awsBucket.uploadFile(file,  data.preassignedURL)
            }
          )
        ).subscribe( data => {
          this.uploading = false;
          const files = this.uploadFile_alt(file)
          this.messageOut.emit(files)
        })

      } catch (error) {
        this.siteService.notify(`Failed to upload.` + JSON.stringify(error), 'Error', 4000)
        this.uploading = false;
      }
    };

    confirmThumbNailFileUpload(file: any ){
      this.uploading = true;
      this.imageUrlToCheck = this.getImageURL(file.name)

      try {
        const presign$ = this.awsBucket.getPresignedURLObservable(file)

        presign$.pipe(
          switchMap( data => {

            if (data && !data?.preassignedURL) {
              this.errorMessage = JSON.stringify(data)
              return of(null)
            }

            if (data.preassignedURL)
              return this.awsBucket.uploadFile(file,  data.preassignedURL)
            }
          )
        ).subscribe( data => {
          this.uploading = false;
          console.log('confirmThumbNailFileUpload ', file.name)
          this.outPutThumbNail.emit(file.name)
        })

      } catch (error) {
        this.siteService.notify(`Failed to upload.` + JSON.stringify(error), 'Error', 4000)
        this.uploading = false;
      }
    };

    _confirmFileUpload(file: any ){
      this.uploading = true;
      this.errorMessage = ''
      this.imageUrlToCheck = this.getImageURL(file.name)
      const presign$ = this.awsBucket.getPresignedURLObservable(file)

      this.upload$ = presign$.pipe(switchMap(data => {
        console.log(data)

        if (data && !data?.preassignedURL) {
          this.errorMessage = JSON.stringify(data)
          return of(null)
        }

        if (!data || !data?.preassignedURL) {
            this.notifyEvent(`Failed to get presigned url.`, 'Error')
            this.uploading = false;
            return of(null)
          }

          if (data?.preassignedURL) {
            return this.awsBucket.uploadFile(file,  data?.preassignedURL)
          }
        return of(null)
      }),
      catchError( e => {
        console.log('get assigned url', e)
        this.errorMessage =  JSON.stringify(e)
        return of(null)
      })
      ).pipe(switchMap( data => {
            if (!data) {
              this.siteService.notify(`Failed to upload.` + JSON.stringify(data), 'Error', 4000)
              this.uploading = false;
              return of('not uploaded')
            }
            this.uploading = false;
            this.uploadFile_alt(file)
            this.messageOut.emit(this.fileNames)
            return of('')
          }
        ),
        catchError( e => {
          this.siteService.notify(`Failed to upload.` + JSON.stringify(e), 'Error', 4000)
          this.errorMessage = 'uploading error' + e.toString()
          return of(null)
        })
      )

    };

    uploadFile_alt(file: any) {
      if (!this.files) {this.files = []  as File[] }
      this.files.push(file);
      return this.removeDuplicateFileNames()
    }

    //this loops the this.files array.
    //then it emits up to the parent component
    removeDuplicateFileNames() {
      //first check if files exist
      if ( this.files) {
        [...this.files].forEach(file =>
          {
            if (this.fileNames)
              { this.fileNames = file.name + ',' +  this.fileNames}
            else
              {this.fileNames = file.name }
          }
        );

        if (!this.fileNames ) { 
          return;
        }

        const newArray = [...new Set(this.fileNames.split(","))];
        this.fileNames = "";
        [...newArray].forEach(file => {
            if (file != undefined || file != null) {
              if (this.fileNames) { this.fileNames = file + ',' +  this.fileNames}
              else {this.fileNames = file }
            }
          }
        )
        this.fileNames =   this.fileNames.replace('undefined', '')
        this.fileNames =   this.fileNames.replace('null', '')
        this.fileNames =   this.fileNames.replace(',,', ',')
      }
      return this.fileNames;
    }

    deleteFile(name:string) {
      if ( this.fileNames != undefined || this.fileNames != '') {
        const removeFile = name // this.files[index].name
        this.fileNames  = this.fileNames.replace(name, '')
        this.fileNames  = this.fileNames.replace(',,', ',')
        if (this.fileNames.substring(1, 1) === "," && this.fileNames.length>1) {
          this.fileNames = this.fileNames.substring(2, this.fileNames.length -1)
        }
        if (this.fileNames.trim() === ',' ) {  this.fileNames = '' }
        this.messageOut.emit(this.fileNames)
        return
      }
      this.messageOut.emit('')
    }

    notifyEvent(message: string, action: string) {
     this._snackBar.open(message, action, {
        duration: 3000,
      });
    }


    ///helpers
    // Helper method to convert DataURL to Blob
    dataURLToBlob(dataURL: string): Blob {
      const byteString = atob(dataURL.split(',')[1]);
      const mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0];
      const arrayBuffer = new ArrayBuffer(byteString.length);
      const intArray = new Uint8Array(arrayBuffer);
      for (let i = 0; i < byteString.length; i++) {
        intArray[i] = byteString.charCodeAt(i);
      }
      return new Blob([intArray], { type: mimeString });
    }

    // Helper method to append 'thumbnail' to the file name
    appendThumbnailToName(fileName: string): string {
      if (!this.isThumbNail) { return fileName }

      const nameParts = fileName.split('.');
      if (nameParts.length > 1) {
        nameParts[nameParts.length - 2] += '_thumbnail';
        return nameParts.join('.');
      }
      return fileName + '_thumbnail';
    }
  
}



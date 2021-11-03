import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AWSBucketService, IAWS_Temp_Key, IKey, MenuService } from 'src/app/_services';
import { MatSnackBar, MatSnackBarModule} from '@angular/material/snack-bar';
import { IProduct } from 'src/app/_interfaces/raw/products';
import { HttpClient,  HttpEvent,  HttpEventType,  HttpHeaders, HttpParams, } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { analyzeAndValidateNgModules } from '@angular/compiler';
import { isArray } from 'highcharts';
import { tap } from 'rxjs/operators';
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';

@Component({
  selector: 'app-widget-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.scss'],
  providers: [ TruncateTextPipe ]
})
export class UploaderComponent implements OnInit {

  files: File[] = [];

  @Input() fileNames: string ; //string array of files

  @Output() messageOut = new EventEmitter<string>();

  @Input() id:            string;

  _logger:                any = "";
  progressForFile:        any = "";
  uploadResult:           any ;
  bucketName:             string;
  awsBucketURL:           string;
  imageUrlToCheck:        string;
  notificationDurationInSeconds = 5;//snackbar
  aws$:  Observable<IAWS_Temp_Key>;

  constructor(private awsBucket: AWSBucketService,
             private _snackBar: MatSnackBar,
             private truncateTextPipe: TruncateTextPipe,
             private http: HttpClient) {

            }

  async ngOnInit() {

    console.log('filanames', this.fileNames)

    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();

    this.imageRefresh();

  }

  getItemName(itemName) {
    if (itemName) {
      itemName = itemName.substr(0, itemName.length - 4 )
      return itemName.substr(0,10)
      return this.truncateTextPipe.transform(itemName.replace(/<[^>]+>/g, ''), 10)
      // return itemName.substr(0,10)
    }
    // return this.truncateTextPipe.transform(itemName.replace(/<[^>]+>/g, ''), 10)
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

    if (fileName) { return this.awsBucket.getImageURLPath(this.bucketName, fileName) }

  }

  uploadFiles(files: Array<any>) {
    if (files) {
      for(const file of files){
          this.confirmFileUpload(file)
      }
    }
  }

  confirmFileUpload(file: any ){
    let uploadFile = false
    this.imageUrlToCheck = this.getImageURL(file.name)

    try {

      const presign$ = this.awsBucket.getPresignedURLObservable(file)

      presign$.subscribe(data=> {
        if (data.preassignedURL)
          console.log(data.preassignedURL)
          this.uploadFile_alt(file, data.preassignedURL)
        }
      )

     } catch (error) {
      console.log(error)
     }
  };


 async uploadFile_alt(file: any, url: string) {

    let startTime: any;
    const uploader$ = this.awsBucket.uploadFile(file, url)

    uploader$.subscribe(
      data => {
        this.files.push(file);
        this.removeDuplicateFileNames()
      }
    )

  }

  //this loops the this.files array.
  //then it emits up to the parent component
  removeDuplicateFileNames() {

    //first check if files exist
    if ( this.files) {

      [...this.files].forEach(file =>
        {
          console.log("File Name " + file.name ,"File Array String" + this.fileNames)

          if (this.fileNames)
          { this.fileNames = file.name + ',' +  this.fileNames}
          else
          {this.fileNames = file.name }

         }
      );

      console.log("this.fileNames of Push", this.fileNames)
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


      if (this.fileNames.substring(0, 1) === "," ) {
        // console.log('this.fileNames.substring(0, 1)', this.fileNames.substring(0, 1))
        // console.log('this.filenames', this.fileNames)
        // this.fileNames = this.fileNames.substring(1, this.fileNames.length -1)
        // console.log('this.filenames new', this.fileNames)
      }

    }

    console.log(this.fileNames)
    this.messageOut.emit(this.fileNames)

  }

  deleteFile(name:string) {

    if ( this.fileNames != undefined || this.fileNames != '') {

        const removeFile = name // this.files[index].name
        this.fileNames  = this.fileNames.replace(name, '')
        this.fileNames  = this.fileNames.replace(',,', ',')

        if (this.fileNames.substring(1, 1) === "," && this.fileNames.length>1) {
          this.fileNames = this.fileNames.substring(2, this.fileNames.length -1)
        }

        if (this.fileNames.trim() === ',' ) {
          this.fileNames = ''
          console.log("Filenames ", this.fileNames)
        }

        this.messageOut.emit(this.fileNames)
    }
  }



  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
    });
  }

}



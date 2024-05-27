import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse  } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { error, promise } from 'protractor';
import { SitesService } from '../reporting/sites.service';
import { AppInitService } from '../system/app-init.service';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
export const InterceptorSkipHeader = 'X-Skip-Interceptor';

//https://docs.aws.amazon.com/sdk-for-javascript/v2/developer-guide/s3-example-photo-album.html

export interface  IAWS_Temp_Key {
  preassignedURL: string;
}

export interface IKey{
  bucket:string;
  key:string
}

@Injectable({
  providedIn: 'root'
})

export class AWSBucketService {

  awsKeys: IAWS_Temp_Key;
  _awsBucket: any = '';

  keys :IKey[];
  key   :IKey;
  apiUrl: any;

  private httpClient: HttpClient;

  async  awsBucket(): Promise<string> {
    let bucket = localStorage.getItem('awsbucket')
    if (!bucket || bucket === '') {
      await this.getBucket();
    }
    bucket =  localStorage.getItem('awsbucket');
    return bucket
  }

  async  awsBucketOBS(): Promise<string> {
    let bucket = localStorage.getItem('awsbucket')
    if (!bucket || bucket === '') {
      await this.getBucket();
    }
    bucket =  localStorage.getItem('awsbucket');
    return bucket
  }

  async  awsBucketURL(): Promise<string> {
    const  awsBucket = await this.awsBucket();
    return `https://${awsBucket}.s3.amazonaws.com/`
  }

  awsBucketURLOBS(): Observable<string> {
    return this.getAWSBucketObservable().pipe(
      switchMap(data => {
          return of(`https://${data.preassignedURL}.s3.amazonaws.com/`)
        }
      )
    )
  }

  constructor(private http            : HttpClient,
              private siteService     : SitesService,
              private appInitService  : AppInitService,
              private httpCache      : HttpClientCacheService
              ) {

    // this.apiUrl =  this.appInitService.apiBaseUrl();
    // if (!this.apiUrl) {
    //   this.apiUrl = this.siteService.getAssignedSite().url;
    // }
    this.apiUrl = this.siteService.getAssignedSite().url;
  }

  convertToArrayWithUrl(imageString: string, url: string): any[] {
    let imageArray: any[];

    if ( imageString != undefined  &&  imageString != '') {
        imageArray = imageString.split(",")
        imageArray.forEach((data, index)  => {
          if (data != '') {
            imageArray[index] = encodeURI(`${url}${data}`)
          } else {
            imageArray.pop()
          }
        },
      )
    }
    return imageArray;
  }

  convertImageListToArray(imageString: string,): any[] {
    let imageArray: any[];

    if ( imageString != undefined  &&  imageString != '') {
        imageArray = imageString.split(",")
        imageArray.forEach((data, index)  => {
          if (data != '') {
            imageArray[index] = encodeURI(`${data}`)
          } else {
            imageArray.pop()
          }
        },
      )
    }
    return imageArray;
  }


  addImageArraytoArray(imageArray: any[], otherImageArray: any []): any[] {
    if (otherImageArray) {
      if (imageArray) {
        otherImageArray.forEach( image =>  {
          if (image) {
           imageArray.push( image )
          }
        })
        return imageArray;
      } else {
        return otherImageArray;
      }
    }else {
      return imageArray;
    }
  }

  getImageURLPath(bucket: string, imageName: string ): string {
    let path = ''
    if (imageName) {

      if (bucket && `${bucket}`.substring(0, 16 ) ===  'https://https://') {
        const result =  bucket.split('https://')
        bucket = result[1];
      }

      if (bucket) {
        bucket = bucket.replace('https//', '')
      }

      if (bucket && `${bucket}`.substring(0, 8 ) === 'https://') {
        path = `https://${bucket}${imageName}`
      } else {
        path = `https://${bucket}.s3.amazonaws.com/${imageName}`
      }

    } else {

      if (bucket && `${bucket}`.substring(0, 8 ) === 'https://') {
        path = `${bucket}placeholderimage.png`
      } else {
        path = `https://${bucket}.s3.amazonaws.com/placeholderproduct.png`
      }

    }

    return path;
  }

  getPlaceHolderImage(): string {
    // "assets/images/placeholderimage.png"
    return "assets/images/placeholderimage.png" //  encodeURI(`${this.awsBucketURL}placeholderproduct.png`);
  }

  getImageURLPathAlt(bucket: string, imageName: string ): string {

    bucket = bucket.replace('https//', '')
    if (imageName) {
      return   encodeURI(`https://${bucket}.s3.amazonaws.com/${imageName}`);
    } else {
      return this.getPlaceHolderImage();
      return   encodeURI(`https://${bucket}.s3.amazonaws.com/placeholderproduct.png`);
    }
  }

  getImageURLFromNameArray(bucket: string, nameArray: string): string {

    if (!nameArray) {  return 'assets/images/placeholderimage.png' }
    // this.getImageURLPath(bucket, "placeholderproduct.png") }
    // assets/images/placeholderimage.png
    const imageName =  nameArray.split(",")
    bucket = bucket.replace('https//', '')
    if (imageName) {
      if (imageName[0] == undefined || imageName[0] == '' || imageName[0] == ',' ) {
        return  this.getImageURLPath(bucket, "placeholderproduct.png")
      } else {
        return  this.getImageURLPath(bucket,  imageName[0])
      }
    }

    return ''
  }


   getPreSignedURLforIDCard(fileName: string): Observable<IAWS_Temp_Key>  {

    const controller = "/AWS/"

    const endPoint = "getPreSignedURLforIDCard"

    const parameter = "?file=" +  fileName

    const url = `${this.apiUrl}${controller}${endPoint}${parameter}`

    return  this.http.get<IAWS_Temp_Key>(url)

  }


  getPresignedURLObservable(file:File): Observable<IAWS_Temp_Key>  {

    const controller = "/AWS/"

    const endPoint = "getPreSignedURL"

    const parameter = "?file=" +  file.name

    const url = `${this.apiUrl}${controller}${endPoint}${parameter}`

    return  this.http.get<IAWS_Temp_Key>(url)

  }

   // this isn't really a needed function, we have bucket set as public and so we just grabe the bucket _ amazonurl _ file
  getObjectURLFromAWS(file:string): any  {

    const controller =  "/aws/"
    const parameter  = "getObjectURLFromAWS?File=" + file

    return  this.http.get(`${this.apiUrl}${controller}${parameter}`).subscribe(data=>
      {
        return data
      })
  }

  getURLFromAWSForBucketList( file:string ): Observable<IKey>   {
    const controller =  "/aws/"
    const parameter = "getListOfobjects"
    return  this.http.get<IKey>(`${this.apiUrl}${controller}${parameter}`)

  }

  uploadfileAWSS3(url, contenttype, file): Observable<any> {

    const headers = new HttpHeaders().set(InterceptorSkipHeader, '');

    const req = new HttpRequest(
      'PUT', url, file,
      {  headers: headers,  });

    return this.http.request(req);

  }

  uploadFile(file:File , url: string): Observable<any> {
    const headers = new HttpHeaders().set(InterceptorSkipHeader, '');
    return this.http.put<any>( url, file, {headers} )
    // return this.http.put<any>( url, file )
  }

  async getBucket(): Promise<any> {

    const site = this.siteService.getAssignedSite();

    if (!site.url) {
      console.log('get Bucket, no url assigned', site.url)
    }

    const controller = '/aws/'

    const parameter = "getAWSBucket"

    const url = `${site.url}${controller}${parameter}`
    try {
      this.httpCache.get<IAWS_Temp_Key>( {url: url, cacheMins: 60} ).subscribe(
        {
        next: data => {
          this._awsBucket =  data.preassignedURL;
          localStorage.setItem('awsbucket', `${data.preassignedURL}`)
          return data.preassignedURL;
        },
        error: err => {
          console.log(err)
        }}
      )
    } catch (error) {

    }

    return ''

  }

  getAWSBucketObservable(): Observable<IAWS_Temp_Key> {
    const site = this.siteService.getAssignedSite();
    const bucket = localStorage.getItem('awsbucket')
    if (bucket) {
      let item = {} as IAWS_Temp_Key
      item.preassignedURL = bucket
      return of(item)
    }
    const controller = '/aws/'
    const parameter = "getAWSBucket"
    const url = `${site.url}${controller}${parameter}`
    const uri = {url: url, cacheMins: 60}
    return this.httpCache.get<IAWS_Temp_Key>( uri )
      .pipe(
        switchMap( data => {
          localStorage.setItem('awsbucket', `${data.preassignedURL}`)
          return of(data)
        })
      )
  }


}


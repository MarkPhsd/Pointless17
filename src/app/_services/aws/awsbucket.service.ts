import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders, HttpRequest, HttpResponse  } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
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
    // console.log('bucket from AwsBucket', bucket)

    if (!bucket || bucket === '') {
      await this.getBucket();
    }

    bucket =  localStorage.getItem('awsbucket');
    // console.log('Bucket from AWS Storage', bucket)
    return bucket

  }

  async  awsBucketURL(): Promise<string> {
    const  awsBucket = await this.awsBucket();
    return `https://${awsBucket}.s3.amazonaws.com/`
  }

  constructor(private http: HttpClient,
              private siteService: SitesService,
              private appInitService  : AppInitService,
              private httpCache: HttpClientCacheService
              ) {
    this.apiUrl =  this.appInitService.apiBaseUrl()
  }

  convertToArrayWithUrl(imageString:string, url: string): any[] {
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

    if (imageName) {
      return   encodeURI(`https://${bucket}.s3.amazonaws.com/${imageName}`);
    } else {
      return   encodeURI(`https://${bucket}.s3.amazonaws.com/placeholderproduct.jpg`);
    }
  }

   getImageURLPathAlt(bucket: string, imageName: string ): string {

    if (imageName) {
      return   encodeURI(`https://${bucket}.s3.amazonaws.com/${imageName}`);
    } else {
      return   encodeURI(`https://${bucket}.s3.amazonaws.com/placeholderproduct.jpg`);
    }
  }

  getImageURLFromNameArray(bucket: string, nameArray: string): string {

    if (!nameArray) {  return this.getImageURLPath(bucket, "placeholderproduct.jpg") }

    const imageName =  nameArray.split(",")

    if (imageName) {
      if (imageName[0] == undefined || imageName[0] == '' || imageName[0] == ',' ) {
        return  this.getImageURLPath(bucket, "placeholderproduct.jpg")
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

    this.httpCache.get<IAWS_Temp_Key>( {url: url, cacheMins: 60} ).subscribe(data => {
      this._awsBucket =  data.preassignedURL;
      localStorage.setItem('awsbucket', `${data.preassignedURL}`)
      return data.preassignedURL;
    })

    return ''

  }


}


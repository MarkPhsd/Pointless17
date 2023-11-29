import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Observable } from 'rxjs';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from '..';
import { SitesService } from '../reporting/sites.service';
import { PlatformService } from '../system/platform.service';
import { UserAuthorizationService } from '../system/user-authorization.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

export interface IMatrix {
  id: number;
  name: string;
  matrixSku: string;
  matrixField1: string;
  matrixField2: string;
  matrixField3: string;
  matrixField4: string;
  matrixField5: string;
  matrixField6: string;
  matrixField7: string;
  matrixField8: string;
  fieldID1: number | null;
  fieldID2: number | null;
  fieldID3: number | null;
  fieldID4: number | null;
  fieldID5: number | null;
  fieldID6: number | null;
  fieldID7: number | null;
  fieldID8: number | null;
  matrixSearch1: string;
  matrixSearch2: string;
  matrixSearch3: string;
  matrixSearch4: string;
  matrixSearch5: string;
  matrixSearch6: string;
  matrixSearch7: string;
  matrixSearch8: string;
  matrixType: number | null;
  productName: string;
  productID: number;
}

@Injectable({
  providedIn: 'root'
})
export class MatricesService {

  constructor(
    private httpCache               : HttpClientCacheService,
    private httpClient              : HttpClient,
    private sitesService            : SitesService,
    private userAuthorizationService: UserAuthorizationService,
    private platFormService         : PlatformService,
    private auth                    : AuthenticationService,
    private fb: FormBuilder,) {
  }


  listAssociations(site: ISite, productID : number): Observable<IMenuItem[]> {

    const controller = "/Matrices/"

    const endPoint   = `listAssociations`

    const parameters = `?productID=${productID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  }

  listAssociationsForTaging(site: ISite, productID : number): Observable<IMatrix[]> {

    const controller = "/Matrices/"

    const endPoint   = `listAssociationsForTaging`

    const parameters = `?productID=${productID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.get<any>(url)

  }

  deleteMatrix(site: ISite, id: number): Observable<IMatrix> {

    const controller ="/Matrices/"

    const endPoint = `deleteMatrix`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.delete<any>(url)

  }

  saveMatrix(site: ISite, matrix: IMatrix, productID: number, associationID: number): Observable<IMatrix> {

    const controller ="/Matrices/"

    const endPoint = `saveMatrix`

    const parameters = `?productID=${productID}&associationID=${associationID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, matrix)

  }

  saveMatrixList(site: ISite, matrices: IMatrix[], productID: number): Observable<IMatrix> {

    const controller ="/Matrices/"

    const endPoint = `saveMatrixList`

    const parameters = `?productID=${productID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.httpClient.post<any>(url, matrices)

  }

}

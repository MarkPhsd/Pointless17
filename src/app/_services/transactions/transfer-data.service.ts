import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ICanCloseOrder } from 'src/app/_interfaces/transactions/transferData';
import { AuthenticationService } from '..';

@Injectable({
  providedIn: 'root'
})
export class TransferDataService {



  constructor( private http: HttpClient,
               private auth: AuthenticationService) { }

  pageNumber = 1;
  pageSize  = 50;

  deleteDuplicates(site: ISite, zrunID: string): Observable<any> {
    const controller =  "/TransferData/"

    const endPoint = `deleteDuplicates`

    const parameters = `?zrunID=${zrunID}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url);
  }


  applyNewZRUNID(site: ISite) {
    const controller =  "/BalanceSheets/"

    const endPoint = `ApplyNewZRUNID`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url);
  }

  closeAll(site: ISite) : Observable<any> {

    const controller =  "/TransferData/"

    const endPoint = `CloseAll`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  closeByID(site: ISite, id: any) : Observable<any> {

    const controller =  "/TransferData/"

    const endPoint = `CloseByID`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

   }

   canCloseDay(site) : Observable<ICanCloseOrder> {

    const controller =  "/TransferData/"

    const endPoint = `CanCloseDay`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ICanCloseOrder>(url)

   }

   canCloseDayV2(site, deviceName:string, id: number) : Observable<ICanCloseOrder> {

    const controller =  "/TransferData/"

    const endPoint = `canCloseDayV2`

    const parameters = `?deviceName=${deviceName}&id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<ICanCloseOrder>(url)

   }
  //dateStart As String, dateEnd As String
  closeByDate(site: ISite, dateStart: string, dateEnd: string) : Observable<any> {

    const controller =  "/TransferData/"

    const endPoint = `CloseByDate`

    const parameters = `?dateStart=${dateStart}&dateEnd=${dateEnd}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

  deleteUncloseUnPrintedOrders(site: ISite) : Observable<any> {

    const controller =  "/TransferData/"

    const endPoint = `deleteUncloseUnPrintedOrders`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<any>(url)

  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { EMPTY, Observable, } from 'rxjs';
import { IClientTable, ISite, IUserProfile,employee, FlowVendor, ImportFlowVendorResults }   from  'src/app/_interfaces';
import { IDriversLicense } from 'src/app/_interfaces/people/drivers-license';
import { IEmployeeClient } from './employee-service.service';

@Injectable({
  providedIn: 'root'
})
export class ClientTableService {

  constructor( private http: HttpClient, private auth: AuthenticationService) { }

  pageNumber = 1;
  pageSize  = 50;


  getClient(site: ISite, id: any) : Observable<IClientTable> {

    if (id == 0) {return EMPTY}

    const controller =  "/ClientTable/"

    const endPoint = `getClientTable`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IClientTable>(url)

  }



  delete(site: ISite, id: number) : Observable<IClientTable> {

    if (id == 0) {return EMPTY}

    const controller =  "/ClientTable/"

    const endPoint = `delete`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<IClientTable>(url)

  }

  deleteList(site: ISite, id: number[]) : Observable<IClientTable> {


    const controller =  "/ClientTable/"

    const endPoint = `deleteList`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IClientTable>(url, id)

  }

  putClient(site: ISite, id: any, client: IClientTable): Observable<IClientTable> {

    if (id == 0) {return EMPTY}

    const controller =  "/ClientTable/"

    const endPoint = `putClientTable`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IClientTable>(url , client)

  };

  putPassword(site: ISite, id: any, client: IClientTable): Observable<IClientTable> {

    if (id == 0) {return EMPTY}

    const controller =  "/ClientTable/"

    const endPoint = `putPassword`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IClientTable>(url , client)

  };

  postClientWithEmployee(site: ISite, employee: employee): Observable<IEmployeeClient> {

    const controller =  "/ClientTable/"

    const endPoint = `postClientWithEmployee`

    const parameters  = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IEmployeeClient>(url , employee)

  };

  postClient(site: ISite, client: IClientTable): Observable<IClientTable> {

    const controller =  "/ClientTable/"

    const endPoint = `postClient`

    const parameters  = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IClientTable>(url , client)

  };

  saveClient( site: ISite,  client: IClientTable) : Observable<IClientTable> {

    if (client.id !== 0) {

      return this.putClient(site, client.id, client)

    } else {

      return this.postClient(site, client)

    }

  }

  postDriversLicense(site, driversLicense: IDriversLicense): Observable<IUserProfile> {

    const controller =  "/ClientTable/"

    const endPoint = `postDriversLicense`

    const parameters  = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>(url , driversLicense)

  };

  importFlowVendors(site: ISite, list: FlowVendor[]): Observable<ImportFlowVendorResults> {

    const controller ="/ClientTable/"

    const endPoint = `ImportFlowVendors`

    const parameters = ''

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.post<any>(url, list)

  };

}

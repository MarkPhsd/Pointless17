import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { EMPTY, Observable, catchError, concatMap, of, switchMap } from 'rxjs';
import { IClientTable, ISite, IUser, IUserProfile,employee, FlowVendor, ImportFlowVendorResults, UserPreferences }   from  'src/app/_interfaces';
import { IDriversLicense } from 'src/app/_interfaces/people/drivers-license';
import { IEmployeeClient } from './employee-service.service';
import { IItemBasic } from '..';
import { ErrorInterceptor } from 'src/app/_http-interceptors/error.interceptor';
import { UserSwitchingService } from '../system/user-switching.service';

export interface NamesCities {
  names: string[];
  cities: string[];
}
@Injectable({
  providedIn: 'root'
})
export class ClientTableService {

  constructor( private ErrorInterCeptor: ErrorInterceptor,
               private http: HttpClient,
               private auth: AuthenticationService) { }

  pageNumber = 1;
  pageSize  = 50;

  createGuestAccount(site: ISite): Observable<IUser > {
    const controller =  "/ClientTable/"

    const endPoint = `CreateGuestAccount`

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.get<IUser>(url).pipe(concatMap(data => {
      // console.log('createGuestAccount', data)
      const botaValue = `${data.username}:${data.password}`
      data.authdata = window.btoa(botaValue)
      // console.log('botaValue', botaValue, data.authdata)
      data.message = "success"
      data.token  = data?.password;
      localStorage.setItem('user', JSON.stringify(data))
      this.auth.updateUser(data)
      return of(data)
    }),catchError(data => {
      console.log('createGuestAccount error', data)
      return of (null)
    }))
  }


  getClient(site: ISite, id: any, overRideError?: boolean) : Observable<IClientTable> {
    let headers
    if (overRideError) {
       headers = new HttpHeaders().set('X-Skip-Error-Handling', 'true');
    }

    if (!id) { return of(null) }

    if (id == 0) {return of({} as IClientTable)}

    const controller =  "/ClientTable/"

    const endPoint = `getClientTable`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    if (headers) {
      return  this.http.get<IClientTable>(url, {headers})
    }
    return  this.http.get<IClientTable>(url)

  }

  newTempClient(site: ISite) : Observable<IClientTable>  {

    const controller =  "/ClientTable/"

    const endPoint = `getTempClient`

    const parameters = ``

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

  putPreference(site: ISite, preference: UserPreferences, id: number): Observable<IClientTable> {

    if (id == 0) {return of(null)}

    const controller =  "/ClientTable/"

    const endPoint = `putPreference`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<IClientTable>(url , preference)

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

  savePreferences(site: ISite, preference: string, id: number) {

    const item = {} as IItemBasic;
    item.name = preference;
    item.id = id;

    const controller =  "/ClientTable/"

    const endPoint = `SavePreferences`

    const parameters  = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>(url , item)

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


  GetNewClientsOverDateCount(site: ISite, numberOfdays: number): Observable<IItemBasic> {
    const controller ="/ClientTable/"

    const endPoint = `GetNewClientsOverDateCount`

    const parameters = `?number=${numberOfdays}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)
  }

  //namesList As List(Of String), cities As List(Of String)
  randomizeClientInfo(site, namesCities: NamesCities): Observable<IUserProfile> {

    const controller =  "/ClientTable/"

    const endPoint = `randomizeClientInfo`

    const parameters  = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<any>(url , namesCities)

  };

  //  https://names.drycodes.com/10000?nameOptions=boy_names
  // 'https://names.drycodes.com/1000?nameOptions=cities
  getCitiesList(): Observable<any> {
    return  this.http.get(`https://names.drycodes.com/1000?nameOptions=cities`)
  }

  getNamesList(): Observable<any> {
    return  this.http.get(`https://names.drycodes.com/10000?nameOptions=boy_names`)
  }
}

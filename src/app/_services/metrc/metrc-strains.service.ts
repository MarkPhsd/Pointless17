import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import {
  METRCStrainsGet,
  MetrcStrainsCreate,
  METRCStrainsUpdate
} from 'src/app/_interfaces/metrcs/strains'

@Injectable({
  providedIn: 'root'
})
export class MetrcStrainsService {

  constructor( private http: HttpClient, private auth: AuthenticationService, ) { }

  getStrainByID(id:number, site: ISite): Observable<METRCStrainsGet> {

    const controller = 'strains/v1/update'

    const endPoint = `${id}`

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCStrainsGet>(url);

  }

  getStrains(site: ISite): Observable<METRCStrainsGet[]> {

    const controller = '/strains/v1/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCStrainsGet[]>(url);

  }

  postStrains(metrcStrainsCreate: MetrcStrainsCreate[], site: ISite): Observable<MetrcStrainsCreate[]> {

    const controller = '/strains/v1/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.post<MetrcStrainsCreate[]>(url, metrcStrainsCreate);

  }

  putStrains(mETRCStrainsUpdate: METRCStrainsUpdate[], site: ISite): Observable<METRCStrainsUpdate[]> {

    const controller = '/strains/v1/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.put<METRCStrainsUpdate[]>(url, mETRCStrainsUpdate);

  }

  deleteStrain(id: number, site: ISite): Observable<any> {

    const controller = '/strains/v1/active'

    const endPoint = ``

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.delete<any>(url);

  }

}

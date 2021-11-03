import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { Observable, } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';

export interface METRCUOM {
  QuantityType: string;
  Name:         string;
  Abbreviation: string;
}

@Injectable({
  providedIn: 'root'
})
export class MetrcUOMService {

  'https://sandbox-api-ca.metrc.com/unitsofmeasure/v1/active?licenseNumber=M10-0000004-LIC'

  constructor( private http: HttpClient, private auth: AuthenticationService, ) { }

  getUOMs(site: ISite):  Observable<METRCUOM[]> {

    const controller = '/unitsofmeasure/v1/'

    const endPoint = 'active'

    const parameters = ''

    const licenseNumber  = `?licenseNumber=${site.metrcLicenseNumber}`

    const url = `${site.metrcURL}${controller}${endPoint}${parameters}${licenseNumber}`

    return this.http.get<METRCUOM[]>(url);

  }

}

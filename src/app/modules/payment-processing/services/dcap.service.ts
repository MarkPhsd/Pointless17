import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DSIEMVSettings } from 'src/app/_services/system/settings.service';

@Injectable({
  providedIn: 'root'
})
export class DcapService {
  site = this.siteService.getAssignedSite()
  constructor(private http: HttpClient,
              private siteService: SitesService
              ) { }

  resetDevice(deviceName: string): Observable<any> {

    const controller = '/dCap/'

    const endPoint = "ResetDevice"

    const parameters = `?deviceName=${deviceName}`

    const url = `${this.site.url}${controller}${endPoint}${parameters}`

    return this.http.get<any>(url)
  }

}

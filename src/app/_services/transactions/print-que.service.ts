import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SitesService } from '../reporting/sites.service';
import { IPOSOrder } from 'src/app/_interfaces';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PrintQueService {

  site = this.siteService.getAssignedSite()
  constructor(private http: HttpClient,private siteService: SitesService) { }

  getQue() {
    const items = [] as IPOSOrder[];
    return of(items)
  }
}

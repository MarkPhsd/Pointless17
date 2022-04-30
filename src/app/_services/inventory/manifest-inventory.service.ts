import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IInventoryAssignment } from './inventory-assignment.service';
import { ManifestStatus } from './manifest-status.service';
import { ManifestType } from './manifest-types.service';

// Generated by https://quicktype.io

export interface InventoryManifest {
  id:                 number;
  name:               string;
  originatorID:       number;
  sourceSiteID:       number;
  sourceSiteURL:      string;
  receiverManifestID: number;
  desinationID:       number;
  desinationURL:      string;
  active:             number;
  status:             string;
  type:               string;
  entryUser:          string;
  entryUserID:        number;
  requestedBy:        string;
  requestedByID:      number;
  createdDate:        string;
  sendDate:           string;
  receiverName:       string;
  scheduleDate:       string;
  carrierName:        string;
  carrierEmployee:    string;
  acceptedDate:       string;
  description:        string;
  recieverID:         number;
  statusID:           number;
  typeID:             number;
  inventoryAssignments:IInventoryAssignment[];
  manifestTypes	      :ManifestType;
  manifestStatus	    :ManifestStatus;
  site                :ISite;
}

// Generated by https://quicktype.io

export interface ManifestSearchModel {
  scheduleDate_From:  string;
  scheduleDate_To:    string;
  status:             string;
  active:             boolean;
  type:               string;
  name:               string;
  created_From:       string;
  created_To:         string;
  carrierName:        string;
  sourceSiteID:       number;
  desinationID:       number;
  entryUseriD:        number;
  requestedByID:      number;
  recieverID:         number;
  pageSize:           number;
  pageNumber:         number;
  pageCount:          number;
  recordCount:        number;
  currentPage:        number;
  lastPage:           number;
  isLastPage:         boolean;
  isFirstPage:        boolean;
  loadChildren:       boolean;
  activeStatus:       number;
  useNameInAllFields: boolean;
  exactNameMatch:     boolean;
}

// Generated by https://quicktype.io

export interface ManifestSearchResults {
  results: InventoryManifest[];
  paging:  Paging;
  errorMessage: string;
}

export interface Paging {
  hasNextPage:      boolean;
  hasPreviousPage:  boolean;
  lastItemOnPage:   number;
  pageSize:         number;
  currentPage:      number;
  pageCount:        number;
  recordCount:      number;
  isLastPage:       boolean;
  isFirstPage:      boolean;
  totalRecordCount: number;
}

@Injectable({
  providedIn: 'root'
})


export class ManifestInventoryService {

  site: ISite;

  public inventoryItems: IInventoryAssignment[];

  private _inventoryItems = new BehaviorSubject<IInventoryAssignment[]>(null);
  public  inventoryItems$  = this._inventoryItems.asObservable()

  private _inventoryManifest = new BehaviorSubject<InventoryManifest>(null);
  public currentInventoryManifest$  = this._inventoryManifest.asObservable()

  private _currentManifestSite = new BehaviorSubject<ISite>(null);
  public currentManifestSite$  = this._currentManifestSite.asObservable()

  constructor(
      private http: HttpClient,
      private auth: AuthenticationService,
      private siteService: SitesService)
  {
  }

  updateCurrentInventoryManifest(inventoryManifest: InventoryManifest){
    this._inventoryManifest.next(inventoryManifest)
  }

  updateInventoryItems(items: IInventoryAssignment[]) {
    this._inventoryItems.next(items)
  }

  updateSelectedManifestSite(site: ISite) {
    this._currentManifestSite.next(site)
  }

  listAll(site: ISite): Observable<InventoryManifest[]> {

      // const site = this.siteService.getAssignedSite()

      const controller =  `/InventoryManifests/`

      const endPoint = `GetManifests`

      const parameters = ``

      const url = `${site.url}${controller}${endPoint}${parameters}`

      return  this.http.get<InventoryManifest[]>(url)

  }

  searchManifest(site: ISite, searchModel: ManifestSearchModel): Observable<ManifestSearchResults> {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `SearchInventoryManifest`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<ManifestSearchResults>(url, searchModel)

  }

  get(site: ISite,  id: number): Observable<InventoryManifest> {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `GetManifest`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<InventoryManifest>(url)

  }

  add(site: ISite,  inventoryManifest: InventoryManifest ): Observable<InventoryManifest> {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `PostInventoryManifest`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<InventoryManifest>(url, inventoryManifest)

  }

  update(site: ISite,  id: number, iInventoryLocation: InventoryManifest): Observable<InventoryManifest>  {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `PutInventoryManifest`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<InventoryManifest>(url, iInventoryLocation)

  }

  delete( site: ISite, id: number): Observable<InventoryManifest> {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `DeleteManifest`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<InventoryManifest>(url)

  }



}

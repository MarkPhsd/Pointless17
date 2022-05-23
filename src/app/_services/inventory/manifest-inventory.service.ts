import { Injectable, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { BehaviorSubject, Observable } from 'rxjs';
import { ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IInventoryAssignment } from './inventory-assignment.service';
import { ManifestStatus } from './manifest-status.service';
import { ManifestType } from './manifest-types.service';
import { Dialog } from 'electron';
import { MatDialog } from '@angular/material/dialog';
import { ManifestsComponent } from 'src/app/modules/admin/inventory/manifests/manifests.component';
import { MainfestEditorComponent } from 'src/app/modules/admin/inventory/manifests/mainfest-editor/mainfest-editor.component';
import { DateAdapter } from '@angular/material/core';

// Generated by https://quicktype.io

export interface InventoryManifest {
  id:                 number;
  name:               string;
  originatorID:       number;
  receiverManifestID: number;

  sourceSiteID:       number;
  sourceSiteURL:      string;
  sourceSiteName    : string;

  destinationID:      number;
  destinationURL     :string;
  destinationSiteName:string;

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
  paidDate           :string;

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
  itemCount          :number;
  totalValue          :number;
  estimatedTotalRetail:number;
  errorMessage        : string;

}

// Generated by https://quicktype.io

export interface ManifestSearchModel {
  scheduleDate_From:  string;
  scheduleDate_To:    string;
  created_From:       string;
  created_To:         string;
  accepted_From:      string;
  accepted_To:        string;

  send_From:          string;
  send_To:            string;

  paid_From:          string;
  paid_To:            string;

  status:             string;
  active:             boolean;
  type:               string;
  name:               string;
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

  private _inventoryItems    = new BehaviorSubject<IInventoryAssignment[]>(null);
  public  inventoryItems$    = this._inventoryItems.asObservable()

  private _inventoryManifest = new BehaviorSubject<InventoryManifest>(null)
  public  currentInventoryManifest$  = this._inventoryManifest.asObservable()
  private currentInventoryManifest: InventoryManifest;

  private _currentManifestSite = new BehaviorSubject<ISite>(null);
  public currentManifestSite$  = this._currentManifestSite.asObservable()

  private _manifestStatus      = new BehaviorSubject<ManifestStatus>(null);
  public manifestStatus$       = this._manifestStatus.asObservable()

  private _manifestTypes       = new BehaviorSubject<ManifestType>(null);
  public manifestTypes$        = this._manifestTypes.asObservable()

  private _searchModel       = new BehaviorSubject<ManifestSearchModel>(null);
  public searchModel$        = this._searchModel.asObservable()

  constructor(
      private http       : HttpClient,
      private auth       : AuthenticationService,
      private dialog     : MatDialog,
      private siteService: SitesService)
  {
  }

  get isWarehouse(): boolean {
    try {
      if (this.currentInventoryManifest) {
        const site = this.siteService.getAssignedSite();
        if (!this.currentInventoryManifest.sourceSiteURL) { return true}

        if (site.url == this.currentInventoryManifest.sourceSiteURL
            || !this.currentInventoryManifest.sourceSiteURL) {
          return true;
        }
      }
    } catch (error) {
      console.log(error)
    }
    return false
  }

  updateCurrentInventoryManifest(inventoryManifest: InventoryManifest){
    this._inventoryManifest.next(inventoryManifest)
    this.currentInventoryManifest = inventoryManifest;
  }

  updateSearchModel(item: ManifestSearchModel) {
    this._searchModel.next(item)
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

    const endPoint = `GetInventoryManifest`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<InventoryManifest>(url)

  }

  // /ReceiveTransfer(inventoryManifest)
  sendTransfer(site: ISite, inventoryManifest: InventoryManifest): Observable<InventoryManifest> {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `ReceiveTransfer`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<InventoryManifest>(url, inventoryManifest )

  }

  getWithProducts(site: ISite,  id: number): Observable<InventoryManifest> {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `GetInventoryManifestWithProducts`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<InventoryManifest>(url)

  }

  add(site: ISite,  inventoryManifest: InventoryManifest ): Observable<InventoryManifest> {

    const controller =  `/InventoryManifests/`

    const endPoint = `PostInventoryManifest`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<InventoryManifest>(url, inventoryManifest)

  }

  update(site: ISite,  id: number, inventoryManifest: InventoryManifest): Observable<InventoryManifest>  {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `PutInventoryManifest`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.put<InventoryManifest>(url, inventoryManifest)

  }

  delete( site: ISite, id: number): Observable<InventoryManifest> {

    // const site = this.siteService.getAssignedSite()

    const controller =  `/InventoryManifests/`

    const endPoint = `DeleteInventoryManifest`

    const parameters = `?id=${id}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.delete<InventoryManifest>(url)

  }


  openManifestForm(id: number) {
    let dialogRef: any;
    const site = this.siteService.getAssignedSite();
    this.get(site,id).subscribe(data => {
      this.updateCurrentInventoryManifest(data)
      dialogRef = this.dialog.open(MainfestEditorComponent,
        { width:        '90vw',
          minWidth:     '90vw',
          height:       '90vh',
          minHeight:    '90vh',
        },
      )
    })
  }

}
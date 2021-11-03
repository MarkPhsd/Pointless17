import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthenticationService } from '../system/authentication.service';
import { Observable } from 'rxjs';
import { ISite}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';

export interface IInventoryAssignment {
  id:                    number;
  packageType:           string;
  productName:           string;
  productCategoryName:   string;
  itemStrainName:        string;
  sku:                   string;
  label:                 string;
  metrcPackageID:        number;
  locationID:            number;
  location:              string;

  unitOfMeasureName:     string;
  unitMulitplier:        number;
  baseQuantity:          number;
  baseQuantityRemaining: number;
  packageQuantity:       number;
  packageCountRemaining: number;
  unitConvertedtoName:   string;
  jointWeight:           number;
  intakeUOM:             string;
  intakeConversionValue: number;
  packagedOrBulk:        number;
  productID:             number;
  dateCreated:           string;
  expiration:            string;
  facilityLicenseNumber: string;
  batchDate:             string;
  cost:                  number;
  price:                 number;
  priceScheduleID:       number;
  notAvalibleForSale:    boolean;
  thc:                   number;
  thc2:                  number;
  thca2:                 number;
  thca:                  number;
  cbd:                   number;
  cbd2:                  number;
  cbda2:                 number;
  cbda:                  number;
  cbn:                   number;
  cbn2:                  number;
  employeeID:            number;
  employeeName:          string;
  requiresAttention:     boolean;
  beginDate:             string;
  endDate:               string;
  adjustmentNote:        string;
  adjustmentDate:        string;
  adjustmentType:        string;
  invoiceID     :        number;
  invoiceCode   :        string;
  serials:               Serial[];
}

export interface Serial {
  id:                    number;
  inventoryAssignmentID: number;
  sku:                   string;
  quantity:              number;
  adjustmentNote:        string;
  adjustmentDate:        string;
  adjustmentType:        string;
  serialCode:            string;
  beginDate:             string;
  endDate:               string;
}

export interface InventoryFilter {
  productName:          string;
  productCategoryName:  string;
  itemStrainName:       string;
  sku:                  string;
  label:                string;
  location:             string;
  noActiveCount:        boolean;
  packageType:          string;
  pageSize:             number;
  pageNumber:           number;
  notAvalibleForSale:   boolean;
  requiresAttention:    boolean;
  inventoryStatus:      number;
}

@Injectable({
  providedIn: 'root'
})

export class InventoryAssignmentService {

  constructor(
    private http: HttpClient,
    private auth: AuthenticationService,
    private siteService: SitesService)
  {
  }

  getSummaryOfGramsUsed(site: ISite, inventoryAssigments: IInventoryAssignment[], packageQuantity: number): any {
    if (inventoryAssigments) {
      let total = 0; inventoryAssigments.forEach(item =>
      {
        total += item.baseQuantity //* item.jointWeight
      })
      console.log('total used')
      return packageQuantity - total
    }
  }

 getInventoryAssignment(site: ISite, id: number): Observable<IInventoryAssignment> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `GetInventoryAssignment`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.get<IInventoryAssignment>(url)

 }

 getInventoryAssignmentHistory(site: ISite, id: number): Observable<IInventoryAssignment[]> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `GetInventoryHistoryList`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.get<IInventoryAssignment[]>(url)

 }

 getInventory(site: ISite, inventoryFilter: InventoryFilter): Observable<IInventoryAssignment[]> {

    const controller =  `/InventoryAssignments/`

    const endPoint = `postInventory`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.post<IInventoryAssignment[]>(url, inventoryFilter)

  }

  getActiveInventory(site: ISite, inventoryFilter: InventoryFilter): Observable<IInventoryAssignment[]> {

    inventoryFilter.noActiveCount = true

    const controller =  `/InventoryAssignments/`

    const endPoint = `postInventory`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}`

    return  this.http.post<IInventoryAssignment[]>(url, inventoryFilter)

  }


  getInActiveInventory(site: ISite, pageNumber: number, pageSize: number): Observable<IInventoryAssignment[]> {

    const inventoryFilter = {}  as InventoryFilter;

    inventoryFilter.pageNumber = pageNumber
    inventoryFilter.pageSize = pageSize
    inventoryFilter.noActiveCount = true

    const controller =  `/InventoryAssignments/`

    const endPoint = `postInventory`

    const parameters = ``

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.post<IInventoryAssignment[]>(url, inventoryFilter )


 }

 getInventoryByType(site: ISite,pageNumber: number, pageSize: number, type: string): Observable<IInventoryAssignment[]> {

  const inventoryFilter = {}  as InventoryFilter;

  inventoryFilter.packageType = type
  inventoryFilter.pageNumber = pageNumber
  inventoryFilter.pageSize = pageSize
  inventoryFilter.noActiveCount = true

  const controller =  `/InventoryAssignments/`

  const endPoint = `GetInventoryList`

  const parameters = ``

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.post<any>(url, inventoryFilter )

}

  // https://localhost:44309/api/InventoryAssignments/PutInventoryAssignment?id=8
editInventory(site: ISite, id: number, iInventoryAssignment: IInventoryAssignment): Observable<IInventoryAssignment> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `PutInventoryAssignment`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.put<IInventoryAssignment>(url, iInventoryAssignment)

}

moveInventory(site: ISite, iInventoryAssignment: IInventoryAssignment[]): Observable<IInventoryAssignment[]> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `moveInventory`

  const url = `${site.url}${controller}${endPoint}`

  return  this.http.post<IInventoryAssignment[]>(url, iInventoryAssignment)

}

addInventoryList(site: ISite, label: string, iInventoryAssignment: IInventoryAssignment[]): Observable<IInventoryAssignment[]> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `PostInventoryAssignments`

  const parameters = `?label=${label}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.post<IInventoryAssignment[]>(url, iInventoryAssignment)

}

addInventoryItem(site: ISite,  iInventoryAssignment: IInventoryAssignment): Observable<IInventoryAssignment> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `PostInventoryAssignment`

  const parameters = ``

  const url = `${site.url}${controller}${endPoint}${parameters}`

  console.log('iInventoryAssignment', iInventoryAssignment)
  console.log('url', url)
  return  this.http.post<IInventoryAssignment>(url, iInventoryAssignment)


}

deleteInventory(site: ISite, id: number): Observable<IInventoryAssignment[]> {

  const controller =  `/InventoryAssignments/`

  const endPoint = `DeleteInventoryAssignment`

  const parameters = `?id=${id}`

  const url = `${site.url}${controller}${endPoint}${parameters}`

  return  this.http.delete<IInventoryAssignment[]>(url)

}


  setNonConvertingFieldValues(inventoryAssignment: IInventoryAssignment,
                                        facility, inventoryLocation , intakeConversion, menuItem: IMenuItem, metrcPackage: METRCPackage ): IInventoryAssignment {

    // inventoryAssignment = this.inventoryAssignmentService.setNonConvertingFieldValues( )
    //assign values to inventoryAssignement
    inventoryAssignment.locationID            = inventoryLocation.id
    inventoryAssignment.location              = inventoryLocation.name

    inventoryAssignment.intakeUOM             = intakeConversion.name
    inventoryAssignment.intakeConversionValue = intakeConversion.value

    inventoryAssignment.facilityLicenseNumber = facility.metrcLicense

    inventoryAssignment.productID             = menuItem.id
    inventoryAssignment.productName           = menuItem.name
    inventoryAssignment.itemStrainName        = menuItem.name

    console.log(inventoryAssignment)

    inventoryAssignment.label                 = metrcPackage.label
    inventoryAssignment.metrcPackageID        = metrcPackage.id
    inventoryAssignment.packageType           = metrcPackage.packageType
    inventoryAssignment.unitOfMeasureName     = metrcPackage.unitOfMeasureName
    inventoryAssignment.productCategoryName   = metrcPackage.productCategoryName
    // metrcPackage.

    inventoryAssignment.notAvalibleForSale  = false
    if (!inventoryLocation.activeLocation) { inventoryAssignment.notAvalibleForSale  = true}
    inventoryAssignment.requiresAttention     = false

    inventoryAssignment.employeeName          = localStorage.getItem('username');
    inventoryAssignment.employeeID            = parseInt(localStorage.getItem('userID'));

    const d = new Date();
    inventoryAssignment.dateCreated           = d.toISOString()

    return inventoryAssignment
  }

}

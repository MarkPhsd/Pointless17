import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { EMPTY, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { ISite } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { MenuService } from 'src/app/_services';
import {  MetrcFacilitiesService } from 'src/app/_services/metrc/metrc-facilities.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'metrc-inventory-properties',
  templateUrl: './metrc-inventory-properties.component.html',
  styleUrls: ['./metrc-inventory-properties.component.scss']
})
export class MetrcInventoryPropertiesComponent implements OnInit {

  @Input() inputForm   :      FormGroup;
  @Input() package     :      METRCPackage;
  @Output() outputMenuItem    = new EventEmitter<any>();
  @Output() outputVendor      = new EventEmitter<any>();
  @Input() filter: ProductSearchModel; //productsearchModel;

  facilityLicenseNumber: string;
  productionBatchNumber: string;
  menuItem             : any ;
  site                 : ISite;

  constructor(
    private siteService           : SitesService,
    private menuService           : MenuService,
    private metrcFacilitiesService: MetrcFacilitiesService,
  ) { }

  ngOnInit(): void {
    this.site = this.siteService.getAssignedSite()
    this.assignDefaultFacility(this.package);
    this.assignDefaultCatalogItem(this.package)
  }

  assignDefaultFacility( metrcPackage: METRCPackage) {
    if (metrcPackage && metrcPackage.itemFromFacilityName) {
      this.inputForm.patchValue({facilityLicenseNumber: [`${metrcPackage.itemFromFacilityLicenseNumber}-${metrcPackage.itemFromFacilityName}` ]});
      const site = this.siteService.getAssignedSite();
      this.metrcFacilitiesService.getItemsNameBySearch(site,metrcPackage.itemFromFacilityLicenseNumber).pipe(
        switchMap(data => {
          if (data) {
            return this.metrcFacilitiesService.getFacility(data[0].id, site)
          }
          return EMPTY
      })).subscribe(data => {
        if (data && data.license) {
          this.facilityLicenseNumber = `${data.license.number}-${data.name}`
          this.inputForm.patchValue({facilityLicenseNumber: this.facilityLicenseNumber});
        }
      })
    }
  }

  //consider maning a component or Directive.
  // @Input('menuItemNameAdd') menuItemNameAdd: string
  addNewMenuItem()  {
    if (this.package && this.package.productName) {
      // this.men
    }
  }

  assignDefaultCatalogItem(metrcPackage: METRCPackage) {
    if (metrcPackage && metrcPackage.productName) {
      this.inputForm.patchValue({productName: [``]})
      const site = this.siteService.getAssignedSite();
      const searchModel = {} as ProductSearchModel;
      searchModel.name = metrcPackage.productName ;
      searchModel.metrcCategory = metrcPackage.productCategoryName
      searchModel.exactNameMatch = true;
      const list$ =  this.menuService.getItemBasicBySearch(site, searchModel ).pipe(
        switchMap(data => {
          if (data) {
            if (data.length == 0) {return of('')}

            if (!data[0] == undefined || data[0].id == undefined) {return EMPTY}
            return this.menuService.getMenuItemByID( site, data[0].id)
          }}),
          catchError( data => {
            console.log('error' , data)
            return EMPTY
          }
        ))

      list$.subscribe(
          {next: data => {
          console.log(' get item from basic search ',searchModel,  data )
          if (data) {
              const item = {} as IMenuItem;
              if (this.dataIsMenuItem(data)) {
                this.menuItem = data;
                this.inputForm.patchValue({
                  productName: [`${data.name}`],
                  productID  : [data.productID]
                })
                this.outputMenuItem.emit(data)
                return
              }
          }
        },
        error: err => {
          console.log(err)
        }
      }
      )
      this.setProductNameEmpty(this.inputForm);
    }
  }

  setProductNameEmpty(inputForm: FormGroup) {
    inputForm.patchValue({
      productName: [''],
      productID:  ['']
    })
  }

  dataIsMenuItem(data: any) {
    if (data.id == undefined) {
      return false
    }
    return true;
  }

  getVendor(event) {
    const facility = event
    if (facility) {
      this.facilityLicenseNumber = `${facility.displayName} - ${facility.metrcLicense}`
      this.outputVendor.emit(facility)
    }
  }

  getCatalogItem(event) {
    const itemStrain = event
    if (itemStrain) {
      if (itemStrain.id) {
        this.menuService.getMenuItemByID(this.site, itemStrain.id).subscribe(data => {
            if (data) {
              this.menuItem = data
              this.outputMenuItem.emit(data)
            }
          }
        )
      }
    }
  }

}

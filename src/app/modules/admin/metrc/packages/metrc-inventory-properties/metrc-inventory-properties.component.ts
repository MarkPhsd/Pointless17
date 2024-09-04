import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable, of } from 'rxjs';
import { catchError, concatMap, switchMap } from 'rxjs/operators';
import { IProduct, ISite, UnitType } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { METRCFacilities } from 'src/app/_interfaces/metrcs/facilities';
import { METRCPackage } from 'src/app/_interfaces/metrcs/packages';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { MenuService } from 'src/app/_services';
import { IItemType, ItemType_Properties, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { MetrcFacilitiesService } from 'src/app/_services/metrc/metrc-facilities.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'metrc-inventory-properties',
  templateUrl: './metrc-inventory-properties.component.html',
  styleUrls: ['./metrc-inventory-properties.component.scss']
})
export class MetrcInventoryPropertiesComponent implements OnInit {

  action$: Observable<any>;
  @Input()  inputForm   :      UntypedFormGroup;
  @Input()  package     :      METRCPackage;
  @Output() outputMenuItem    = new EventEmitter<any>();
  @Output() outputVendor      = new EventEmitter<any>();
  @Input()  filter: ProductSearchModel; //productsearchModel;

  facilityLicenseNumber: string;
  productionBatchNumber: string;
  menuItem             : any ;
  site                 : ISite;

  constructor(
    private siteService           : SitesService,
    private menuService           : MenuService,
    private unitTypeService: UnitTypesService,
    private itemTypeService: ItemTypeService,
    private productButtonService: ProductEditButtonService,

  ) { }

  ngOnInit(): void {
    this.site = this.siteService.getAssignedSite()
    this.assignDefaultCatalogItem(this.package)
  }

  // consider maning a component or Directive.
  // @Input('menuItemNameAdd') menuItemNameAdd: string
  addNewMenuItem()  {
    if (this.package && this.package.productName) {
      // this.men
    }
  }

  assignDefaultCatalogItem(metrcPackage: METRCPackage) {
    if (metrcPackage && metrcPackage.productName) {
      this.inputForm.patchValue({productName: ``})
      const site = this.siteService.getAssignedSite();
      let searchModel = {} as ProductSearchModel;
      console.log('assignDefaultCatalogItem',  metrcPackage.productName)
      // if (this.package.itemStrainName) {
      // }
      // console.log( this.package, metrcPackage)
      // searchModel =  {name: metrcPackage.productName, exactNameMatch: true} as ProductSearchModel;
      searchModel.exactNameMatch = true;
      searchModel.name = metrcPackage?.productName ;
      console.log('search model', searchModel)
      const list$ =  this.menuService.getItemBasicBySearch( site, searchModel ).pipe(
        switchMap(data => {
          if (data) {
            if (data.length == 0) {return of('')}
            if (!data[0] == undefined || data[0].id == undefined) {return of(null)}
            return this.menuService.getMenuItemByID( site, data[0]?.id)
          }}),
          catchError( data => {
            console.log('error' , data)
            return of(null)
          }
      ))

        list$.subscribe(
            {next: data => {
              if (data) {
                const item = {} as IMenuItem;
                if (this.dataIsMenuItem(data)) {
                  this.menuItem = data as IMenuItem;
                  this.inputForm.patchValue({
                    productName: this.menuItem?.name ,
                    productID  : this.menuItem?.id
                  })
                  this.outputMenuItem.emit(data)
                  return
                }
              }
              if (!data) {
                if (searchModel?.name) {
                  const confirm = window.confirm(`${metrcPackage?.productName} does not exist. Do you want to create a new item?`)
                  if (confirm) {
                    this.openNewProduct(metrcPackage)
                  }
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

  openNewProduct(met: METRCPackage) {
    //data?:METRCPackage
    let type = {} as IItemType;
    let uom = {} as any;
    let product = {} as IProduct;

    type.name   = met?.item?.productCategoryName;
    const site  = this.siteService.getAssignedSite()
    const type$ = this.getItemType(met?.item?.productCategoryName)
    const uom$  = this.getUnitTypeByName(met?.unitOfMeasureName)
    let packageWeight = 0

    let jsonInfo : ItemType_Properties
    let action$ = type$.pipe(concatMap(data => {
      type = data;
      try {
        if (data.json) {
          jsonInfo = JSON.parse(data.json) as ItemType_Properties
          if (jsonInfo) { 
            packageWeight = jsonInfo?.metrcPackageWeight;
          }
        }
      } catch {
      }

      return uom$
    })).pipe(concatMap(data => {
      uom = data;
      product.name = met?.item?.name;
      product.active = true;
      product.webProduct = 1;

      product.fullProductName = product?.name;
      product.prodModifierType = type?.id;
      product.unitTypeID = uom?.id;
      product.productCount = 0;

      if(met?.item?.unitWeight) { 

        const result = +met?.item?.unitWeight - +packageWeight;
        const roundedResult = Math.round(result * 100) / 100;
        console.log('type', roundedResult)
        product.gramCount = +roundedResult
      }

      return      this.menuService.postProduct(site, product)
    })).pipe(switchMap(data => {
      if (data && type) {
        this.outputMenuItem.emit(data)
      }
      return of(data)
    }));
    this.action$ = action$
  }

  private getItemType(name: string): Observable<IItemType> {
    const site = this.siteService.getAssignedSite()
    return this.itemTypeService.getItemTypeByName(site,name ).pipe(switchMap(data => {
      if (!data) {
        let type = {} as IItemType;
        type.name = name;
        return this.itemTypeService.postItemType(site, type)
      }
      return of(data)
    }))
   }

   private getUnitTypeByName(name: string): Observable<any> {
    const site = this.siteService.getAssignedSite()
    let uom = {} as any;
    return this.unitTypeService.getUnitTypeByName(site, name).pipe(switchMap(data => {
      if (!data) {
        uom.name = name;
        return this.unitTypeService.post(site, uom)
      }
      return of(data)
    }))
   }

  openProductEditor(productID) {

    productID = this.inputForm.controls['productID'].value;
    if (!productID) {
      this.siteService.notify('no id', 'close', 300)
      return
    }
    const site = this.siteService.getAssignedSite()
    let product
    this.action$  = this.menuService.getProduct(site, productID).pipe(concatMap(data => {
      product = data
      if (!data) {return of(null) }
      return this.itemTypeService.getItemType(site, data?.prodModifierType )
    })).pipe(switchMap(data => {

      console.log('type', data, product?.prodModifierType)
      if (data && productID) {
        this.productButtonService.openProductEditor(productID, data?.id)
      }
      return of(data)
    }))

  }

  setProductNameEmpty(inputForm: UntypedFormGroup) {
    inputForm.patchValue({
      productName: '',
      productID:  ''
    })
  }

  dataIsMenuItem(data: any) {
    if (data.id == undefined) {
      return false
    }
    return true;
  }

  deleteProductID() {
    if (this.package) { 
      this.package.productID = null;
    }
    this.inputForm.patchValue({productID: 0, productName: ''})
  }

  openNewProductByType() {
    
    const site= this.siteService.getAssignedSite()
    let typeName = this.package?.productCategoryName;

    let product = {} as IProduct
    product.name = this.package.productName;
    
    let unit = {} as UnitType;
    const unitType$ = this.unitTypeService.getUnitTypeByName(site, this.package.unitOfMeasureName)

    //get item type
    const type$ =    this.itemTypeService.getItemTypeByName(site, typeName)

    let product$  = this.menuService.postProduct(site, product)

    this.action$ = unitType$.pipe(concatMap(data => { 
      unit = data;
      if (data){
        product.unitTypeID = +data?.id
      }
      return type$ 
    })).pipe(switchMap(data => {
      if (data){
        product.prodModifierType = +data?.id
      }
      return this.menuService.postProduct(site, product)
    })).pipe(switchMap( data => {

        this.productButtonService.openNewItemSelector(

      )
      return of(data)
    }))
   
  }

  getCatalogItem(event) {
    const itemStrain = event
    if (itemStrain) {
      if (itemStrain.id) {
        this.menuService.getMenuItemByID(this.site, itemStrain.id).subscribe(data => {
            if (data) {
              this.menuItem = data
              this.package.productID = this.menuItem?.id;
              this.package.productName = this.menuItem?.name
              this.outputMenuItem.emit(data)
            }
          }
        )
      }
    }
  }

}

import { Component,  Inject,  Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable,  } from 'rxjs';
import { IItemBasic } from 'src/app/_services';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { IPriceCategories, IPriceCategory2,
          IUnitTypePaged,
          PriceTiers,
          ProductPrice, ProductPrice2 } from 'src/app/_interfaces/menu/price-categories';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { FbPriceCategoriesService } from 'src/app/_form-builder/fb-price-categories';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { PriceCategoryItemService } from 'src/app/_services/menu/price-category-item.service';
import { PriceCategories } from 'src/app/_interfaces/menu/menu-products';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { PriceTierService } from 'src/app/_services/menu/price-tier.service';
import { PriceTierMethodsService } from 'src/app/_services/menu/price-tier-methods.service';

@Component({
  selector: 'app-price-categories-edit',
  templateUrl: './price-categories-edit.component.html',
  styleUrls: ['./price-categories-edit.component.scss']
})
export class PriceCategoriesEditComponent implements OnInit {

  @Input() priceCategory  : IPriceCategories;
  inputForm               : FormGroup;
  showMore                :  boolean;
  showTime                :  boolean;
  showWeightPrices        :  boolean;
  showConversions         :  boolean;
  showPriceTiers          :  boolean;
  priceTiers$             : Observable<PriceTiers[]>;

  get productPrices() : FormArray {
    return this.inputForm.get('productPrices') as FormArray;
  }

  unitTypes$: Observable<IUnitTypePaged>;
  unitTypes :  IItemBasic[]
  fieldOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', precision: 2 }

  constructor(  private _snackBar   : MatSnackBar,
    private fb                      : FormBuilder,
    private siteService             : SitesService,
    private priceCategoryService    : PriceCategoriesService,
    private priceCategoryItemService: PriceCategoryItemService,
    private fbPriceCategory         : FbPriceCategoriesService,
    private priceTiersService       : PriceTierService,
    private priceTierMethods        : PriceTierMethodsService,
    private dialogRef: MatDialogRef<PriceCategoriesEditComponent>,
    private unitTypeService: UnitTypesService,
    @Inject(MAT_DIALOG_DATA) public data: IPriceCategories
    )
  {
    if (data) {
      this.priceCategory = data;
    }
    const site          = this.siteService.getAssignedSite()

    let unitSearchModel = {} as SearchModel;
    unitSearchModel.pageNumber = 1;
    unitSearchModel.pageSize   = 1000;

    const search$ = this.unitTypeService.getBasicTypes(site, unitSearchModel)
    search$.subscribe(data => {
      this.unitTypes = data.results;
     // console.log('init sizes', data.results)
    })
    this.unitTypes$ = this.unitTypeService.getBasicTypes(site, unitSearchModel);
    this.refreshData_Sub(this.priceCategory);

    this.priceTiers$ = this.priceTiersService.getPriceTiers(site);
  }

  ngOnInit() {
    console.log('')
  };

  async refreshData() {
    const site          = this.siteService.getAssignedSite()
    const item$         = this.priceCategoryService.getPriceCategory(site, this.priceCategory.id);
    const data          = await item$.pipe().toPromise()
    if (data) {
      this.refreshData_Sub(data)
    }
  }

  refreshData_Sub(priceCategory: IPriceCategories) {
    if (priceCategory) {
      this.priceCategory = priceCategory;
      this.inputForm = this.fbPriceCategory.initForm(this.inputForm);
      this.inputForm.patchValue(this.priceCategory)
      if (!priceCategory.productPrices) { return }
      this.addItems(this.inputForm, this.priceCategory.productPrices, 'productPrices')
    }
  }

  openPriceTier(id) {
    this.priceTierMethods.openPriceTier(id)
  }

  toggleShowMore() {
    this.showMore = !this.showMore
  }
  toggleShowTime() {
    this.showTime = !this.showTime
  }
  toggleShowConversion() {
    this.showConversions = !this.showConversions
  }
  toggleWeightPrices() {
    this.showPriceTiers = !this.showPriceTiers
  }

  addPrice() {

    if (!this.priceCategory) {return }

    let pricing          = this.productPrices

    const item           = {} as ProductPrice;
    item.priceCategoryID = this.priceCategory.id;
    item.webEnabled      =  1;
    item.retail          = 0;

    let priceForm            = this.addArray();
    priceForm.patchValue(item);
    pricing.push(priceForm)
    this.priceCategory.productPrices.push(item)

  }

  addItems(inputForm: FormGroup, items: any[], arrayName: string) {
    if (!inputForm) { return }
    if (!items)     { return }
    let pricing = this.productPrices;

    pricing.clear();

    items.forEach( data =>
      {
        let price = this.addArray();
        console.log('price patch', data)
        price.patchValue(data);
        console.log(data)
        pricing.push(price);
      }
    )
  }



  debugitem(item) {
    console.log(item.value)
  }

  saveAllItems() {
    let pricing = this.inputForm.controls['productPrices'] as FormArray;
    if (pricing) {
      const items = this.productPrices.value
      items.forEach(data => {
        this.updateItem(data);
      })
    }
  }

  async updateItem(formArray): Promise<boolean> {

    if (!this.inputForm.valid)    { return  }
    if (!this.inputForm.value.id) {  return }

    try {
      const price2 = formArray as ProductPrice2;
      price2.webEnabled = 1;
      price2.priceCategoryID = this.inputForm.value.id;

      this.updateItemByItem(price2)
    } catch (error) {
      // console.log('error', error)
    }

  };

  updateItemByItem(price: ProductPrice2) {
    if (!price) { return }
    try {
      const site = this.siteService.getAssignedSite()
      return new Promise(resolve => {
        const price$ = this.priceCategoryItemService.save(site, price)
        price$.subscribe( data => {
          this.notifyEvent('Item Updated', 'Success')
          resolve(true)
        }, error => {
          this.notifyEvent(`Update item. ${error}`, "Failure")
          resolve(false)
        })
        }
      )
    } catch (error) {
      console.log('error', error)
    }
  }

  async updateCategory(item): Promise<boolean> {
    let result: boolean;
    if (!this.inputForm.valid) { return }
    const priceCategory = this.inputForm.value;

    if (!priceCategory) {return }

    let  price2 = {} as IPriceCategory2
    price2.id = priceCategory.id
    price2.uid = priceCategory.uid
    price2.name = priceCategory.name

    return new Promise(resolve => {
      const site = this.siteService.getAssignedSite()
      const product$ = this.priceCategoryService.save(site, price2)

      product$.subscribe( data => {
        this.saveAllItems();
        this.notifyEvent('Item Updated', 'Success')
        resolve(true)
        }, error => {
          this.notifyEvent(`Update item. ${error}`, "Failure")
          resolve(false)
        })

      }
    )
  };

  async updateCategoryExit(item) {
    const category  = item.value as PriceCategories
    const result = await this.updateCategory(category)
    if (result) {
      this.onCancel(item);
    }
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteCategory(item) {

    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }

    const site = this.siteService.getAssignedSite()
    if (!this.priceCategory) { return }
      this.priceCategoryService.delete(site, this.priceCategory.id).subscribe( data =>{
        this._snackBar.open("Category deleted", "Success")
        this.onCancel(item)
    })
  }

  deleteItem(item, i) {

    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    item = item.value;

    if (!item.id) {
      this.removeItem(i)
      return
    }

    console.log(item)
    const productPrice  = item as ProductPrice
    const site = this.siteService.getAssignedSite()
    if (!productPrice) { return }
      this.priceCategoryItemService.delete(site, productPrice.id).subscribe( data =>{
        this.removeItem(i)
        this.notifyEvent("Item deleted", "Success")
      }
    )

  }

  removeItem(i) {
    let pricing = this.inputForm.controls['productPrices'] as FormArray;
    pricing.removeAt(i)
  }

  copyItem(event) {
    //do confirm of delete some how.
    //then
  }

  addArray() {
      return this.fb.group({
        id:               [''],
        priceCategoryID:  [''],
        retail:           [''],
        wholeSale:        [''],
        unitTypeID:       [''],
        hideFromMenu:     [''],
        useforInventory:  [''],
        pizzaMultiplier:  [''],
        unitPartRatio:    [''],
        partMultiplyer:   [''],
        doNotDelete:      [''],
        pizzaSize:        [''],
        priceType:        [''],
        barcode:          [''],
        itemQuantity:     [''],
        productID:        [''],
        tierPriceGroup:   [''],
        price1:           [''],
        price2:           [''],
        price3:           [''],
        price4:           [''],
        price5:           [''],
        price6:           [''],
        price7:           [''],
        price8:           [''],
        price9:           [''],
        price10:          [''],
        timeBasedPrice:   [''],
        uid:              [''],
        weekDays:         [''],
        endTime:          [''],
        startTime:        [''],
        webEnabled:       [''],
        specialDatePrice: [''],
        startDate:        [''],
        endDate:          [''],
        gramPrice:        0,
        eightPrice:       0,
        halfPrice:        0,
        quarterPrice:     0,
        ouncePrice:       0,
      }
    )

  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

// initPrice() {

//   return {
//        id:  0,
//        priceCategoryID:  0,
//        retail:           0,
//        wholeSale:        0,
//        unitTypeID:       0,
//        hideFromMenu:     0,
//        useforInventory:  0,
//        pizzaMultiplier:  0,
//        unitPartRatio:    0,
//        partMultiplyer:   0,
//        doNotDelete:      0,
//        pizzaSize:        0,
//        priceType:        0,
//        barcode:          0,
//        itemQuantity:     0,
//        productID:        0,
//        tierPriceGroup:   0,
//        price1:           0,
//        price2:           0,
//        price3:           0,
//        price4:           0,
//        price5:           0,
//        price6:           0,
//        price7:           0,
//        price8:           0,
//        price9:           0,
//        price10:          0,
//        timeBasedPrice:   0,
//        uid:              0,
//        weekDays:         '',
//        endTime:          '',
//        startTime:        '',
//        webEnabled:       true,
//        specialDatePrice: 0,
//        startDate:        '',
//        endDate:          '',
//        gramPrice:  0,
//        eightPrice: 0,
//        halfPrice:  0,
//        quarterPrice: 0,
//        ouncePrice: 0,
//      }

//  }

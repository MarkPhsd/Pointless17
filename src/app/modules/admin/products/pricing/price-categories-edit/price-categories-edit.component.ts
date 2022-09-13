import { Component,  Inject,  Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, switchMap,  } from 'rxjs';
import { IItemBasic } from 'src/app/_services';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PriceCategories, IPriceCategory2,
          IUnitTypePaged,
          PriceTiers,
          ProductPrice, ProductPrice2, UnitType } from 'src/app/_interfaces/menu/price-categories';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { FbPriceCategoriesService } from 'src/app/_form-builder/fb-price-categories';
import { UnitTypesService } from 'src/app/_services/menu/unit-types.service';
import { PriceCategoryItemService } from 'src/app/_services/menu/price-category-item.service';
import { SearchModel } from 'src/app/_services/system/paging.service';
import { PriceTierService } from 'src/app/_services/menu/price-tier.service';
import { PriceTierMethodsService } from 'src/app/_services/menu/price-tier-methods.service';
import { TransactionUISettings,UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-price-categories-edit',
  templateUrl: './price-categories-edit.component.html',
  styleUrls: ['./price-categories-edit.component.scss']
})
export class PriceCategoriesEditComponent implements OnInit {

  @Input() priceCategory  :  PriceCategories;
  inputForm               :  FormGroup;
  showMore                :  boolean;
  showTime                :  boolean;
  showWeightPrices        :  boolean;
  showConversions         :  boolean;
  showPriceTiers          :  boolean;
  toggleSearchSize        = [] as  boolean[];
  saving                  : boolean;

  get productPrices() : FormArray {
    return this.inputForm.get('productPrices') as FormArray;
  }

  priceCategory$          : Observable<any>;

  priceTiers$             : Observable<PriceTiers[]>;
  priceTiers              : PriceTiers[];
  unitTypeList            : UnitType[];
  unitTypes$              : Observable<IUnitTypePaged>;
  unitTypes               :  IItemBasic[]
  fieldOptions = { prefix: 'R$ ', thousands: '.', decimal: ',', precision: 2 }

  uiTransactions = {} as TransactionUISettings;

  recOption = this.uiSettingsService.pricingRecMed;

  constructor(  private _snackBar   : MatSnackBar,
    private fb                      : FormBuilder,
    private siteService             : SitesService,
    private priceCategoryService    : PriceCategoriesService,
    private priceCategoryItemService: PriceCategoryItemService,
    private fbPriceCategory         : FbPriceCategoriesService,
    private priceTiersService       : PriceTierService,
    private priceTierMethods        : PriceTierMethodsService,
    private uiSettingsService       : UISettingsService,
    private dialogRef               : MatDialogRef<PriceCategoriesEditComponent>,
    private unitTypeService: UnitTypesService,
    @Inject(MAT_DIALOG_DATA) public data: PriceCategories
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

    this.unitTypes$.subscribe (data => {
      this.unitTypeList = data.results;
    })

    this.refreshData_Sub(this.priceCategory);

    this.priceTiers$ = this.priceTiersService.getPriceTiers(site);
    this.priceTiers$.subscribe(data => {
      this.priceTiers = data;
    })

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

  refreshData_Sub(priceCategory: PriceCategories) {
    if (priceCategory) {
      this.priceCategory = priceCategory;
      this.inputForm = this.fbPriceCategory.initForm(this.inputForm);
      this.inputForm.patchValue(this.priceCategory)
      if (!priceCategory.productPrices) { return }
      this.addItems(this.inputForm, this.priceCategory.productPrices, 'productPrices')
    }
  }

  selectRecMedOption(event) {
    if (!event) { return }
    const id = event.id
    console.log(event)
    this.inputForm.patchValue(this.priceCategory)
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
    item.webEnabled      = 1;
    item.retail          = 0;

    let priceForm        =  this.fbPriceCategory.addPriceArray()
    try {
      if (priceForm) {
        priceForm.patchValue(item);
        pricing.push(priceForm);
        if (!this.priceCategory.productPrices) { this.priceCategory.productPrices = [] as ProductPrice[] }
        this.priceCategory.productPrices.push(item)
      }
    } catch (error) {
      console.log('error', error)
    }

  }

  addItems(inputForm: FormGroup, items: any[], arrayName: string) {
    if (!inputForm) { return }
    if (!items)     { return }
    let pricing = this.productPrices;
    pricing.clear();
    items.forEach( data =>
      {
        let price = this.addArray();
        price.patchValue(data);
        // if (this.toggleSearchSize) { this.toggleSearchSize.push(false)  }
        pricing.push(price);
      }
    )
  }


  async updateItem(formArray): Promise<boolean> {
    if (!this.inputForm.valid)    { return  }
    if (!this.inputForm.value.id) {  return }
    try {
      const price2 = formArray as ProductPrice2;
      price2.webEnabled = 1;
      price2.priceCategoryID = this.inputForm.value.id;
      this.saving = true;
      this.updateItemByItem(price2)
    } catch (error) {
      console.log('error', error)
    }

  };

  updateItemByItem(price: ProductPrice2) {
    if (!price) { return }
      const site = this.siteService.getAssignedSite()
      return new Promise(resolve => {
        const price$ = this.priceCategoryItemService.save(site, price)
        price$.subscribe( {
          next: data => {
              resolve(true)
            },
          error: error => {
              this.notifyEvent(`Update item. ${error}`, "Failure")
              resolve(false)
            }
          }
        )
    })
  }

  searchSize(i: number) {

    if (i > this.toggleSearchSize.length) {
      this.toggleSearchSize = [] as boolean[]
      this.priceCategory.productPrices.forEach( i => {
        this.toggleSearchSize.push(false)
      })
    }
    this.toggleSearchSize[i] = !this.toggleSearchSize[i];
  }

  updateCategory(item): Observable<any> {

    console.log('item form valid', this.inputForm.valid, item)
    if (!this.inputForm.valid) { return }
    const priceCategory = this.inputForm.value;

    if (!priceCategory) {return }
    this.saving = true;

    let  price2 = {} as IPriceCategory2
    price2.id = priceCategory.id
    price2.uid = priceCategory.uid
    price2.name = priceCategory.name
    const site = this.siteService.getAssignedSite()
    const result$ = this.priceCategoryService.save(site, price2)
    console.log('check result');

    const items$ = result$.pipe(
      switchMap( data => {
        console.log('result data', data)
        this.priceCategory = data;
        return this.saveAllItems()
      })).pipe(
        switchMap(data => {
          console.log('saved price category', data)
          this.saving = false
          return of('complete')
        }
      )
    );

    this.priceCategory$ = items$
    // this.priceCategory$.subscribe(data => {
    //   console.log(data)
    // })

    // this.saveAllItems().subscribe(data => {
    //   console.log('save items')
    // })
  };


  saveAllItems(): Observable<ProductPrice2> {
    let pricing = this.inputForm.controls['productPrices'] as FormArray;
    console.log('saving items', pricing.value)
    if (pricing) {
      const site  = this.siteService.getAssignedSite();
      const items =  pricing.value  as ProductPrice[];
      console.log('saving', items)
      return this.priceCategoryItemService.savePriceList(site, items)
    }
  }

  // updateCategoryAll(item){
  //   const category  = item.value as PriceCategories;

  //   this.priceCategory$ =  this.updateCategory(category)
  //   result$.pipe(
  //     switchMap( data => {
  //       return this.saveAllItems()
  //     }))

  //   this.priceCategory$ = result$
  // }

  async updateCategoryExit(item) {
    const category  = item.value as PriceCategories;
    this.updateCategory(category).subscribe( {
      next: data => {
        this.notifyEvent('Items saved', 'Success')
        this.onCancel(null)},
      error: err => {
        console.log('error', err)
        this.notifyEvent('Items not saved ' + err, 'Failure')
      }
    });

  }

  onCancel(event) {
    this.dialogRef.close();
  }

  deleteCategory(item) {

    // const result = window.confirm('Are you sure you want to delete this item?')
    // if (!result) { return }

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
      this.toggleSearchSize.splice(i)
      return
    }

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
    return  this.fbPriceCategory.addPriceArray()
  }

  assignItem(data) {
    if (data) {
      const unitTypeID = data.unitTypeID
      const index      = data.index;
      const unitName   = data.unitName
      const unitType   = data.unitType;
      console.log(data)
      if (data) {
        let pricing = this.inputForm.controls['productPrices'] as FormArray;
        // console.log('this.priceCategory.productPrices', this.priceCategory.productPrices)
        if (this.priceCategory.productPrices.length>=index) {
          this.priceCategory.productPrices[index].unitType   = unitType;
          this.priceCategory.productPrices[index].unitTypeID = unitTypeID;
        }

        if (pricing && pricing.length>=index) {
          // console.log('pricing patchvalue', pricing.at(index).value)
          pricing.at(index).patchValue({unitTypeID: unitTypeID})
          // console.log('pricing patchvalue', pricing.at(index).value)

        }
        this.toggleSearchSize[index] = !this.toggleSearchSize[index]
      }
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}


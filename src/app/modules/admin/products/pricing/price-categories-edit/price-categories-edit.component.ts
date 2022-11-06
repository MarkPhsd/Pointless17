import { Component,  Inject,  Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, switchMap,  } from 'rxjs';
import { IItemBasic } from 'src/app/_services';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
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
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';

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
  toggle                  : any;

  get productPrices() : FormArray {
    return this.inputForm.get('productPrices') as FormArray;
  }
  itemAction$            : Observable<any>;
  priceCategory$          : Observable<any>;
  actionMessage           : string;
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
    private productEditButtonService  : ProductEditButtonService,
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
    item.unitType        = {} as UnitType;
    let priceForm        =  this.fbPriceCategory.addPriceArray()

    if (priceForm) {
      priceForm.patchValue(item);
      pricing.push(priceForm);
      if (!this.priceCategory.productPrices) { this.priceCategory.productPrices = [] as ProductPrice[] }
      this.priceCategory.productPrices.push(item)
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
    this.toggle = i
    this.toggleSearchSize[i] = !this.toggleSearchSize[i];
  }

  updateCategory(item): Observable<any> {

    if (!this.inputForm.valid) { return }
    const priceCategory = this.inputForm.value;
    this.updatePriceCategory(priceCategory)

  };

  updatePriceCategory(priceCategory: PriceCategories) {

    if (!priceCategory) {return }
    this.saving = true;

    let  price2 = {} as IPriceCategory2
    price2.id = priceCategory.id
    price2.uid = priceCategory.uid
    price2.name = priceCategory.name
    const site = this.siteService.getAssignedSite()
    const result$ = this.priceCategoryService.save(site, price2)

    const items$ = result$.pipe(
      switchMap( data => {
        this.priceCategory = data;
        return this.saveAllItems()
      })).pipe(
        switchMap(data => {
          this.refreshData_Sub(this.priceCategory);
          this.saving = false
          const priceCategory$ = this.priceCategoryService.getPriceCategory(site,this.priceCategory.id)
          return priceCategory$
        }
      )).pipe(
        switchMap( data => {
          this.priceCategory = data;
          this.refreshData_Sub(data)
          return of(data)
        })
      )
    ;

    this.itemAction$ = items$
  }

  saveAllItems(): Observable<ProductPrice2> {
    let pricing = this.inputForm.controls['productPrices'] as FormArray;
    if (pricing) {
      const site  = this.siteService.getAssignedSite();
      const items =  pricing.value  as ProductPrice[];
      return this.priceCategoryItemService.savePriceList(site, items)
    }
  }

  openAddSize() {
    this.productEditButtonService.openUnitTypeEditor(null)
  }

  updateCategoryExit(item) {
    const category  = item.value as PriceCategories;
    this.itemAction$ = this.updateCategory(category).pipe(
      switchMap( data => {
          this.notifyEvent('Items saved', 'Success')
          this.onCancel(null)
          return of(data)
        }
      )
    );
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
      this.actionMessage = 'Deleted'
      return
    }

    const productPrice  = item as ProductPrice
    const site = this.siteService.getAssignedSite()
    if (!productPrice) { return }
      this.actionMessage = 'Deleting'
      this.itemAction$ = this.priceCategoryItemService.delete(site, productPrice.id).pipe(
        switchMap( data =>{
          this.priceCategory.productPrices.splice(i, 1)
          this.removeItem(i)
          this.actionMessage = 'Deleted'
          this.notifyEvent("Item deleted", "Success")
          return of(data)
      }
    ))
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
      let index      = data.index;
      const unitName   = data.unitName
      const unitType   = data.unitType;

      if (data) {
        let pricing = this.inputForm.controls['productPrices'] as FormArray;

        // console.log('pricing gotten', pricing)
        let lines = pricing.value;
        let line =  pricing.value[index] as ProductPrice;

        index = index -1;

        if (!line) {
          if(pricing.length >= (index)) {
            let priceForm        =  this.fbPriceCategory.addPriceArray()
            pricing.at(index).patchValue(priceForm)
            line = pricing.controls[index].value;
          }
        }

        line.unitType        = {} as UnitType;
        line.unitType        = unitType;
        line.unitTypeID      = unitType.id;
        line.partMultiplyer  = unitType.itemMultiplier;

        if (this.priceCategory.productPrices.length >= index) {
          let newIndex = index
          if (!this.priceCategory.productPrices[index]) {
            newIndex =  this.priceCategory.productPrices.push(line)
          }
          if (unitType) {
            this.priceCategory.productPrices[newIndex + 1].unitType   = unitType;
            this.priceCategory.productPrices[newIndex + 1].unitTypeID = unitTypeID;
            // this.toggleSearchSize[newIndex + 1] = !this.toggleSearchSize[index];

          }
        }
        this.toggleSearchSize[this.toggle] = !this.toggleSearchSize[this.toggle];
        this.itemAction$ = this.updateCategory(this.priceCategory);

        return;
        if (pricing && pricing.length>=index) {
          pricing.at(index).patchValue(line)
          pricing.at(index).patchValue({unitTypeID: unitTypeID})
        }

          this.toggleSearchSize[index] = !this.toggleSearchSize[index]
      }
    }
  }


  // assignItem(data) {

  //   console.log('data', data)
  //   if (data) {
  //     const unitTypeID = data.unitTypeID
  //     let index        = data.index;
  //     const unitName   = data.unitName
  //     const unitType   = data.unitType as UnitType;

  //     if (data) {
  //       let pricing = this.inputForm.controls['productPrices'] as FormArray;
  //       index = index - 1

  //       console.log('current line',  pricing.value[index])
  //       let lines = pricing.value;
  //       let line =  pricing.value[index] as ProductPrice;

  //       if (!line.unitType ||
  //         line.unitType == undefined) {
  //         line.unitType        = {} as UnitType;
  //         line.unitType        = unitType;
  //         line.unitTypeID      = unitType.id;
  //         line.partMultiplyer  = unitType.itemMultiplier;
  //       }

  //       pricing.at(index).patchValue(line);
  //       pricing.at(index).patchValue({unitTypeID: unitTypeID});
  //       this.inputForm.controls['productPrices'] = pricing;

  //       if (this.priceCategory.productPrices) {
  //         if (this.priceCategory.productPrices[index]){
  //           this.priceCategory.productPrices[index].unitType = unitTypeID;
  //         }
  //       }

  //       this.toggleSearchSize[index] = !this.toggleSearchSize[index]
  //     }
  //   }
  // }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}


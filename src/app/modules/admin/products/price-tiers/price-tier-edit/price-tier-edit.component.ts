import { isNull } from '@angular/compiler/src/output/output_ast';
import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { merge, Observable, of, Subject } from 'rxjs';
import { map, takeUntil } from 'rxjs/operators';
import { FbPriceTierService } from 'src/app/_form-builder/fb-price-tier';
import { PriceTierPrice,PriceTiers } from 'src/app/_interfaces/menu/price-categories';
import { PriceTierMethodsService, WeightProfile } from 'src/app/_services/menu/price-tier-methods.service';
import { PriceTierPriceService } from 'src/app/_services/menu/price-tier-price.service';
import { PriceTierService } from 'src/app/_services/menu/price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-price-tier-edit',
  templateUrl: './price-tier-edit.component.html',
  styleUrls: ['./price-tier-edit.component.scss']
})
export class PriceTierEditComponent implements OnInit {

  weightProfile$          : Observable<WeightProfile[]>;
  weightSelectForm        : FormGroup;
  inputForm               : FormGroup;
  priceTier               : PriceTiers;
  priceTierPrice          : PriceTierPrice;
  weightProfile           : WeightProfile[];

  showMorePrices    : boolean;
  showWeightPrices  : boolean;
  showConversions   : boolean;
  showTime          : boolean;

  endPriceValue        = [] as number[];
  endPriceHappyHour    = [] as number[];

  // get endPrice() {return this.inputForm.get("retail") as FormControl;}
  // get retail()   { return this.inputForm.get("name")   as FormControl;}
  // get quantity() { return this.inputForm.get("flatQuantity") as FormControl;}

  get priceTierPrices() : FormArray {
    return this.inputForm.get('priceTierPrices') as FormArray;
  }

  changesUnsubscribe = new Subject();

  // tslint:disable-next-line: typedef
  priceTierPricesChanges() {
    // cleanup any prior subscriptions before re-establishing new ones
    this.changesUnsubscribe.next(null);

    merge(...this.priceTierPrices.controls.map((control: AbstractControl, index: number) =>
              control.valueChanges.pipe(
                  takeUntil(this.changesUnsubscribe),
                  map(value => ({ rowIndex: index, control: control, data: value })))
      )).subscribe(changes => {
          this.onValueChanged(changes);
      });
  }

  onValueChanged(changes) {
    this.priceTierPrice = changes.data;
    this.refreshEndPrice(changes.data, changes.rowIndex, this.endPriceValue)
    this.updatePrice(changes.data)
  }

  constructor(  private _snackBar   : MatSnackBar,
    private fb                      : FormBuilder,
    private siteService             : SitesService,
    private fbPriceTierService      : FbPriceTierService,
    private dialogRef               : MatDialogRef<PriceTierEditComponent>,
    private priceTierService        : PriceTierService,
    private priceTierPriceService   : PriceTierPriceService,
    private priceTierMethods        : PriceTierMethodsService,
    @Inject(MAT_DIALOG_DATA) public data: PriceTiers
    )
  {

    if (data) {
      this.priceTier = data
      this.priceTier.priceTierPrices = this.priceTierMethods.sortPriceTiers(this.priceTier.priceTierPrices)
    }

  }

  refreshEndPrice(priceTierPrice: PriceTierPrice, i: number, priceArray: number[]) : number[] {
    if (!priceArray || !priceTierPrice) {return }
    const price = this.getEndPrice(priceTierPrice,i, priceArray)
    const specialPrice = this.getHHEndPrice(priceTierPrice,i, priceArray)
    this.endPriceHappyHour[i] = specialPrice

    this.initEndPriceValues()
    if (priceArray.length>=i) {
      priceArray[i] = price
    } else {
      priceArray.push(price)
    }
    return priceArray;
  }


  initWeigthSelectform() {
    this.weightSelectForm = this.fb.group({
      weightProfile: []
    })

    this.weightSelectForm.valueChanges.subscribe( data=> {
      const profile =  data as WeightProfile
    })
  }

  initInputFormSubscription() {
    this.inputForm.valueChanges.subscribe( data=> {
      // const profile =  data as WeightProfile
    })
  }
  //assign value of weight list to observable for selector.
  initWeightProfileObjservable() {
    const profile = this.priceTierMethods.getWeightProfile()
    this.weightProfile$ = of(profile)
  }

  ngOnInit(): void {

    this.initWeightProfileObjservable();
    this.initWeigthSelectform();
    this.refreshData();
    this.initInputFormSubscription();
    this.priceTierPricesChanges();
    this.initEndPriceValues()
  }

  initEndPriceValues() {
    let i = 0
    let priceArray = [] as number[]
    this.priceTier.priceTierPrices.forEach(data => {
      this.endPriceValue.push(this.getEndPrice(data, i, priceArray ))
      this.endPriceHappyHour.push(this.getHHEndPrice(data, i, priceArray ))
      i += 1
    })
  }

  async refreshData() {
    this.inputForm = this.fbPriceTierService.initForm(this.inputForm);
    if (!this.priceTier) this.priceTier = {} as PriceTiers;
    if (!this.priceTier || !this.priceTier.id) { return }
    const site          = this.siteService.getAssignedSite()
    this.refreshData_Sub(this.priceTier);
  }

  refreshData_Sub(priceTier: PriceTiers) {
    if (priceTier) {
      this.priceTier = priceTier;
      this.inputForm.patchValue(this.priceTier)
      if (!priceTier.priceTierPrices) { return }
      this.addItems(this.inputForm, priceTier.priceTierPrices, 'priceTierPrices')
    }
  }

  //this should be moved to service.
  addItems(inputForm: FormGroup, items: any[], arrayName: string) {
    if (!inputForm) { return }
    if (!items)     { return }
    let pricing = this.priceTierPrices;
    pricing.clear();
    items.forEach( data =>
      {
        let price = this.priceTierMethods.addArrayForm();
        price.patchValue(data);
        pricing.push(price);
      }
    )
  }

  addPriceLine() {
    this.addPrice(null)
  }

  addPrice(price: PriceTierPrice) {
    let pricesArray = this.inputForm.controls['priceTierPrices'] as FormArray;
    let pricing = this.priceTier.priceTierPrices;

    if (!price) {
      price =  {} as PriceTierPrice;
      price.productPriceID = this.priceTier.id;
    }

    let priceForm = this.priceTierMethods.addArrayForm();
    priceForm.patchValue(price)
    pricing.push(price)
    pricesArray.push(priceForm)
  }

  addPricesWithWeightProfiles(): PriceTiers {
    let pricesArray = this.inputForm.controls['priceTierPrices'] as FormArray;
    this.priceTier  =   this.priceTierMethods.addPricesWithWeightProfiles
                        (this.priceTier,pricesArray)
    return this.priceTier;
  }

  updateItemPrice(item, i){
    const price = item.value as PriceTierPrice;
    this.updatePrice(price)
  }

  updatePrice(price: PriceTierPrice) {

  }

  async updatePriceTierExit(item) {
    const priceTier  = item.value as PriceTiers
    const result = await this.updatePriceTier(priceTier)
    if (result) {
      this.onCancel(item);
    }
  }

  getBasicTierFromForm(): PriceTiers {
    if (!this.inputForm.valid) { return }
    const priceTier = this.inputForm.value as PriceTiers;
    const price_Temp  = {} as PriceTiers;
    price_Temp.id = priceTier.id;
    price_Temp.name = priceTier.name;
    if (!priceTier.webEnabled) { price_Temp.webEnabled = 0}
    if (priceTier.webEnabled) { price_Temp.webEnabled = -1}
    price_Temp.uid = priceTier.uid;
    return price_Temp;
  }

  async updatePriceTier(item): Promise<boolean> {
    if (!this.inputForm.valid) { return }
    const priceTier = this.getBasicTierFromForm();
    if (!priceTier) {
      this.notifyEvent('price tier is not valid', 'failed')
      return
    }
    this.saveAllItems();
    return new Promise(resolve => {
      const site = this.siteService.getAssignedSite()
      const priceTier$ = this.priceTierService.savePriceTier(site, priceTier)
      priceTier$.subscribe( data => {
        this.notifyEvent('Item Updated', 'Success')
        this.priceTier = data;
        this.refreshData()
        resolve(true)
        }, error => {
          this.notifyEvent(`Update item. ${error}`, "Failure")
          resolve(false)
        })
      }
    )

  };

  saveAllItems() {
    this.priceTierMethods.saveAllPrices(this.inputForm.value)
  }

  deleteTier(item) {
    const result = window.confirm('Are you sure you want to delete this Price Tier?')
    if (!result) { return }
    const id = this.priceTier.id
    const site = this.siteService.getAssignedSite()
    if (!item) { return }
      this.priceTierService.deletePriceTier(site, id).subscribe( data =>{
        console.log(data)
        this._snackBar.open("Tier deleted", "Success")
        this.onCancel(null)
      }, err => {
        console.log(err)
        console.log(err)
        this._snackBar.open("Tier deleted", "Success")
        this.onCancel(null)
      }
    )
  }

  setWeightProfile(profile, index) {
    const price = this.getPriceWithProfile(profile, index)
    this.setItemvalue(price , index)
  }

  getPriceWithProfile(profile,index: number):PriceTierPrice {
    const prof           = profile as WeightProfile
    const arrayControl   = this.inputForm.controls['priceTierPrices'] as FormArray;
    const item           = arrayControl.at(index);
    let price            = item.value as PriceTierPrice
    price                = this.priceTierMethods.setPriceWeightProfile(this.priceTier, price, prof)
    return price
  }

  setItemvalue(item, i) {
    if (item) {
      let prices = this.inputForm.controls['priceTierPrices'] as FormArray;
      prices.at(i).patchValue(item)
    }
  }

  getItem(item, i) {
    console.log(item, i)
  }

  deletePrice(item, i) {
    try {
      const result = window.confirm('Are you sure you want to delete this price?')
      if (!result) { return }
      const price  = item.value as PriceTierPrice
      try {
        if (!price.id) {
          this.removeItem(i)
          return
        }
      } catch (error) {
        console.log('error ', error)
      }
      const site = this.siteService.getAssignedSite()
      if (!price) { return }
        this.priceTierPriceService.deletePrice(site, price.id).subscribe( data =>{
          this.removeItem(i)
        }
      )
    } catch (error) {
      console.log('error ', error)
    }
  }


  // const endPrice  = this.endPriceValue[i]
  getEndPrice(priceTierPrice: PriceTierPrice, i: number, priceArray: number[]): number {
    if (!priceArray || !priceTierPrice) {return }
    const quantity  = priceTierPrice.flatQuantity;
    const rate      = priceTierPrice.retail;
    return          this.getEndPriceFromRateQuantity(quantity, rate);
  }

  getHHEndPrice(priceTierPrice: PriceTierPrice, i: number, priceArray: number[]): number {
    if (!priceArray || !priceTierPrice) {return }
    const quantity  = priceTierPrice.flatQuantity;
    const rate      = priceTierPrice.specialPrice;
    return          this.getEndPriceFromRateQuantity(quantity, rate);
  }

  getPriceFromRateQuantity() {
    let i = 0;
  }

  // const retail          = priceTierPrice.retail;
  refreshPrice(priceTierPriceControl: FormGroup, i : number) {
    const priceTierPrice        = priceTierPriceControl.value as PriceTierPrice;
    const quantity              = priceTierPrice.flatQuantity;
    const endPrice              = this.endPriceValue[i];
    const hhendPrice            = this.endPriceHappyHour[i];

    //get the prices from their end price when the end price is changed.
    priceTierPrice.retail       = this.getRateFromEndPriceQuantity(quantity, endPrice)
    priceTierPrice.specialPrice = this.getRateFromEndPriceQuantity(quantity, hhendPrice)
    priceTierPriceControl.patchValue(priceTierPrice)
  }

  getRateFromEndPriceQuantity(quantity: number, endPrice: number): number {
    let rate = 0;
    if ((quantity && quantity !=0) && endPrice) {
      const rate = endPrice / quantity
      return rate
    }
    return rate
  }

  getEndPriceFromRateQuantity(quantity: number, rate: number) : number {
    if ((quantity && quantity !=0)  && rate) {
      const value =  quantity * rate
      return  quantity * rate
    }
    return 0
  }


  removeItem(i) {
    const site  = this.siteService.getAssignedSite();
    if (this.priceTierPrices.length >= i) {
      try {
        this.priceTierPrices.removeAt(i)
      } catch (error) {
        console.log('remove item', error)
      }
    }
  }

  copyItem(event) {
    //do confirm of delete some how.
    //then
  }

  toggleShowMore() {
    this.showMorePrices = !this.showMorePrices
  }
  toggleShowTime() {
    this.showTime = !this.showTime
  }
  toggleShowConversion() {
    this.showConversions = !this.showConversions
  }
  toggleWeightPrices() {
    console.log('toggleWeightPrices')
    this.showWeightPrices = !this.showWeightPrices
  }

  onCancel(event) {
    this.dialogRef.close();
  }

  notifyEvent(message: string, action: string) {
    this.priceTierMethods.notifyEvent(message, action)
  }
}

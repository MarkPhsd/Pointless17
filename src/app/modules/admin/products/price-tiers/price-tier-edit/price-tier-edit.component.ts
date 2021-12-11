import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup } from '@angular/forms';
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

  get priceTierPrices() : FormArray {
    return this.inputForm.get('priceTierPrices') as FormArray;
  }

  changesUnsubscribe = new Subject();

  priceTierPricesChanges() {
    // cleanup any prior subscriptions before re-establishing new ones
    this.changesUnsubscribe.next();

    merge(...this.priceTierPrices.controls.map((control: AbstractControl, index: number) =>
              control.valueChanges.pipe(
                  takeUntil(this.changesUnsubscribe),
                  map(value => ({ rowIndex: index, control: control, data: value })))
      )).subscribe(changes => {
          this.onValueChanged(changes);
      });
  }
  onValueChanged(changes) {
    console.log('on value changed')
    this.updatePrice(changes.data)
    // console.log(changes)
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
      this.priceTier.priceTierPrices =this.priceTier.priceTierPrices.sort((a , b) => (+a.flatQuantity > +b.flatQuantity) ? 1: -1)
      console.log(this.priceTier.priceTierPrices)
    }

    this.initWeightProfileObjservable();
    this.initWeigthSelectform();
    this.refreshData();
    this.initInputFormSubscription();
    this.priceTierPricesChanges();
  }

  initWeigthSelectform() {
    this.weightSelectForm = this.fb.group({
      weightProfile: []
    })

    this.weightSelectForm.valueChanges.subscribe( data=> {
      const profile =  data as WeightProfile
      console.log('data', data)
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
    console.log('')
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

  async updatePriceTier(item): Promise<boolean> {
    let result: boolean;
    if (!this.inputForm.valid) { return }
    const priceTierValue = this.inputForm.value;

    if (!priceTierValue) {return }

    let  priceTier = {} as PriceTiers
    priceTier.id = priceTierValue.id
    priceTier.uid = priceTierValue.uid
    priceTier.name = priceTierValue.name

    this.saveAllItems();

    return new Promise(resolve => {
      const site = this.siteService.getAssignedSite()
      const product$ = this.priceTierService.savePriceTier(site, priceTier)
      product$.subscribe( data => {
        this.notifyEvent('Item Updated', 'Success')
        resolve(true)
        }, error => {
          this.notifyEvent(`Update item. ${error}`, "Failure")
          resolve(false)
        })
      }
    )

  };

  saveAllItems() {
    // let pricesArray = this.inputForm.controls['priceTierPrices'] as FormArray;
    // let prices = pricesArray.value as PriceTierPrice[]
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
  }

  removeItem(i) {
    const site  = this.siteService.getAssignedSite();
    if (this.priceTierPrices.length >= i) {
      const item  = this.priceTierPrices.get(i) //.value as PriceTierPrice
      const price = item.value as PriceTierPrice
      console.log('i remove item', i)
      this.priceTierPrices.removeAt(i)
      return price
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

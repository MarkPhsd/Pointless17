import { Component, Inject, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, of, Subscription } from 'rxjs';
import { FbPriceTierService } from 'src/app/_form-builder/fb-price-tier';
import { PriceTierPrice,PriceTiers } from 'src/app/_interfaces/menu/price-categories';
import { PriceTierPriceService } from 'src/app/_services/menu/price-tier-price.service';
import { PriceTierService } from 'src/app/_services/menu/price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
export interface WeightProfile {
  name: string;
  from: number;
  to:   number;
  weight: number
}
@Component({
  selector: 'app-price-tier-edit',
  templateUrl: './price-tier-edit.component.html',
  styleUrls: ['./price-tier-edit.component.scss']
})
export class PriceTierEditComponent implements OnInit {

  weightProfile$ : Observable<WeightProfile[]>;
  weightProfile = [
    {name: 'Gram', from: 1,to: 3.49,weight: 1},
    {name: 'Eight', from: 3.5, to: 6.99, weight: 3.5},
    {name: 'Quarter', from: 7,to: 13.99,weight: 7},
    {name: 'Half', from: 14,to: 27.99, weight: 14},
    {name: 'Ounce', from: 28,to: 28.2,weight: 28},
  ] as WeightProfile[]

  weightSelectForm              : FormGroup;
  inputForm               : FormGroup;
  priceTier               : PriceTiers;
  priceTierPrice          : PriceTierPrice;

  showMorePrices: boolean;
  showWeightPrices: boolean;
  showConversions: boolean;
  showTime: boolean;

  get priceTierPrices() : FormArray {
    return this.inputForm.get('priceTierPrices') as FormArray;
  }

  constructor(  private _snackBar   : MatSnackBar,
    private fb                      : FormBuilder,
    private siteService             : SitesService,
    private fbPriceTierService         : FbPriceTierService,
    private dialogRef               : MatDialogRef<PriceTierEditComponent>,
    private priceTierService        : PriceTierService,
    private priceTierPriceService   : PriceTierPriceService,
    @Inject(MAT_DIALOG_DATA) public data: PriceTiers
    )
  {

    if (data) {
      this.priceTier = data
    }

    this.initWeightProfileObjservable();
    this.initWeigthSelectform();
    this.refreshData()
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

  //assign value of weight list to observable for selector.
  initWeightProfileObjservable() {
    this.weightProfile$ = of(this.weightProfile)
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
    console.log(this.priceTier)
    // const item$         = this.priceTierService.getPriceTier(site, this.priceTier.id);
    // item$.subscribe(data => {
    //   if (data) {
    //     this.refreshData_Sub(data)
    //   }
    // })
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
        let price = this.priceTierPriceService.addArrayForm();
        price.patchValue(data);
        pricing.push(price);
      }
    )
  }

  addPrice(event) {
    let pricing = this.priceTier.priceTierPrices;
    const item =  {} as PriceTierPrice;
    item.productPriceID = this.priceTier.id;
    item.retail = (0).toString();
    let price = this.priceTierPriceService.addArrayForm();
    pricing.push(price.value)
  }


  saveAllItems() {
    let pricing = this.inputForm.controls['productPrices'] as FormArray;
    if (pricing) {
      const items = this.priceTierPrices.value
      items.forEach(data => {
        this.updateItem(data);
      })
    }
  }

  async updateItem(formArray): Promise<boolean> {
    if (!this.inputForm.valid)    { return  }
    if (!this.inputForm.value.id) {  return }
    try {
      const price = formArray as PriceTierPrice;
      // price.webEnabled = 1;
      price.id = this.inputForm.value.id;
      console.log('price', price)
      this.updateItemByItem(price)
    } catch (error) {
      // console.log('error', error)
    }
    return false
  };

  async updatePriceTierExit(item) {
    const priceTier  = item.value as PriceTiers
    const result = await this.updatePriceTier(priceTier)
    if (result) {
      this.onCancel(item);
    }
  }

  updateItemByItem(price: PriceTierPrice) {
    if (!price) { return }
    try {
      const site = this.siteService.getAssignedSite()
      return new Promise(resolve => {
        const price$ = this.priceTierPriceService.save(site, price)
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

  async updatePriceTier(item): Promise<boolean> {
    let result: boolean;
    if (!this.inputForm.valid) { return }
    const priceTierValue = this.inputForm.value;

    if (!priceTierValue) {return }

    let  priceTier = {} as PriceTiers
    priceTier.id = priceTierValue.id
    priceTier.uid = priceTierValue.uid
    priceTier.name = priceTierValue.name

    return new Promise(resolve => {
      const site = this.siteService.getAssignedSite()
      const product$ = this.priceTierService.savePriceTier(site, priceTier)

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

  deleteTier(item) {
    const result = window.confirm('Are you sure you want to delete this Price Tier?')
    if (!result) { return }

    const site = this.siteService.getAssignedSite()
    if (!item) { return }
      this.priceTierService.deletePriceTier(site, item.id).subscribe( data =>{
        this._snackBar.open("Category deleted", "Success")
        this.onCancel(item)
    })
  }

  deleteItem(item, i) {
    const result = window.confirm('Are you sure you want to delete this Price Tier?')
    if (!result) { return }

    if (!item.id) {
      this.removeItem(i)
      return
    }
    const price  = item.value as PriceTierPrice
    const site = this.siteService.getAssignedSite()
    if (!price) { return }
      this.priceTierService.deletePriceTier(site, price.id).subscribe( data =>{
        this.removeItem(i)
        this.notifyEvent("Item deleted", "Success")
      }
    )
  }

  setWeightProfile(weightProfile, index) {
    // const index = 0;
    //index is the price in the price array.
    const prof = weightProfile as WeightProfile
    console.log('weight', weightProfile, index)

                            //this.checkoutFormGroup.get('products')
    const arrayControl   = this.inputForm.controls['priceTierPrices'] as FormArray;
    const item           = arrayControl.at(index);
    let price            = item.value as PriceTierPrice

    if (price) {
      price.flatQuantity = prof.weight.toString()
      price.priceName    = prof.name
      price.quantityFrom = prof.from.toString()
      price.quantityTo   = prof.to.toString();

      // console.log('item.value  from set weight',  item.value )
      this.setItemvalue(price,index)
    }
  }

  //this.items.at(index).patchValue(...)
  setItemvalue(item, i) {
    // console.log('setItemvalue', item, i)
    if (item) {
      let prices = this.inputForm.controls['priceTierPrices'] as FormArray;
      prices.at(i).patchValue(item)
    }
  }

  getItem(item, i) {
    console.log(item, i)
  }

  removeItem(i) {
    let prices = this.inputForm.controls['priceTierPrices'] as FormArray;
    prices.removeAt(i)
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
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }
}

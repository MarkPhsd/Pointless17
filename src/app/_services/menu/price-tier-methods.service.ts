import { Injectable } from '@angular/core';
import {  UntypedFormArray, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
// import { MatDialogRef,  MAT_DIALOG_DATA } from '@angular/material/dialog';
// import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { EMPTY, merge, Observable, of, Subject } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { PriceTierPrice, PriceTiers } from 'src/app/_interfaces/menu/price-categories';
// import { map, takeUntil } from 'rxjs/operators';
// import { FbPriceTierService } from 'src/app/_form-builder/fb-price-tier';
// import { PriceTierPrice,PriceTiers } from 'src/app/_interfaces/menu/price-categories';
import { PriceTierPriceService } from 'src/app/_services/menu/price-tier-price.service';
import { PriceTierService } from 'src/app/_services/menu/price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductEditButtonService } from './product-edit-button.service';

export interface WeightProfile {
  name: string;
  from: number;
  to:   number;
  weight: number
}

@Injectable({
  providedIn: 'root'
})

export class PriceTierMethodsService {

  weightProfile$ : Observable<WeightProfile[]>;

  weightProfile = [
    {name: 'Gram', from: 1,to: 1.05,weight: 1},
    {name: 'Eight', from: 3.5, to: 3.51, weight: 3.5},
    {name: 'Quarter', from: 7,to: 7.1,weight: 7},
    {name: 'Half', from: 14,to: 14.1, weight: 14},
    {name: 'Ounce', from: 28,to: 28.2,weight: 28},
  ] as WeightProfile[]

  constructor(
    private _fb                     : UntypedFormBuilder,
    private siteService             : SitesService,
    private priceTierService        : PriceTierService,
    private priceTierPriceService   : PriceTierPriceService,
    private productEditButtonService: ProductEditButtonService,
    private _snackBar   : MatSnackBar,
  ) { }

  getWeightProfile(): WeightProfile[] {
    return this.weightProfile;
  }

  initPriceTierPriceForm(inputForm: UntypedFormGroup): UntypedFormGroup {
    inputForm  =  this.initalizeForm(inputForm)
    return inputForm
  }

  addArrayForm(): UntypedFormGroup {
    let inputForm = this._fb.group({})
    inputForm  =  this.initalizeForm(inputForm)
    return inputForm
  }

  initalizeForm(inputForm) {
    inputForm  =  this._fb.group({
        id:              [],
        productPriceID:  [],
        quantityFrom:    [],
        quantityTo:      [],
        retail:          [],
        price1:          [],
        price2:          [],
        price3:          [],
        price4:          [],
        price5:          [],
        price6:          [],
        price7:          [],
        price8:          [],
        price9:          [],
        startTime:       [],
        endTime:         [],
        specialPrice:    [],
        weekDays:        [],
        flatQuantity:    [],
        priceName:       [],
        rateOrPrice:     [],
    })
    return inputForm
  }


  loopPrices(inputForm: UntypedFormGroup) {
    let prices = inputForm.controls['priceTierPrices'] as UntypedFormArray;
    console.log(prices)
    if (prices) {
      const pricesCount = prices.length
      for (let i = 0; i < pricesCount; i++) {
        const price = prices.at(i).value
        console.log(price)
      }
    }
  }

  saveAllPrices(priceTier: PriceTiers): Observable<PriceTiers> {
    if (priceTier) {
      const pricesCount = priceTier.priceTierPrices.length;
      for (let i = 0; i < pricesCount; i++) {
        const price     = priceTier.priceTierPrices;   //.at(i).value as PriceTierPrice;
        this.updatePrice(price[i]);
      }
    }
    return of(priceTier);
  }

  // tslint:disable-next-line: typedef
  updatePrice(price: PriceTierPrice)  {
    if (!price) { return }
    try {
      const site = this.siteService.getAssignedSite()
      return new Promise(resolve => {
        const price$ = this.priceTierPriceService.save(site, price)
        price$.subscribe( data => {
          // this.notifyEvent('Item Updated', 'Success')
          resolve(true)
        }, error => {
          this.notifyEvent(`Error updating item. ${error}`, 'Failure');
          resolve(false)
        })
        }
      )
    } catch (error) {
      console.log('error', error)
    }
  }

  sortPriceTiers(priceTierPrices:  PriceTierPrice[]): PriceTierPrice[] {
    return priceTierPrices.sort((a , b) => (+a.flatQuantity > +b.flatQuantity) ? 1: -1)
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }


  addNewTierGroup(): Observable<any> {
    const site = this.siteService.getAssignedSite();
      const price = {} as PriceTiers
      const price$ = this.priceTierService.savePriceTier(site, price)
      price$.pipe(
        switchMap(
           priceTier => {
            this.addPricesWithWeightProfiles(priceTier, null)
            return this.saveAllPrices(priceTier)
           }
         )
      ).subscribe(data => {
        if (!data) {
          return of("Failure")
        }
        if (data) {
          this.productEditButtonService.openPriceTierEditor(data)
          return of("success")
        }
      }
    )
    return EMPTY;
  }

  addPricesWithWeightProfiles(priceTier: PriceTiers, pricesArray: UntypedFormArray): PriceTiers {
    this.weightProfile.forEach( profile => {
      let price = {} as PriceTierPrice
      price     = this.assignWeightValues(priceTier, price, profile)
      priceTier.priceTierPrices.push(price)
      this.addPriceToArray(priceTier,price,pricesArray)
    })
    return priceTier
  }

  setPriceWeightProfile(priceTier: PriceTiers,
                        price: PriceTierPrice,
                        prof: WeightProfile,
                        ) {
    const  priceTierPrices = this.assignWeightValues(priceTier, price, prof)
    return priceTierPrices
  }

  openPriceTier(id: number) {
    const site = this.siteService.getAssignedSite();
    const price$ = this.priceTierService.getPriceTier(site, id)
    price$.subscribe( data => {
      this.productEditButtonService.openPriceTierEditor(data)
    })
  }

  assignWeightValues(priceTier: PriceTiers, price: PriceTierPrice, prof: WeightProfile): PriceTierPrice {
    if (price && priceTier) {
      price.flatQuantity   = prof.weight;
      price.priceName      = prof.name;
      price.quantityFrom   = prof.from;
      price.quantityTo     = prof.to;
      price.productPriceID = priceTier.id;
      console.log(price)
      return price
    }
  }

  addPriceToArray(priceTier: PriceTiers,  price: PriceTierPrice, pricesArray:UntypedFormArray ) {
    if (!price) {
      price =  {} as PriceTierPrice;
      price.productPriceID = priceTier.id;
    }
    if (pricesArray) {
      //create form object to add to price tiers array
      let priceForm = this.addArrayForm();
      priceForm.patchValue(price)
      //assign value to price array form array
      pricesArray.push(priceForm)
    }
  }

}

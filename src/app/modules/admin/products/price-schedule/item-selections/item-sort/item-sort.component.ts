import {   Component, Input, } from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { catchError, of, switchMap , Observable} from 'rxjs';
import { CdkDragDrop, moveItemInArray,  } from '@angular/cdk/drag-drop';
import { DiscountInfo, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { UntypedFormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';

@Component({
  selector: 'app-item-sort',
  templateUrl: './item-sort.component.html',
  styleUrls: ['./item-sort.component.scss']
})
export class ItemSortComponent  {

  action$ : Observable<any>;
  priceSchedule            : IPriceSchedule;
  @Input() inputForm       : UntypedFormGroup;
  discountInfos            : DiscountInfo[];
  discountInfo             : DiscountInfo;
  openingProduct: boolean;
  index                    : number;

  _priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
    if (data) {
      console.log('data.itemDiscount', data.itemDiscounts)
      if (data.itemDiscounts) {
        data.itemDiscounts.sort((a, b) => a.sort - b.sort);
        console.log('data.discount' , data.itemDiscounts)
        this.discountInfos =  data.itemDiscounts //.sort((a, b) => a.sort - b.sort);
      }
     }
     this.priceSchedule = data
  })

  constructor(
    private priceScheduleDataService  : PriceScheduleDataService,
    private priceScheduleService      : PriceScheduleService,
    private siteService               : SitesService,
    private fbPriceScheduleService    : FbPriceScheduleService,
    private _snackBar                 : MatSnackBar,
    private productEditButtonService: ProductEditButtonService,
  ) {
  }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  // initList(list: DiscountInfo[]) {
  //   if (list) {
  //     this.discountInfos = list.sort((a, b) => a.sort - b.sort);
  //     console.log('initList .discount' , list)
  //   }
  // }

  assignItem(item, index) {
    if (item) {
      this.discountInfo = item
      this.index = index
    }
  }

  editSelected(item: DiscountInfo, index) {
    this.editItemWithId(item.itemID)
  }

  editItemWithId(id:number) {
    if(!id) { return }
    this.productEditButtonService.openProductDialogObs(id).subscribe(
      data => {
      this.openingProduct = false
      return of(data)
    })

  }

  deleteSelected(item, index) {

    console.log('item.id', item.id)
    if (!item  && item.id) {
      this.siteService.notify('ID not found', 'Close', 3000, 'red')
      console.log('id not provided')
      return
    }

    if (!item.id || item.id == 0) {
      this.discountInfos.splice( index , 1);
      return;
    }

    const site = this.siteService.getAssignedSite();
    this.action$ = this.priceScheduleService.deleteItemDiscountSelected(site, item.id).pipe(
      switchMap( data=> {
        this.discountInfos.splice( index , 1);
        this.priceSchedule.itemDiscounts = this.discountInfos;
        this.priceScheduleDataService.updatePriceSchedule(this.priceSchedule)
        this.inputForm.patchValue(this.priceSchedule)
        return of(null)
      }),
      catchError( err => {
        this.notifyEvent('Oh no ' + err, 'failured')
        return of(null)
      })
    )

  }

  drop(event: CdkDragDrop<string[]>) {
    if (this.discountInfos) {
      moveItemInArray(this.discountInfos, event.previousIndex, event.currentIndex);
      this.saveMenu()
    }
  }

  saveMenu() {
    const site = this.siteService.getAssignedSite();
    if (this.discountInfos) {

       this.discountInfos.forEach( (data, index) => {
        this.discountInfos[index].priceScheduleID  = this.priceSchedule.id;
      })

      const schedule$ = this.priceScheduleService.postItemList(site, this.discountInfos)
      schedule$.subscribe(data => {
          this.priceSchedule.itemDiscounts = data;
          this.priceScheduleService.updateItemPriceSchedule(this.priceSchedule);
          this.fbPriceScheduleService.addDiscountItems(this.inputForm, data)
        }
      )
    }
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  assignType(id: number) {

  }


}

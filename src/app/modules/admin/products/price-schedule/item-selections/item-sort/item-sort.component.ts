import { AfterViewInit, Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray,  } from '@angular/cdk/drag-drop';
import { DiscountInfo, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { FormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';

@Component({
  selector: 'app-item-sort',
  templateUrl: './item-sort.component.html',
  styleUrls: ['./item-sort.component.scss']
})
export class ItemSortComponent  {

  priceSchedule            : IPriceSchedule;
  @Input() inputForm       : FormGroup;
  discountInfos            : DiscountInfo[];
  discountInfo             : DiscountInfo;
  // _priceSchedule           : Subscription;
  index                    : number;

  // _priceSchedule = this.priceScheduleService.priceSchedule$.subscribe(data => {
  //   console.log('received datea for item sort', data)
  //   if (data) {
  //    this.priceSchedule = data;
  //    if (data.itemDiscounts) {
  //      this.initList(data.itemDiscounts);
  //    }
  //   }
  // })

  // initSubscriptions() {

  // }

  _priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
    this.priceSchedule = data
    console.log('received datea for item sort', data)
    if (data) {
      this.priceSchedule = data;
      if (data.itemDiscounts) {
        this.initList(data.itemDiscounts);
      }
     }
  })

  constructor(
    private priceScheduleDataService  : PriceScheduleDataService,
    private priceScheduleService      : PriceScheduleService,
    private siteService               : SitesService,
    private fbPriceScheduleService    : FbPriceScheduleService,
    private _snackBar                 : MatSnackBar,
  ) {
  }

  // ngOnInit() {
  //   this.initSubscriptions();
  // }

  // ngAfterViewInit(): void {
  //   //Called after ngAfterContentInit when the component's view has been initialized. Applies to components only.
  //   //Add 'implements AfterViewInit' to the class.
  //   this.initSubscriptions();
  // }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  initList(list: DiscountInfo[]) {
    if (list) {
      this.discountInfos = list.sort((a , b) => (+a.sort > +b.sort) ? 1: -1)
    }
  }

  assignItem(item, index) {
    if (item) {
      this.discountInfo = item
      this.index = index
    }
  }

  deleteSelected(item) {
    if (!item) {return}
    const site = this.siteService.getAssignedSite();
    this.priceScheduleService.deleteItemDiscountSelected(site, item.id).subscribe( data=> {
      this.discountInfos.splice( this.index, 1);
      this.priceSchedule.itemDiscounts = this.discountInfos;
    })
    this.discountInfo = {} as DiscountInfo
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
      const schedule$ = this.priceScheduleService.postItemList(site, this.discountInfos)
      schedule$.subscribe(data => {
          this.priceSchedule.itemDiscounts = data;
          this.priceScheduleService.updateItemPriceSchedule(this.priceSchedule);
          this.fbPriceScheduleService.addDiscountItemTypes(this.inputForm, data)
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

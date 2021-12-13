import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray,  } from '@angular/cdk/drag-drop';
import { DiscountInfo, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { FormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';

@Component({
  selector: 'app-item-sort',
  templateUrl: './item-sort.component.html',
  styleUrls: ['./item-sort.component.scss']
})
export class ItemSortComponent implements OnInit {

  @Input() priceSchedule   : IPriceSchedule;
  @Input() inputForm       : FormGroup;
  discountInfos            : DiscountInfo[];
  discountInfo             : DiscountInfo;
  _priceSchedule           : Subscription;
  index                    : number;

  // initSubscriptions() {
  //   this._priceSchedule = this.priceScheduleService.priceSchedule$.subscribe(data => {
  //     if (data) {
  //      this.priceSchedule = data;
  //      this.initList(data.itemDiscounts)
  //     }
  //   })
  // }
  constructor(
    private priceScheduleService: PriceScheduleService,
    private siteService:  SitesService,
    private fbPriceScheduleService  : FbPriceScheduleService,
    private _snackBar:    MatSnackBar,
  ) {
  }

  ngOnInit() {
    if (!this.priceSchedule) { return }
    this.initList(this.priceSchedule.itemDiscounts)
    // this.initSubscriptions();
  }


  assignItem(item, index) {
    this.discountInfo = item
    this.index = index
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

  initList(list: DiscountInfo[]) {
    this.discountInfos = list.sort((a , b) => (+a.sort > +b.sort) ? 1: -1)
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

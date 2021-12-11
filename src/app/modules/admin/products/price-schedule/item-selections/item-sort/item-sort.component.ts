import { Component, Input, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Subscription } from 'rxjs';
import { CdkDragDrop, moveItemInArray,  } from '@angular/cdk/drag-drop';
import { DiscountInfo, IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-item-sort',
  templateUrl: './item-sort.component.html',
  styleUrls: ['./item-sort.component.scss']
})
export class ItemSortComponent implements OnInit {

  @Input() priceSchedule   : IPriceSchedule;
  discountInfos   : DiscountInfo[];
  discountInfo    : DiscountInfo;

  _priceSchedule    : Subscription;
  index             : number;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleService.priceSchedule$.subscribe(data => {
      console.log('sort subscription', data)
      if (data) {
       this.priceSchedule = data;
       if (data.itemDiscounts) {
         this.discountInfos = data.itemDiscounts;
       }
     }
    })
  }
  constructor(
    private priceScheduleService: PriceScheduleService,
    private siteService:  SitesService,
    private _snackBar:    MatSnackBar,
  ) {    this.initSubscriptions(); }

  ngOnInit() {


    this.initList();
  }

  initItemList() {

  }

  assignItem(item,index) {
    this.discountInfo = item
    this.index = index
  }

  deleteSelected() {
    if (!this.index && !this.discountInfo) {return}
    const site = this.siteService.getAssignedSite();
    this.priceScheduleService.deleteItemDiscountSelected(site, this.discountInfo.id).subscribe( data=> {
      this.discountInfos.splice( this.index, 1);
      this.priceSchedule.itemDiscounts = this.discountInfos;
    })
    this.discountInfo = {} as DiscountInfo
  }

  initList() {
    this.discountInfos = this.priceSchedule.itemDiscounts.sort((a , b) => (+a.sort > +b.sort) ? 1: -1)
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.discountInfos, event.previousIndex, event.currentIndex);
    this.saveMenu()
  }

  saveMenu() {
    const site = this.siteService.getAssignedSite();
    if (this.discountInfos) {
      const schedule$ = this.priceScheduleService.postItemList(site, this.discountInfos)
      schedule$.subscribe(data => {
          this.priceSchedule.itemDiscounts = data;
          return this.priceScheduleService.updateItemPriceSchedule(this.priceSchedule);
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

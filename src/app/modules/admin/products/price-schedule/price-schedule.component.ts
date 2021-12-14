import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule, ClientType, DateFrame, DiscountInfo,
  TimeFrame, WeekDay
} from 'src/app/_interfaces/menu/price-schedule';
import { DevService } from 'src/app/_services';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';

// https://angular.io/guide/component-interaction#!#bidirectional-service

@Component({
  selector: 'app-price-schedule',
  templateUrl: './price-schedule.component.html',
  styleUrls: ['./price-schedule.component.scss']
})
export class PriceScheduleComponent {

  @Output() outPutToggleSideBar:      EventEmitter<any> = new EventEmitter();

  inputForm:            FormGroup;
  selectClientForm:     FormGroup;

  clientTypes:          ClientTypes;
  dateFrame:            DateFrame;
  maintype:             DiscountInfo;
  timeFrame:            TimeFrame;
  weekDay:              WeekDay;
  weekDays:             WeekDay[];
  allEligible:          boolean;
  allOrderTypes:        boolean;
  allWeekdaysDays:      boolean;
  timeFrameAlways:      boolean;
  allDates:             boolean;
  active:               boolean;

  priceSchedule$      : Observable<IPriceSchedule>;
  priceSchedule       : IPriceSchedule;
  id                  : number;

  @Input() requiredItemTypes:  DiscountInfo[] = []; //what is a main type? This is itemType
  @Input() requiredBrands:     DiscountInfo[] = [];
  @Input() requiredCategories: DiscountInfo[] = [];
  @Input() requiredItems:      DiscountInfo[] = [];

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;
  devMode                     : boolean;

  initPriceScheduleService() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceScheduleTracking = data
    })

    //subscribe to form
    this.inputForm.valueChanges.subscribe(data => {
      if (!data) {
        console.log('no data output from Price Schedule Service. Component')
      }
      this.priceScheduleTracking = data
    })

  }

  constructor(
      private fbPriceScheduleService  : FbPriceScheduleService,
      private priceScheduleService    : PriceScheduleService,
      private priceScheduleDataService: PriceScheduleDataService,
      private siteService             : SitesService,
      private snack                   : MatSnackBar,
      public  route                   : ActivatedRoute,
      private toolBarUIService        : ToolBarUIService,
      private router                  : Router,
      private devModeService                 : DevService
    )

  {
    this.devMode =  !this.devModeService.getdevMode();

    this.initForm()
    this.toggleSideBar()
    const id = this.route.snapshot.paramMap.get('id');
    this.getItem( parseInt( id ))
    this.initPriceScheduleService();
  }

  ngDestroy() {
    if (this._priceSchedule) {
      this._priceSchedule.unsubscribe();
    }
  }

  toggleSideBar() {
    this.toolBarUIService.updateToolBarSideBar(false)
    setTimeout(() => {
      window.dispatchEvent(
        new Event('resize')
      );
    }, 300);
  }

  logInfo() {
    console.log(this.priceSchedule)
  }

  initForm(){
    this.inputForm = this.fbPriceScheduleService.initForm(this.inputForm)
  }

  getItem(id: number) {
    if (id) {
        const site = this.siteService.getAssignedSite();
        const item$ = this.priceScheduleService.getPriceSchedule(site, id)
        item$.subscribe(data => {
          this.priceSchedule = data
          this.fbPriceScheduleService.initFormData(this.inputForm, this.priceSchedule)
          this.priceScheduleDataService.updatePriceSchedule( this.priceSchedule )
        }
      )
    }
  }

  initFormArray() {
    if (this.priceSchedule.weekDays) {
      this.fbPriceScheduleService.setWeekDayArray(this.inputForm, this.priceSchedule.weekDays)
    }
  }

  setWeekDayArray(event) {
    const item = event as IPriceSchedule;
    if (item.weekDays) {
      this.fbPriceScheduleService.setWeekDayArray(this.inputForm, item.weekDays)
    }
  }

  updateRequiredCategories(requiredCategories) {
    this.requiredCategories = requiredCategories
  }

  updateRequiredItemTypes(requiredItemTypes) {
    this.requiredItemTypes = requiredItemTypes
  }

  getPriceSchedule(data: FormGroup): IPriceSchedule {
    if (data) {
       if (data.valid) {
        let  priceSchedule = data.value as IPriceSchedule;
        if (priceSchedule.clientTypes) {
          let clientTypes = priceSchedule.clientTypes
          if (clientTypes.length > 0) {
          }
        }
        return priceSchedule;
       }
    }
    return null
  }

  save() {
    const site = this.siteService.getAssignedSite();
    if (this.inputForm.valid) {
      // const priceSchedule = this.getPriceSchedule(this.inputForm)
      const item = this.inputForm.value as IPriceSchedule

      this.priceScheduleDataService.updatePriceSchedule(item)

      const item$ = this.priceScheduleService.save(site, item)
      console.log('item to save ', item)
      item$.subscribe( data => {
        this.snack.open('Item Saved', 'Success', {duration: 2000, verticalPosition: 'top'})
      }, err => {
        this.snack.open(err, 'Error', {duration: 4000, verticalPosition: 'top'})
      })

    }
    if (!this.inputForm.valid) {
      this.snack.open('Missing values', 'Alert', {duration: 2000, verticalPosition: 'top'})
    }
  }

  delete() {
    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    const site = this.siteService.getAssignedSite();
    if (this.inputForm.valid) {
      const priceSchedule = this.getPriceSchedule(this.inputForm)
      const item$ = this.priceScheduleService.delete(site, priceSchedule.id)
      item$.subscribe(data => {
        this.router.navigate(['/price-schedule-list'])
        this.snack.open('Item Deleted', 'Success', {duration: 2000})
      })
    }
    if (!this.inputForm.valid) {
      this.snack.open('Missing values', 'Alert', {duration: 2000})
    }
  }
}

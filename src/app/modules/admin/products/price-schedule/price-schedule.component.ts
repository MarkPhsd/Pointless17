import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, Observable, of, Subscription, switchMap } from 'rxjs';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule, ClientType, DateFrame, DiscountInfo,
  TimeFrame, WeekDay, OrderType
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
  saveNotification:     boolean;
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
  schedule$           : Observable<IPriceSchedule>;
  priceSchedule$      : Observable<IPriceSchedule>;

  id                  : number;

  @Input() requiredItemTypes:  DiscountInfo[] = []; //what is a main type? This is itemType
  @Input() requiredBrands:     DiscountInfo[] = [];
  @Input() requiredCategories: DiscountInfo[] = [];
  @Input() requiredItems:      DiscountInfo[] = [];

  _priceSchedule              : Subscription;
  priceSchedule       : IPriceSchedule;
  devMode                     = false;
  isMenuList                   : boolean;
  description         : string;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      if (data) {
          this.priceSchedule = data
          this.isMenuList = false
          if (data.type == 'Menu List') {
          this.isMenuList = true
        }
      }
    })

    //subscribe to form
    this.inputForm.valueChanges.subscribe(data => {
      if (!data) {
        console.log('no data output from Price Schedule Service. Component')
      }
      this.priceSchedule = data
      this.updateMenuList(this.priceSchedule)
    })
  }

  updateMenuList(schedule: IPriceSchedule) {
    this.isMenuList = false
    if (schedule.type == 'Menu List') {
      this.isMenuList = true
    }
  }

  saveImageToSchedule(event)  {
    this.priceSchedule.image = event
    this.inputForm.controls['image'].setValue(this.priceSchedule.image)
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
      private devModeService          : DevService
    )

  {
    this.initForm()
    this.toggleSideBar()
    const id = this.route.snapshot.paramMap.get('id');
    this.id = +id;
    this.schedule$ = this.getItem(+id)
  }

    getItem(id: number) {
      if (id) {
          const site = this.siteService.getAssignedSite();
          return this.priceScheduleService.getPriceSchedule(site, id).pipe(switchMap(data => {
            this.priceSchedule = data
            this.description   = data.description;
            this.fbPriceScheduleService.initFormData(this.inputForm, this.priceSchedule)
            this.priceScheduleDataService.updatePriceSchedule( this.priceSchedule )
            return of(data)
          }
        ),catchError(err => {
          this.siteService.notify('Error ' + err, 'Alert', 2000)
          return of(err)
        })
      )
      return;
    }
    this.siteService.notify('Error: No ID', 'Alert', 2000)
    return of(null)
  }

  ngDestroy() {
    if (this._priceSchedule) { this._priceSchedule.unsubscribe();}
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

  listSchedules() {
    this.router.navigate(['price-schedule'])
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

  getItemValueFromForm(value: any): IPriceSchedule {
    const newSchedule = {} as IPriceSchedule;
    const orderTypes = newSchedule.orderTypes as OrderType[]
    const clientTypes = newSchedule.clientTypes as ClientType[]
    const itemDiscounts = newSchedule.itemDiscounts as DiscountInfo[]
    return value
  }

  save() {
    const site = this.siteService.getAssignedSite();
    if (this.inputForm.valid) {
      const item = this.inputForm.value as IPriceSchedule;
      item.id = this.id;
      const item$ = this.priceScheduleService.save(site, item)
      this.saveNotification = true
      item$.subscribe( {
        next:  data => {
          this.saveNotification = false
            this.snack.open('Item Saved', 'Success', {duration: 2000, verticalPosition: 'top'})
            this.priceScheduleDataService.updatePriceSchedule(data)
          },
        error:  err => {
            this.snack.open(err, 'Error', {duration: 4000, verticalPosition: 'top'})
          }
        }
      )
    }

    if (!this.inputForm.valid) {
      this.snack.open('Missing values', 'Alert', {duration: 2000, verticalPosition: 'top'})
    };
  }

  delete() {
    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }
    const site = this.siteService.getAssignedSite();
    const item$ = this.priceScheduleService.delete(site, this.id)
    item$.subscribe(data => {
      this.router.navigate(['/price-schedule'])
      this.snack.open('Item Deleted', 'Success', {duration: 2000})
    })
  }

}

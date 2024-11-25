import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { UntypedFormArray, FormBuilder, UntypedFormGroup, UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule, ClientType, DateFrame, DiscountInfo ,
  TimeFrame, WeekDay
} from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { END } from '@angular/cdk/keycodes';
import { CommonModule, DatePipe } from '@angular/common';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-date-schedule',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './date-schedule.component.html',
  styleUrls: ['./date-schedule.component.scss']
})
export class DateScheduleComponent implements OnInit {

  range = new UntypedFormGroup({
    start: new UntypedFormControl(),
    end: new UntypedFormControl()
  });

  // priceSchedule$              :      Observable<IPriceSchedule>
  // @Output() outputWeekdays    :      EventEmitter<any> = new EventEmitter();
  // @Output() outputAllWeekdays :      EventEmitter<any> = new EventEmitter();
  @Input()  inputForm         :      UntypedFormGroup;
  @Input()  item              :      IPriceSchedule;

  // @Input()  dateFrames        :      DateFrame[];
  // @Input()  timeFrames        :      TimeFrame[];

  allDates: boolean;

  get dateFrames() : UntypedFormArray {
    return this.inputForm.get('dateFrames') as UntypedFormArray;
  }

  _priceSchedule              : Subscription;
  priceScheduleTracking       : IPriceSchedule;

  initSubscriptions() {
    this._priceSchedule = this.priceScheduleDataService.priceSchedule$.subscribe( data => {
      this.priceScheduleTracking = data

    })
  }
  constructor(
        private fbPriceScheduleService  : FbPriceScheduleService,
        private priceScheduleDataService: PriceScheduleDataService,
  )
  { }

  ngOnInit(): void {
    this.initSubscriptions();
    if (this.inputForm) {
      this.allDates = this.inputForm.get('allDates').value
    }
  }

  inputDateRange() {
  }

  toggle()  {
    this.priceScheduleTracking.allDates = !this.priceScheduleTracking.allDates
  }


  addItemFromPicker() {

    let startDate = this.range.controls.start.value.toString() ;
    let endDate   = this.range.controls.end.value.toString()  ;

    const datepipe: DatePipe = new DatePipe('en-US')
    startDate = datepipe.transform(startDate, 'shortDate')
    endDate   = datepipe.transform(endDate, 'shortDate')
    console.log(startDate,endDate)
    try {
      const dateFrame = {} as DateFrame;
      dateFrame.startDate = startDate
      dateFrame.endDate = endDate
      this.fbPriceScheduleService.addDateRange(this.inputForm, dateFrame)

      this.priceScheduleDataService.updatePriceSchedule(this.inputForm.value)
        console.log('item added')
    } catch (error) {
      console.log(error)
    }
  }

  addItem() {
    try {

        let startDate = this.range.controls.start.value.toString() ;
        let endDate   = this.range.controls.end.value.toString()  ;

        const datepipe: DatePipe = new DatePipe('en-US')
        startDate = datepipe.transform(startDate, 'shortDate')
        endDate   = datepipe.transform(endDate, 'shortDate')
        const dateFrame = {} as DateFrame;
        dateFrame.startDate  = startDate
        dateFrame.endDate    = endDate
        this.fbPriceScheduleService.addDateRange(this.inputForm, dateFrame)

        // this.item.dateFrames = [] as DateFrame[]
        // this.item.dateFrames.push(dateFrame)
        this.priceScheduleDataService.updatePriceSchedule(this.inputForm.value)

    } catch (error) {
      console.log(error)
    }
  }



  // deleteItem(i: any) {
  //   this.fbPriceScheduleService.deleteDateFrame(i, this.inputForm)
  //   this.priceScheduleDataService.updatePriceSchedule(this.inputForm.value)
  //   if (this.item) {
  //     this.item.timeFrames.splice(i, 1)
  //   }
  // }

  deleteItem(i: any) {
    this.fbPriceScheduleService.deleteDateFrame(i, this.inputForm)
    this.item.timeFrames.splice(i, 1)
  }

  toApiDate(bDate) {
    const apiDate: string = new Date(bDate).toUTCString();
    return apiDate;
  }
}

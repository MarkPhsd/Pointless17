import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule, ClientType, DateFrame, DiscountInfo ,
  TimeFrame, WeekDay
} from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { Observable, Subject ,fromEvent } from 'rxjs';
import { END } from '@angular/cdk/keycodes';
import { DatePipe } from '@angular/common';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';

@Component({
  selector: 'app-date-schedule',
  templateUrl: './date-schedule.component.html',
  styleUrls: ['./date-schedule.component.scss']
})
export class DateScheduleComponent implements OnInit {

  range = new FormGroup({
    start: new FormControl(),
    end: new FormControl()
  });

  // priceSchedule$              :      Observable<IPriceSchedule>
  @Output() outputWeekdays    :      EventEmitter<any> = new EventEmitter();
  @Output() outputAllWeekdays :      EventEmitter<any> = new EventEmitter();
  @Input()  inputForm         :      FormGroup;
  @Input()  item              :      IPriceSchedule;

  // @Input()  dateFrames        :      DateFrame[];
  // @Input()  timeFrames        :      TimeFrame[];

  allDates: boolean;

  get dateFrames() : FormArray {
    return this.inputForm.get('dateFrames') as FormArray;
  }

  constructor(
        private fbPriceScheduleService  : FbPriceScheduleService,
        private priceScheduleDataService: PriceScheduleDataService,
  )
  { }

  ngOnInit(): void {
    console.log('init time schedule')
    if (this.inputForm) {
      this.allDates = this.inputForm.get('allDates').value

    }
  }

  inputDateRange() {
  }

  toggle(event)  {
    console.log('event')
  }

  addItemFromPicker() {

    let startDate = this.range.controls.start.value.toString() ;
    let endDate   = this.range.controls.end.value.toString()  ;

    const datepipe: DatePipe = new DatePipe('en-US')
    startDate = datepipe.transform(startDate, 'shortDate')
    endDate   = datepipe.transform(endDate, 'shortDate')

    try {
      const dateFrame = {} as DateFrame;
      dateFrame.startDate = startDate
      dateFrame.endDate = endDate
      this.fbPriceScheduleService.addDateRange(this.inputForm, dateFrame)
      // this.item.dateFrames = [] as DateFrame[]
      // this.item.dateFrames.push(dateFrame)
      this.priceScheduleDataService.updatePriceSchedule(this.inputForm.value)
        console.log('item added')
    } catch (error) {
      console.log(error)
    }
  }

  // addItem() {
  //   try {
  //       this.fbPriceScheduleService.addDateRange(this.inputForm, null)
  //       const dateFrame = {} as DateFrame;
  //       dateFrame.startDate =''
  //       dateFrame.endDate = ''
  //       // this.item.dateFrames = [] as DateFrame[]
  //       // this.item.dateFrames.push(dateFrame)
  //     console.log('item added')
  //   } catch (error) {
  //     console.log(error)
  //   }
  // }

  deleteItem(i: any) {
    this.fbPriceScheduleService.deleteDateFrame(i, this.inputForm)
    this.priceScheduleDataService.updatePriceSchedule(this.inputForm.value)
    if (this.item) {
      this.item.timeFrames.splice(i, 1)
    }
  }

  toApiDate(bDate) {
    const apiDate: string = new Date(bDate).toUTCString();
    return apiDate;
  }
}

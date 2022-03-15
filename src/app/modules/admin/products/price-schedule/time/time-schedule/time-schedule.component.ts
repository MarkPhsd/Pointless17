import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule, ClientType, DateFrame,DiscountInfo,
  TimeFrame, WeekDay
} from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';

@Component({
  selector: 'app-time-schedule',
  templateUrl: './time-schedule.component.html',
  styleUrls: ['./time-schedule.component.scss']
})
export class TimeScheduleComponent implements OnInit {

  // priceSchedule$              :      Observable<IPriceSchedule>
  // @Output() outputWeekdays    :      EventEmitter<any> = new EventEmitter();
  // @Output() outputAllWeekdays :      EventEmitter<any> = new EventEmitter();
  @Input()  inputForm         :      FormGroup;
  @Input()  weekDay           :      WeekDay;
  @Input()  item              :      IPriceSchedule;

  timeFrameAlways             :      boolean;

  get timeFrames() : FormArray {
    return this.inputForm.get('timeFrames') as FormArray;
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
    this.timeFrameAlways =  this.priceScheduleTracking.timeFrameAlways
  }

  toggle()  {
    this.priceScheduleTracking.timeFrameAlways = !this.priceScheduleTracking.timeFrameAlways
  }

  addItem() {
    try {
      console.log('add Item')
        this.fbPriceScheduleService.addTimeRange(this.inputForm, null)
        const timeFrame = {} as TimeFrame;
        timeFrame.startTime = ''
        timeFrame.endTime   = ''
        this.item.timeFrames = [] as TimeFrame[]
        this.item.timeFrames.push(timeFrame)
        this.priceScheduleDataService.updatePriceSchedule(this.inputForm.value)

    } catch (error) {
      console.log(error)
    }
  }

  deleteItem(i: any) {
    this.fbPriceScheduleService.deleteFrame(i, this.inputForm)
    this.item.timeFrames.splice(i, 1)
  }

}

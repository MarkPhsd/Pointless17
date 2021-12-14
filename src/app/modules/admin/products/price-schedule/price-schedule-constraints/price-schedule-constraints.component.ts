import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { FormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';

@Component({
  selector: 'app-price-schedule-constraints',
  templateUrl: './price-schedule-constraints.component.html',
  styleUrls: ['./price-schedule-constraints.component.scss']
})
export class PriceScheduleConstraintsComponent implements OnInit {

  @Output() outputOrderTypes : EventEmitter<any> = new EventEmitter();
  @Input() inputForm         : FormGroup;
  @Input() item              : IPriceSchedule;

  constructor(
    private fbPriceScheduleService : FbPriceScheduleService) { }

  ngOnInit(): void {
    console.log('')
  }


  setOrderTypeValues(orderTypes: any[]) {
    this.fbPriceScheduleService.setOrderTypeValues(this.inputForm, orderTypes)
  }

  setClientTypeValues(clientTypes: any[]) {
    this.fbPriceScheduleService.setClientTypeValues(this.inputForm, clientTypes)
  }

  setAllWeekDaydays(allWeekDays) {
    if (this.item) { this.item.allWeekdaysDays = allWeekDays }
    this.inputForm  = this.fbPriceScheduleService.setValues(this.item, this.inputForm)
  }

  setWeekDayArray(event) {
    const item = event as IPriceSchedule;
    if (item.weekDays) {
      this.fbPriceScheduleService.setWeekDayArray(this.inputForm, item.weekDays)
    }
  }

}

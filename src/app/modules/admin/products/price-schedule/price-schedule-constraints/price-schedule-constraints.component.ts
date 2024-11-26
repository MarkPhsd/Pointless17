import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter} from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { FbPriceScheduleService } from 'src/app/_form-builder/fb-price-schedule.service';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { OrderTypeSelectionComponent } from '../order-type-selection/order-type-selection.component';
import { ClientTypeSelectionComponent } from '../client-type-selection/client-type-selection.component';
import { WeekDaySelectionComponent } from '../time/week-day-selection/week-day-selection.component';
import { TimeScheduleComponent } from '../time/time-schedule/time-schedule.component';
import { DateScheduleComponent } from '../time/date-schedule/date-schedule.component';
import { ValueFieldsComponent } from '../../productedit/_product-edit-parts/value-fields/value-fields.component';

@Component({
  selector: 'app-price-schedule-constraints',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    OrderTypeSelectionComponent,
    ClientTypeSelectionComponent,
    WeekDaySelectionComponent,
    TimeScheduleComponent,
    DateScheduleComponent,
    ValueFieldsComponent,
    SharedPipesModule],
  templateUrl: './price-schedule-constraints.component.html',
  styleUrls: ['./price-schedule-constraints.component.scss']
})
export class PriceScheduleConstraintsComponent implements OnInit {

  @Output() outputOrderTypes : EventEmitter<any> = new EventEmitter();
  @Input() inputForm         : UntypedFormGroup;
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

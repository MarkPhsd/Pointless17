import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { IPriceSchedule, ClientType, DateFrame, DiscountInfo,
  TimeFrame, WeekDay
} from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';

@Component({
  selector: 'app-week-day-selection',
  templateUrl: './week-day-selection.component.html',
  styleUrls: ['./week-day-selection.component.scss']
})

export class WeekDaySelectionComponent implements OnInit {

  @Output() outputWeekdays    :      EventEmitter<any> = new EventEmitter();
  @Output() outputAllWeekdays :      EventEmitter<any> = new EventEmitter();
  @Input()  inputForm         :      UntypedFormGroup;
  @Input()  weekDay           :      WeekDay;
  @Input()  allWeekdaysDays   :      boolean;
  @Input()  item              :      IPriceSchedule;

  monday:       boolean;
  tuesday:      boolean;
  wednesday:    boolean;
  thursday:     boolean;
  friday:       boolean;
  saturday:     boolean;
  sunday:       boolean;

  constructor(private priceScheduleDataService : PriceScheduleDataService ) { }

  ngOnInit(): void {

    if ( this.inputForm) {
      this.allWeekdaysDays = this.inputForm.get('allWeekdaysDays').value
    }
    this.setItems();

  }

  toggle(event)  {

    this.outputAllWeekdays.emit(event)

  }

  setItems() {
    console.log('setItems')
    try {
      if ( this.item ) {
        if (this.item.weekDays) {
          const  weekDays = this.item.weekDays

           this.monday = weekDays.some(item => item.name === 'monday');
           this.tuesday = weekDays.some(item => item.name === 'tuesday');
           this.wednesday = weekDays.some(item => item.name === 'wednesday');
           this.thursday = weekDays.some(item =>item.name === 'thursday');
           this.friday = weekDays.some(item => item.name === 'friday');
           this.saturday = weekDays.some(item => item.name === 'saturday');
           this.sunday = weekDays.some(item => item.name === 'sunday');

        }
      }

    } catch (error) {
      console.log('setItems', error)
    }
  }

  compareFunction(weekDay: any): boolean {
    if ( this.item ) {
      if (this.item.weekDays) {
          const result =   this.item.weekDays.some(weekDay)
          if (result) { return true}
          return false
      }
    }
    return false
  }

  getItems() {

    const weekDays = [] as WeekDay[];

    if (this.monday) {
      const weekDay = {} as WeekDay
      weekDay.name = 'monday'
      weekDays.push(weekDay)
    }

    if (this.tuesday) {
      const weekDay = {} as WeekDay
      weekDay.name = 'tuesday'
      weekDays.push(weekDay)
    }

    if (this.wednesday) {
      const weekDay = {} as WeekDay
      weekDay.name = 'wednesday'
      weekDays.push(weekDay)
    }

    if (this.thursday) {
      const weekDay = {} as WeekDay

      weekDay.name = 'thursday'
      weekDays.push(weekDay)
    }

    if (this.friday) {
      const weekDay = {} as WeekDay
      weekDay.name = 'friday'
      weekDays.push(weekDay)
    }

    if (this.saturday) {
      const weekDay = {} as WeekDay
      weekDay.name = 'saturday'
      weekDays.push(weekDay)
    }

    if (this.sunday) {
      const weekDay = {} as WeekDay
      weekDay.name = 'sunday'
      weekDays.push(weekDay)
    }

    this.item.allWeekdaysDays = this.allWeekdaysDays;
    this.item.weekDays = weekDays;
    this.outputWeekdays.emit(this.item);

    this.priceScheduleDataService.updatePriceSchedule(this.item);

  }

  clearItems() {
    // this.allWeekdaysDays = !this.allWeekdaysDays
    const weekDays  = {} as WeekDay[];
    //then output weekdays to the parent.
    this.item.weekDays = []
    this.priceScheduleDataService.updatePriceSchedule(this.item);
    this.outputWeekdays.emit(this.item)
  }




}

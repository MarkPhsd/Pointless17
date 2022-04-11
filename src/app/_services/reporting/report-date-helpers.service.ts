import { Injectable } from '@angular/core';
import { formatDate, DatePipe } from '@angular/common';
import { BehaviorSubject } from 'rxjs';
export interface IDateRange {
  startdate: string;
  endDate  : string;
}
// // This would come from the server.
// // Also, this whole block could probably be made into an mktime function.
// // All very bare here for quick grasping.
// d = new Date();
// d.setUTCFullYear(2004);
// d.setUTCMonth(1);
// d.setUTCDate(29);
// d.setUTCHours(2);
// d.setUTCMinutes(45);
// d.setUTCSeconds(26);

// console.log(d);                        // -> Sat Feb 28 2004 23:45:26 GMT-0300 (BRT)
// console.log(d.toLocaleString());       // -> Sat Feb 28 23:45:26 2004
// console.log(d.toLocaleDateString());   // -> 02/28/2004
// console.log(d.toLocaleTimeString());   // -> 23:45:26

// var date = new Date();
// var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
// var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
@Injectable({
  providedIn: 'root'
})
export class ReportDateHelpersService {

  dateSeries = [];
  currentYear = '';
  foward: boolean;

  monthSeries = [];
  currentMonth = '';

  private _dateRange    = new BehaviorSubject<IDateRange>(null);
  public  dateRange$    = this._dateRange.asObservable();

  updateDateRange(item: IDateRange) {
    this._dateRange.next(item)
  }

  constructor(private datePipe: DatePipe) {}

  displayCurrentMonth() {
    this.currentMonth = this.datePipe.transform(
      this.getFirstDayCurrentMonth(),
      'MM/dd/yyyy'
    );
  }

  displayLast10Months() {
    this.monthSeries = this.getXLastMonths(10);
  }

  getCurrentDay() {
    var d = new Date().toLocaleDateString()
    return this.datePipe.transform(d, 'MM/dd/yyyy');
  }

  getXLastYears(number: number) {
    const year = this.getCurrentYear();
    return this.getYearSeries(year, number, false);
  }

  getCurrentYear() {
    var d = new Date(new Date().getFullYear(), 0, 1);
    return this.datePipe.transform(d, 'yyy');
  }

  getYearSeries(
    rangeStarting: string,
    count: number,
    foward: boolean
  ): string[] {
    const series = [];
    for (let i = 1; i < count; i += 1) {
      let period = i;
      if (foward) {
        let period = +rangeStarting + i;
        series.push(period);
      }
      if (!foward) {
        let period = +rangeStarting - i;
        series.push(period);
      }
    }
    return series;
  }

  getXLastMonths(number: number) {
    const month = this.getFirstDayCurrentMonth();
    return this.getMonthSeries(month, number, false);
  }

  // var month = 0; // January
  // var d = new Date(2008, month + 1, 0);
  // console.log(d.toString()); // last day in January
  getFirstDayCurrentMonth() {
    return this.getFirstDayOfMonthFromCurrentMonth(1)
  }

  getFirstDayOfMonthFromCurrentMonth(value) {
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth() +value, 1);
  }

  getLastDayofCurrentMonth() {
    return this.getLastDayOfMonthFromCurrentMonth(1)
  }

  getLastDayOfMonthFromCurrentMonth(value) {
    var today = new Date();
    return new Date(today.getFullYear(), today.getMonth() + value, 0);
  }

  getMonthSeries(dateStarting: Date, count: number, foward: boolean): string[] {
    const series = [];
    const month = this.getMonthString(dateStarting);
    series.push(month);
    for (let i = 1; i < count; i += 1) {
      let y = i;
      if (!foward) {
        y = -i;
      }
      let newDate = new Date(
        dateStarting.setMonth(dateStarting.getMonth() + y)
      );
      let month = this.getMonthString(newDate);
      series.push(month);
    }
    return series;
  }

  getMonthString(month: Date): string {
    return this.datePipe.transform(month, 'MM/01/yyyy');
  }

  getLastMonthInSeries(dateStarting: Date, count: number, foward: boolean): string {
    const month = this.getMonthString(dateStarting);
    if (!foward) { count = -count }
    let firstDate = new Date(
        dateStarting.setMonth(dateStarting.getMonth() + count));
    return this.getMonthString(firstDate);
  }

  getLastWeekInSeries(dateStarting: Date, count: number, foward: boolean): string {
    const month = this.getMonthString(dateStarting);
    let firstDate = new Date(
        dateStarting.setMonth(dateStarting.getMonth() + count));
    return this.getMonthString(firstDate);
  }

  getLastYearInSeries(dateStarting: Date, count: number, foward: boolean): string {
    const month = this.getMonthString(dateStarting);
    if (!foward) { count = -count }
    let firstDate = new Date(
        dateStarting.setMonth(dateStarting.getMonth() + count));
    return this.getMonthString(firstDate);
  }
}

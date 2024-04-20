import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { EmployeeClockSearchModel, EmployeeClockService } from 'src/app/_services/employeeClock/employee-clock.service';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'employee-clock-filter',
  templateUrl: './employee-clock-filter.component.html',
  styleUrls: ['./employee-clock-filter.component.scss']
})
export class EmployeeClockFilterComponent implements OnInit {

  @Output() outputRefreshSearch :   EventEmitter<any> = new EventEmitter();

  pageSize = 100;
  dateRangeForm: UntypedFormGroup;
  dateTo: string;
  dateFrom: string;
  employees$       :   Observable<IItemBasic[]>;
  employeeID: number;
  orderBy: string

  constructor(
    private dateHelper: DateHelperService,
    private orderService    : OrdersService,
    private siteService     : SitesService,
    private employeeService: EmployeeService,
    private employeeClockService: EmployeeClockService,
    private router: Router,
            private fb: UntypedFormBuilder,
            ) { }

  ngOnInit(): void {
    const i = 0;
    const site           = this.siteService.getAssignedSite();
    this.initDateForm();
    this.emitSearchResults();
    this.employees$      = this.employeeService.getAllActiveEmployees(site);
  }

  initDateForm() {
    let today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    // today = new Date(today.getTime() + (1000 * 60 * 60 * 24));
    let endDate = this.dateHelper.add('day', 1 ,today)

    this.dateFrom = today.toDateString();
    this.dateTo = endDate.toDateString();

    this.dateRangeForm =  this.fb.group({
      start: today,
      end  : endDate // new Date()
    })
    this.subscribeToDatePicker();
  }

  subscribeToDatePicker()  {
    if (this.dateRangeForm) {
      this.dateRangeForm.get('start').valueChanges.subscribe(res=>{
        if (!res) {return}
        this.dateFrom = res //this.dateRangeForm.get("start").value
      })

      this.dateRangeForm.get('end').valueChanges.subscribe(res=>{
        if (!res) {return}
        this.dateTo = res
      })

      this.dateRangeForm.valueChanges.subscribe( res => {
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo = this.dateRangeForm.get("end").value
        if (this.dateTo ='')
        if (this.dateRangeForm.get("start").value && this.dateRangeForm.get("end").value) {
          this.refreshSearch()
        }
      })
    }
  }

  getSearch() {
    if (this.dateTo === '12/31/1969') { return }

    const dateTo = this.dateHelper.format(this.dateTo, 'MM/dd/yyyy');

    console.log('dateFrom, DateTo', dateTo , this.dateTo)
    if (dateTo === '12/31/1969') { return }

    return  { summary: false,
      pageSize: this.pageSize,
      employeeID:  this.employeeID,
      startDate: this.dateFrom,
      endDate: this.dateTo,
      orderBy: this.orderBy
    }
  }

  refreshSearch() {
    const search = this.getSearch() as EmployeeClockSearchModel
    if (!search) { return }
    this.employeeClockService.updateSearch(search)
    // this.outputRefreshSearch.emit(
    //   this.getSearch()
    // );
  }

  reset() {
    const search = {} as EmployeeClockSearchModel
    this.employeeClockService.updateSearch(search)
    // this.outputRefreshSearch.emit(
    //   this.getSearch()
    // );
  }

  emitDatePickerData(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    // console.log(this.dateRangeForm.value);
    if (dateRangeStart && dateRangeEnd) {
      // if (!this.dateRangeForm.get("start").value || !this.dateRangeForm.get("end").value) {
        // this.dateFrom = dateRangeStart.value //this.dateRangeForm.get("start").value
        // this.dateTo   = dateRangeEnd.value //this.dateRangeForm.get("end").value
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo   = this.dateRangeForm.get("end").value
        this.refreshSearch()
      // }
    }
  }

  emitSearchResults() {
    this.refreshSearch()
  }

  setEmployee(event) {
    console.log('event', event)
    if (!event) { return }
    this.employeeID  = event.id
    this.refreshSearch()
  }

  breakListEdit() {
    this.router.navigate(['break-types'])
  }

  listResults() {
    this.outputRefreshSearch.emit({ summary: false, pageSize: this.pageSize, employeeID:  this.employeeID, startDate: this.dateFrom, endDate: this.dateTo });
  }

  getSummary() {
    this.outputRefreshSearch.emit({ summary: true, pageSize: this.pageSize, employeeID:  this.employeeID, startDate: this.dateFrom, endDate: this.dateTo });
  }
}

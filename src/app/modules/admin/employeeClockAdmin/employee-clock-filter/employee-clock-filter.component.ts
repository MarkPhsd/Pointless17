import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IItemBasic, OrdersService } from 'src/app/_services';
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

  pageSize = 25;
  dateRangeForm: UntypedFormGroup;
  dateTo: string;
  dateFrom: string;
  employees$       :   Observable<IItemBasic[]>;
  employeeID: number;

  constructor(
    private dateHelper: DateHelperService,
    private orderService    : OrdersService,
    private siteService     : SitesService,
    private employeeService: EmployeeService,
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
        if (this.dateRangeForm.get("start").value && this.dateRangeForm.get("end").value) {
          this.refreshSearch()
        }
      })
    }
  }

  refreshSearch() {
    this.outputRefreshSearch.emit(
      { summary: false,
        pageSize: this.pageSize,
        employeeID:  this.employeeID,
        startDate: this.dateFrom,
        endDate: this.dateTo
      }
    );
  }

  reset() {
    this.outputRefreshSearch.emit(
      { summary: false,
        pageSize: this.pageSize,
        employeeID:  0,
        startDate: this.dateFrom,
        endDate: this.dateTo
      }
    );
  }

  emitDatePickerData(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {
    console.log(this.dateRangeForm.value);
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

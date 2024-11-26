import { CommonModule } from '@angular/common';
import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { EmployeeClockSearchModel, EmployeeClockService } from 'src/app/_services/employeeClock/employee-clock.service';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatToggleSelectorComponent } from 'src/app/shared/widgets/mat-toggle-selector/mat-toggle-selector.component';

@Component({
  selector: 'employee-clock-filter',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,
            FormsModule,ReactiveFormsModule,
            MatToggleSelectorComponent,
            SharedPipesModule],
  templateUrl: './employee-clock-filter.component.html',
  styleUrls: ['./employee-clock-filter.component.scss']
})
export class EmployeeClockFilterComponent implements OnInit {

  @Output() outputRefreshSearch :   EventEmitter<any> = new EventEmitter();
  toggleID: number = 0
  pageSize = 100;
  dateRangeForm: UntypedFormGroup;
  dateTo: string;
  dateFrom: string;
  employees$       :   Observable<IItemBasic[]>;
  employeeID: number;
  orderBy: string
  dates: Date[] = [];

  constructor(
    private dateHelper: DateHelperService,
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

  toggleView(id) {
    if (id == 1) {
      this.toggleID = 0;
      return
    }
    this.toggleID  =1
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
  }

  reset() {
    const search = {} as EmployeeClockSearchModel;

    this.employeeClockService.updateSearch(search)
  }

  emitDatePickerData(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {

    if (dateRangeStart && dateRangeEnd) {
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo   = this.dateRangeForm.get("end").value
        if (this.dateFrom && this.dateTo) {
          this.refreshSearch()
          this.refreshDateList(this.dateFrom, this.dateTo)
        }

    }
  }

  refreshDateList(startDate, endDate) {
    if (startDate && endDate) {
      const start = new Date(this.dateHelper.format(startDate, 'medium'))
      const end = new Date(this.dateHelper.format(endDate, 'medium'))
      this.dates = this.dateHelper.getDates(start, end);
    }
  }

  setDate(value) {
    this.dateFrom = value;
    this.dateTo = value;
    if (this.dateFrom && this.dateTo) {
      this.refreshSearch()
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

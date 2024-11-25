import { CommonModule } from '@angular/common';
import { Component, OnInit, EventEmitter, Output, HostListener, Input, OnChanges } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ReportingService,DashboardService,AuthenticationService } from 'src/app/_services';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

export const MY_FORMATS = {
    parse: {
      dateInput: 'LL',
    },
    display: {
      dateInput: 'MM-DD-YYYY',
      monthYearLabel: 'YYYY',
      dateA11yLabel: 'LL',
      monthYearA11yLabel: 'YYYY',
    },
  };

interface IDatePicker {
    reportDateRange: IDaterange
}
interface IDaterange {
    dateFrom: string;
    dateTo: string
}
@Component({
    selector:   'app-widget-filter',
    standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

    SharedPipesModule],
    templateUrl: './filter.component.html',
    styleUrls: [ './filter.component.scss']
  })

export class FilterComponent implements OnInit,OnChanges {
  @Input() dateRangeForm        : UntypedFormGroup;
  dateFrom             : Date;
  dateTo               : Date;
  smallDevice: boolean;

  filterForm: UntypedFormGroup;
  calDate: IDatePicker;
  counter: number;

  @Input() hideRefresh: boolean;
  @Input()  dateRange: string;
  @Output() messageOut = new EventEmitter<string>();
  @Output() counterOut = new EventEmitter<number>();

  @HostListener("window:resize", [])
  updateDateRangeResize() {
    if (!this.dateRange)  { this.initDateForm }
    if (this.dateRangeForm) {
      const dtFrom   = this.dateRangeForm.get("start").value
      const dtTo     = this.dateRangeForm.get("end").value

      if (window.innerWidth >= 768) {
        this.smallDevice = false
      }
      if (window.innerWidth < 768) {
        this.smallDevice = true
      }

      if (!this.dateRange)  { this.initDateForm }
      this.dateRangeForm =  this.fb.group({
        start: [dtFrom],
        end  : [dtTo]
      })

    }

  }

  constructor(
      public fb: UntypedFormBuilder,
      private reportingService: ReportingService,
      )
  {  }

  ngOnInit() {
    this.counter =0;
    this.initDateForm()
    this.setFilterDateToday()
    this.updateDateRangeResize();
    this.subscribeToDatePicker();
  }

  ngOnChanges() {
    this.refreshDateSearch();
  }

  //sets the default dates
  setFilterDateToday() {
    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
  }

  initDateForm() {
    if (!this.dateRangeForm) {
      this.dateRangeForm = new UntypedFormGroup({
        start: new UntypedFormControl(),
        end: new UntypedFormControl()
      });
    }

    let today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();
    today = new Date(today.getTime() + (1000 * 60 * 60 * 24));
    this.dateRangeForm =  this.fb.group({
      start: new Date(year, month, 1),
      end: today // new Date()
    })
    this.dateRangeForm =  this.fb.group({
      start: [],
      end: [], // new Date()
    })
    // this.subscribeToDatePicker()
  }

  subscribeToDatePicker()
    {
      if (this.dateRangeForm) {
        this.dateRangeForm.valueChanges.subscribe( res => {
          console.log('changed')
          if (this.dateRangeForm.get("start").value &&
              this.dateRangeForm.get("end").value) {
              console.log('refreshed')
            this.setData()
          }
        })
      }
    }


    refreshDateSearch() {
      if (this.dateRangeForm && this.dateRangeForm.get("start").value &&
          this.dateRangeForm.get("end").value) {
        this.setData()
       }
    }

    setData() {
      this.dateFrom = this.dateRangeForm.get("start").value
      this.dateTo   = this.dateRangeForm.get("end").value
      this.counter =  1 + this.counter;

      this.messageOut.emit( this.dateFrom.toLocaleDateString() + ":" + this.dateTo.toLocaleDateString() + ':' + this.counter );
    }
}

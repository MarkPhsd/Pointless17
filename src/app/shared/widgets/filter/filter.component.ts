import { Component, OnInit, EventEmitter, Output, HostListener, Input } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ReportingService,DashboardService,AuthenticationService } from 'src/app/_services';

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
    templateUrl: './filter.component.html',
    styleUrls: [ './filter.component.scss']
  })

export class FilterComponent implements OnInit {
  dateRangeForm        : FormGroup;
  dateFrom             : Date;
  dateTo               : Date;
  smallDevice: boolean;

  filterForm: FormGroup;
  calDate: IDatePicker;
  counter: number;


  @Input()  dateRange: string;
  @Output() messageOut = new EventEmitter<string>();
  @Output() counterOut = new EventEmitter<number>();

  @HostListener("window:resize", [])
  updateItemsPerPage() {

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
        end  : [dtTo] // new Date()
      })

    }

  }

  constructor(
      public fb: FormBuilder,
      private reportingService: ReportingService,
      )
  {

  }


  ngOnInit() {
    this.counter =0;

    // if (this.dateRange) {
    //   this.initDateForm();
    //   //filt out some time.
    //   return
    // }
    this.setFilterDateToday()

    this.updateItemsPerPage();
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

    async initDateForm() {

      this.dateRangeForm = new FormGroup({
        start: new FormControl(),
        end: new FormControl()
      });

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

      this.subscribeToDatePicker();

    }

    subscribeToDatePicker()
    {
      if (this.dateRangeForm) {
        this.dateRangeForm.get('start').valueChanges.subscribe(res=>{
          if (!res) {return}
          this.dateFrom = res //this.dateRangeForm.get("start").value
        })

        this.dateRangeForm.get('end').valueChanges.subscribe(res=>{
          if (!res) {return}
          this.dateTo = res
        })

        this.dateRangeForm.valueChanges.subscribe(res=>{
          if (this.dateRangeForm.get("start").value && this.dateRangeForm.get("end").value) {
            // this.refreshDateSearch()
          }
        })
      }
    }


    refreshDateSearch() {
      if (this.dateRangeForm && this.dateRangeForm.get("start").value && this.dateRangeForm.get("end").value) {
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo   = this.dateRangeForm.get("end").value
        this.counter =  1 + this.counter
        this.messageOut.emit( this.dateFrom.toLocaleDateString() + ":" + this.dateTo.toLocaleDateString() + ':' + this.counter );
      }
    }
}

import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild, OnInit, AfterViewInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import dayjs from 'dayjs/esm';
import { DaterangepickerDirective } from 'ngx-daterangepicker-material';
// import { DaterangepickerDirective } from 'ngx-daterangepicker-material/daterangepicker.directive';
import { AuthenticationService } from 'src/app/_services';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
// import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

// {
//   format: 'MM/DD/YYYY', // could be 'YYYY-MM-DDTHH:mm:ss.SSSSZ'
//   displayFormat: 'MM/DD/YYYY', // default is format value
//   direction: 'ltr', // could be rtl
//   weekLabel: 'W',
//   separator: ' To ', // default is ' - '
//   cancelLabel: 'Cancel', // detault is 'Cancel'
//   applyLabel: 'Okay', // detault is 'Apply'
//   clearLabel: 'Clear', // detault is 'Clear'
//   customRangeLabel: 'Custom range',
//   daysOfWeek: dayjs.weekdaysMin(),
//   monthNames: dayjs.monthsShort(),
//   firstDay: 1 // first day is monday
// }

@Component({
  selector: 'mat-date-range',
  templateUrl: './mat-date-range.component.html',
  styleUrls: ['./mat-date-range.component.scss']
})
export class MatDateRangeComponent implements OnInit, AfterViewInit{
  @ViewChild(DaterangepickerDirective, { static: false }) pickerDirective: DaterangepickerDirective;

  @ViewChild('desktopTemplate') desktopTemplate: TemplateRef<any>;
  @ViewChild('touchTemplate') touchTemplate: TemplateRef<any>;
  @ViewChild('nextPreviousTemplate') nextPreviousTemplate: TemplateRef<any>;
  @ViewChild('nextPreviousTemplateGroup') nextPreviousTemplateGroup: TemplateRef<any>;
  @Input() buttonViewEnabled: boolean = false;
  @Input() inputForm: UntypedFormGroup;
  @Output() outputDateRange  = new EventEmitter();

  @Input() hideRefresh: boolean;
  @Input() autoRefresh: boolean;
  selected: {startDate: any, endDate: any};
  // selected: {startDate: Dayjs, endDate: Dayjs};
  model

  ranges: any = {
    'Today': [dayjs(), dayjs()],
    'Yesterday': [dayjs().subtract(1, 'days'), dayjs().subtract(1, 'days')],
    'Last 7 Days': [dayjs().subtract(6, 'days'), dayjs()],
    'Last 30 Days': [dayjs().subtract(29, 'days'), dayjs()],
    'This Month': [dayjs().startOf('month'), dayjs().endOf('month')],
    'Last Month': [dayjs().subtract(1, 'month').startOf('month'), dayjs().subtract(1, 'month').endOf('month')]
  }

  constructor(
    private dateHelperService: DateHelperService,
    public authService: AuthenticationService) {

    }

  ngOnInit() {
    if (this.autoRefresh) {
      this.emitDatePickerData()
    }
  }

  openDatepicker() {
    // this.pickerDirective.open();
  }

  ngAfterViewInit() {
    if (this.autoRefresh) {
      setTimeout(() => {
        this.emitDatePickerData()
      }, 150);

    }
  }

  get buttonView() {
    if (this.buttonViewEnabled) {
      return this.nextPreviousTemplateGroup
    }
    return null;
  }

  emitDatePickerData() {
    this.outputDateRange.emit(true)
  }

  get magPickerView() {
    if (this.authService.deviceInfo && (this.authService.deviceInfo.smallDevice ||
                                        this.authService.deviceInfo.phoneDevice)) {
      return this.touchTemplate
    }
    return this.desktopTemplate
  }

  moveDate(value: number) {
    let startDate = this.inputForm.get('start').value ? new Date(this.inputForm.get('start').value) : new Date();
    let endDate = this.inputForm.get('end').value ? new Date(this.inputForm.get('end').value) : new Date();

    if (value === 1) {
      // Move to next day
      startDate = this.dateHelperService.add('day', 1, startDate);
      endDate = this.dateHelperService.add('day', 1, endDate);
    } else if (value === -1) {
      // Move to previous day
      startDate = this.dateHelperService.add('day', -1, startDate);
      endDate = this.dateHelperService.add('day', -1, endDate);
    } else if (value === 0) {
      // Set to today
      startDate = new Date();
      endDate = new Date();
    }

    // Update the form with the new dates
    this.inputForm.setValue({
      start: startDate,
      end: endDate
    });

    // Optionally emit data after date change
    this.emitDatePickerData();
  }

  selectedRange(event) {
    console.log(event)
  }

  datesUpdated (event) {
    console.log(event)
  }

  rangeClicked (event) {
    console.log(event)
  }
}


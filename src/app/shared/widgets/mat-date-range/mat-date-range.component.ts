import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';

@Component({
  selector: 'mat-date-range',
  templateUrl: './mat-date-range.component.html',
  styleUrls: ['./mat-date-range.component.scss']
})
export class MatDateRangeComponent {

  @ViewChild('desktopTemplate') desktopTemplate: TemplateRef<any>;
  @ViewChild('touchTemplate') touchTemplate: TemplateRef<any>;
  @ViewChild('nextPreviousTemplate') nextPreviousTemplate: TemplateRef<any>;
  @Input() buttonViewEnabled: boolean = false;
  @Input() inputForm: UntypedFormGroup;
  @Output() outputDateRange  = new EventEmitter();
  @Input() hideRefresh: boolean;

  constructor(
    private dateHelperService: DateHelperService,
    public authService: AuthenticationService) { }

  get buttonView() {
    if (this.buttonViewEnabled) {
      return this.nextPreviousTemplate
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
}


import { Component, Input, Output, EventEmitter, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AuthenticationService } from 'src/app/_services';

@Component({
  selector: 'mat-date-range',
  templateUrl: './mat-date-range.component.html',
  styleUrls: ['./mat-date-range.component.scss']
})
export class MatDateRangeComponent {

  @ViewChild('desktopTemplate') desktopTemplate: TemplateRef<any>;
  @ViewChild('touchTemplate') touchTemplate: TemplateRef<any>;

  @Input() inputForm: UntypedFormGroup;
  @Output() outputDateRange  = new EventEmitter();
  @Input() hideRefresh: boolean;

  constructor(public authService: AuthenticationService) { }

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

}

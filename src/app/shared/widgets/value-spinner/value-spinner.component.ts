
import { Component, OnInit, Input } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-value-spinner',
  templateUrl: './value-spinner.component.html',
  styleUrls: ['./value-spinner.component.scss']
})
export class ValueSpinnerComponent {

  @Input() value      : any;
  finalValue : number;
  @Input() description: any;
  @Input() spinnerMode = 'determiniate';
  @Input() spinnerText = 'spinner-text';
  @Input() class       =       'spinner-text';
  @Input() color       =       'accent';
  @Input() colorTrack  = 'accent'
  platformName:string;

  constructor(
    private  platform: Platform,
  ) {
    this.spinnerText = 'spinner-text'
    if (this.platform.ANDROID)
    {
      this.spinnerText = 'spinner-text-android'
      this.platformName = 'android'
    }

    this.timeOutSpinner();
  }

  timeOutSpinner() {
    setTimeout( () => {
      this.finalValue = this.value
    }, 500)
   }


}

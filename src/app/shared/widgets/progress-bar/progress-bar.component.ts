import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-progress-bar',
  templateUrl: './progress-bar.component.html',
  styleUrls: ['./progress-bar.component.scss']
})
export class ProgressBarComponent implements OnInit  {

  @Input() value: number;
  @Input() percentage: number;
  @Input() ratio = 100;
  percentageValue: number;

  constructor () {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this.ratio = 0) {
      this.ratio = 28;
    }
    this.percentageValue = parseInt((this.value / this.ratio).toFixed(0))
  }

  ngOnInit(): void {
    console.log('')
  }
}

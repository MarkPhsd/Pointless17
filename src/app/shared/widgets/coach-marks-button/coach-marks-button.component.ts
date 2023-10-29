import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'coach-marks-button',
  templateUrl: './coach-marks-button.component.html',
  styleUrls: ['./coach-marks-button.component.scss']
})
export class CoachMarksButtonComponent implements OnInit {

  @Input() enabled: boolean;
  @Output() initPopOver = new EventEmitter();
  constructor() { }

  ngOnInit(): void {
  }

  initPopOverEvent() {
    this.initPopOver.emit(true)
  }
}


import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';

@Component({
  selector: 'coach-marks-button',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,],
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


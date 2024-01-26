import { Component, Input, OnInit,Output, EventEmitter } from '@angular/core';
import { EmployeeClock } from 'src/app/_interfaces/people/employeeClock';


@Component({
  selector: 'clock-print-view',
  templateUrl: './clock-view.component.html',
  styleUrls: ['./clock-view.component.scss']
})
export class ClockViewComponent implements OnInit {

  @Output() renderComplete = new EventEmitter()
  @Input() clock: EmployeeClock;

  ngOnInit(): void {
    setTimeout(() => {
      this.renderComplete.emit('CLock')
    }, 500);


  }

}

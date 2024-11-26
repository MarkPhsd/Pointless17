import { CommonModule } from '@angular/common';
import { Component, Input, OnInit,Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { EmployeeClock } from 'src/app/_interfaces/people/employeeClock';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';


@Component({
  selector: 'clock-print-view',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './clock-view.component.html',
  styleUrls: ['./clock-view.component.scss']
})
export class ClockViewComponent implements OnInit {

  @Output() renderComplete = new EventEmitter()
  @Input() clock: EmployeeClock;

  constructor(
    public dateHelper: DateHelperService,
  ) {

  }

  ngOnInit(): void {
    setTimeout(() => {
      this.renderComplete.emit('CLock')
    }, 500);
  }

  getTimeInMinutes(startTime: string, endTime: string) {
    if (startTime && endTime) {
      // return this.dateHelper.diff("minute", startTime,endTime)
      let diffInMinutes = this.dateHelper.diff("minute", startTime, endTime);
      return  Math.ceil(diffInMinutes);
    }
    return 0;
  }

}

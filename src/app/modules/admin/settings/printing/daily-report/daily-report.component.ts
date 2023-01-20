import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-daily-report',
  templateUrl: './daily-report.component.html',
  styleUrls: ['./daily-report.component.scss']
})
export class DailyReportComponent implements OnInit {


  dateFrom: any;
  dateTo  : any;

  constructor() { }

  ngOnInit(): void {
    const i = 0;
  }

}

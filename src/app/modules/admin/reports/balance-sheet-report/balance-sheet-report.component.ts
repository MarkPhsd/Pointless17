import { Component, Input,  OnInit } from '@angular/core';
import { Observable, Subject, of, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BalanceSheetSearchModel, BalanceSheetService, IBalanceSheet, IBalanceSheetPagedResults } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'balance-sheet-report',
  templateUrl: './balance-sheet-report.component.html',
  styleUrls: ['./balance-sheet-report.component.scss']
})
export class BalanceSheetReportComponent implements OnInit {

  @Input() type    : string;
  @Input() site    : ISite;
  @Input() dateTo  : string;
  @Input() dateFrom: string;
  @Input() notifier: Subject<boolean>
  @Input() groupBy = "employee"
  @Input() zrunID  : string;

  sheets$ : Observable<IBalanceSheetPagedResults>;

  constructor(private balanceSheetService : BalanceSheetService,
              private siteSevice: SitesService) { }

  ngOnInit(): void {


  }
  ngOnChanges() {
    this.refreshData();
  }

  refreshData() {
    const i = 0;
    const search = {} as BalanceSheetSearchModel;
    const site = this.siteSevice.getAssignedSite()
    if (this.zrunID){
      search.zRunID = +this.zrunID
    }
    if (this.dateFrom && this.dateTo) {
      search.completionDate_From = this.dateFrom;
      search.completionDate_To = this.dateTo;
    }
    console.log('search', search)
    this.sheets$ = this.balanceSheetService.searchBalanceSheets(site, search).pipe(
      switchMap(data => {
         return  of(data)
      }
    ))
  }

}


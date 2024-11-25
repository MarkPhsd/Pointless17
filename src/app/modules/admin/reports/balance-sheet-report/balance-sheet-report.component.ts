import { CommonModule } from '@angular/common';
import { Component, Input,  OnInit } from '@angular/core';
import { Observable, Subject, of, switchMap } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { ReportingItemsSalesService } from 'src/app/_services/reporting/reporting-items-sales.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BalanceSheetOptimized, BalanceSheetSearchModel, BalanceSheetService, IBalanceSheet, IBalanceSheetPagedResults } from 'src/app/_services/transactions/balance-sheet.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'balance-sheet-report',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
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
  @Input() autoPrint: boolean = false;
  showAll : boolean;
  sheets$ : Observable<IBalanceSheetPagedResults>;
  sheets : IBalanceSheetPagedResults;

  constructor(private balanceSheetService : BalanceSheetService,
              private reportingItemsSalesService: ReportingItemsSalesService,
              private popOutService: ProductEditButtonService,
              private siteSevice: SitesService) { }

  ngOnInit(): void {


  }
  ngOnChanges() {
    this.refreshData();
  }

  refreshData() {
    const i = 0;
    const search = {} as BalanceSheetSearchModel;
    let site : ISite;
    if (this.site) {
      site = this.site
    }

    if (!site) {
      site = this.siteSevice.getAssignedSite()
    }

    if (this.zrunID){
      search.zRunID = +this.zrunID
    }

    if (this.dateFrom && this.dateTo) {
      search.completionDate_From = this.dateFrom;
      search.completionDate_To = this.dateTo;
      search.zRunID = null;
      search.balanceSheetStatus = 2
    }

    this.sheets$ = this.balanceSheetService.searchBalanceSheets(site, search).pipe(
      switchMap(data => {
          this.sheets = data;
         return  of(data)
      }
    ))

  }


  togglesShowAll() {
    this.showAll = !this.showAll;
  }

  downloadCSV() {
    if (this.sheets) {
      this.reportingItemsSalesService.downloadFile(this.sheets.results, 'ItemReport')
    }
  }

  dataGridView() {
    this.popOutService.openDynamicGrid(
      {data: this.sheets, name: 'BalanceSheetOptimized'}
    )
  }

}


import { Component, OnInit , Input} from '@angular/core';
import { Observable } from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { BalanceSheetService } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'balance-sheet-employee-sales',
  templateUrl: './balance-sheet-employee-sales.component.html',
  styleUrls: ['./balance-sheet-employee-sales.component.scss']
})
export class BalanceSheetEmployeeSalesComponent implements OnInit {

  @Input() id: number;
  action$: Observable<any>;

  constructor(
          private siteService             :  SitesService,
          private balanceSheetService     :  BalanceSheetService,
                    ) { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();
    if (this.id) {
      this.action$ = this.balanceSheetService.getUsersOfBalanceSheet(site, this.id)
    }
  }

}

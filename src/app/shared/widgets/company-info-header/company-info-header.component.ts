import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ICompany } from 'src/app/_interfaces';
import { CompanyService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-company-info-header',
  templateUrl: './company-info-header.component.html',
  styleUrls: ['./company-info-header.component.scss']
})
export class CompanyInfoHeaderComponent implements OnInit {

  company$ : Observable<ICompany>;
  @Input()  isUser: boolean;
  constructor(private companyInfoService: CompanyService,
             private siteService: SitesService,) { }

  ngOnInit(): void {
    const site    = this.siteService.getAssignedSite();
    this.company$ = this.companyInfoService.getCompany(site)
  }

}

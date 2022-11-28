import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CompanyService, AWSBucketService} from 'src/app/_services';
import { ICompany }  from 'src/app/_interfaces';
import { environment } from 'src/environments/environment';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-page-not-found',
  templateUrl: './page-not-found.component.html',
  styleUrls: ['./page-not-found.component.scss']
})
export class PageNotFoundComponent implements OnInit {
  compName: string;
  company = {} as ICompany;
  logo: string;

  constructor(
    private router : Router,
    private sitesService: SitesService,
    private companyService: CompanyService,
    private awsBucketService: AWSBucketService,) { }

  ngOnInit() {

    this.initCompanyInfo()
  }

  initCompanyInfo() {
    this.getCompanyInfo();

    if (this.company === undefined) {
    } else {
      this.compName = this.company.compName
    }
    this.logo = `${environment.logo}`
    this.compName = `${environment.company}`
    this.awsBucketService.getBucket()
  }

  getCompanyInfo() {
    try {
        const site = this.sitesService.getAssignedSite();
        this.companyService.getCompany(site).subscribe(data =>
        {
          this.company  = data
          localStorage.setItem('company/compName', JSON.stringify(this.company.compName))
          localStorage.setItem('company/phone', JSON.stringify(this.company.phone))
          localStorage.setItem('company/address', JSON.stringify(this.company.compAddress1))
        }, error  => {
        }
      );

    } catch (error) {

    }
  }

  goBack() {
    this.router.navigateByUrl('app-main-menu')
  }

}

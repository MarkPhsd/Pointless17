import { Component,  Input, OnInit, ViewChild } from '@angular/core';
import { ISite, IUserProfile }  from 'src/app/_interfaces';
import { AuthenticationService, DashboardService, ReportingService, UserService} from 'src/app/_services';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-sites',
  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss'],
})

export class SitesComponent implements OnInit {

  TableData: any[];

  displayedColumns: string[] = ['Name',  'status'];

  sites: ISite[] = [];
  dataSource:  MatTableDataSource<ISite>;W

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
              private  reportingService: ReportingService,
              private sitesService: SitesService,
              ) {

    }
  ngOnInit(): void {
    this.refreshComponent();
  }

  refreshComponent() {

    this.sitesService.getSites().subscribe(data =>
      {
        this.sites = data
        this.dataSource = new MatTableDataSource<ISite>(this.sites);

        for (let site of this.sites) {

          this.reportingService.getSiteStatus(site).subscribe(

            values => {
                site.status = "ok"
            },
              error => {
               site.status = error
            }

          )
        }
      }
    )
  }
}

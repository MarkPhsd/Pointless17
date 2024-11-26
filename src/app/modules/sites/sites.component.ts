import { Component, OnInit, ViewChild } from '@angular/core';
import { ISite }  from 'src/app/_interfaces';
import { ReportingService} from 'src/app/_services';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-sites',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './sites.component.html',
  styleUrls: ['./sites.component.scss'],
})

export class SitesComponent implements OnInit {

  TableData: any[];

  displayedColumns: string[] = ['Name',  'status', 'storeID'];

  sites: ISite[] = [];
  dataSource:  MatTableDataSource<ISite>;W

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor(
              private  reportingService: ReportingService,
              private sitesService: SitesService,
              private router: Router,
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

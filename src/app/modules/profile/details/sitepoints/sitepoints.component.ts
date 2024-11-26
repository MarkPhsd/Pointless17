import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { UserService,ReportingService } from 'src/app/_services';
import { ISite,IUser, IUserProfile}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-sitepoints',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './sitepoints.component.html',
  styleUrls: ['./sitepoints.component.scss']
})
export class SitepointsComponent implements OnInit {
  TableData: any[];

  displayedColumns: string[] = ['Name',  'status'];

  sites: ISite[] = [];
  dataSource:  MatTableDataSource<ISite>;
  @Input() user = {} as IUserProfile;

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;

  constructor( private sitesService: SitesService,  private userService: UserService) { }

  ngOnInit(): void {
    this.refreshComponent();
  }

  refreshComponent()
  {

    let user: IUserProfile;
    this.sites = [];
    this.sitesService.getSites().subscribe(data =>
      {
        this.sites = data
        for (let site of this.sites) {
          this.userService.getRemoteProfile(site).subscribe(

            values => {
                user = values
                if (user) {
                  if (user.loyaltyPoints) {
                    site.userLoyaltyPoints = user.loyaltyPoints;
                  }
                  if (site.userLoyaltyPoints) {
                    site.status = site.userLoyaltyPoints.toString();
                  }
                }
              },
              error => {
                site.status = "Site offline"
              }
            )
          }
        }
      )

      this.dataSource = new MatTableDataSource<ISite>(this.sites);
  }
}

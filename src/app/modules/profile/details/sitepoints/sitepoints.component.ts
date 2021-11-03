import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { UserService,ReportingService } from 'src/app/_services';
import { ISite,IUser, IUserProfile}  from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-sitepoints',
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
                site.userLoyaltyPoints = user.loyaltyPoints;
                site.status = site.userLoyaltyPoints.toString();
              },
              error => {
               //console.log("error" ,error)
               site.status = "Site offline"
              }

            )
          }
        }
      )

      this.dataSource = new MatTableDataSource<ISite>(this.sites);
  }
}

import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-department-menu',
  templateUrl: './department-menu.component.html',
  styleUrls: ['./department-menu.component.scss']
})
export class DepartmentMenuComponent implements OnInit {
  id: any;
  departments$: any;
  textLength: 20;
  bucketName: string;

  constructor(
    private router            : Router,
    public route              : ActivatedRoute,
    private menuService:        MenuService,
    private siteService:        SitesService,
    private awsBucketService  : AWSBucketService,
  ) { }

  async  ngOnInit() {
    const i =1
    this.bucketName =   await this.awsBucketService.awsBucket();
    this.initDepartment();
  }

  initDepartment() {
    if ( this.route.snapshot.paramMap.get('id') ) {
      const id = this.route.snapshot.paramMap.get('id');
      this.id = id;
      console.log(id)
      const site = this.siteService.getAssignedSite();
      this.departments$ = this.menuService.getGetDepartment(site, id)
    }
  }

  categoryList(event) {
    if (!event) { return }
    this.router.navigate(["/menuitems-infinite/", {categoryID:event.id }]);
  }

  getItem() {

  }

  getItemSrc(imageName) {
    return this.awsBucketService.getImageURLFromNameArray(this.bucketName, imageName)
  }

}

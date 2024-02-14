import { Component, OnInit,Input } from '@angular/core';
import { DisplayMenuService } from 'src/app/_services/menu/display-menu.service';
import {Observable, of, switchMap} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { Router } from '@angular/router';
import { IDisplayMenu } from 'src/app/_interfaces/menu/price-schedule';
@Component({
  selector: 'display-menu-main',
  templateUrl: './display-menu-main.component.html',
  styleUrls: ['./display-menu-main.component.scss']
})
export class DisplayMenuMainComponent implements OnInit {

  action$ : Observable<any>;
  bucket  : string;
  placeHolderImage   : String = this.awsBucket.getPlaceHolderImage()
  menus: IDisplayMenu[];
  @Input() gridItemWidth = '100%'
  @Input() hideLogo: boolean;
  @Input() iconView: boolean;

  style = ''

  constructor(
    private displayMenuService: DisplayMenuService,
    private siteService       : SitesService,
    private awsBucket         : AWSBucketService,
    private router: Router,
  ) { }

  ngOnInit() {
    const i = 0
    const site = this.siteService.getAssignedSite()
    this.action$ = this.getBucket().pipe(
      switchMap(data => {
        this.bucket = data.preassignedURL;
        return this.displayMenuService.getMenus(site);
      })
    ).pipe(
      switchMap(data => {
          if (data) {
            this.menus = data.filter(data => { return data.enabled })
          }
          return of(data)
        }
      )
    )
  }

  getBucket() {
    return this.awsBucket.getAWSBucketObservable().pipe(
      switchMap( data => {
        this.bucket = data.preassignedURL;
        return of(data)
      })
    )
  }

  navMenu(event) {
    this.router.navigate(["/display-menu/", {id: event?.id }]);
  }

  getItemSrc(nameArray: string) {
    return this.awsBucket.getImageURLFromNameArray(this.bucket, nameArray)
  }

  getPlaceHolder() {
    return this.placeHolderImage // this.placeHolderImage
  }
}

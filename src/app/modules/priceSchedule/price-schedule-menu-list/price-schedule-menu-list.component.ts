import { Component, HostListener, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { Observable, of, switchMap } from 'rxjs';
import { PS_SearchResultsPaged,IPriceSearchModel } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Router } from '@angular/router';
import { AWSBucketService } from 'src/app/_services';
@Component({
  selector: 'price-schedule-menu-list',
  templateUrl: './price-schedule-menu-list.component.html',
  styleUrls: ['./price-schedule-menu-list.component.scss']
})
export class PriceScheduleMenuListComponent implements OnInit {

  phoneSize: boolean;
  id: number;
  menus$: Observable<any>;
  menus: IPriceSearchModel[];
  @Input() menuStyle = 'basic';
  bucket$: Observable<any>;
  bucket: string;

  @ViewChild('basicMenu')      basicMenu: TemplateRef<any>;
  @ViewChild('fancyMenu')      fancyMenu: TemplateRef<any>;
  PS_SearchResultsPaged: PS_SearchResultsPaged

  constructor(private priceScheduleService: PriceScheduleService,
              private router: Router,
              private awsBucket: AWSBucketService,
              private siteService  : SitesService,) { }

  ngOnInit(): void {
    const i = 0;
    this.updateScreenSize();
    this.initMenu();
    this.getBucket()
  }

  getBucket() {
    this.bucket$ = this.awsBucket.getAWSBucketObservable().pipe(
      switchMap( data => {
        this.bucket = data.preassignedURL;
        return of(data)
      })
    )
  }

  initMenu() {
    const site = this.siteService.getAssignedSite();
    if (this.menuStyle === 'fancy') {
      this.menus$ = this.priceScheduleService.getSimpleMenuList(site).pipe(switchMap(data => {
        this.menus = data.results.sort((a, b) => (a.sort > b.sort ? 1 : -1));
        return (data.results)
      }))
      return;
    }
    this.menus$ = this.priceScheduleService.getSimpleMenuList(site).pipe(switchMap(data => {
      this.menus = data.results.sort((a, b) => (a.sort > b.sort ? 1 : -1));
      return (data.results)
    }))
  }

  setItem(menu) {
    this.router.navigate(["/price-schedule-menu-items/", {id: menu?.id }]);
  }

  _listItems(event) {
    console.log(event)
    if (this.menuStyle == 'fancy') {
      this.router.navigate(['/app-menu-section/', {id: event} ])
      return;
    }

  }

  _editItem(event) {}
  _nextPage(event) {}

  @HostListener("window:resize", [])
  updateScreenSize() {
    if (window.innerWidth < 399) {
      this.phoneSize = false
    }
    this.phoneSize = false
  }

  get menuList() {
    if (this.menuStyle == 'fancy') {
      return this.fancyMenu
    }
    return this.basicMenu
  }
}

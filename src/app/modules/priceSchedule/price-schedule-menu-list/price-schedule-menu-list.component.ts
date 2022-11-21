import { Component, HostListener, OnInit } from '@angular/core';
import { Observable, switchMap } from 'rxjs';
import { IPriceSchedule, PS_SearchResultsPaged,IPriceSearchModel } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleDataService } from 'src/app/_services/menu/price-schedule-data.service';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Router } from '@angular/router';
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

  PS_SearchResultsPaged: PS_SearchResultsPaged

  constructor(private priceScheduleService: PriceScheduleService,
              private router: Router,
              private siteService  : SitesService,) { }

  ngOnInit(): void {
    const i = 0;
    const site = this.siteService.getAssignedSite();
    this.menus$ = this.priceScheduleService.getSimpleMenuList(site).pipe(switchMap(data => {
      console.log(data.results)
      this.menus = data.results;
      return (data.results)
    }))
  }
  setItem(event) {
    this.router.navigate(["/price-schedule-menu-items/", {id: event?.id }]);
  }

  @HostListener("window:resize", [])
  updateScreenSize() {
    if (window.innerWidth < 768) {
      return
    }
    if (window.innerWidth < 399) {
      this.phoneSize = false
    }
  }

}

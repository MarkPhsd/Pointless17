import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'scheduled-menu-header',
  templateUrl: './scheduled-menu-header.component.html',
  styleUrls: ['./scheduled-menu-header.component.scss']
})
export class ScheduledMenuHeaderComponent implements OnInit {

  @Input() url: string;
  @Input() description: string;
  @Input() name: string;
  @Input() isApp: boolean;
  href : string;
  @Input() priceSchedule: IPriceSchedule;
  @Input() showText: boolean;

  showAllFlag: boolean;
  iconName   = 'expand';
  textShow = 'Show More..'
  @Output() outPutToggleView = new EventEmitter<boolean>();
  gridItemImage= 'grid-item-image'
  gridHeaderApp = 'header-grid';

  constructor(
    private router:          Router,
    private priceScheduleService: PriceScheduleService,
    private siteService: SitesService,
    private titleService: Title) {
    this.href = this.router.url;
  }

  ngOnInit(): void {

    if (this.priceSchedule.type && this.priceSchedule.type != 'menu list') {
      const site = this.siteService.getAssignedSite();
      this.priceScheduleService.getPriceSchedule( site, this.priceSchedule.id).subscribe( data => {
        this.priceSchedule = data;
        this.priceScheduleService.updateItemPriceSchedule(data)
        // data.timeFrameAlways
      })
    }

    if (this.isApp) {
      this.gridItemImage= 'grid-item-image-app'
      this.gridHeaderApp = 'header-grid-app';
    }
    this.setTitle()
  }

  setTitle() {
    if (this.name) {
      if (this.href === '/scheduled-menu') {
        this.titleService.setTitle(this.name)
      }
    }
  }

  toggleMenuItems(event) {
    this.showAllFlag = !this.showAllFlag;
    this.outPutToggleView.emit(this.showAllFlag)
    if (this.showAllFlag)   {
      this.textShow = 'ShowLess..'
      this.iconName = 'minimize'}
    if (!this.showAllFlag)  {
      this.textShow = 'Show More..'
      this.iconName = 'expand'}
  }

}



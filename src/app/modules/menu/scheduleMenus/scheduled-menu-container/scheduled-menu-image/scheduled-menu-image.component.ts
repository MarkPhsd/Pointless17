import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { AWSBucketService } from 'src/app/_services';
import { PriceScheduleService } from 'src/app/_services/menu/price-schedule.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';

@Component({
  selector: 'app-scheduled-menu-image',
  templateUrl: './scheduled-menu-image.component.html',
  styleUrls: ['./scheduled-menu-image.component.scss']
})
export class ScheduledMenuImageComponent implements OnInit {

  @Input() url: string;
  @Input() description: string;
  @Input() name: string;
  @Input() isApp: boolean;
  @Input()  item:                IPriceSchedule;
  @Input() hideButton : boolean;
  href : string;
  // @OutPut() outPutToggleView = new EventEmitter()<any>;
  showAllFlag: boolean;
  iconName   = 'expand';
  textShow = 'Show More..'
  @Output() outPutToggleView = new EventEmitter<boolean>();
  gridItemImage= 'grid-item-image'
  gridHeaderApp = 'header-grid';
  bucket: string;

  constructor(
    private awsBucketService:       AWSBucketService,
    private platFormService:        PlatformService,
    private router:          Router,
    private titleService: Title) {
    this.href = this.router.url;
  }

  async ngOnInit() {
    if (this.isApp) {
      this.gridItemImage= 'grid-item-image-app'
      this.gridHeaderApp = 'header-grid-app';
    }
    this.setTitle()
    await this.getImageUrl();
  }

  async getImageUrl() {
    if (this.url) { return }
    this.isApp = this.platFormService.isApp();
    this.bucket = await this.awsBucketService.awsBucketURL()
    if (this.item && this.item.image && this.bucket) {
      this.url = `${this.bucket}${this.item.image}`
    }
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

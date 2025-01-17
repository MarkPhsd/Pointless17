import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, EventEmitter, Output, OnChanges } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { IPriceSchedule } from 'src/app/_interfaces/menu/price-schedule';
import { AWSBucketService } from 'src/app/_services';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'scheduled-menu-image',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './scheduled-menu-image.component.html',
  styleUrls: ['./scheduled-menu-image.component.scss']
})
export class ScheduledMenuImageComponent implements OnInit, OnChanges {
  // @OutPut() outPutToggleView = new EventEmitter()<any>;

  @Input() url        : string;
  @Input() description: string;
  @Input() name       : string;
  @Input() isApp      : boolean;
  @Input() item:        IPriceSchedule;
  @Input() hideButton : boolean;

  href          : string;

  showAllFlag   : boolean;
  iconName      = 'expand';
  textShow      = 'Show More..'
  @Output() outPutToggleView = new EventEmitter<boolean>();
  gridItemImage = 'grid-item-image'
  gridHeaderApp = 'header-grid';
  bucket        : string;

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
  }

  async ngOnChanges() {
    this.setTitle()
    await this.getImageUrl();
  }

  async getImageUrl() {
    this.url = ''
    if (this.item && this.item.image) {
      this.bucket = await this.awsBucketService.awsBucketURL()
      this.url = `${this.bucket}${this.item.image}`
      return
    }

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

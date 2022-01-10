import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';

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
  // @OutPut() outPutToggleView = new EventEmitter()<any>;
  showAllFlag: boolean;
  iconName   = 'expand';
  textShow = 'Show More..'
  @Output() outPutToggleView = new EventEmitter<boolean>();
  gridItemImage= 'grid-item-image'
  gridHeaderApp = 'header-grid';
  constructor(
    private router:          Router,
    private titleService: Title) {
    this.href = this.router.url;
  }

  ngOnInit(): void {
    console.log('')
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

  toggleMenuItems() {
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


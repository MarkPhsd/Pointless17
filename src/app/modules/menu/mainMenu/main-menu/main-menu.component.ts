import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef } from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ResizedEvent } from 'angular-resize-event';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],

  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent implements OnInit  {

  panelHeightValue = 100;
  panelHeightSize : string;

  @ViewChild('brandView') brandView: TemplateRef<any>;
  @ViewChild('categoryView') categoryView: TemplateRef<any>;
  @ViewChild('departmentView') departmentView: TemplateRef<any>;
  @ViewChild('tierMenuView') tierMenuView: TemplateRef<any>;

  homePageSetings: UIHomePageSettings;
  smoke  = "./assets/video/smoke.mp4"
  isStaff : boolean;

  site: ISite;

  _site: Subscription;
  initSiteSubscriber() {
    this._site = this.siteService.site$.subscribe( data => {
      if (!data) { return }
      if (!this.site) { this.site = data }
      if (this.site.id != data.id) {
        this.reloadComponent();
      }
    })
  }

  constructor(
    private uiSettings: UISettingsService,
    private userAuthorizationService: UserAuthorizationService,
    private siteService: SitesService,
    private router: Router,
  ) {
  }

  setPanelHeight(item: UIHomePageSettings) {
    let value = 0
    if(item.categoriesEnabled) {value = value + 1}
    if(item.departmentsEnabled) {value = value + 1}
    if(item.brandsEnabled) {value = value + 1}
    if (value != 0) {
      const height = (100 / value).toFixed(0);
      this.panelHeightValue  =  +height;
      this.panelHeightSize   = `calc(${height}vh - 65px)`
    }
  }

  ngOnInit(): void {
      this.initSiteSubscriber();
      this.isStaff = false;
      this.isStaff = this.userAuthorizationService.isCurrentUserStaff()
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.
      this.uiSettings.getSetting('UIHomePageSettings').subscribe( data => {
        if (data) {
          this.homePageSetings  = JSON.parse(data.text) as UIHomePageSettings;
          this.setPanelHeight( this.homePageSetings )
        }
        if (!data) {
          this.homePageSetings = {} as UIHomePageSettings
          this.homePageSetings.departmentsEnabled = true;
          this.homePageSetings.categoriesEnabled = true;
          this.homePageSetings.brandsEnabled     = true;
          this.homePageSetings.tierMenuEnabled   = true;
          this.setPanelHeight( this.homePageSetings )
        }
      })
  }

  reloadComponent() {
    let currentUrl = this.router.url;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = 'reload';
    this.router.navigate([currentUrl]);
  }

  get isBrandListViewOn() {

    if ((this.isStaff && this.homePageSetings.staffBrandsEnabled) ||
                  (!this.isStaff && this.homePageSetings.brandsEnabled)){
      return this.brandView
    }
    return null;
  }

  get isTierMenuViewOn() {

    if ((this.isStaff && this.homePageSetings.staffTierMenuEnabled) ||
        (!this.isStaff && this.homePageSetings.tierMenuEnabled)) {
      return this.tierMenuView
    }
    return null;
  }

  get isCategoryViewOn() {

    if ((this.isStaff && this.homePageSetings.staffCategoriesEnabled) ||
        (!this.isStaff && this.homePageSetings.categoriesEnabled)) {
      return this.categoryView
    }
    return null;
  }

  get isDepartmentViewOn() {

    if ((this.isStaff && this.homePageSetings.staffDepartmentsEnabled) ||
        (!this.isStaff && this.homePageSetings.departmentsEnabled)) {
      return this.departmentView
    }
    return null;
  }

}



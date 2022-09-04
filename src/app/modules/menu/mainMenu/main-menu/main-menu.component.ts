import { Component, OnInit, ChangeDetectionStrategy, ViewChild, TemplateRef, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { ISite } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ResizedEvent } from 'angular-resize-event';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import {  MenuService } from 'src/app/_services';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrls: ['./main-menu.component.scss'],

  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainMenuComponent implements OnInit  {

  searchForm: FormGroup;
  panelHeightValue = 100;
  panelHeightSize : string;
  smallDevice =false;

  @ViewChild('brandView') brandView: TemplateRef<any>;
  @ViewChild('categoryView') categoryView: TemplateRef<any>;
  @ViewChild('departmentView') departmentView: TemplateRef<any>;
  @ViewChild('tierMenuView') tierMenuView: TemplateRef<any>;
  @ViewChild('searchSelector') searchSelector: TemplateRef<any>;
  @ViewChild('viewOverlay') viewOverlay: TemplateRef<any>;

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
    private menuService: MenuService,
    private fb: FormBuilder,
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
     this.updateItemsPerPage()
      this.searchForm = this.fb.group( {
        itemName: ''
      })
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


  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if ( window.innerWidth < 811 ) {
      this.smallDevice = true
    }
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

  get isSearchSelectorOn() {
    if (this.smallDevice) {
      return this.searchSelector
    }
    return null;
  }

  isviewOverlayOn() {
    // if (this.smallDevice) {
    //   return this.departmentView
    // }
    return null;
  }

  applyProductSearchModel(itemName: string) : ProductSearchModel {
    let  productSearchModel=  {} as ProductSearchModel
		productSearchModel.type         = null;
		productSearchModel.categoryID   = null;
		productSearchModel.departmentID = null;
		productSearchModel.name         = null;
		productSearchModel.barcode      = null;
		productSearchModel.departmentName = null;
		if (itemName) {
		  productSearchModel.name               =  itemName;
		  productSearchModel.useNameInAllFields = true
		}

		productSearchModel.barcode    = productSearchModel.name
		productSearchModel.pageSize   = 50
		productSearchModel.pageNumber = 1
		this.menuService.updateMeunuItemData(productSearchModel)
		return productSearchModel

  }

  //this is called from subject rxjs obversablve above constructor.
  refreshSearch(itemName) {
    try {
      const site               = this.siteService.getAssignedSite()
      const searchModel        = this.applyProductSearchModel(itemName);
      this.listItems(searchModel)
    } catch (error) {
      console.log('error', error)
    }
  }

  listItems(model: ProductSearchModel) {
    this.router.navigate(
      [
        "/menuitems-infinite", { value: 1}
      ]
    )
  }

}



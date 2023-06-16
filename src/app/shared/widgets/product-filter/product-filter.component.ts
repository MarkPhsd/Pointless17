import { E } from '@angular/cdk/keycodes';
import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import {  UntypedFormGroup } from '@angular/forms';
import {  Observable, Subscription, of, switchMap } from 'rxjs';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { AWSBucketService, MenuService } from 'src/app/_services';
import { UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-product-filter',
  templateUrl: './product-filter.component.html',
  styleUrls: ['./product-filter.component.scss']
})
export class ProductFilterComponent implements OnInit {

  @ViewChild('subcategoryList') subcategoryList : TemplateRef<any>;
  toggleSubCategoryList: boolean;

  @ViewChild('departmentList') departmentList   : TemplateRef<any>;
  toggleDepartmentList: boolean;

  @ViewChild('brandList')      brandList        : TemplateRef<any>;
  toggleBrandList: boolean;

  @ViewChild('categoryList')   categoryList     : TemplateRef<any>;
  toggleCategoryList: boolean;

  @ViewChild('itemTypeList')   itemTypeList     : TemplateRef<any>;
  toggleitemTypeList: boolean;

  @ViewChild('specieslList')   specieslList     : TemplateRef<any>;
  toggleSpeciesList: boolean;

  @ViewChild('colorList')   colorList     : TemplateRef<any>;
  toggleColorList: boolean;

  @ViewChild('gluetenOption')   gluetenOption     : TemplateRef<any>;
  toggleGluetenOption: boolean;

  @ViewChild('sizeList')   sizeList     : TemplateRef<any>;
  toggleSizeList: boolean;
  bucketName: string;
  _searchModel: Subscription;
  searchModel : ProductSearchModel;
  bucket$: Observable<any>;
  gf: boolean;

  inputForm: UntypedFormGroup;
  uiSetting: UIHomePageSettings;
  uiSetting$ =  this.uiSettingService.homePageSetting$.pipe(switchMap(data => {
    if (data) {
      this.uiSetting = data
    }
    return this.awsBucketService.awsBucketURLOBS()
  })).pipe(switchMap(data => {
    this.bucketName = data
    return of(data)
  }))

  initSubscription() {
    this._searchModel = this.menuService.searchModel$.subscribe( model => {
      if (!model) { model = this.menuService.initSearchModel()}
      this.searchModel = model;
      this.searchModel.gf = this.gf;
    })

  }

  constructor(
    private awsBucketService: AWSBucketService,
    public uiSettingService: UISettingsService,
    private menuService: MenuService) { }

  ngOnInit(): void {
    this.initSearchModel();
    this.initSubscription();
  }

  setGF(event) {
    if (!this.searchModel) {
      // this.searchModel = {} as ProductSearchModel;
      this.searchModel = this.menuService.initSearchModel()

      this.gf = false;
    }
    this.searchModel.pageNumber = 1;
    this.searchModel.gf = this.gf
    // console.log('update search modeul set gf', this.searchModel)
    this.menuService.updateSearchFilter(this.searchModel)
  }

  initSearchModel() {
    if (!this.menuService.searchModel) {
      // this.menuService.updateSearchModel(this.searchModel)
    }
  }

  resetSearch() {
    this.searchModel = this.menuService.initSearchModel();
    this.gf = false;
    this.searchModel.gf = false
    this.menuService.updateSearchModel(this.searchModel)
  }

  get toggleItemTypeView() {
    if (this.toggleitemTypeList &&  ( this.uiSetting && this.uiSetting.itemTypeFilter )) {
      return this.itemTypeList
    }
    return null
  }

  get toggleCategoryView() {
    if (this.toggleCategoryList &&  ( this.uiSetting && this.uiSetting.categoryFilter )) {
      return this.categoryList
    }
    return null
  }

  get   toggleSubCategoryView() {
    if (this.toggleSubCategoryList &&  ( this.uiSetting && this.uiSetting.subCategoryFilter )) {
      return this.subcategoryList
    }
    return null
  }
 get  toggleDepartmentView() {
    if (this.toggleDepartmentList &&  ( this.uiSetting && this.uiSetting.departmentFilter )) {
      return this.departmentList
    }
    return null
  }

  get  toggleBrandView() {
    if (this.toggleBrandList &&  ( this.uiSetting && this.uiSetting.brandFilter )) {
      return this.brandList
    }
    return null
  }

  get  toggleColorView() {
    if (this.toggleColorList &&  ( this.uiSetting && this.uiSetting.colorFilter )) {
      return this.colorList
    }
    return null
  }
  get  toggleGleutenView() {
    if (this.toggleGluetenOption &&  ( this.uiSetting && this.uiSetting.gluetenFilter )) {
      return this.gluetenOption
    }
    return null
  }
  get  toggleSpeciesView() {
    if (this.toggleSpeciesList &&  ( this.uiSetting && this.uiSetting.speciesFilter )) {
      return this.specieslList
    }
    return null
  }
  get  toggleSizeView() {
    if (this.toggleSizeList &&  ( this.uiSetting && this.uiSetting.sizeFilter )) {
      return this.sizeList
    }
    return null
  }
  setTogggleSubCat() {
    this.toggleSubCategoryList = !this.toggleSubCategoryList
  }
  setTogggleCat() {
    this.toggleCategoryList = !this.toggleCategoryList
  }
  setTogggleDept() {
    this.toggleDepartmentList = !this.toggleDepartmentList
  }
  setToggleBrand() {
    this.toggleBrandList = !this.toggleBrandList
  }
  setItemType() {
    this.toggleitemTypeList = !this.toggleitemTypeList
  }

 setColorList() {
    this.toggleColorList = !this.toggleColorList
  }
  setSpeciesList() {
    this.toggleSpeciesList = !this.toggleSpeciesList
  }
  setGluetenOption() {
    this.toggleGluetenOption = !this.toggleGluetenOption
  }
  setSizeOption() {
    this.toggleGluetenOption = !this.toggleGluetenOption
  }
  setSizeList() {
    this.toggleSizeList = !this.toggleSizeList
  }
}

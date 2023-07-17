import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subject, Subscription, of, switchMap } from 'rxjs';
import { IProductCategory, IUserProfile } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { AWSBucketService, ContactsService } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { IItemBasic, MenuService } from 'src/app/_services/menu/menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ItemBasic } from 'src/app/modules/admin/report-designer/interfaces/reports';

// export interface IItemBasic{
//   name: string;
//   id  : number;

// }

export interface IItemBasicProduct extends IItemBasic{
  active: boolean;
  webEnabled: boolean;
  icon?: string;
  image?: string;
}
@Component({
  selector: 'category-menu-selector',
  templateUrl: './category-menu-selector.component.html',
  styleUrls: ['./category-menu-selector.component.scss']
})
export class CategoryMenuSelectorComponent implements OnInit {
  @Input() themeColor = 'primary'
  @ViewChild('categoryMenu') categoryMenu: TemplateRef<any>;

  @Input() _reset: Subject<boolean>;
  @Input() departmentID: number;
  @Output() selected    : EventEmitter<any> = new EventEmitter();
  @Input()  inputForm   : UntypedFormGroup;
  @Input()  type        : string = 'department'
  @Input()  bucketName: string;
  list$  : Observable<any[]>;
  array  : unknown[];
  list   =   [];

  basicList = [] as IItemBasicProduct[]
  selectedItem: number;
  _searchModel: Subscription;
  searchModel : ProductSearchModel;
  categoryList = [] as IProductCategory[];
  subCategoryList = [] as IMenuItem[];

  expandedDepartments = [] as IProductCategory[];
  expandedCategories = [] as IProductCategory[];

  @Input() categories = [] as IMenuItem[];
  categoryList$: Observable<IMenuItem[]>;
  initialized: boolean

  initSubscription() {
    this._searchModel = this.menuService.searchFilter$.subscribe(data => {
      if (!data) { data = this.menuService.initSearchModel()}
      this.searchModel = data;
      if (!this.initialized) {
        this.initialized = true
        this.initForm(data);
      }
    })
  }

  initSearchSubscription() {
    this._searchModel = this.menuService.searchModel$.subscribe( model => {
      if (!model) { model = this.menuService.initSearchModel()}
      if (this.departmentID) {
        model.departmentID = this.departmentID;
        this.filterCategories(model);
      }
    })
  }

  filterCategories(model: ProductSearchModel) {
    const dept = model.listDepartmentID
    if (dept && dept.length>0) {
      if (this.type === 'category') {
        this.basicList = []
        let list = new Set(dept);
        let filteredItems = this.categoryList.filter(item => list.has(item.departmentID));
          filteredItems.forEach(item => {
            this.pushItem(item)
          }
        )
      }
    } else {
      this.categoryList.forEach(item => {
        this.pushItem(item)
      })
    }
  }

  pushItem(item) {
    let itemValue
    if (this.userAuthService.isUser  && item.webEnabled && item.active) {
      let value = item
      itemValue = {name: item?.name, id: item?.id ,active: item.active, webEnabled: item.webEnabled,
        image: this.getItemSrc(item?.urlImageMain)}
    }
    if (this.userAuthService.isStaff  && item.active) {
      itemValue = {name: item?.name, id: item?.id ,active: item.active, webEnabled: item.webEnabled,
          image: this.getItemSrc(item?.urlImageMain)}
    }

    if (itemValue) {
      this.basicList.push(itemValue)
    }
  }


  filterSubcategories(model: ProductSearchModel) {
    const cat = model.listCategoryID
    if (cat && cat.length > 0) {
      if (this.type === 'subcategory') {
        this.basicList = []
        let list = new Set(cat);
        let filteredItems = this.subCategoryList.filter(item => list.has(item.categoryID));
        filteredItems.forEach(item => {  this.pushItem(item) } )
      }
    } else {
      this.subCategoryList.forEach(item => {  this.pushItem(item) } )
    }
  }

  constructor(
    private siteService: SitesService,
    private menuService: MenuService,
    private itemTypeService: ItemTypeService,
    private contactService: ContactsService,
    private awsBucket: AWSBucketService,
    private userAuthService: UserAuthorizationService,
    private router: Router,
 ) { }

  ngOnInit(): void {
    this.initView();
    if (this._reset) {
      this._reset.subscribe(data => {
        if (this.type === 'department') {
          this.initForm(this.searchModel)
        }
      })
    }
  }

  initView() {
    this.initForm(this.searchModel)
    this.initSubscription();
    this.initSearchSubscription();
    this.refreshCategories();
    this.router.navigate(['menuitems-infinite'])
  }

  initSearchModel() {
    if (!this.menuService.searchModel) {
      this.menuService.updateSearchModel(this.searchModel)
    }
    if (this._searchModel) { this._searchModel.unsubscribe()}
  }

  initForm(model: ProductSearchModel) {
    const site = this.siteService.getAssignedSite();

    if (this.type === 'species') {
      this.list$ = of(this.menuService.getSpeciesType()).pipe(switchMap(list => {
          list.forEach(item => {  this.pushItem(item) })
          this.setSavedList(model)
          return of(list)
      }))
    }

    if (this.type === 'itemType') {
      this.list$ = this.itemTypeService.getItemTypesByUseType(site, 'product').pipe(switchMap(list => {
          list.forEach(item => {  this.pushItem(item) })
          this.setSavedList(model)
          return of(list)
      }))
    }

    if (this.type === 'category' || this.type === 'department' || this.type === 'subcategory') {
      const category$ = this.menuService.getCategoryListNoChildren(site);
      const department$ = this.menuService.getGetDepartmentList(site);
      const subCategory$ = this.menuService.getListOfSubCategories(site)
      let list$: Observable<any[]>;

      if (this.type === 'category') {
        this.refreshCategories()
        return;
      }

      if (this.type === 'department') {
        this.list$ = department$
          .pipe(switchMap(list => {
            list.forEach(item => {  this.pushItem(item) })
            if (model == undefined) {   model = this.menuService.initSearchModel()   }
            this.setSavedList(model)
          return of(list)
        }))
        return;
      }

      if (this.type === 'subcategory') {
        this.list$ = subCategory$
        .pipe(switchMap(list => {
          this.subCategoryList  = list
          list.forEach(item => {  this.pushItem(item) })
          this.setSavedList(model)
          return of(list)
        }))
        return;
      }
    }

    if (this.type === 'brand') {
      this.list$ = this.contactService.getBrands(site, null).pipe(switchMap(results => {
        if (results.results) {
          const list = results.results
          list.forEach(item =>
          {
              const value = this.getBrandItem(item)
              if (value) {
                this.basicList.push( value )
              }
          })
          this.setSavedList(model)
          return of(list)
        }
        return of(null)
      }))
    }
  }

  refreshCategories() {
    this.selectedItem = null;
    const site          = this.siteService.getAssignedSite()

    if (this.categories && this.categories.length > 0) {
      this.refreshFilteredCategories(this.categories)
      return ;
    }

    this.categoryList$    = this.menuService.getListOfCategoriesAll(site).pipe(
      switchMap(data => {
        this.refreshFilteredCategories(data)
        this.categories = data
        return of(data)
      })
    )
  }

  refreshFilteredCategories(list: IMenuItem[]) {
    if (this.type == 'category') {
      this.basicList = []
      list.forEach(item => {
        if (item.departmentID == this.departmentID) {
          this.pushItem(item)
        }
      })
    }
  }

  getBrandItem(item: IUserProfile) {
    let value = ''
    if (item.company) {   value = value.concat(item.company + ' ') }
    const name =  value
    if (name && name.trim() != '') {
      return  {name: name, id: item.id } as IItemBasicProduct;
    }
    return null
  }

  compareFunction(o1: any, o2: any) {
    if (o1.name == o2.name) {
      return o2;
    }
  }

  isSelectedDepartment(id: number, selectedItem: number) {
    if (selectedItem && id) {
      if (selectedItem == id) {
        return this.categoryMenu
      }
    }
    return null
  }

  setValue(item: number) {

    if ( this.searchModel == undefined) {    this.searchModel = this.menuService.initSearchModel()   }
    this.searchModel.pageNumber = 1;

    if (this.selectedItem == item && this.type === 'department') {
      this.selectedItem = null;
      this.searchModel.categoryID = 0;
      this.searchModel.departmentID = 0;
      return;
    }

    if (this.type === 'department') {
      this.searchModel.departmentID = item;
      this.selectedItem = item;
      this.searchModel.listDepartmentID = [];
      this.searchModel.listDepartmentID.push(item)
      this.searchModel.categoryID = 0;
      this.searchModel.listCategoryID = [];
    }

    if(this.type === 'category') {
      this.searchModel.listCategoryID = [];
      this.searchModel.listDepartmentID = [];
      this.searchModel.categoryID = item;
      this.searchModel.listCategoryID.push(item)
    }

    if(this.type === 'subcategory') {
      this.searchModel.subCategoryID = item;
    }

    if(this.type === 'brand') {
    }
    if(this.type === 'itemType') {
    }

    this.searchModel.pageNumber = 1;
    this.router.navigate(['menuitems-infinite'])

    let paramaters ;
    if (this.searchModel.categoryID != 0) {
      paramaters = {departmentID: this.searchModel.departmentID}
      this.router.navigate(['menuitems-infinite', paramaters])
    }
    if (this.searchModel.categoryID != 0) {
      paramaters = {categoryID: this.searchModel.categoryID}
      this.router.navigate(['menuitems-infinite', paramaters])
    }
    if (this.searchModel.subCategoryID != 0) {
      paramaters = {subcategoryID: this.searchModel.subCategoryID}
      this.router.navigate(['menuitems-infinite', paramaters])
    }


    this.menuService.updateSearchModel(this.searchModel)

  }

  setSavedList(model: ProductSearchModel) {

    //should loop and look up items in the basic list
    //then assign the basic list as the saved list.
    let list: number[]

    if (!model || model == undefined) { this.searchModel = this.menuService.initSearchModel()}

    if ( this.type === 'itemType' ) {
      // this.savedList = this.searchModel.itemTypeIDList
      list = model.itemTypeIDList //= list
    }
    if ( this.type === 'category' ) {
      // this.savedList = this.searchModel.listCategoryID
      list = model.listCategoryID //= []
     }
    if ( this.type === 'department' ) {
      // this.savedList = this.searchModel.listDepartmentID
      list = model.listDepartmentID // = []
    }
    if ( this.type === 'subcategory') {
      list = this.searchModel.listSubCategoryID    // this.searchModel.listSubCategoryID = []
     }
    if ( this.type === 'species') {
      list = this.searchModel.listSpecies    // this.searchModel.listSubCategoryID = []
     }
     if ( this.type === 'size') {
      list = this.searchModel.listSize    // this.searchModel.listSubCategoryID = []
     }

    if ( this.type === 'color') {
     list = this.searchModel.listColor    // this.searchModel.listSubCategoryID = []
    }

    if (this.type === 'brand' )       {
      list = model.listBrandID
    }
     const typeList = this.basicList;
    let newList : IItemBasicProduct[] = [];

    if (!list) {return}

    list.forEach( data => {
      if (typeList) {
        const  item  = typeList.find( info => data == info.id)
        if (item) {
          newList.push({name: item.name, id: item.id, image: item.image, active: item.active, webEnabled: item.webEnabled })
        }
      }
    });
    // this.savedList = newList;
  }


  getItemSrc(imageURL: string) {
    if (!imageURL) {
      const image = this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.png")
      return image
    } else {
      const imageName = imageURL.split(",")
      const image =`${this.bucketName}${imageName[0]}`
      return image
    }
    return ''
  }


}


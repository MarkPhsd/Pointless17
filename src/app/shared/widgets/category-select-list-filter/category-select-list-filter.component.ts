import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IProductCategory, IUserProfile } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { AWSBucketService, ContactsService } from 'src/app/_services';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ItemBasic } from 'src/app/modules/admin/report-designer/interfaces/reports';

export interface IItemBasic{
  name: string;
  id  : number;
  icon?: string;
  image?: string;
}

@Component({
  selector: 'category-select-list-filter',
  templateUrl: './category-select-list-filter.component.html',
  styleUrls: ['./category-select-list-filter.component.scss']
})
export class CategorySelectListFilterComponent implements OnInit {

  @Output() selected    : EventEmitter<any> = new EventEmitter();
  @Input()  inputForm   : UntypedFormGroup;
  @Input()  type        : string;
  @Input()  bucketName: string;
  list$  : Observable<any[]>;
  array  : unknown[];
  list   =   [];
  basicList = [] as IItemBasic[]
  savedList   : IItemBasic[];
  _searchModel: Subscription;
  searchModel : ProductSearchModel;
  categoryList = [] as IProductCategory[];
  subCategoryList = [] as IMenuItem[];

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
    })
  }

  filterCategories(model: ProductSearchModel) {
    const dept = model.listDepartmentID
    if (dept && dept.length>0) {
      if (this.type === 'category') {
        this.basicList = []

        let list = new Set(dept);
        let filteredItems = this.categoryList.filter(item => list.has(item.departmentID));
        filteredItems.forEach(item => {  this.basicList.push({name: item?.name, id: item?.id ,
                                                              image: this.getItemSrc(item?.urlImageMain)} ) })
      }
    } else {
      this.categoryList.forEach(item => {  this.basicList.push({name: item?.name, id: item?.id ,
        image: this.getItemSrc(item?.urlImageMain)} ) })
    }
  }

  filterSubcategories(model: ProductSearchModel) {
    const cat = model.listCategoryID
    if (cat && cat.length > 0) {
      if (this.type === 'subcategory') {
        this.basicList = []

        let list = new Set(cat);
        console.log('filter subcategory', cat, this.subCategoryList)
        let filteredItems = this.subCategoryList.filter(item => list.has(item.categoryID));
        filteredItems.forEach(item => {  this.basicList.push({name: item?.name, id: item?.id ,
                                                              image: this.getItemSrc(item?.urlImageMain)} ) })
      }
    } else {
      this.subCategoryList.forEach(item => {  this.basicList.push({name: item?.name, id: item?.id ,
        image: this.getItemSrc(item?.urlImageMain)} ) })
    }
  }


// this.setSavedList(model)

  constructor(
    private siteService: SitesService,
    private menuService: MenuService,
    private itemTypeService: ItemTypeService,
    private contactService: ContactsService,
    private awsBucket: AWSBucketService,

    ) { }

  ngOnInit(): void {
    // this.initSearchModel();
    this.initSubscription();
    this.initSearchSubscription()
  }

  initSearchModel() {
    if (!this.menuService.searchModel) {
      this.menuService.updateSearchModel(this.searchModel)
    }
    if (this._searchModel) { this._searchModel.unsubscribe()}
  }

  initForm(model: ProductSearchModel) {
    const site = this.siteService.getAssignedSite();

    //this.menuService.getSpeciesType();
    if (this.type === 'species') {
      this.list$ = of(this.menuService.getSpeciesType()).pipe(switchMap(list => {
          list.forEach(item => {  this.basicList.push({name: item.name, id: item.id} ) })
          this.setSavedList(model)
          return of(list)
      }))
    }

    if (this.type === 'itemType') {
      this.list$ = this.itemTypeService.getItemTypesByUseType(site, 'product').pipe(switchMap(list => {
          list.forEach(item => {  this.basicList.push({name: item.name, id: item.id} ) })
          this.setSavedList(model)
          return of(list)
      }))
    }

    if (this.type === 'category' || this.type === 'department' || this.type === 'subcategory') {
      const category$ = this.menuService.getCategoryListNoChildren(site);
      const department$ = this.menuService.getDepartmentList(site);
      const subCategory$ = this.menuService.getListOfSubCategories(site)
      let list$: Observable<any[]>;

      if (this.type === 'category') {
        this.list$ = category$
        .pipe(switchMap(list => {
          this.categoryList  = list
          list.forEach(item => {  this.basicList.push( {name: item?.name, id: item?.id, image: this.getItemSrc(item.urlImageMain)})

          })
          this.setSavedList(model)
          return of(list)
        }))
        return;
      }
      if (this.type === 'department') {
        this.list$ = department$
        .pipe(switchMap(list => {
          list.forEach(item => {  this.basicList.push({name: item?.name, id: item?.id, image: this.getItemSrc(item.urlImageMain)} ) })
          this.setSavedList(model)
          return of(list)
        }))
        return;
      }
      if (this.type === 'subcategory') {
        this.list$ = subCategory$
        .pipe(switchMap(list => {

          this.subCategoryList  = list
          list.forEach(item => {  this.basicList.push({name: item?.name, id: item?.id ,
                                                      image: this.getItemSrc(item?.urlImageMain)} ) })
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

  getBrandItem(item: IUserProfile) {
    let value = ''
    if (item.company) {   value = value.concat(item.company + ' ') }
    const name =  value
    if (name && name.trim() != '') {
      return  {name: name, id: item.id} as ItemBasic
    }
    return null
  }

  compareFunction(o1: any, o2: any) {
    if (o1.name == o2.name) {
      return o2;
    }
  }

  setValues() {
    const list = this.savedList;
    if ( this.type === 'itemType' ) {
      // this.savedList = this.searchModel.itemTypeIDList
      // this.searchModel.itemTypeIDList = list
    }
    if ( this.type === 'category' ) {
      // this.savedList = this.searchModel.listCategoryID
      // this.searchModel.listCategoryID = []
     }
    if ( this.type === 'department' ) {
      // this.savedList = this.searchModel.listDepartmentID
      //  this.searchModel.listDepartmentID = []
    }
    if ( this.type === 'subcategory') {
      // this.savedList = this.searchModel.listSubCategoryID    // this.searchModel.listSubCategoryID = []
     }
    if (this.type === 'brand' )       {
      // this.savedList = this.searchModel.listBrandID
    }

    this.addToList(list, this.basicList, this.type)
  }

  setSavedList(model: ProductSearchModel) {

    //should loop and look up items in the basic list
    //then assign the basic list as the saved list.
    let list: number[]
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
      list = this.searchModel.listSubCategoryID    // this.searchModel.listSubCategoryID = []
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
    let newList : IItemBasic[] = [];

    if (!list) {return}

    list.forEach( data => {
      if (typeList) {
        const  item  = typeList.find( info => data == info.id)
        if (item) {
          newList.push({name: item.name, id: item.id, image: item.image })
        }
      }
    });
    this.savedList = newList;
  }

  addToList(list:any[], typeList : IItemBasic[], type: string) {
    if (!list) { return }

    let newList = [] as number[]
    this.savedList = this.savedList as unknown[] as IItemBasic[]
    this.savedList.forEach( data => {
      if (typeList) {
        const  item  = typeList.find( info => data.id == info.id)
        if (item) {
          newList.push(item.id)
        }
      }
    });

    // console.log('new list', newList)
    if(type === 'category') {
      this.searchModel.listCategoryID = newList as number[];
    }
    if(type === 'subcategory') {
      this.searchModel.listSubCategoryID = newList as number[];
    }
    if(type === 'department') {
      this.searchModel.listDepartmentID =newList as number[];
    }
    if(type === 'brand') {
      this.searchModel.listBrandID = newList as number[];
    }
    if(type === 'itemType') {
      this.searchModel.itemTypeIDList = newList as number[];
    }

    this.searchModel.pageNumber = 1;
    // console.log(this.searchModel)
    this.menuService.updateSearchModel(this.searchModel)
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

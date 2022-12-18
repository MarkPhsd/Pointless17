import {Component,  HostListener, OnInit, AfterViewInit,OnDestroy,
        ViewChild, ElementRef, QueryList, ViewChildren, Input, TemplateRef}  from '@angular/core';
import {IMenuItem} from 'src/app/_interfaces/menu/menu-products';
import {AWSBucketService, MenuService} from 'src/app/_services';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { Capacitor, Plugins } from '@capacitor/core';
import { Title } from '@angular/platform-browser';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-menu-items-infinite',
  templateUrl: './menu-items-infinite.component.html',
  styleUrls: ['./menu-items-infinite.component.scss']
  }
)

export class MenuItemsInfiniteComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  // @ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  smallDevice: boolean;
  @ViewChild('searchSelector') searchSelector: TemplateRef<any>;
  searchForm: FormGroup;
  scrollContainer:   any;
  isNearBottom   :   any;
  webMode        :  boolean;
  productSearchModel
  array            = [];
  sum              = 15;
  throttle         = 300;
  scrollDistance   = 1;
  scrollUpDistance = 1.5;
  direction        = "";
  modalOpen        = false;
  endOfRecords     = false;
  pagingInfo        : any;
  p                 : any //html page
  items             = [];
  pageOfItems:      Array<any>;
  lengthOfArray:    number

  statusmessage     = '';
  section           = 1;

  menuItems$:       Observable<IMenuItem[]>
  menuItems:        IMenuItem[];
  value             : any;
  currentPage       = 1 //paging component
  pageSize          = 35;
  itemsPerPage      = 35

  @Input() departmentID :   string;
  @Input() categoryID:      string;
  @Input() subCategoryID :  string;
  @Input() brandID       :  string;
  @Input() typeID        :  string;
  @Input() productName   :  string;

  bucketName        :   string;
  scrollingInfo     :   string;
  endofItems        :   boolean;
  loading           :   boolean;
  totalRecords      :   number;

  _productSearchModel          : Subscription;
  productSearchModelData       : ProductSearchModel;
  someValue         : any;
  searchDescription : string //for description of results

  grid              = "grid"
  _orderBar         : Subscription;
  orderBar          : boolean;
  platForm          = this.getPlatForm()
  isApp             = false;

  getPlatForm() { return Capacitor.getPlatform(); }

  initOrderBarSubscription() {
    this.toolbarServiceUI.orderBar$.subscribe(data => {
      this.orderBar = data
      if (this.orderBar) {
        this.grid = "grid-smaller"
      }
      if (!this.orderBar) {
        this.grid = "grid"
      }
    })
  }

constructor(private menuService        : MenuService,
              private awsBucketService : AWSBucketService,
              private router           : Router,
              public  route            : ActivatedRoute,
              private siteService      : SitesService,
              private toolbarServiceUI : ToolBarUIService,
              private titleService     : Title,
              private platFormService  : PlatformService,
              private fb: FormBuilder,
      )
  {
    this.isApp = this.platFormService.isApp()
  }

  async ngOnInit()  {
    //this is called on page refresh, or sending the person the link to this page.
    //this should be called.
    //the parameters can all be used, however they shouldn't/
    //categories shouldn' display departments
    //don't change the local variables based on the search model
    //change the model based on the variables.
    //for the most part : the model will be updated
    //then the page will refresh
    //the way to make sure we don't show undeseriable items.
    //is if the model is updated, and adjusted based on variables.
    //so if the deparment is assigned in the search, then we can accept .
    //when a new model is provided, it can come in with the current model search
    //so it's important that when a model is submitted, extraneous values are not accepted.
    //but if we move from a department search, to show categories, perhaps we have to clear out the depaertment
    //before we move foward.
    //but if we move back, and have a category assigned but no department, we can't be
    //sure if we should accept the model, or the parameter from the page.

    this.value      = 1;
    this.bucketName =   await this.awsBucketService.awsBucket();
    this.initSearchForm();
    this.initSearchProcess();
    this.initSearchFromModel();
    this.setItemsPerPage();
    this.updateItemsPerPage()
    this.pageSize = 35;
    this.currentPage = 1;
    await this.nextPage();
    this.initOrderBarSubscription();
    this.setTitle();
  }

  get isSearchSelectorOn() {
    if (this.smallDevice) {
      return this.searchSelector
    }
    return null;
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if ( window.innerWidth < 811 ) {
      this.smallDevice = true
    }
  }

  initSearchForm() {
    this.searchForm = this.fb.group( {
      itemName: ''
    })
  }

    //this is called from subject rxjs obversablve above constructor.
  refreshSearch(itemName) {
    try {
      this.applyProductSearchModel(itemName);
      this.menuItems = [];
      this.nextPage();

    } catch (error) {
      console.log('error', error)
    }
  }


  ngAfterViewInit() {
    this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
  }

  ngOnDestroy(): void {
    if (this._orderBar) { this._orderBar.unsubscribe(); }
    if (this._productSearchModel) {this._productSearchModel.unsubscribe();}
  }

  setTitle() {
    if (this.productSearchModelData) {
      this.titleService.setTitle('Items Search Results')
    }
  }

  initSearchProcess() {
    try {
        this.departmentID  = this.route.snapshot.paramMap.get('departmentID');
        this.subCategoryID = this.route.snapshot.paramMap.get('subCategoryID');
        this.categoryID    = this.route.snapshot.paramMap.get('categoryID');
        this.brandID       = this.route.snapshot.paramMap.get('brandID');
        this.typeID        = this.route.snapshot.paramMap.get('typeID');
        this.productName   = this.route.snapshot.paramMap.get('productName');

    } catch (error) {
      console.log('initSearchProcess Error', error)
    }
  }

  initSearchFromModel() {
    this._productSearchModel = this.menuService.menuItemsData$.subscribe( model => {
        this.initSearchProcess();
        if (!model) { return }
        this.subCategoryID = model.subCategoryID;
        this.departmentID = model.departmentID
        this.categoryID   = model.categoryID
        this.brandID      = model.brandID;
        this.subCategoryID= model.subCategoryID;
        this.typeID       = model.itemTypeID
        this.productName  = model.name
        model.web         = this.webMode
        model.webMode     = this.webMode;
        if (!model.pageNumber) { model.pageNumber = 1}
        this.currentPage = model.pageNumber

        let  categoryResults = ''

        if (model.categoryName && model.categoryName != undefined ) {
          categoryResults = model.categoryName;
          let reRoute = false
        }

        let  departmentName = ''
        if (model.departmentName && model.departmentName != undefined ) {
          departmentName = 'departments ' + model.departmentName;
          let reRoute = false
        }

        let  itemTypeName = ''
        if (model.itemTypeName && model.itemTypeName != undefined) {
          itemTypeName = 'types ' + model.itemTypeName;
          let reRoute = false
        }
        model.webMode = this.menuService.isWebModeMenu
        model.active  = true;

        this.productSearchModelData = model;
        this.searchDescription = `Results from ${ model.name}  ${categoryResults} ${departmentName}  ${itemTypeName}`
        return
      }
    )
  }

  getNextMenuItem() {
    let menuItem = {} as IMenuItem
    menuItem.id = -1;
    menuItem.name = 'Load More'
    return menuItem;
  }

  async addToList(pageSize: number, pageNumber: number)  {
      let model   = this.productSearchModelData;
      if (!model) { model = {} as ProductSearchModel }
      const value = this.route.snapshot.paramMap.get('value');
      if (model && !value)  {

        console.log('department source', this.route.snapshot.paramMap.get('departmentID'))
        console.log('subCategory', this.route.snapshot.paramMap.get('subCategoryID'))

        this.departmentID  = this.route.snapshot.paramMap.get('departmentID');
        this.categoryID    = this.route.snapshot.paramMap.get('categoryID');
        this.subCategoryID    = this.route.snapshot.paramMap.get('subCategoryID');
        this.brandID       = this.route.snapshot.paramMap.get('brandID')
        if (this.brandID) {
          if (this.brandID) { model.brandID       = this.brandID     }
        }

        model.categoryID   = this.categoryID
        model.departmentID = this.departmentID
        model.subCategoryID = this.subCategoryID;

        this.typeID       = this.route.snapshot.paramMap.get('typeID')
        if (this.typeID) {
          if (this.typeID) { model.itemTypeID     = this.typeID     }
        }
      }

      if (!pageNumber || pageNumber == null) {pageNumber = 1 }
      if (!pageSize   || pageSize   == null) {pageSize   = 35}

      model.pageNumber  = pageNumber
      model.pageSize    = pageSize
      model.active      = true;
      const site        = this.siteService.getAssignedSite();
      console.log('Search Model', model)
      const results$    = this.menuService.getMenuItemsBySearchPaged(site, model);
      this.loading      = true

      results$.subscribe(data => {
        this.currentPage += 1;
        if (data.results && data.results.length == 0 || data == null || (!data || !data.results)) {
          this.value = 100;
          this.loading = false;
          this.endOfRecords = true
          return
        }

        if (!this.menuItems)  { this.menuItems = [] as IMenuItem[] }
        this.itemsPerPage = this.itemsPerPage + data.results.length;
        if (this.menuItems) {

          try {
            // console.log('menu length', this.menuItems.length)
            if (this.menuItems[this.menuItems.length -1 ].name.toLowerCase() === 'load more') {
              this.menuItems.splice(this.menuItems.length-1,1)
            };
          } catch (error) {

          }
          data.results.forEach( item => {
            this.menuItems.push(item)
          })


          this.totalRecords = data.paging.totalRecordCount;
          if ( this.menuItems.length == this.totalRecords ) {
            this.endOfRecords = true;
            this.loading = false;
            this.value = 100;
          }


          if ( this.value != 100) {
            const lastItem = this.getNextMenuItem();
            this.loading = false;
            this.menuItems.push(lastItem)
          }



          this.value = ((this.menuItems.length / this.totalRecords ) * 100).toFixed(0)
          this.loading      = false
          return
        }

        this.pagingInfo = data.paging
        if (data) {
          this.menuItems    = data.results
          this.loading      = false
          this.value = 100;
        }
      }
    )
  };

  moveNext(event) {
    this.menuItems.splice(this.menuItems.length,1)
    this.onScrollDown();
  }


  onScrollDown() {
    this.scrollingInfo = 'scroll down'
    this.nextPage();
  }

  onScrollUp() {
    this.scrollingInfo = 'scroll up'
  }

  setItemsPerPage() {

  }

  async nextPage() {
    await this.addToList(this.pageSize, this.currentPage)
  }

  scrollDown() {
    var scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  }

  listItem(id: string) {
    this.router.navigate(["/menuitem/", {id:id}]);
  }

  getItemSrc(item:IMenuItem) {
    return this.awsBucketService.getImageURLFromNameArray(this.bucketName, item.urlImageMain)
  }

 onItemElementsChanged(): void {
    // if (this.isNearBottom()) {
    //   this.scrollToBottom();
    // }
  }

  scrollToBottom(): void {
    this.scrollContainer.scroll({
      top: 2000,// this.scrollContainer.scrollHeight,
      left: 0,
      behavior: 'smooth'
    });
  }

  isUserNearBottom(): boolean {
    const threshold = 150;
    const position = window.scrollY + window.innerHeight; // <- Measure position differently
    const height = document.body.scrollHeight; // <- Measure height differently
    // console.log('isUserNearBottom' ,  position > height - threshold)
    return position > height - threshold;
  }

  @HostListener('window:scroll', ['$event']) // <- Add scroll listener to window
  scrolled(event: any): void {
    this.isNearBottom = this.isUserNearBottom();
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


}


import {Component, HostBinding, HostListener, OnInit, AfterViewInit,OnDestroy , ChangeDetectionStrategy, ChangeDetectorRef, Renderer2, ViewChild, ElementRef, QueryList, ViewChildren, Input}  from '@angular/core';
import {IMenuItem} from 'src/app/_interfaces/menu/menu-products';
import {AWSBucketService, MenuService} from 'src/app/_services';
import {ActivatedRoute, Router} from '@angular/router';
import {Observable, Subscription} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ProductSearchModel } from 'src/app/_interfaces/search-models/product-search';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { Capacitor, Plugins } from '@capacitor/core';
import { ElectronService } from 'ngx-electron';

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

scrollContainer:   any;
isNearBottom   :   any;

productSearchModel
array = [];
sum = 15;
throttle = 300;
scrollDistance = 1;
scrollUpDistance = 1.5;
direction    = "";
modalOpen    = false;
endOfRecords = false;
pagingInfo: any;
p: any //html page
items             = [];
pageOfItems:      Array<any>;
lengthOfArray:    number

statusmessage     = '';
section           = 1;

menuItems$:       Observable<IMenuItem[]>
menuItems:        IMenuItem[];
value             : any;
currentPage       = 1 //paging component
pageSize          = 25;
itemsPerPage      = 25

@Input() categoryID:       string;
@Input() brandID  :          string;
@Input() typeID   :          string;
@Input() productName:      string;

bucketName        :   string;
scrollingInfo     :   string;
endofItems        :   boolean;
loading           :   boolean;
totalRecords      :   number;

_productSearchModel          : Subscription;
productSearchModelData       : ProductSearchModel;
someValue         : any;
searchDescription : string //for description of results

grid           = "grid"
_orderBar      : Subscription;
orderBar       : boolean;

platForm        =  this.getPlatForm()
appName         = ''
isApp           = false;

getPlatForm() {  return Capacitor.getPlatform(); }

constructor(private menuService: MenuService,
            private awsBucketService: AWSBucketService,
            private router: Router,
            public route: ActivatedRoute,
            private siteService: SitesService,
            private toolbarServiceUI : ToolBarUIService,
            private electronService: ElectronService,
    )
{

  if (this.electronService) {
    if (this.electronService.remote != null)
    {
      this.appName = 'electron '
      this.isApp = true
    } else
    {
      this.isApp = false
      this.platForm =  this.getPlatForm();
      if (this.platForm == 'android') {
        this.isApp = true;
      }
    }
  }

  this.someValue = this.route.snapshot.paramMap.get('value');
  this.initSearchService();
  let reRoute = true

  if (this.productSearchModelData)  {
    const model = this.productSearchModelData
    this.categoryID  = model.categoryID
    this.brandID     = model.brandID;
    this.typeID      = model.itemTypeID
    this.productName = model.name

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

    this.searchDescription = `Results from ${ model.name}  ${categoryResults} ${departmentName}  ${itemTypeName}`
    return
  }

  try {
    this.categoryID = this.route.snapshot.paramMap.get('categoryID');
    this.brandID = this.route.snapshot.paramMap.get('brandID');
    this.typeID = this.route.snapshot.paramMap.get('typeID');
    this.productName = this.route.snapshot.paramMap.get('productName');
  } catch (error) {
    console.log('constructor error', error)
  }

  if (!this.categoryID && !reRoute )  {  reRoute = false }
  if (!this.brandID  && !reRoute)     {  reRoute = false }
  if (!this.typeID  && !reRoute)      {  reRoute = false }
  if (!this.productName  && !reRoute) {  reRoute = false }

  if (this.route.snapshot.paramMap.get('productName')) {
    this.currentPage = parseInt (this.route.snapshot.paramMap.get('currentPage'))
  }

}

async ngOnInit()  {
  this.value      = 1;
  this.bucketName =   await this.awsBucketService.awsBucket();
  // console.log('buck name menu items infinit', this.bucketName )
  this.initOrderBarSubscription()
  this.setItemsPerPage();
  await this.nextPage();
}

ngOnDestroy(): void {
  if (this._orderBar) { this._orderBar.unsubscribe(); }
  if (this._productSearchModel) {this._productSearchModel.unsubscribe();}
}

ngAfterViewInit() {
  this.itemElements.changes.subscribe(_ => this.onItemElementsChanged());
}

initSearchService() {
  this._productSearchModel = this.menuService.menuItemsData$.subscribe( data => {
    this.productSearchModelData = data
  })
}

initOrderBarSubscription() {
  this.toolbarServiceUI.orderBar$.subscribe(data => {
    this.orderBar = data
    // console.log(data)
    if (this.orderBar) {
      this.grid = "grid-smaller"
    }
    if (!this.orderBar) {
      this.grid = "grid"
    }
  })
}

onScrollDown() {
  // console.log('scrolled down!!');
  this.scrollingInfo = 'scroll down'
  this.nextPage();
}

onScrollUp() {
  // console.log('scrolled up!!');
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

async addToList(pageSize: number, pageNumber: number)  {

    let model = this.productSearchModelData

    if (!model) { model = {} as ProductSearchModel }

    if (!this.productSearchModelData) {
      const model = {} as ProductSearchModel;
      if (this.categoryID) {
        model.categoryID    = this.categoryID;
      }
      if (this.brandID)    {
        model.brandID     = this.brandID
      }
      if (this.typeID)     {
        model.itemTypeID  = this.typeID
      }
      if (this.brandID)    {
        model.name        = this.productName
      }
    }

    if (!pageNumber || pageNumber == null) {pageNumber = 1}
    if (!pageSize || pageSize == null)   {pageSize = 25}

    model.pageNumber  = pageNumber
    model.pageSize    = pageSize
    model.active      = true;
    const site                     = this.siteService.getAssignedSite();
    const results$                 = this.menuService.getMenuItemsBySearchPaged(site, model);
    this.loading                   = true

    results$.subscribe(data => {
      this.currentPage += 1;
      //no records returned
      if (data.results.length == 0 || data == null) {
        this.value = 100;
        this.loading = false;
        this.endOfRecords = true
        return
      }

      if (!this.menuItems)  { this.menuItems = [] as IMenuItem[] }

      this.itemsPerPage = this.itemsPerPage + data.results.length;

      if (this.menuItems) {
        // this.menuItems = this.menuItems.concat(data.results)
        data.results.forEach( item => {
          this.menuItems.push(item)
        })

        this.totalRecords = data.paging.totalRecordCount;
        if ( this.menuItems.length == this.totalRecords ) {
          this.endOfRecords = true;
          this.loading = false;
          this.value = 100;
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

}


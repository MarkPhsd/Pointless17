import {Component, HostListener, OnInit, OnDestroy, AfterViewInit,
  ViewChild, ElementRef, QueryList, ViewChildren, Input}  from '@angular/core';
import { IPOSOrder,IPOSOrderSearchModel } from 'src/app/_interfaces/transactions/posorder';
import { OrdersService } from 'src/app/_services';
import { AWSBucketService} from 'src/app/_services';
import { ActivatedRoute, Router} from '@angular/router';
import { Observable, Subscription} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { OrderFilterPanelComponent } from '../order-filter-panel/order-filter-panel.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';

@Component({
  selector: 'app-orders-main',
  templateUrl: './orders-main.component.html',
  styleUrls: ['./orders-main.component.scss'],
})

export class OrdersMainComponent implements OnInit, AfterViewInit, OnDestroy {

  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  // @ViewChild('scrollframe', {static: false}) scrollFrame: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;

  scrollContainer     :   any;
  isNearBottom        :   any;

  productSearchModel
  array               = [];
  sum                 = 15;
  throttle            = 300;
  scrollDistance      = 1;
  scrollUpDistance    = 1.5;
  direction           = "";
  modalOpen           = false;
  endOfRecords        = false;
  pagingInfo: any;
  p: any //html page
  items               = [];
  pageOfItems        :      Array<any>;
  lengthOfArray      :    number
  smallDevice       = false;

  statusmessage     = '';
  section           = 1;

  orders$           : Observable<IPOSOrder[]>;
  orders            : IPOSOrder[];
  value             : any;
  currentPage       = 1 //paging component
  pageSize          = 20;
  itemsPerPage      = 20

  scrollingInfo :   string;
  endofItems    :   boolean;
  loading       :   boolean;
  totalRecords  :   number;

  serviceType  : string;
  employeeID   : number;
  suspendedOrder  : number;

  bucketName    : string;
  searchDescription :string;

  stateValue     :   any;

  _searchModel  :   Subscription;
  searchModel   :   IPOSOrderSearchModel;

  _posOrders    :  Subscription;
  posOrders     :  IPOSOrder[];

  cardcontainer  = 'card-container'

  grid           = 'grid-flow'
  _orderBar      : Subscription;
  orderBar       : boolean;

  _menutBar     : Subscription;
  menuBar       : boolean;

  _searchBar    : Subscription;
  searchBar     : boolean;

  constructor(
    private orderService: OrdersService,
    private awsBucketService: AWSBucketService,
    private router: Router,
    public route: ActivatedRoute,
    private siteService: SitesService,
    private toolbarServiceUI : ToolBarUIService,
    private _bottomSheet: MatBottomSheet
    )
  {
    this.stateValue = this.route.snapshot.paramMap.get('value');
    this.initSubscriptions();
    this.initOrderBarSubscription();
    this.updateItemsPerPage();
    let reRoute = true

    if (this.searchModel)  {
      const model           = this.searchModel
      this.employeeID       = model.employeeID
      this.serviceType      = model.serviceType
      this.suspendedOrder   = model.suspendedOrder
      this.currentPage      = model.pageNumber
      this.searchDescription = `Results from` //  ${categoryResults} ${departmentName}  ${itemTypeName}`
      return
    }
  }

  async ngOnInit()  {
    this.value = 1;
    this.bucketName =   await this.awsBucketService.awsBucket();
    this.setItemsPerPage();
    await this.nextPage(false);
  }

  ngOnDestroy() {
    // if (this._searchModel) {this._searchModel.unsubscribe();}
    if (this._orderBar) { this._orderBar.unsubscribe(); }
  }

  ngAfterViewInit() {
    this.itemElements.changes.subscribe( _ => this.onItemElementsChanged());
  }

  initSubscriptions() {
    try {
      this._searchModel = this.orderService.posSearchModel$.subscribe( data => {
        this.searchModel = data
        this.orders = [] as  IPOSOrder[];
        this.currentPage = 1
        this.nextPage(true)
      })
    } catch (error) {
    }
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }
  }

  initOrderBarSubscription() {
    this.toolbarServiceUI.orderBar$.subscribe(data => {
      this.orderBar = data
      this.refreshGridClass()
      }
    )
    this.toolbarServiceUI.searchSideBar$.subscribe(data => {
        this.searchBar = data
        this.refreshGridClass()
      }
    )
    this.toolbarServiceUI.toolbarSideBar$.subscribe(data => {
      this.menuBar = data
      this.refreshGridClass()
      }
    )
  }

  refreshGridClass() {
    this.grid = "grid-flow";
    return;
  }

  clearSelection() {
    this.serviceType    = '';
    this.employeeID     = 0;
    this.suspendedOrder = 0;
    this.currentPage    = 1;
  }

  onScrollDown() {
    console.log('scrolled down!!');
    this.scrollingInfo = 'scroll down'
    this.nextPage(false);
  }

  onScrollUp() {
    console.log('scrolled up!!');
    this.scrollingInfo = 'scroll up'
  }

  setItemsPerPage() {
  }

  async nextPage(reset: boolean) {
    await this.addToList(this.pageSize, this.currentPage, reset)
  }

  scrollDown() {
    var scrollingElement = (document.scrollingElement || document.body);
    scrollingElement.scrollTop = scrollingElement.scrollHeight;
  }

  getUniqueItems(array: any): any {
    const uniqueArray = array.filter((item, index) => {
      const _item = JSON.stringify(item);
      return index === array.findIndex(obj => {
        return JSON.stringify(obj) === _item;
      });
    });
    return uniqueArray
  }

  async newOrder(){
    const site = this.siteService.getAssignedSite();
    await this.orderService.newDefaultOrder(site);
  }

  setActiveOrder(order) {
    const site  = this.siteService.getAssignedSite();
    const order$ =  this.orderService.getOrder(site, order.id)
    order$.subscribe(data =>
      {
        this.orderService.updateOrderSubscription(data)
        this.toolbarServiceUI.updateOrderBar(true)
      }
    )
  }

  async addToList(pageSize: number, pageNumber: number, reset : boolean)  {
    let model = {} as IPOSOrderSearchModel
    if (this.searchModel)  {  model = this.searchModel}
    model.pageNumber  = pageNumber
    model.pageSize    = pageSize
    const site        = this.siteService.getAssignedSite();
    const results$    = this.orderService.getOrderBySearchPaged(site, model);
    this.loading      = true

    results$.subscribe(data => {

      if (!this.orders)  { this.orders = [] as IPOSOrder[] }
      this.currentPage += 1;

      if (!data || !data.results) {
        this.loading = false;
        this.endOfRecords = true
        return
      }

      if (data.results.length == 0 || data == null) {
        this.value = 100;
        this.loading = false;
        this.endOfRecords = true
        return
      }

      this.itemsPerPage = this.itemsPerPage + data.results.length;

      if (reset) {
        this.orders  = [] as IPOSOrder[]
      }

      if (data.results) {
        this.loading      = false
        this.orders = this.orders.concat(data.results)
        this.orders.sort
        this.orders = this.getUniqueItems(this.orders)

        this.totalRecords = data.paging.totalRecordCount;
        if ( this.orders.length == this.totalRecords ) {
          this.endOfRecords = true;
          this.loading = false;
          this.value = 100;
        }
        this.value = ((this.orders.length / this.totalRecords ) * 100).toFixed(0)
        this.loading      = false
        return
      }

      this.pagingInfo = data.paging
      if (data) {
          this.loading      = false
          this.value        = 100;
        }
      }
    )
  };

  listItem(id: string) {
    this.router.navigate(["/menuitem/", {id:id}]);
  }

  getItemSrc(item:IPOSOrder) {
  // return this.awsBucketService.getImageURLFromNameArray(this.bucketName, item.urlImageMain)
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
    return position > height - threshold;
  }

  @HostListener('window:scroll', ['$event']) // <- Add scroll listener to window
    scrolled(event: any): void {
    console.log('scrolled')
    this.isNearBottom = this.isUserNearBottom();
  }

  filterBottomSheet() {
    this._bottomSheet.open(OrderFilterPanelComponent);
  }

  newOrderOptions() {
    this._bottomSheet.open(NewOrderTypeComponent)
  }

}

import {Component, HostListener, OnInit, OnDestroy,
  ViewChild, ElementRef, QueryList, ViewChildren, Input, Output,EventEmitter}  from '@angular/core';
import { IPOSOrder,IPOSOrderSearchModel } from 'src/app/_interfaces/transactions/posorder';
import { AuthenticationService, OrdersService, POSOrdersPaged } from 'src/app/_services';
import { ActivatedRoute} from '@angular/router';
import { Observable, Subscription, catchError, of, switchMap} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { ISite, IUser } from 'src/app/_interfaces';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';

// import { share } from 'rxjs/operators';

@Component({
  selector: 'app-order-cards',
  templateUrl: './order-cards.component.html',
  styleUrls: ['./order-cards.component.scss']
})
export class OrderCardsComponent implements OnInit,OnDestroy {

  action$: Observable<any>;
  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  @Output() orderOutPut = new EventEmitter()
  scrollContainer     :   any;
  isNearBottom        :   any;
  @Input() cardStyle = 'block';
  @Input() site: ISite;
  results$: Observable<any>;

  // productSearchModel
  array               = [];
  sum                 = 15;
  throttle            = 300;
  scrollDistance      = 1;
  scrollUpDistance    = 1.5;
  direction           = "";
  modalOpen           = false;
  endOfRecords        = false;
  pagingInfo: any;

  //pre values
  invisibleOrders = [];
  itemCount       = 0;

  p: any //html page
  items              = [];
  pageOfItems        : Array<any>;
  lengthOfArray      : number
  smallDevice        = false;

  statusmessage      = '';
  section            = 1;

  orders$           : Observable<IPOSOrder[]>;
  orders            : IPOSOrder[];
  value             : any;
  currentPage       = 1 //paging component
  pageSize          = 50;
  itemsPerPage      = 45

  scrollingInfo  :   string;
  endofItems     :   boolean;
  loading        :   boolean;
  totalRecords   :   number;

  serviceType    : string;
  employeeID     : number;
  suspendedOrder : number;

  bucketName     : string;
  searchDescription :string;

  stateValue     :   any;

  _searchModel   :   Subscription;
  searchModel    :   IPOSOrderSearchModel;

  _posOrders     :  Subscription;
  posOrders      :  IPOSOrder[];

  cardcontainer  = 'card-container'
  menuBar         : any;
  grid           = 'grid-flow'
  _orderBar      : Subscription;
  orderBar       : boolean;

  _searchBar     : Subscription;
  searchBar      : boolean;

  _viewType     : Subscription;
  viewType      : number;

  _printLocation  : Subscription;
  printLocation   : number;

  _userAuths: Subscription;
  userAuths: IUserAuth_Properties;

  _user: Subscription;
  user : IUser;


  initViewSubscriber() {
    this._viewType = this.orderMethodsService.viewOrderType$.subscribe(data => {
      this.viewType = data;
    })
  }

  initUserAuth() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })

    this._userAuths = this.authenticationService.userAuths$.subscribe(data => {
      this.userAuths = data;
      if (!data) {
        this.userAuths = {} as IUserAuth_Properties
      }
    })
  }

  destroySubscriptions() {
    if (this._orderBar) { this._orderBar.unsubscribe(); }
    if (this._printLocation) { this._printLocation.unsubscribe()    }
    if (this._viewType) { this._viewType.unsubscribe()}
    if (this._searchBar) { this._searchBar.unsubscribe()}
    if (this._userAuths) { this._userAuths.unsubscribe()}
  }

  constructor(
    private orderService: OrdersService,
    public orderMethodsService: OrderMethodsService,
    public route: ActivatedRoute,
    public paymentMethodsProcess: PaymentsMethodsProcessService,
    private siteService: SitesService,
    private toolbarServiceUI : ToolBarUIService,
    private authenticationService: AuthenticationService,
    )
  {
  }

  ngOnInit()  {

    this.stateValue = this.route.snapshot.paramMap.get('value');
    this.initOrderBarSubscription();
    this.initUserAuth();
    this.updateItemsPerPage();
    this.site = this.siteService.getAssignedSite();

    if (this.searchModel)  {
      const model           = this.searchModel
      this.employeeID       = model.employeeID
      this.serviceType      = model.serviceType
      this.suspendedOrder   = model.suspendedOrder
      this.currentPage      = model.pageNumber
      this.searchDescription = `Results from`
      return
    }

    this.value = 1;
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.destroySubscriptions()
  }

  initSubscriptions() {
    this.initViewSubscriber()
    try {
      this._searchModel = this.orderMethodsService.posSearchModel$.subscribe( data => {
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

    this.toolbarServiceUI.mainMenuSideBar$.subscribe(data => {
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
    this.scrollingInfo = 'scroll down'
    this.nextPage(false);
  }

  onScrollUp() {
    this.scrollingInfo = 'scroll up'
  }

  nextPage(reset: boolean) {
     this.addToList(this.pageSize, this.currentPage, reset)
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
    await this.orderMethodsService.newDefaultOrder(site);
  }

  setActiveOrder(order) {
    const site  = this.siteService.getAssignedSite();

    //sends order from this, to trigger defaultmodulecomponent, which then triggers another observable to send thourh payment methodsprocessservice.
    this.orderMethodsService._sendOrder.next(true)

    // console.log('set active order')
    const order$ =  this.orderService.getOrder(site, order.id, order.history )
    order$.subscribe(data =>
      {
        if (data) {

          this.orderOutPut.emit(data)
          this.orderMethodsService.setActiveOrder(site, data)
        }
      }
    )
  }

  setActiveOrderObs(order) {
    const site  = this.siteService.getAssignedSite();

    // console.log('orderID', this.orderMethodsService?.order?.id)
    let sendOrder$ = this.paymentMethodsProcess.sendOrderOnExit(this.orderMethodsService.order)

    let order$  =   this.orderService.getOrder(site, order.id, order.history )
    let newOrder$ : Observable<any>;

    newOrder$ = sendOrder$.pipe(
      switchMap( data => {
        return order$
      })).pipe(
        switchMap(data => {
        {
          if (data) {

            this.orderOutPut.emit(data)
            this.orderMethodsService.setActiveOrder(site, data)
          }
        }
        return of(data)
      })
    )

    this.action$ = newOrder$
  }

  addToList(pageSize: number, pageNumber: number, reset : boolean)  {
    let model         = {} as IPOSOrderSearchModel
    if (this.searchModel)  {  model = this.searchModel}
    model.pageNumber  = pageNumber
    model.pageSize    = pageSize
    const site        = this.siteService.getAssignedSite();
    let results$      : Observable<POSOrdersPaged>;
    this.invisibleOrders = [];

    if (this.viewType == 3) {
      model.pageNumber    = pageNumber
      model.pageSize      = pageSize
      results$            = this.orderService.getOrdersPrepBySearchPaged(site,model) //.pipe(share());
    }

    if (this.viewType != 3) {
      results$    = this.orderService.getOrderBySearchPaged(site, model) //.pipe(share());
    }

      this.loading      = true
      this.endOfRecords = false;
      this.results$ = results$.pipe(switchMap(data => {
        // console.log('processing', data)

        if (!this.orders)  {
          this.loading = false
          this.endOfRecords = true
          this.orders = [] as IPOSOrder[]
        }
          this.currentPage += 1;

        if (!data || !data.results) {
          this.loading = false;
          this.endOfRecords = true
          return
        }

        // console.log('processing', data, data.results.length)

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

          return of(data)
        }
        this.loading = false
        this.pagingInfo = data.paging
        if (data) {
            this.endOfRecords = true;
            this.loading      = false
            this.value        = 100;
        }
        return of(data)
      }
    ))
  };


  setThisCardInVisible(event) {
    const i = event.index;
    this.itemCount = event.count;
    this.invisibleOrders.push(i)
  }

  isOrderVisible(i) {

    if (!i) {
      return true
    }

    const items = this.invisibleOrders.filter(p => {
      if  (p == i) { return p }
    })

    if ( items.length == 0 ) {
      return true
    }
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
    this.isNearBottom = this.isUserNearBottom();
  }
}

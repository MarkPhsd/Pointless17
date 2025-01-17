import {Component, HostListener, OnInit, OnDestroy,
  ViewChild, ElementRef, QueryList, ViewChildren, Input, Output,EventEmitter, TemplateRef, OnChanges, SimpleChanges, Renderer2, ChangeDetectorRef}  from '@angular/core';
import { IPOSOrder,IPOSOrderSearchModel } from 'src/app/_interfaces/transactions/posorder';
import { AuthenticationService, OrdersService, POSOrdersPaged } from 'src/app/_services';
import { ActivatedRoute, Router} from '@angular/router';
import { Observable, Subscription, catchError, delay, of, repeatWhen, switchMap, tap, throwError} from 'rxjs';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { ISite, IUser } from 'src/app/_interfaces';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PaymentsMethodsProcessService } from 'src/app/_services/transactions/payments-methods-process.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { InfiniteScrollDirective, InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { PosOrderItemsComponent } from '../../posorders/pos-order/pos-order-items/pos-order-items.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { OrderPrepComponent } from '../order-prep/order-prep.component';
import { OrderPanelComponent } from '../order-panel/order-panel.component';
import { OrderCardComponent } from '../order-card/order-card.component';

// import { share } from 'rxjs/operators';

@Component({
  selector: 'app-order-cards',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    OrderPrepComponent,OrderPanelComponent,OrderCardComponent,
    InfiniteScrollModule,
  SharedPipesModule],
  templateUrl: './order-cards.component.html',
  styleUrls: ['./order-cards.component.scss']
})
export class OrderCardsComponent implements OnInit,OnDestroy,OnChanges {
  @ViewChild(InfiniteScrollDirective) infiniteScroll;
  action$: Observable<any>;

  @Input() prepOnExit : boolean;

  @ViewChild('orderPrepRefresh') orderPrepRefresh : TemplateRef<any>;
  @ViewChild('ordersRefresh')    ordersRefresh : TemplateRef<any>;
  @ViewChild('nextPage', {read: ElementRef, static:false}) elementView: ElementRef;
  @ViewChildren('item') itemElements: QueryList<any>;
  @Output() orderOutPut = new EventEmitter()
  scrollContainer     :   any;
  isNearBottom        :   any;
  @Input() cardStyle = 'block';
  @Input() site: ISite;
  results$: Observable<any>;
  @Input() autoOpenCart : boolean;
  @Input() isPaxDevice: boolean;

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
  pageNumber: number;

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

  //order / cards / prep
  _viewType     : Subscription;
  viewType      : number;


  prepStatus: number;
  _prepStatus: Subscription;

  _printLocation  : Subscription;
  printLocation   : number;
  infiniteStyle = 'overflow-x:hidden;overflow-y:auto;max-height(80vh)'
  _userAuths: Subscription;
  userAuths: IUserAuth_Properties;

  _user: Subscription;
  user : IUser;

  //user style
  private styleTag: HTMLStyleElement;

  private customStyleEl: HTMLStyleElement | null = null;
  @ViewChild('scrollDiv') scrollDiv: ElementRef;

  seconds = 30000;
  orderResults$ = of([]) as  Observable<IPOSOrder[]>
  // orderSubscription$: Observable<IPOSOrder[]>;
  orderPrepRefresh$: Observable<any[]>;
  orderSubscription$: Observable<POSOrdersPaged>
  _orderSubscription: Subscription;
  _scrollStyle = this.platformService.scrollStyleWide;
  get scrollStyle() {
    if (this.viewType == 3) {
      return 'scrollstyle_1'
    }
    return this._scrollStyle
  }

  get orderPrepRefreshView() {
    if (this.viewType == 3) {  return this.orderPrepRefresh; }
    return this.ordersRefresh;
  }

  initViewSubscriber() {
    this._viewType = this.orderMethodsService.viewOrderType$.subscribe(data => {
      this.viewType = data;
      if (data == 3) {
        this.updatePreStatus()
      }
    })
  }

  updatePreStatus() {
    this._prepStatus = this.printingService.prepStatus$.subscribe(data => {
      this.prepStatus = data;
      this.setOrderSubscriber()
    })
  }

  initUserAuth() {
    this._user = this.authenticationService.user$.pipe(switchMap(data => {
      this.user = data;
      this.setScrollBarColor((this.user?.userPreferences?.headerColor))
      return this.authenticationService.userAuths$
    })).subscribe(data => {
      this.userAuths = data;
      if (this.viewType == 3) {
        this.setOrderSubscriber()
      }
      if (!data) {
        this.userAuths = {} as IUserAuth_Properties
      }
    })
  };

  setOrderSubscriber() {
    if (this.user && this.viewType == 3) {
      let model = {} as IPOSOrderSearchModel
      if (this.searchModel)  {  model = this.searchModel}
      model.pageNumber    = 1
      model.pageSize      = 50
      model.prepStatus    = +this.prepStatus;
      model.closedOpenAllOrders = 0;
      // console.log('setOrderSubscriber', model)
      const site    = this.siteService.getAssignedSite()
      let results$ = this.orderService.getOrdersPrepBySearchPaged(site, model)
      let prep$ = this.getResults(results$, false)
      this.grid = "grid-flow-prep";
      this.orderSubscription$ = prep$.pipe(
        repeatWhen(notifications =>
          notifications.pipe(
            tap(() =>
              console.log('refresh', )
            ),
            delay(this.seconds))
        ),
        catchError((err: any) => {
          return throwError(err);
        })
      )
    }

  }

  setScrollBarColor(color: string) {
    if (!color) {    color = '#6475ac' }
    const css = this.authenticationService.getAppToolBarStyle(color, 35)
    this.styleTag = this.renderer.createElement('style');
    this.styleTag.type = 'text/css';
    this.styleTag.textContent = css;
    this.renderer.appendChild(document.head, this.styleTag);
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
    public  orderMethodsService: OrderMethodsService,
    public  route: ActivatedRoute,
    public  paymentMethodsProcess: PaymentsMethodsProcessService,
    private siteService: SitesService,
    private toolbarServiceUI : ToolBarUIService,
    private authenticationService: AuthenticationService,
    public platformService: PlatformService,
    private renderer: Renderer2, private el: ElementRef,
    private printingService: PrintingService,
    private userAuthorization: UserAuthorizationService,
    private cd: ChangeDetectorRef,


      public  toolbarUIService  : ToolBarUIService,
      private  navigationService: NavigationService,
      // public  printingService    : PrintingService,
      private bottomSheet       : MatBottomSheet,
      // private uiSettingsService: UISettingsService,
      private platFormService: PlatformService,
      public router:           Router,


    )
  {
  }

  ngOnInit()  {
    this.stateValue = this.route.snapshot.paramMap.get('value');
    this.initOrderBarSubscription();
    this.initUserAuth();
    this.updateItemsPerPage();
    this.site = this.siteService.getAssignedSite();

    // console.log('init model', this.searchModel)
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


  ngOnChanges(changes: SimpleChanges): void {
    // if (this.isPrepViewEnabled) {
    //   this.getPrepOrders()
    // }
  }

  ngOnDestroy() {
    this.destroySubscriptions()
  }

  initSubscriptions() {
    this.initViewSubscriber()
    try {
      this._searchModel = this.orderMethodsService.posSearchModel$.subscribe( data => {
        if (data) {
          const item = JSON.parse(JSON.stringify(data))
          data = item;
        }
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
    this.infiniteStyle = 'overflow-x:hidden;overflow-y:auto;max-height(80vh)'
    if ( window.innerWidth < 811 ) {
      this.smallDevice = true
      this.infiniteStyle = 'overflow-x:hidden;overflow-y:auto;max-height(80vh - 155px)'
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
    const order$ =  this.orderService.getOrder(site, order.id, order.history )
    order$.subscribe(data =>
      {
        if (data) {
          this.orderOutPut.emit(data)
          this.orderMethodsService.setActiveOrder(data)

          // @Input() autoOpenCart : boolean;
          // @Input() isPaxDevice: boolean;
          if (this.autoOpenCart && this.isPaxDevice) {
            //then we auto nav to the posorder items;
            this.toggleOpenOrderBar(data)
          }
        }
      }
    )
  }

  toggleOpenOrderBar(order) {
    // if (!this.smallDevice) {
    //   this.navigationService.toggleOpenOrderBar(this.isStaff)
    //   return;
    // }

    if (this.smallDevice && this.platFormService.androidApp) {
      this.router.navigate([ 'pos-items' , {mainPanel:true}]);
      this.toolbarUIService.updateOrderBar(false,this.authenticationService.deviceInfo)
      this.toolbarUIService.resetOrderBar(true)
      return
    }

    if (order) {
      this.bottomSheet.open(PosOrderItemsComponent)
    }
  }

  setActiveOrderObs(order) {
    const site  = this.siteService.getAssignedSite();
    let sendOrder$ : Observable<any>;

    if (this.orderMethodsService?.currentOrder && this.prepOnExit) {
      if (!this.orderMethodsService.currentOrder.history) {
        sendOrder$ = this.paymentMethodsProcess.sendToPrep(order, true, null, false)
      }
    } else {
      sendOrder$ = of(null)
    }

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
            this.orderMethodsService.setActiveOrder(data)
          }
        }
        return of(data)
      })
    )
    this.action$ = newOrder$
  }

  getPrepOrders() {
    const seconds = 1000 * 5;
    const site = this.siteService.getAssignedSite()
    let model         = {} as IPOSOrderSearchModel
    if (this.searchModel)  {  model = this.searchModel}
    model.pageNumber = 1;
    model.pageSize = 25;
    return this.orderService.getOrdersPrepBySearchPaged(site, model).pipe(switchMap(data => {
      const newLocal = this;
      newLocal.orders = [...newLocal.orders, ...data.results];
      return of (data.results)
    }))
  }

  addToList(pageSize: number, pageNumber: number, reset : boolean)  {
    if (!this.user) { return }
    this.results$ = this._addToListOBS(pageSize,pageNumber, reset)
  };

  get isUser() {
    // console.log('this.user', this.user, this.userAuths)
    if (this.user?.roles == 'user' || this.user?.roles == 'guest') {
      return true;
    }
    return false
  }

  _addToListOBS(pageSize: number, pageNumber: number, reset : boolean)  {
    let model         = {} as IPOSOrderSearchModel
    if (this.searchModel)  {  model = this.searchModel}

    if (pageNumber <= 0) { this.pageNumber = 1;  }
    model.pageNumber  = pageNumber
    model.pageSize    = pageSize
    const site        = this.siteService.getAssignedSite();
    let results$      : Observable<POSOrdersPaged>;
    this.invisibleOrders = [];
    this.loading      = true
    this.endOfRecords = false;

    if (this.isUser || !this.user) {
      model.greaterThanZero = 0;
    }

    if (this.viewType == 1 || this.viewType == 0 || this.viewType == 2) {
      model.prepStatus = null;
      results$    = this.orderService.getOrderBySearchPaged(site, model) //.pipe(share());
    }

    if (this.viewType == 3) {
      model.pageNumber    = pageNumber
      model.pageSize      = pageSize
      if (this.printingService._prepStatus.value) {
        model.prepStatus   = this.printingService._prepStatus.value;
      }
      results$            = this.orderService.getOrdersPrepBySearchPaged(site, model).pipe(switchMap(data => {
        return of(data)
      }))
    }

    if (!results$) {
      this.loading      = false
      this.endOfRecords = false;
      return of(null)
    }

    return this.getResults(results$, reset)
  }

  getResults(results$: Observable<POSOrdersPaged>, reset)  {

    return results$.pipe(switchMap(data => {

      // console.log('data', data)
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
          // this.orders = this.orders.concat(data.results)

          // console.log('current orders', this.orders)
          // console.log('new orders', data.results)

          this.orders = this.mergeAndDeduplicate(this.orders, data.results)
          if (this.viewType != 3) {
            this.cd.detectChanges()
          }
          const newLocal = this;
          this.orders.sort
          // console.log('merged orders', this.orders)
          this.orders = this.getUniqueItems(this.orders)

          // console.log('getUniqueItems orders', this.orders)

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

        try {
          this.infiniteScroll.disposeScroller.unsubscribe();
          this.infiniteScroll.setup();
        } catch (error) {
          console.log('error scroll', error)
        }
        return of(data)
      }
    ),catchError(data => {
      const item = {} as POSOrdersPaged;
      item.results = null;
      return of(item)
    }))

  }

  // mergeAndDeduplicate(items1: IPOSOrder[], items2: IPOSOrder[]): IPOSOrder[] {
  //   const merged: IPOSOrder[] = [...items1, ...items2];
  //   const result: IPOSOrder[] = [];

  //   const itemMap: Map<number, IPOSOrder> = new Map();

  //   for (const item of merged) {
  //     // Check if we already have an item with the same id

  //     if (item.itemCount === 0) {
  //       continue;
  //     }

  //     if (itemMap.has(item.id)) {
  //       const existingItem = itemMap.get(item.id);
  //       // Keep the item with the higher itemCount
  //       if (existingItem && item.itemCount > existingItem.itemCount) {
  //         itemMap.set(item.id, item);
  //       }
  //     } else {
  //       itemMap.set(item.id, item);
  //     }
  //   }

  //   // Convert the map back to an array
  //   itemMap.forEach((value) => {
  //     result.push(value);
  //   });

  //   return result;
  // }

  mergeAndDeduplicate(items1: IPOSOrder[], items2: IPOSOrder[]): IPOSOrder[] {
    const merged: IPOSOrder[] = [...items1, ...items2];
    const result: IPOSOrder[] = [];
    const itemMap: Map<number, IPOSOrder> = new Map();

    for (const item of merged) {
      // Check if we already have an item with the same id
      if (itemMap.has(item.id)) {
        const existingItem = itemMap.get(item.id);
        // Keep the item with the higher itemCount
        if (existingItem && item.itemCount > existingItem.itemCount) {
          itemMap.set(item.id, item);
        }
      } else {
        itemMap.set(item.id, item);
      }
    }

    // Convert the map back to an array
    itemMap.forEach((value) => {
      result.push(value);
    });

    return result;
  }


  get isPrepViewEnabled() {
    if (this.viewType != 3) {
      return true
    }
    return false;
  }

  setThisCardInVisible(event) {
    const i = event.index;
    this.itemCount = event.count;
    this.invisibleOrders.push(i)
  }

  isOrderVisible(i, order: IPOSOrder) {

    if (order && order.posOrderItems && order.posOrderItems.length === 0) {
      return false
    }

    if (!i) {  return true }

    const items = this.invisibleOrders.filter(p => {
      if  (p == i) { return p }
    })

    if ( items.length == 0 ) { return true }
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

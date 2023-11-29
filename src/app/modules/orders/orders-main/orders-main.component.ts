import {Component,  OnInit, OnDestroy, AfterViewInit, HostListener, TemplateRef, ViewChild, ChangeDetectorRef, QueryList, ViewChildren, ElementRef,
  }  from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { OrderFilterPanelComponent } from '../order-filter-panel/order-filter-panel.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IPOSOrderSearchModel, ISetting, ISite, IUser, UserPreferences } from 'src/app/_interfaces';
import { IPrinterLocation, PrinterLocationsService } from 'src/app/_services/menu/printer-locations.service';
import { InstructionDirective } from 'src/app/_directives/instruction.directive';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { PrintingService } from 'src/app/_services/system/printing.service';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { CoachMarksClass, CoachMarksService } from 'src/app/shared/widgets/coach-marks/coach-marks.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { POSItemSearchModel } from 'src/app/_services/reporting/reporting-items-sales.service';

@Component({
  selector: 'app-orders-main',
  templateUrl: './orders-main.component.html',
  styleUrls: ['./orders-main.component.scss'],
})

export class OrdersMainComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('orderCard')    orderCard: TemplateRef<any>;
  @ViewChild('orderList')    orderList: TemplateRef<any>;
  @ViewChild('orderPanel')   orderPanel: TemplateRef<any>;
  @ViewChild('orderPrep')    orderPrep: TemplateRef<any>;
  @ViewChild('orderItemPanel')   orderItemPanel: TemplateRef<any>;
  @ViewChild('houseAccountsList')    houseAccountsList: TemplateRef<any>;
  @ViewChild('houseAccountView') houseAccountView: TemplateRef<any>;
  @ViewChild('mergeView') mergeView: TemplateRef<any>;

  @ViewChildren(InstructionDirective) instructionDirectives: QueryList<InstructionDirective>;

  @ViewChild('coachingSearch', {read: ElementRef}) coachingSearch: ElementRef;
  @ViewChild('coachingOtherNew', {read: ElementRef}) coachingOtherNew: ElementRef;
  @ViewChild('coachingHouseAccount', {read: ElementRef}) coachingHouseAccount: ElementRef;
  @ViewChild('coachingListView', {read: ElementRef}) coachingListView: ElementRef;
  @ViewChild('coachingPrep', {read: ElementRef}) coachingPrep: ElementRef;
  @ViewChild('coachingMergeView', {read: ElementRef}) coachingMergeView: ElementRef;

  viewHouseAccountListOn: boolean;

  @ViewChild('ordersSelectedView')    ordersSelectedView: TemplateRef<any>;
  mergeOrders: boolean;
  posOrdersSelectedList: IPOSOrder[]
  action$: Observable<any>;

  orderItemHistory$: Observable<any>;

  isApp: boolean;
  smallDevice  : boolean;
  site         = this.siteService.getAssignedSite()
  isAuthorized : boolean;
  isStaff      : boolean;
  isUser       : boolean;
  listHeight   = '84vh'
  hidePanel    : boolean;

  isMenuOpen = false;
  _user: Subscription;
  user: IUser;
  gridcontainer = 'grid-container'
  viewType     = 1;
  _viewType: Subscription;

  printLocation       = 0;
  prepStatus          = 1;
  printerLocations$   : Observable<IPrinterLocation[]>;
  _prepStatus         : Subscription;
  _printLocation      : Subscription;

  searchModel: IPOSOrderSearchModel;
  _searchModel: Subscription;
  auths: IUserAuth_Properties
  _UITransaction: Subscription;
  _terminalSettings: Subscription;
  uiTransactions  = {} as TransactionUISettings;
  uiTransactions$  : Observable<ISetting>;
  scheduleDateStart: string;
  scheduleDateEnd: string;
  showAllOrderInstructions = []  as string[];
  interval;

  // this.uiSettingService.updatePOSDevice(item)
  terminalSettings: ITerminalSettings;

  setPrepInterval() {
    // if (this.viewType == 3) {
    //   this.interval = setInterval(() => {
    //     this.refreshPrep();
    //   }, 30000);
    //   return;
    // }
    // clearInterval(this.interval)
  }



  initPopover() {
    if (this.user?.userPreferences && this.user?.userPreferences?.enableCoachMarks ) {
      this.coachMarksService.clear()
      if (this.isStaff && this.coachingSearch) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingSearch.nativeElement, "Search Orders toggles a panel of filters to find orders. "));
      }
      if (this.isStaff && this.coachingOtherNew) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingOtherNew.nativeElement, "Other new shows kinds of orders you can start."));
      }
      if (this.isStaff && this.coachingHouseAccount) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingHouseAccount.nativeElement, "House Accounts are orders made for special customers with accounts that have delayed payment. "));
      }
      if (this.isStaff && this.coachingListView) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingListView.nativeElement, "Toggles the views for orders."));
      }
      if (this.isStaff && this.coachingPrep) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingPrep.nativeElement, "Toggles the prep display for kitchen prep / delivery etc.."));
      }
      if (this.isStaff && this.coachingMergeView) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingMergeView.nativeElement, "If you are allowed to merge orders, you will see a button that allows you to group orders together and merge them."));
      }
      this.coachMarksService.showCurrentPopover();
    }
  }

  initStatusSubscriber() {
    this._prepStatus = this.printingService.prepStatus$.subscribe( data => {
      if (data) {
        this.prepStatus = data;
      }
    })
  }

  initPrintLocationSubscriber() {
    this._printLocation = this.printingService.printerLocation$.subscribe( data => {
      if (data) {
        this.printLocation = data;
      }
    })
  }

  initUITransactionsSubscriber() {
    this._UITransaction = this.uISettingsService.transactionUISettings$.subscribe( data => {
      if (data) {
        this.uiTransactions = data;
        // console.log('initUITransactionsSubscriber', this.userAuthorization.user)
        // if (!this.userAuthorization.user) {

        // }
        if (this.userAuthorization.user) {
          this.displayAllOrFilter(this.userAuthorization.user)
        }
      }
    })

    this._terminalSettings = this.uISettingsService.posDevice$.subscribe(data => {
      if (data) {
        this.terminalSettings = data;
      }
    })
  }

  setHouseAccountsOn() {

    this.viewHouseAccountListOn = true;
    this.setViewType(0)
    return;
    this.viewHouseAccountListOn = !this.viewHouseAccountListOn;
    // if (!this.viewHouseAccountListOn) {
    //   this.viewHouseAccountListOn = true
    // }

    if (this.viewHouseAccountListOn) {
      this.setViewType(1)
    } else {
      this.setViewType(0)
    }

  }
  get viewHouseAccountList() {
    if (this.viewHouseAccountListOn) {
      return this.houseAccountsList
    }
    return null;
  }

  selectHouseAccountClient(id: number) {
    this.searchModel = {} as IPOSOrderSearchModel
    this.searchModel.suspendedOrder = 1;
    this.searchModel.clientID = id;
    this.searchModel.closedOpenAllOrders = 0;
    // console.log('update search', this.searchModel)
    this.orderMethodsService.updateOrderSearchModelDirect(this.searchModel)
  }

  initSearchModelSubscriber() {
    this._searchModel =  this.orderMethodsService.posSearchModel$.subscribe(data => {
      if (!data) {
        this.searchModel = {} as IPOSOrderSearchModel
      }
      if (data) {
        this.searchModel = data;
        this.scheduleDateStart= null;
        this.scheduleDateEnd  = null;

        if (this.uiTransactions && !this.uiTransactions.toggleUserOrAllOrders) {
          this.searchModel.employeeID = 0;
        }

        if (this.searchModel.scheduleDate_From && this.searchModel.scheduleDate_To) {
          this.scheduleDateStart = this.searchModel.scheduleDate_From;
          this.scheduleDateEnd   = this.searchModel.scheduleDate_To;
        }
      }
    })
  }

  getOrderItemHistory() { 
    //orderItemHistory$
    this.viewType = 4;
    if (this.user && this.user.roles == 'user') { 
      // this.posor/
      const site = this.siteService.getAssignedSite();
      let search = {} as POSItemSearchModel
      search.clientID = this.user.id;
      search.includeMenuItem = true
      const results$ =  this.posOrderItemService.getItemsHistoryBySearch(site,search);
      this.orderItemHistory$ = results$.pipe(switchMap(data => { 
        console.log('history items', data)
        return of(data)
      }))
    }
  }

  initViewTypeSubscriber() {
    this._viewType = this.orderMethodsService.viewOrderType$.subscribe(data => {
      this.viewType = data;
    })
  }

  initSubscriptions(){
    this.initStatusSubscriber();
    this.initPrintLocationSubscriber();
    this.initSearchModelSubscriber();
    this.initViewTypeSubscriber();
    this.initUITransactionsSubscriber()
  }

  destroySubscriptions() {
    if (this._prepStatus) { this._prepStatus.unsubscribe()}
    if (this._printLocation) {this._printLocation.unsubscribe()}
    if (this._viewType) {this._viewType.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
    if (this._user) {this._user.unsubscribe()}
    if (this._UITransaction) { this._UITransaction.unsubscribe() }
  }

  constructor (
    public route             : ActivatedRoute,
    private _bottomSheet     : MatBottomSheet,
    private siteService      : SitesService,
    public  userAuthorization : UserAuthorizationService,
    public authenticationService: AuthenticationService,
    private printerService   : PrinterLocationsService,
    private printingService  : PrintingService,
    private changeDetectorRef: ChangeDetectorRef,
    private uISettingsService: UISettingsService,
    public orderMethodsService: OrderMethodsService,
    public coachMarksService : CoachMarksService,
    private platFormService: PlatformService,
    private posOrderItemService: POSOrderItemService,
    private orderService     : OrdersService)
  {
    this.initAuthorization();
    this.orderMethodsService.updateViewOrderType(1)
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.site = this.siteService.getAssignedSite();
    this.initCustomerView()
    this.displayPanel(null)
    this.initSubscriptions();
    this.printerLocations$ = this.printerService.getLocations()
    this.auths = this.authenticationService.userAuths;
    this.isApp = (this.platFormService.isAppElectron || this.platFormService.androidApp)

    if (this.isUser) { 
      localStorage.setItem('OrderFilterPanelVisible', 'true')
    }
  }

  initCustomerView() {
    let user = this.userAuthorization.user;
    if (!user) {
      user = this.authenticationService.userValue
    }
    if (!user) { return }
    if (user.roles == 'user') {
      this.viewType = 2;
      this.setViewType(this.viewType)
    }
  }

  ngAfterViewInit() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
      this.showAllOrderInstructions = [] as string[];
      this.showAllOrderInstructions.push[''];
      this.showAllOrderInstructions.push[''];
      this.showAllOrderInstructions.push[''];
      let item = 'Press search to find open and closed orders, as well as use other filters.';
      this.showAllOrderInstructions[0] = item;
      item = 'Press Show All Orders. This toggles showing all open orders versus just yours.';
      this.showAllOrderInstructions[1] = item;
      if (this.user && this.user.userPreferences) {
        this.initInstructions(this.user.userPreferences as UserPreferences)
      }
    })
  }

  initInstructions(auth: UserPreferences) {
    // console.log('init inistructions, ', auth)
    if (!auth.firstTime_notifyShowAllOrders) {
      this.showInstruction(0)
    } else {
      this.showAllOrderInstructions[0] = ''
    }
    if (!auth.firstTime_FilterOrderInstruction) {
      // console.log('show order filter instructions')
      this.showInstruction(1)
    } else {
      this.showAllOrderInstructions[1] = ''
    }
  }

  showInstruction(index: number) {
    // this.showAllOrderInstructions[0] = 'Press Show All Orders, to toggle showing all orders or just yours.';
    this.changeDetectorRef.detectChanges()
    if (!this.instructionDirectives) {

      return
    }
    const directive = this.instructionDirectives.toArray()[index];
    if (directive) {
      directive.showInstruction();
    }
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.hideInstruction(0)
    this.hideInstruction(1)
    clearInterval(this.interval)
    this.destroySubscriptions()
  }

  updatePrinterLocation() {
    this.searchModel.printLocation = this.printLocation;
    this.searchModel.prepStatus    = this.prepStatus
    this.printingService.updateOrderPrinterLocation(this.printLocation)
    this.printingService.updatePrepStatus(this.prepStatus)
    this.orderMethodsService.updateOrderSearchModel(this.searchModel)
  }

  updatePreptStatus(value:number) {
    if (value) {
      this.refreshPrep()
    }
  }

  refreshSearch() {
    this.orderMethodsService.updateOrderSearchModel(this.searchModel)
  }

  // closedOpenAllOrders: 1
  // completionDate_From: ""
  // completionDate_To: ""
  // employeeID: 0
  // greaterThanZero: 0
  // onlineOrders: false
  // pageNumber: 1
  // pageSize: 50
  // prepStatus: 1
  // printLocation: 0
  // scheduleDate_From: null
  // scheduleDate_To: null
  // suspendedOrder: 0

  get filterIsSet() {
    let filterIsSetOption = false

    if (this.searchModel) {

      const search =  this.searchModel

      if (search.closedOpenAllOrders && search.closedOpenAllOrders != 1) {
        filterIsSetOption = true
        // console.log('closedOpenAllOrders', search.closedOpenAllOrders)
        return true
      }

      if (search.closedOpenAllOrders == 0) {
        // console.log('closedOpenAllOrders', search.closedOpenAllOrders)
        return true
      }

      if (search.completionDate_From || search.completionDate_To) {
        if (search.completionDate_From != '') {
          // console.log('completion', search.completionDate_From)
          return true
        }
      }

      if (search.serviceTypeID && search.serviceTypeID !=0  ) {
        // console.log('service')
        return true
      }

      if (search.employeeID && search.employeeID !=0  ) {
        // console.log('employee')
        return true
      }

      if (search.suspendedOrder == 1 ) {
        // console.log('suspended',search.suspendedOrder)
        return true
      }

      if (search.scheduleDate_From  || search.scheduleDate_To) {
        // console.log('scheduleDate_From',search.scheduleDate_From)
        return true
      }
      if (search.searchOrderHistory) {
        // console.log('searchOrderHistory',search.searchOrderHistory)
        return true
      }

      if (search.prepStatus && search.prepStatus != 1) {
        // console.log(search)
        return true
      }
      if (search.onlineOrders) {
        // console.log(search)
        return true
      }

      if (search.orderID) {
        // console.log(search)
        return true
      }

      if (search.greaterThanZero && search.greaterThanZero != 0) {
        // console.log(search)
        return true
      }

    }

    return filterIsSetOption;
  }

  showAllOpenOrders() {
    this.searchModel.closedOpenAllOrders = 1
    this.searchModel.completionDate_From = null;
    this.searchModel.completionDate_To = null;
    this.searchModel.orderID = null;
    this.searchModel.employeeID = 0;
    this.searchModel.pageSize = 25;
    this.searchModel.pageNumber = 1;
    this.searchModel.searchOrderHistory = false
    this.searchModel.prepStatus  = null;
    this.searchModel.onlineOrders = null;
    this.searchModel.serviceTypeID = null;
    this.searchModel.suspendedOrder  = 0;
    this.searchModel.routeDetailID  = null;
    this.searchModel.greaterThanZero = 0;
    this.orderMethodsService.updateOrderSearchModel(this.searchModel)
  }

  refreshPrep() {
    this.searchModel.printLocation = this.printLocation;
    this.searchModel.prepStatus = this.prepStatus
    this.printingService.updatePrepStatus(this.prepStatus)
    this.orderMethodsService.updateOrderSearchModel(this.searchModel)
  }

  togglePrepStatus() {
    this.updatePreptStatus(this.prepStatus)
  }

  toggleMergeOrders() {
    this.mergeOrders = !this.mergeOrders;
    if (this.mergeOrders) {
      this.gridcontainer = 'grid-container-merge'
    } else {
      this.gridcontainer = 'grid-container'
    }
    this.viewType = 1;
  }

  mergeOrdersComplete() {
    const site =     this.siteService.getAssignedSite()
    const list = []
    this.posOrdersSelectedList.forEach(data => { list.push(data.id) })
    this.action$ = this.orderService.mergeOrders(site, list).pipe(switchMap(data => {
      this.orderMethodsService.updateOrderSubscription(data)
      this.cancelMerge()
      this.orderMethodsService.updateOrderSearchModel(this.searchModel)
      return of(data)
    }))
  }

  cancelMerge() {
    this.mergeOrders = false;
    this.posOrdersSelectedList = [];
  }

  get orderSelectedList() {
    if (this.mergeOrders) {
      return this.ordersSelectedView;
    }
    this.posOrdersSelectedList = []
  }

  get houseAccount() {
    // this.auths.hou
    if (this.auths && this.auths.houseAccountPayment) {
      return this.houseAccountView
    }
    return null;
  }

  get mergeViewEnabled() {
    if (this.auths && this.auths.houseAccountPayment) {
      return this.mergeView
    }
    return null;
  }

  addOrderToSelectedList(order: IPOSOrder) {
    if (!this.posOrdersSelectedList) {
      this.posOrdersSelectedList = []
    }
    this.posOrdersSelectedList.push(order)
    const key = "id"
    this.posOrdersSelectedList =  [...new Map(this.posOrdersSelectedList.map(item =>[item[key], item])).values()]
  }

  removeFromList(i) {
    try {
      this.posOrdersSelectedList.splice(i,1)
    } catch (error) {
      console.log('Error', error)
    }
  }

  get orderView() {
    if (this.viewType == 0 ) {
      return  this.orderList
    }
    if (this.viewType == 1) {
      return  this.orderCard
    }
    if (this.viewType == 2 ) {
      return this.orderPanel
    }
    if (this.viewType == 3 ) {
      return this.orderPrep
    }
    if (this.viewType == 4 ) {
      return this.orderItemPanel
    }
    return this.orderCard
  }

  searchBtn(event) {

    this.updateFilterInstruction();
    this.hideInstruction(0)

    if (this.viewType === 4) { 
      this.viewType = 2
      this.displayPanel(event);
      this.hideFilterPanel(true)
      return;
    }

    this.displayPanel(event)
  }

  displayPanel(event)  {
    
    const show =  localStorage.getItem('OrderFilterPanelVisible')
    if (show === 'false') {
      this.hidePanel = true
      this.gridcontainer = 'grid-container-full'
      if (this.mergeOrders) {
        this.gridcontainer = 'grid-container-merge'
      }
      localStorage.setItem('OrderFilterPanelVisible', 'true')
      return
    }

    this.hidePanel = false
    if (!this.mergeOrders) {
      this.gridcontainer = 'grid-container'
    }
    localStorage.setItem('OrderFilterPanelVisible', 'false')
  }
  
  hideFilterPanel(event) {
    this.hidePanel = event
    if (event) {
      this.gridcontainer = 'grid-container-full'
      localStorage.setItem('OrderFilterPanelVisible', 'true')
      if (this.mergeOrders) {
        this.gridcontainer = 'grid-container-merge'
      }
    }
    if (!event) {
      if (!this.mergeOrders) {
        this.gridcontainer = 'grid-container'
      }
      localStorage.setItem('OrderFilterPanelVisible', 'false')
    }
    this.displayPanel(event)
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isManagement;
    this.isStaff      = this.userAuthorization.isStaff;
    this.isUser       = this.userAuthorization.isUser;
    if (!this.isStaff) { this.viewType = 2; }
  }

  @HostListener("window:resize", [])
  adjustWindow(){
    this.smallDevice = false
    this.listHeight = '84vh'
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.listHeight = '79vh'
    }
  }

  filterBottomSheet() {
    this._bottomSheet.open(OrderFilterPanelComponent);
  }

  async newOrder(){
    const site = this.siteService.getAssignedSite();
    this.action$ = this.orderMethodsService.newDefaultOrder(site);
  }

  newOrderOptions() {
    this._bottomSheet.open(NewOrderTypeComponent)
  }

  changeView() {

    if (this.viewType == 1) {
      this.viewType = 0
      this.orderMethodsService.updateViewOrderType(this.viewType)
      return
    }

    if (this.viewType == 0 || this.viewType == 3) {
      this.viewType = 1
      this.orderMethodsService.updateViewOrderType(this.viewType)
      return
    }

    if (this.viewType == 3) {
      this.viewType = 0
      this.orderMethodsService.updateViewOrderType(this.viewType)
      return
    }
  }

  setViewType(value) {
    this.viewType = value;
    this.orderMethodsService.updateViewOrderType(value);
    this.setPrepInterval()
  }

  toggleShowAllOrders() {
    let  user = this.userAuthorization.user
    if ( user && user.userPreferences) {
      user.userPreferences.showAllOrders = !user.userPreferences.showAllOrders ;
    }
    if (!user.userPreferences.firstTime_notifyShowAllOrders) {
      this.showAllOrderInstructions[0] = ''
      this.hideInstruction(0)
      user.userPreferences.firstTime_notifyShowAllOrders = true;
    }
    this.displayAllOrFilter(user)
  }

  displayAllOrFilter(user) {
    if (user?.userPreferences?.showAllOrders) {
      if (user?.employeeID) {
        if (this.orderMethodsService.posSearchModel) {
          this.orderMethodsService.posSearchModel = {} as IPOSOrderSearchModel
          this.orderMethodsService.posSearchModel.employeeID = user.employeeID
        }
      }
    }
    this.authenticationService.updateUser(user)
    this.userAuthorization.setUser(user)
    this.orderMethodsService.updateOrderSearchModel(this.orderMethodsService.posSearchModel)
  }

  updateFilterInstruction() {
    let  user = this.userAuthorization.user
    if (!user.userPreferences.firstTime_FilterOrderInstruction) {
      this.showAllOrderInstructions[1] = ''
      user.userPreferences.firstTime_FilterOrderInstruction = true;
      this.userAuthorization.setUser(user)
      this.authenticationService.updateUser(user)
    }
    this.orderMethodsService.updateOrderSearchModel(this.orderMethodsService.posSearchModel)
  }

  hideInstruction(index: number) {
    if (!this.instructionDirectives) {
      return
    }
    const directive = this.instructionDirectives.toArray()[index];
    if (directive) {
      directive.hideInstruction();
    }
  }

}

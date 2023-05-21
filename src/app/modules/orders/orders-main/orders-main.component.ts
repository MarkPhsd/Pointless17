import {Component,  OnInit, OnDestroy, AfterViewInit, HostListener, TemplateRef, ViewChild, ChangeDetectorRef, QueryList, ViewChildren,
  }  from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { OrderFilterPanelComponent } from '../order-filter-panel/order-filter-panel.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IPOSOrderSearchModel, ISite, IUser, UserPreferences } from 'src/app/_interfaces';
import { IPrinterLocation, PrinterLocationsService } from 'src/app/_services/menu/printer-locations.service';
import { InstructionDirective } from 'src/app/_directives/instruction.directive';

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
  @ViewChildren(InstructionDirective) instructionDirectives: QueryList<InstructionDirective>;

  @ViewChild('ordersSelectedView')    ordersSelectedView: TemplateRef<any>;
  mergeOrders: boolean;
  posOrdersSelectedList: IPOSOrder[]
  action$: Observable<any>;

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

  scheduleDateStart: string;
  scheduleDateEnd: string;
  showAllOrderInstructions = []  as string[];
  interval
  setPrepInterval() {
    // if (this.viewType == 3) {
    //   this.interval = setInterval(() => {
    //     this.refreshPrep();
    //   }, 30000);
    //   return;
    // }
    // clearInterval(this.interval)
  }

  initStatusSubscriber() {
    this._prepStatus = this.orderService.prepStatus$.subscribe( data => {
      if (data) {
        this.prepStatus = data;
      }
    })
  }

  initPrintLocationSubscriber() {
    this._printLocation = this.orderService.printerLocation$.subscribe( data => {
      if (data) {
        this.printLocation = data;
      }
    })
  }

  initSearchModelSubscriber() {
    this._searchModel =  this.orderService.posSearchModel$.subscribe(data => {
      if (!data) {
        this.searchModel = {} as IPOSOrderSearchModel
      }
      if (data) {
        this.searchModel = data;
        this.scheduleDateStart= null;
        this.scheduleDateEnd  = null;
        if (this.searchModel.scheduleDate_From && this.searchModel.scheduleDate_To) {
          this.scheduleDateStart = this.searchModel.scheduleDate_From;
          this.scheduleDateEnd   = this.searchModel.scheduleDate_To;
        }
      }
    })
  }

  initViewTypeSubscriber() {
    this._viewType = this.orderService.viewOrderType$.subscribe(data => {
      this.viewType = data;
    })
  }

  initSubscriptions(){
    this.initStatusSubscriber();
    this.initPrintLocationSubscriber();
    this.initSearchModelSubscriber();
    this.initViewTypeSubscriber();
  }

  destroySubscriptions() {
    if (this._prepStatus) { this._prepStatus.unsubscribe()}
    if (this._printLocation) {this._printLocation.unsubscribe()}
    if (this._viewType) {this._viewType.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
    if (this._user) {this._user.unsubscribe()}
  }

  constructor (
    public route             : ActivatedRoute,
    private _bottomSheet     : MatBottomSheet,
    private siteService      : SitesService,
    public  userAuthorization : UserAuthorizationService,
    private authenticationService: AuthenticationService,
    private printerService   : PrinterLocationsService,
    private changeDetectorRef: ChangeDetectorRef,
    private orderService     : OrdersService)
  {
    this.initAuthorization();
    this.orderService.updateViewOrderType(1)
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.site = this.siteService.getAssignedSite();
    this.displayPanel(null)
    this.initSubscriptions();
    this.printerLocations$ = this.printerService.getLocations()
  }

  ngAfterViewInit() {
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
      this.showAllOrderInstructions = [] as string[];
      this.showAllOrderInstructions.push[''];
      this.showAllOrderInstructions.push[''];
      this.showAllOrderInstructions.push[''];
      let item = 'Press Show All Orders. This toggles showing all open orders versus just yours.';
      this.showAllOrderInstructions[0] = item;
      item = 'Press search to find open and closed orders, as well as use other filters.';
      this.showAllOrderInstructions[1] = item;
      this.initInstructions(this.user.userPreferences as UserPreferences)
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
      console.log('no directive active', index)
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
    this.orderService.updateOrderPrinterLocation(this.printLocation)
    this.orderService.updatePrepStatus(this.prepStatus)
    this.orderService.updateOrderSearchModel(this.searchModel)
  }

  updatePreptStatus(value:number) {
    if (value) {
      this.refreshPrep()
    }
  }

  refreshPrep() {
    this.searchModel.printLocation = this.printLocation;
    this.searchModel.prepStatus = this.prepStatus
    this.orderService.updatePrepStatus(this.prepStatus)
    this.orderService.updateOrderSearchModel(this.searchModel)
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
      this.orderService.updateOrderSubscription(data)
      this.cancelMerge()
      this.orderService.updateOrderSearchModel(this.searchModel)
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
      console.log('eerror', error)
    }
  }

  get orderView() {
    if (this.viewType == 1) {
      return  this.orderCard
    }
    if (this.viewType == 0 ) {
      return  this.orderList
    }
    if (this.viewType == 2 ) {
      return this.orderPanel
    }
    if (this.viewType == 3 ) {
      return this.orderPrep
    }
    return this.orderCard
  }

  searchBtn(event) {
    this.updateFilterInstruction();
    this.hideInstruction(1)
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
    this.orderService.newDefaultOrder(site);
  }

  newOrderOptions() {
    this._bottomSheet.open(NewOrderTypeComponent)
  }

  changeView() {

    if (this.viewType == 1) {
      this.viewType = 0
      this.orderService.updateViewOrderType(this.viewType)
      return
    }

    if (this.viewType == 0 || this.viewType == 3) {
      this.viewType = 1
      this.orderService.updateViewOrderType(this.viewType)
      return
    }

    if (this.viewType == 3) {
      this.viewType = 0
      this.orderService.updateViewOrderType(this.viewType)
      return
    }
  }

  setViewType(value) {
    this.viewType = value;
    this.orderService.updateViewOrderType(value);
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
    this.authenticationService.updateUser(user)
    this.userAuthorization.setUser(user)
    this.orderService.updateOrderSearchModel(this.orderService.posSearchModel)
  }

  updateFilterInstruction() {
    let  user = this.userAuthorization.user
    if (!user.userPreferences.firstTime_FilterOrderInstruction) {
      this.showAllOrderInstructions[1] = ''
      user.userPreferences.firstTime_FilterOrderInstruction = true;
      this.userAuthorization.setUser(user)
      this.authenticationService.updateUser(user)
    }
    this.orderService.updateOrderSearchModel(this.orderService.posSearchModel)
  }

  hideInstruction(index: number) {
    if (!this.instructionDirectives) {
      console.log('no directive')
      return }
    const directive = this.instructionDirectives.toArray()[0];
    if (directive) {
      directive.hideInstruction();
    }
  }

}

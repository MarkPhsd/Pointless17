import {Component, OnDestroy,
  HostListener, OnInit, AfterViewInit,
  EventEmitter, Output,
  ViewChild, ElementRef,
  }  from '@angular/core';
import { IServiceType, IUser,  } from 'src/app/_interfaces';
import { IPOSOrderSearchModel,  } from 'src/app/_interfaces/transactions/posorder';
import { IItemBasic,} from 'src/app/_services';
import { OrdersService } from 'src/app/_services';
import { ActivatedRoute, Router} from '@angular/router';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Plugins } from '@capacitor/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { IPrinterLocation } from 'src/app/_services/menu/printer-locations.service';

const { Keyboard } = Plugins;

@Component({
  selector: 'app-order-filter-panel',
  templateUrl: './order-filter-panel.component.html',
  styleUrls: ['./order-filter-panel.component.scss']
})
export class OrderFilterPanelComponent implements OnDestroy, OnInit, AfterViewInit {

  //auth - suspended orders, employee selection
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  printingEnabled    : boolean;
  electronEnabled    : boolean;
  printerName        : string;
  printQuantity      : number;

  selectedEmployee            : number;
  selectedType                : number;
  toggleOpenClosedAll            = "1";
  toggleSuspendedOrders          = "0";
  toggleOrdersGreaterThanZero    = "0";
  toggleTypeEmployee             = "0"
  printForm          : FormGroup;
  user               = {} as IUser;

  dateRangeForm     : FormGroup;
  dateFrom          : any;
  dateTo            : any;

  scheduleDateForm  : FormGroup;
  scheduleDateFrom  : any;
  scheduleDateTo    : any;

  // searchModel   = {} as IPOSOrderSearchModel;
  employees$       :   Observable<IItemBasic[]>;
  serviceTypes$    :   Observable<IServiceType[]>;
  orderServiceType = {} as IServiceType;

  _searchModel     :   Subscription;
  searchModel      :   IPOSOrderSearchModel;
  searchForm       : FormGroup;
  searchPhrase     : Subject<any> = new Subject();
  value            : string;
  smallDevice      = false;

  isAuthorized     : any;
  isStaff     : boolean;
  isUser      : boolean;

  showDateFilter   : boolean;
  showScheduleFilter  = false ;

  _viewType: Subscription;
  viewType: number;

  printLocation       = 0;
  prepStatus          = 1;
  _prepStatus         : Subscription;
  _printLocation      : Subscription;
  printerLocations$   : Observable<IPrinterLocation[]>;

  @Output() outPutHidePanel = new EventEmitter();

  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  private readonly onDestroy = new Subject<void>();

  searchItems$              : Subject<IPOSOrderSearchModel[]> = new Subject();
  _searchItems$ = this.searchPhrase.pipe(
  debounceTime(250),
    distinctUntilChanged(),
    switchMap(searchPhrase =>
      this.refreshSearch()
    )
  )

  initStatusSubscriber() {
    this._prepStatus = this.orderService.prepStatus$.subscribe( data => {
      if (!data) {
        this.prepStatus = 1
      }
      if (data) {
        this.prepStatus = data;
      }
    })
  }

  initPrintLocationSubscriber() {
    this._printLocation = this.orderService.printerLocation$.subscribe( data => {
      if (data) {
        console.log('order filter printLocation')
        this.printLocation = data;
      }
    })
  }

  initViewTypeSubscriber() {
    this._viewType = this.orderService.viewOrderType$.subscribe(data => {
      this.viewType = data;
    })
  }

  initSearchSubscriber() {
    try {
      this._searchModel = this.orderService.posSearchModel$.subscribe( data => {
        this.searchModel = data
        this.initFilter(data)
      })
    } catch (error) {
    }
  }

  initSubscriptions() {
    this.initStatusSubscriber();
    this.initPrintLocationSubscriber();
    this.initViewTypeSubscriber();
    this.initSearchSubscriber();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._prepStatus) { this._prepStatus.unsubscribe()}
    if (this._searchModel) {
      this._searchModel.unsubscribe()
    }
    if (this._printLocation) { this._printLocation.unsubscribe()}
    if (this._prepStatus) { this._prepStatus.unsubscribe()}
    if (this._viewType) { this._viewType.unsubscribe(); }
  }

  constructor(
      private orderService    : OrdersService,
      private router          : Router,
      public  route           : ActivatedRoute,
      private siteService     : SitesService,
      private serviceTypes    : ServiceTypeService,
      private matSnack        : MatSnackBar,
      private fb              : FormBuilder,
      private userAuthorization  : UserAuthorizationService,

      private _bottomSheet    : MatBottomSheet
  )
  {
    this.initSubscriptions();
    const site           = this.siteService.getAssignedSite();
    this.employees$      = this.orderService.getActiveEmployees(site);
    this.serviceTypes$   = this.serviceTypes.getSaleTypes(site);
    this.initAuthorization();
    this.initDateForm();
    this.initForm();
    this.refreshSearch();
  }

  ngOnInit() {
    this.updateItemsPerPage();
    return
  }

  displayPanel()  {
    const show =  localStorage.getItem('OrderFilterPanelVisible')
    console.log(show)
    if (!show || show === 'true') {
      localStorage.setItem('OrderFilterPanelVisible', 'false')
      this.outPutHidePanel.emit(true)
      return
    }
    if (show === 'false') {
      localStorage.setItem('OrderFilterPanelVisible', 'true')
      this.outPutHidePanel.emit(false)
      return
    }
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin, manager, employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {
      // this.showScheduleFilter = true;
      this.showDateFilter = true;
    }
  }

  initForm() {
    this.searchForm   = this.fb.group( {
      itemName          : [''],
    })
  }

  @HostListener("window:resize", [])
  updateItemsPerPage() {
    this.smallDevice = false
    if (window.innerWidth < 768) {
      this.smallDevice = true
    }
  }

  exitBottomSheet() {
    this._bottomSheet.dismiss()
  }

  ngAfterViewInit() {
    this.initSearchOption();
  }

  initSearchOption() {
    if (this.input) {
      fromEvent(this.input.nativeElement,'keyup')
      .pipe(
        filter(Boolean),
        debounceTime(250),
        distinctUntilChanged(),
        tap((event:KeyboardEvent) => {
          try {
            const search  = this.input.nativeElement.value
            this.refreshOrderSearch(search);
            this.input.nativeElement.focus();
          } catch (error) {
            console.log('error searching')
          }
        })
      )
      .subscribe();
      }
  }

  gotoPayments() {
    this.router.navigateByUrl('/pos-payments');
  }

  resetSearch() {
    this.searchModel = {} as IPOSOrderSearchModel;
    this.initDateForm()
    this.toggleSuspendedOrders       = "0";
    this.toggleOrdersGreaterThanZero = "0";
    this.toggleOpenClosedAll         = "1"
    this.toggleTypeEmployee          = "0"
    this.value = ''
    if (this.user.roles==='user'){
      this.value = '1';
    }
    if (this.searchModel) {  this.searchModel.orderID = 0}
    this.initForm();
    this.initDateForm();
    this.refreshSearch();
    this.clearOrder();
  }

  clearOrder() {
    this.orderService.updateOrderSubscription(null);
  }

  initEmployeeList(){
    const site           = this.siteService.getAssignedSite()
    setInterval(this.refreshEmployees, (60*1000) *5);
  }

  refreshEmployees(){
    const site           = this.siteService.getAssignedSite()
    if (!site) { return}
    this.employees$      = this.orderService.getActiveEmployees(site)
  }


  initOrderSearch(searchModel: IPOSOrderSearchModel) {
    this.orderService.updateOrderSearchModel( searchModel )
  }

  //check
  initFilter(search: IPOSOrderSearchModel) {
    if (!search) {
      search = {} as IPOSOrderSearchModel
      search.suspendedOrder       = 0
      search.greaterThanZero      = 0
      search.closedOpenAllOrders  = 1;
      this.searchModel = search;
    }

    if (search.suspendedOrder) {
      this.toggleSuspendedOrders       =  search.suspendedOrder.toString()      //= parseInt(this.toggleSuspendedOrders)
    }
    if (search.greaterThanZero) {
      this.toggleOrdersGreaterThanZero =  search.greaterThanZero.toString()
    }      //= parseInt(this.toggleOrdersGreaterThanZero)
    if (search.closedOpenAllOrders) {
      this.toggleOpenClosedAll         =  search.closedOpenAllOrders.toString()
    }//= parseInt(this.toggleOpenClosedAll)
  }

  changeToggleTypeEmployee() {
  // if ( this.toggleTypeEmployee === "0" ) {
  //   this.toggleTypeEmployee = "1"
  //   return
  // }
  // if ( this.toggleTypeEmployee === "1" ) {
  //   this.toggleTypeEmployee = "0"
  //   return
  // }
  }

  orderSearch(searchPhrase) {
    if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel }
    this.searchModel.orderID = parseInt( searchPhrase)
    this.initOrderSearch(this.searchModel)
  }

  refreshSearch() {
    if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel
      this.searchModel.serviceTypeID = 0
      this.searchModel.employeeID    = 0
    }

    const search               = this.searchModel;
    search.suspendedOrder      = parseInt(this.toggleSuspendedOrders)
    search.greaterThanZero     = parseInt(this.toggleOrdersGreaterThanZero)
    search.closedOpenAllOrders = parseInt(this.toggleOpenClosedAll)

    search.printLocation       = 0;
    search.prepStatus          = 1;
    if (this.viewType ==3) {
      search.printLocation      = this.printLocation;
      search.prepStatus         = 1//this.prepStatus
    }
    this.initOrderSearch(search)
    // console.log(search)
    return this._searchItems$
  }

  refreshOrderSearch(searchPhrase) {
    this.searchModel = {} as IPOSOrderSearchModel
    this.searchModel.serviceTypeID = 0
    this.searchModel.employeeID    = 0
    this.searchModel.orderID   = parseInt(searchPhrase)
    const search               = this.searchModel;
    search.suspendedOrder      = parseInt(this.toggleSuspendedOrders)
    search.greaterThanZero     = parseInt(this.toggleOrdersGreaterThanZero)
    search.closedOpenAllOrders = parseInt(this.toggleOpenClosedAll)
    this.initOrderSearch(search)
    // console.log(search)
    return this._searchItems$
  }

  setServiceType(event) {
    if (!event) { return }
    this.searchModel.serviceTypeID = event.id
    this.refreshSearch()
  }

  setEmployee(event) {
    if (!event) { return }
    this.searchModel.employeeID = event.id
    this.refreshSearch()
  }

  getPrinterName(){}

  async newOrder(){
    const site = this.siteService.getAssignedSite();
    await this.orderService.newDefaultOrder(site);
  }

  newOrderWithPayload(){
    const site = this.siteService.getAssignedSite();
    this.orderService.newOrderWithPayload(site, this.orderServiceType)
  }

  newOrderOptions() {
    this._bottomSheet.open(NewOrderTypeComponent)
  }

  notifyEvent(message: string, title: string) {
    this.matSnack.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }

  toggleDateRangeFilter() {
    this.showDateFilter = !this.showDateFilter;
    this.initDateForm()
  }

  toggleScheduleDateRangeFilter() {
    this.showScheduleFilter = !this.showScheduleFilter;
    this.initScheduledDateForm();
  }

  initDateForm() {

    if (!this.showDateFilter ) {
      if (this.searchModel) {
        this.searchModel.completionDate_From = null;
        this.searchModel.completionDate_To = null;
      }
      this.dateRangeForm = null;
      return
    }

    this.dateRangeForm = new FormGroup({
      start: new FormControl(),
      end: new FormControl()
    });

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    this.dateRangeForm =  this.fb.group({
      start: new Date(year, month, 1),
      end: new Date()
    })

    this.searchModel.completionDate_From = this.dateRangeForm.get("start").value;
    this.searchModel.completionDate_To   = this.dateRangeForm.get("end").value;
    this.subscribeToDatePicker();
  }

   initScheduledDateForm() {

    this.scheduleDateForm = new FormGroup({
      start: new FormControl(),
      end: new FormControl()
    });

    const today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    this.dateRangeForm =  this.fb.group({
      start: new Date(year, month, 1),
      end: new Date()
    })

    this.searchModel.scheduleDate_From = this.scheduleDateForm.get("start").value;
    this.searchModel.scheduleDate_To   = this.scheduleDateForm.get("end").value;
    // this.subscribeToDatePicker();

    if (!this.showScheduleFilter) {
      if (this.searchModel) {
        this.searchModel.scheduleDate_From = null;
        this.searchModel.scheduleDate_To = null;
      }
      // this.scheduleDateForm = null;
      return
    }

  }

  subscribeToDatePicker()
    {
    if (this.dateRangeForm) {
      this.dateRangeForm.get('start').valueChanges.subscribe(res=>{
        if (!res) {return}
        this.dateFrom = res //this.dateRangeForm.get("start").value
      }
    )

    this.dateRangeForm.get('end').valueChanges.subscribe(res=>{
      if (!res) {return}
      this.dateTo = res
      }
    )

    this.dateRangeForm.valueChanges.subscribe(res=>{
        if (this.dateRangeForm.get("start").value && this.dateRangeForm.get("start").value) {
          this.refreshDateSearch()
        }
        }
      )
    }
  }

  subscribeToScheduledDatePicker()
  {
  if (this.scheduleDateForm) {
    this.scheduleDateForm.get('start').valueChanges.subscribe(res=>{
      if (!res) {return}
      this.dateFrom = res //this.dateRangeForm.get("start").value
    }
  )

  this.scheduleDateForm.get('end').valueChanges.subscribe(res=>{
    if (!res) {return}
    this.dateTo = res
    }
  )

  this.scheduleDateForm.valueChanges.subscribe(res=>{
      if (this.scheduleDateForm.get("start").value && this.scheduleDateForm.get("start").value) {
        this.refreshDateSearch()
      }
      }
    )
  }
}

  emitDatePickerData(event) {
    if (this.dateRangeForm) {
      if (!this.dateRangeForm.get("start").value || !this.dateRangeForm.get("end").value) {
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo = (  this.dateRangeForm.get("end").value )
        this.refreshDateSearch()
      }
    }
  }

  emitScheduledDatePickerData(event) {
    if (this.dateRangeForm) {
      if (!this.scheduleDateForm.get("start").value || !this.dateRangeForm.get("end").value) {
        this.scheduleDateFrom = this.scheduleDateForm.get("start").value
        this.scheduleDateTo = (  this.scheduleDateForm.get("end").value )
        this.refreshDateSearch()
      }
    }
  }

  refreshDateSearch() {
    if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel  }

      this.dateFrom = this.dateRangeForm.get("start").value
      this.dateTo   = this.dateRangeForm.get("end").value

      if (!this.dateRangeForm || !this.dateFrom || !this.dateTo) {
        this.searchModel.completionDate_From = '';
        this.searchModel.completionDate_To   = '';
        this.refreshSearch()
        return
      }

      this.searchModel.completionDate_From = this.dateFrom.toISOString()
      this.searchModel.completionDate_To   = this.dateTo.toISOString()
      this.refreshSearch()
  }


  refreshScheduledDateSearch() {
    if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel  }

      this.scheduleDateTo = this.scheduleDateForm.get("start").value
      this.scheduleDateFrom  = this.scheduleDateForm.get("end").value

      if (!this.scheduleDateForm || !this.scheduleDateFrom  || !this.scheduleDateTo) {
        this.searchModel.scheduleDate_From = '';
        this.searchModel.scheduleDate_To   = '';
        this.refreshSearch()
        return
      }

      this.searchModel.scheduleDate_From = this.scheduleDateFrom.toISOString()
      this.searchModel.scheduleDate_To   = this.scheduleDateTo.toISOString()
      this.refreshSearch()
  }

}

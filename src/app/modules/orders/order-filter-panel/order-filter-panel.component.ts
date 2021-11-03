import {Component, HostBinding, OnDestroy,
        HostListener, OnInit, AfterViewInit,
        EventEmitter, Output,
        Renderer2, ViewChild, ElementRef, QueryList,
        ViewChildren, Input}  from '@angular/core';
import { IEmployee, IServiceType, IUser, IUserProfile } from 'src/app/_interfaces';
import { IPOSOrderSearchModel, PosOrderItem } from 'src/app/_interfaces/transactions/posorder';
import { IItemBasic, OrderPayload, UserService } from 'src/app/_services';
import { OrdersService } from 'src/app/_services';
import {AWSBucketService, MenuService} from 'src/app/_services';
import {trigger, transition, animate, style, query, stagger} from '@angular/animations';
import {ActivatedRoute, Router} from '@angular/router';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor, Plugins } from '@capacitor/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { T } from '@angular/cdk/keycodes';

const { Keyboard } = Plugins;

@Component({
  selector: 'app-order-filter-panel',
  templateUrl: './order-filter-panel.component.html',
  styleUrls: ['./order-filter-panel.component.scss']
})
export class OrderFilterPanelComponent implements OnDestroy, OnInit,AfterViewInit {

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

  // searchModel   = {} as IPOSOrderSearchModel;
  employees$    :   Observable<IItemBasic[]>;
  serviceTypes$ :   Observable<IServiceType[]>;
  orderServiceType    = {} as IServiceType;

  _searchModel     :   Subscription;
  searchModel      :   IPOSOrderSearchModel;
  searchForm       : FormGroup;
  searchPhrase     : Subject<any> = new Subject();
  value            : string;
  smallDevice       = false;
  isAuthorized     : any;

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

  initSubscriptions() {
    try {
      this._searchModel = this.orderService.posSearchModel$.subscribe( data => {
        this.searchModel = data
        this.initFilter(data)
      })
    } catch (error) {
    }
  }

  constructor(
    private orderService: OrdersService,
    private router: Router,
    public  route: ActivatedRoute,
    private siteService: SitesService,
    private serviceTypes   : ServiceTypeService,
    private matSnack: MatSnackBar,
    private fb: FormBuilder,
    private userAuthorization       : UserAuthorizationService,
    private _bottomSheet: MatBottomSheet
    )
  {

    this.initSubscriptions();
    const site           = this.siteService.getAssignedSite()
    this.employees$      = this.orderService.getActiveEmployees(site)
    this.serviceTypes$   = this.serviceTypes.getSaleTypes(site)

    // if (this.searchModel) {
    //   this.initFilter(this.searchModel);//displays settings of filter
    // }

    this.initForm();
    this.initAuthorization();
    this.refreshSearch();
  }

  ngOnInit() {
    this.updateItemsPerPage();
    return
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
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
    this.router.navigateByUrl('/pos-payments')
  }

  resetSearch() {

    this.searchModel = {} as IPOSOrderSearchModel;
    this.toggleSuspendedOrders       = "0";
    this.toggleOrdersGreaterThanZero = "0";
    this.toggleOpenClosedAll         = "1"
    this.toggleTypeEmployee          = "0"
    this.value = ''
    if (this.searchModel) {
      this.searchModel.orderID = 0
    }

    this.initForm();
    this.refreshSearch();
  }

  initEmployeeList(){
    const site           = this.siteService.getAssignedSite()
    setInterval(this.refreshEmployees, 1000);
   }

  refreshEmployees(){
    try {
      const site           = this.siteService.getAssignedSite()
      if (!site) {
        console.log('site not defined')
        return
      }
      this.employees$      = this.orderService.getActiveEmployees(site)
    } catch (error) {
    console.log(error)
    }
  }

  ngOnDestroy() {
    if (this._searchModel) {
      // this._searchModel.unsubscribe();
    }
  }

  initOrderSearch(searchModel: IPOSOrderSearchModel) {
    // this.orderService.updateOrderSearchResults( null )
    this.orderService.updateOrderSearchModel( this.searchModel )
  }

  initFilter(search: IPOSOrderSearchModel) {
    if (!search) {
      search = {} as IPOSOrderSearchModel
      search.suspendedOrder = 0
      search.greaterThanZero = 0
      search.closedOpenAllOrders = 0;
      this.searchModel = search;
    }

    this.toggleSuspendedOrders       =  search.suspendedOrder.toString()      //= parseInt(this.toggleSuspendedOrders)
    this.toggleOrdersGreaterThanZero =  search.greaterThanZero.toString()      //= parseInt(this.toggleOrdersGreaterThanZero)
    this.toggleOpenClosedAll         =  search.closedOpenAllOrders.toString() //= parseInt(this.toggleOpenClosedAll)
    // this.serviceTypes                =  search.serviceTypeID
    // this.searchModel = search;
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

    const search = this.searchModel;
    search.suspendedOrder      = parseInt(this.toggleSuspendedOrders)
    search.greaterThanZero     = parseInt(this.toggleOrdersGreaterThanZero)
    search.closedOpenAllOrders = parseInt(this.toggleOpenClosedAll)

    this.initOrderSearch(search)
    return this._searchItems$

  }

  refreshOrderSearch(searchPhrase) {
    this.searchModel = {} as IPOSOrderSearchModel
    this.searchModel.serviceTypeID = 0
    this.searchModel.employeeID    = 0

    this.searchModel.orderID = parseInt(searchPhrase)

    const search = this.searchModel;
    search.suspendedOrder      = parseInt(this.toggleSuspendedOrders)
    search.greaterThanZero     = parseInt(this.toggleOrdersGreaterThanZero)
    search.closedOpenAllOrders = parseInt(this.toggleOpenClosedAll)

    this.initOrderSearch(search)
    return this._searchItems$
  }

  setServiceType(event) {
    if (!event) { return}
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

    if (!this.orderServiceType) {
      this.orderServiceType = {} as IServiceType;
    }

    const site = this.siteService.getAssignedSite();

    const orderPayload = {} as OrderPayload;
    orderPayload.serviceType = this.orderServiceType;
    orderPayload.client = null;

    const order$ = this.orderService.postOrderWithPayload(site, orderPayload)

    order$.subscribe(
      order => {
        // this.notifyEvent(`Order Submitted Order # ${data.id}`, "Posted")
        console.log(order)
        this.orderService.setActiveOrder(site, order)
      }, catchError => {
        this.notifyEvent(`Error submitting Order # ${catchError}`, "Posted")
      }
    )
  }

  newOrderOptions() {
    this._bottomSheet.open(NewOrderTypeComponent)
  }

  notifyEvent(message: string, title: string) {
    this.matSnack.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }


  async initDateForm() {
    console.log('init date form')
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
    this.searchModel.completionDate_To   = this.dateRangeForm.get("start").value;

    this.subscribeToDatePicker();

  }

  subscribeToDatePicker()
  {
    if (this.dateRangeForm) {
      this.dateRangeForm.get('start').valueChanges.subscribe(res=>{
        if (!res) {return}
        this.dateFrom = res //this.dateRangeForm.get("start").value
      })

      this.dateRangeForm.get('end').valueChanges.subscribe(res=>{
        if (!res) {return}
        this.dateTo = res
      })

      this.dateRangeForm.valueChanges.subscribe(res=>{
        if (this.dateRangeForm.get("start").value && this.dateRangeForm.get("start").value) {
          this.refreshDateSearch()
        }
      })
    }
  }

   emitDatePickerData() {
    if (this.dateRangeForm) {
      if (!this.dateRangeForm.get("start").value || !this.dateRangeForm.get("start").value) {
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo = (  this.dateRangeForm.get("end").value )
        this.refreshDateSearch()
      }
    }
  }

  refreshDateSearch() {

    if (! this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel  }

    if (!this.dateRangeForm || !this.dateFrom || !this.dateTo) {
      this.searchModel.completionDate_From = '';
      this.searchModel.completionDate_To   = '';
      this.refreshSearch()
      return
    }

    this.dateFrom = this.dateRangeForm.get("start").value
    this.dateTo   = this.dateRangeForm.get("end").value
    this.searchModel.completionDate_From = this.dateFrom.toISOString()
    this.searchModel.completionDate_To = this.dateTo.toISOString()

    this.refreshSearch()

  }


}

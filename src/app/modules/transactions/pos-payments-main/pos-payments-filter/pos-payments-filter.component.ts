import {Component, HostBinding, OnDestroy, Output, HostListener,
        OnInit, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef,
        Renderer2, ViewChild, ElementRef, QueryList, ViewChildren, Input, EventEmitter}  from '@angular/core';
import { IEmployee, IServiceType, IUser, IUserProfile } from 'src/app/_interfaces';
import { IPOSPaymentsOptimzed , Paging , Result, ServiceType, Summary, IPOSPayment} from 'src/app/_interfaces/transactions/posorder';
import { IItemBasic, UserService } from 'src/app/_services';
import { OrdersService } from 'src/app/_services';
import { AWSBucketService, MenuService} from 'src/app/_services';
import { trigger, transition, animate, style, query, stagger} from '@angular/animations';
import { ActivatedRoute, Router} from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPriceSearchModel } from 'src/app/_interfaces/menu/price-schedule';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { EmployeeService} from 'src/app/_services/people/employee-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { IPaymentSearchModel, POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription } from 'rxjs';
import { Capacitor, Plugins } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-pos-payments-filter',
  templateUrl: './pos-payments-filter.component.html',
  styleUrls: ['./pos-payments-filter.component.scss']
})
export class PosPaymentsFilterComponent implements OnDestroy, OnInit, AfterViewInit {

    //auth - suspended orders, employee selection

    @ViewChild('input', {static: true}) input: ElementRef;
    @Output() itemSelect  = new EventEmitter();
    value : string;
    get itemName() { return this.searchForm.get("itemName") as FormControl;}
    searchForm: FormGroup;

    @Output() outputRefreshSearch :   EventEmitter<any> = new EventEmitter();
    get platForm()         {  return Capacitor.getPlatform(); }
    printingEnabled      : boolean;
    electronEnabled      : boolean;
    capacitorEnabled     : boolean;
    printerName          : string;
    printQuantity        : number;

    dateRangeForm        : FormGroup;
    dateFrom             : Date;
    dateTo               : Date;

    selectedEmployee            : number;
    selectedType                : number;
    toggleOpenClosedAll            = "1";
    toggleSuspendedOrders          = "0";
    toggleOrdersGreaterThanZero    = "0";
    togglePreAuth                  = "0";
    toggleTypeEmployee             = "0"
    toggleIsCashCredit             =  0
    printForm          : FormGroup;
    user               = {} as IUser;

    // searchModel   = {} as IPOSOrderSearchModel;
    employees$      : Observable<IItemBasic[]>;
    paymentMethod$  : Observable<IPaymentMethod[]>;
    serviceTypes$   : Observable<IServiceType[]>;
    _searchModel    : Subscription;
    searchModel     : IPaymentSearchModel;
    _posPayment     : Subscription;
    posPayment      : IPOSPayment;

    isStaff         : boolean;
    isAuthorized    : boolean;

    initSubscriptions() {
      this._searchModel = this.posPaymentService.searchModel$.subscribe( data => {
        if (!data) {
          this.searchModel = {} as IPaymentSearchModel
        } else {
          this.searchModel = data
        }
      })
      this._posPayment = this.posPaymentService.currentPayment$.subscribe( data => {
        this.posPayment = data
      })
    }

    initPlatForm()  {
      const platForm      = this.platForm;
      if (platForm === 'capacitor') { this.capacitorEnabled = true }
      if (platForm === 'electron')  { this.electronEnabled =  true }
    }

    constructor(
      private paymentMethodsService: PaymentMethodsService,
      private posPaymentService    : POSPaymentService,
      private orderService         : OrdersService,
      private awsBucketService     : AWSBucketService,
      private router               : Router,
      public  route                : ActivatedRoute,
      private siteService          : SitesService,
      private renderer             : Renderer2,
      private serviceTypes         : ServiceTypeService,
      private userService          : UserService,
      private matSnack             : MatSnackBar,
      private toolbarServiceUI     : ToolBarUIService,
      private userAuthorization    : UserAuthorizationService,
      private fb: FormBuilder,
      )
    {
      this.initForm();
      this.initSubscriptions();
      this.resetSearch()
    }

    ngOnInit() {
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.
      // this.initEmployeeList()
      this.initDateForm();
      this.initPlatForm();
      this.initAuthorization();
      return
    }

    initAuthorization() {

      this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
      this.isStaff =  this.userAuthorization.isUserAuthorized('admin, manager, employee')
    }

    initForm() {
      this.searchForm   = this.fb.group( {
        itemName          : [''],
      })
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
              this.refreshPaymentSearch(search);
              this.input.nativeElement.focus();
            } catch (error) {
              console.log('error searching')
            }

          })
        )
        .subscribe();
      }
    }

    resetSearch() {
      this.initForm();
      this.toggleSuspendedOrders       = "0";
      this.toggleOrdersGreaterThanZero = "0";
      this.toggleOpenClosedAll         = "0"
      this.toggleTypeEmployee          = "0"
      this.toggleIsCashCredit          = 0

      if (!this.searchModel) {
        this.searchModel = {} as IPaymentSearchModel
      }

      this.searchModel.id = 0
      this.searchModel.orderID = 0
      this.searchModel.isCash = false
      this.searchModel.preAuth = false
      this.searchModel.isCreditCard = false
      this.searchModel.tipInput = false

      this.searchModel.serviceTypeID = 0;
      this.searchModel.employeeID = 0;
      this.searchModel.paymentMethodID = 0;
      this.searchModel.pageNumber = 1;

      const site           = this.siteService.getAssignedSite()
      this.employees$      = this.orderService.getActiveEmployees(site)
      this.serviceTypes$   = this.serviceTypes.getSaleTypes(site)
      this.paymentMethod$   = this.paymentMethodsService.getList(site)

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
        this._searchModel.unsubscribe();
      }
    }

    refreshPaymentSearch(id: string) {
      if (! this.searchModel) {  this.searchModel = {} as IPaymentSearchModel }
      const searchModel = this.searchModel;
      searchModel.orderID = parseInt (id);
      console.log('filter output', this.searchModel)
      // search.id      = parseInt (id);
      this.posPaymentService.updateSearchModel( searchModel )
      // return this._searchItems$
      this.outputRefreshSearch.emit('true');
    }

    refreshSearch() {
      if (! this.searchModel) {  this.searchModel = {} as IPaymentSearchModel }
      const search = this.searchModel;
      this.posPaymentService.updateSearchModel( this.searchModel )
      this.outputRefreshSearch.emit('true');
    }

    refreshToggleAllClosedOpen() {
      if (! this.searchModel) {  this.searchModel = {} as IPaymentSearchModel }
      // this.searchModel.closedOpenAllPayments = this.toggleIsCashCredit
      this.searchModel.preAuth = false;

      //0 tip
      if (this.toggleOpenClosedAll == '1') {
        this.searchModel.tipInput = true
      }

      //pre-auth
      if (this.toggleOpenClosedAll == '2') {
        this.searchModel.isCash = false
        this.searchModel.preAuth = true
      }

      this.refreshSearch();
    }

    refreshToggleCashCredit() {
      if (this.toggleIsCashCredit == 0) {
        this.searchModel.isCash = false
        this.searchModel.isCreditCard = false
      }
      if (this.toggleIsCashCredit == 2) {
        this.searchModel.isCash = false
        this.searchModel.isCreditCard = true
      }
      if (this.toggleIsCashCredit == 1) {
        this.searchModel.isCash = true
        this.searchModel.isCreditCard = false
      }

      this.refreshSearch();
    }

    setServiceType(event) {
      if (!event) { return}
      if (! this.searchModel) {  this.searchModel = {} as IPaymentSearchModel }
      this.searchModel.serviceTypeID = event.id
      this.refreshSearch()
    }

    setEmployee(event) {
      if (!event) { return }
      if (! this.searchModel) {  this.searchModel = {} as IPaymentSearchModel }
      this.searchModel.employeeID = event.id
      this.refreshSearch()
    }

    setPaymentMethod(event) {
      if (!event) { return }
      if (! this.searchModel) {  this.searchModel = {} as IPaymentSearchModel }
      this.searchModel.paymentMethodID = event.id
      this.refreshSearch()
    }

    getPrinterName(){}

    setActiveOrder(id: number) {
      const site  = this.siteService.getAssignedSite();
      const order$ =  this.posPaymentService.getPOSPayment(site, id)
      order$.subscribe(data =>
        {
          this.posPaymentService.updatePaymentSubscription(data)
          // this.toolbarServiceUI.updateOrderBar(true)
        }
      )
    }

    async initDateForm() {
      console.log('init date form')
      this.dateRangeForm = new FormGroup({
        start: new FormControl(),
        end: new FormControl()
      });

      let today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      today = new Date(today.getTime() + (1000 * 60 * 60 * 24));

      this.dateRangeForm =  this.fb.group({
        start: new Date(year, month, 1),
        end: today // new Date()
      })

      console.log('date', this.dateRangeForm.get("start").value)

      this.searchModel.completionDate_From = this.dateRangeForm.get("start").value;
      this.searchModel.completionDate_To   = this.dateRangeForm.get("end").value;

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
          if (this.dateRangeForm.get("start").value && this.dateRangeForm.get("end").value) {
            this.refreshDateSearch()
          }
        })
      }
    }

     emitDatePickerData() {

      if (this.dateRangeForm) {
        if (!this.dateRangeForm.get("start").value || !this.dateRangeForm.get("end").value) {
          this.dateFrom = this.dateRangeForm.get("start").value
          this.dateTo = (  this.dateRangeForm.get("end").value )
          this.refreshDateSearch()
        }
      }

    }

    refreshDateSearch() {

      if (! this.searchModel) {  this.searchModel = {} as IPaymentSearchModel  }

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


    notifyEvent(message: string, title: string) {
      this.matSnack.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
    }

  }

import {Component, OnDestroy, Output,
        OnInit, AfterViewInit,
         ViewChild, ElementRef, EventEmitter, Inject, LOCALE_ID}  from '@angular/core';
import { IServiceType, IUser } from 'src/app/_interfaces';
import {  IPOSPayment, IPaymentSearchModel} from 'src/app/_interfaces/transactions/posorder';
import { IItemBasic,  } from 'src/app/_services';
import { OrdersService } from 'src/app/_services';
import { ActivatedRoute, } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter,tap } from 'rxjs/operators';
import { Observable, fromEvent, Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { DatePipe } from '@angular/common';

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
    get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
    searchForm: UntypedFormGroup;

    @Output() outputRefreshSearch :   EventEmitter<any> = new EventEmitter();
    get platForm()         {  return Capacitor.getPlatform(); }
    printingEnabled      : boolean;
    electronEnabled      : boolean;
    capacitorEnabled     : boolean;
    printerName          : string;
    printQuantity        : number;

    dateRangeForm        : UntypedFormGroup;
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
    printForm          : UntypedFormGroup;
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
      public  route                : ActivatedRoute,
      private siteService          : SitesService,
      private serviceTypes         : ServiceTypeService,
      private matSnack             : MatSnackBar,
      private userAuthorization    : UserAuthorizationService,
      private fb:                    UntypedFormBuilder,
      private datePipe: DatePipe,
      private dateHelper: DateHelperService,
      @Inject(LOCALE_ID) private locale: string

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

    ngOnDestroy() {
      if (this._posPayment) { this._posPayment.unsubscribe()}
      if (this._searchModel) {this._searchModel.unsubscribe();}
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

      if (!this.searchModel) { this.searchModel = {} as IPaymentSearchModel}

      this.searchModel.id               = 0
      this.searchModel.orderID          = 0
      this.searchModel.isCash           = false
      this.searchModel.preAuth          = false
      this.searchModel.isCreditCard     = false
      this.searchModel.tipInput         = false

      this.searchModel.serviceTypeID    = 0;
      this.searchModel.employeeID       = 0;
      this.searchModel.paymentMethodID  = 0;
      this.searchModel.pageNumber       = 1;

      const site           = this.siteService.getAssignedSite()
      this.employees$      = this.orderService.getActiveEmployees(site)
      this.serviceTypes$   = this.serviceTypes.getSaleTypes(site)
      this.paymentMethod$  = this.paymentMethodsService.getList(site)

      this.refreshSearch();
    }

    initEmployeeList(){
      const site           = this.siteService.getAssignedSite()
      setInterval(this.refreshEmployees,  (60*1000) *5);
     }

     refreshEmployees(){
        const site           = this.siteService.getAssignedSite()
        this.employees$      = this.orderService.getActiveEmployees(site)
     }



    refreshPaymentSearch(id: string) {
      if (! this.searchModel) {  this.searchModel = {} as IPaymentSearchModel }
      const searchModel = this.searchModel;
      searchModel.orderID = parseInt (id);
      this.posPaymentService.updateSearchModel( searchModel )
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
      const order$ =  this.posPaymentService.getPOSPayment(site, id, false)
      order$.subscribe(data =>
        {
          this.posPaymentService.updatePaymentSubscription(data)
        }
      )
    }

    changeDates(value) {

      let frm = this.dateRangeForm;
      let start = new  Date();
      let end = this.dateHelper.add('d', 1, start)

      console.log('DateForm values', frm.value, {start: start, end: end})

      console.log('value', value)
      console.log('starting date', this.datePipe.transform(start, 'yyyy-dd-MM',this.locale),  frm.controls['start'].value)
      if (frm.controls['start'].value) {
        start = frm.controls['start'].value;
      }

      if (value === 0){
        //set dateRangeForm start value to be the current date, and
        //sets the ending value to be +1 of the startDate
        start = new  Date();
        end = this.dateHelper.add('d', 1, start );
        console.log('end ', end)

      }
      //otherwise we use the 'starting date value of the dateRangeForm
      //then we set the date + / - the date of the Start value of that form.
      //and we set the end value to + 1 the value of the start value.
      if (value == 1){
        end = this.dateHelper.add('d', 1, start)
      }
      if (value == -1) {
        end = this.dateHelper.add('d', 1, start)
      }


      this.dateRangeForm = this.fb.group({
        start:  [this.datePipe.transform(start, 'yyyy/dd/MM',this.locale)],
        end: [this.datePipe.transform(end, 'yyyy/dd/MM',this.locale)]
      });

      this.subscribeToDatePicker();
    }

    async initDateForm() {
      this.dateRangeForm = new UntypedFormGroup({
        start: new UntypedFormControl(),
        end: new UntypedFormControl()
      });

      let today = new Date();
      const month = today.getMonth();
      const year = today.getFullYear();
      today = new Date(today.getTime() + (1000 * 60 * 60 * 24));

      this.dateRangeForm =  this.fb.group({
        start: new Date(year, month, 1),
        end: today // new Date()
      })

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
        if (this.dateRangeForm.get("start").value && this.dateRangeForm.get("end").value) {

          this.dateFrom = this.dateRangeForm.get("start").value
          this.dateTo   =  this.dateRangeForm.get("end").value

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

      const dateFrom = this.dateRangeForm.get("start").value;
      const dateTo = this.dateRangeForm.get("end").value;
      const start  = this.dateHelper.format(this.dateFrom, 'short')
      const end = this.dateHelper.format(this.dateTo, 'short')

      this.searchModel.completionDate_From = start
      this.searchModel.completionDate_To   = end
      // this.searchModel.completionDate_From =  this.dateFrom.toISOString()
      // this.searchModel.completionDate_To = this.dateTo.toISOString()
      this.refreshSearch()

    }


    notifyEvent(message: string, title: string) {
      this.matSnack.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
    }

  }

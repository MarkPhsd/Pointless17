import {Component, OnDestroy, Output,
  OnInit, AfterViewInit,
   ViewChild, ElementRef, EventEmitter}  from '@angular/core';
import { IPurchaseOrderItem, IServiceType, IUser } from 'src/app/_interfaces';
import { IItemBasic,  } from 'src/app/_services';
import { OrdersService } from 'src/app/_services';
import { ActivatedRoute, } from '@angular/router';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, filter,tap } from 'rxjs/operators';
import { Observable, fromEvent, Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { IOrderItemSearchModel, POSOrderItemService } from 'src/app/_services/transactions/posorder-item-service.service';
import { ItemTypeService } from 'src/app/_services/menu/item-type.service';

@Component({
  selector: 'app-items-filter',
  templateUrl: './items-filter.component.html',
  styleUrls: ['./items-filter.component.scss']
})
export class ItemsFilterComponent implements OnInit {

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
    toggleTypeEmployee             =  0
    toggleIsCashCredit             =  0
    printForm          : UntypedFormGroup;
    user               = {} as IUser;
    itemTypes$      : Observable<any>;
    employees$      : Observable<IItemBasic[]>;
    serviceTypes$   : Observable<IServiceType[]>;
    _searchModel    : Subscription;
    searchModel     : IOrderItemSearchModel;
    _posPayment     : Subscription;
    IPurchaseOrderItem      : IPurchaseOrderItem;

    isStaff         : boolean;
    isAuthorized    : boolean;

    initSubscriptions() {
      this._searchModel = this.pOSOrderItemService.searchModel$.subscribe( data => {
        if (!data) {
          this.searchModel = {} as IOrderItemSearchModel
        } else {
          this.searchModel = data
        }
      })

    }

    initPlatForm()  {
      const platForm      = this.platForm;
      if (platForm === 'capacitor') { this.capacitorEnabled = true }
      if (platForm === 'electron')  { this.electronEnabled =  true }
    }

    constructor(
      private pOSOrderItemService    : POSOrderItemService,
      private orderService         : OrdersService,
      public  route                : ActivatedRoute,
      private siteService          : SitesService,
      private serviceTypes         : ServiceTypeService,
      private userAuthorization    : UserAuthorizationService,
      private fb:                    UntypedFormBuilder,
      private itemTypeService     : ItemTypeService,
      private dateHelper: DateHelperService,

      )
    {

    }

    ngOnInit() {
      //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
      //Add 'implements OnInit' to the class.
      // this.initEmployeeList()
      this.initSubscriptions();
      this.resetSearch()
      this.initDateForm();
      this.initPlatForm();
      this.initAuthorization();
      this.initForm()
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
        name              : [],
        reportRunID: [],
      })
    }

    ngAfterViewInit() {
      if (this.searchForm) { 
        this.initSearchOption();
      }
    }

    refreshSearchPhrase(event) {
      const item = { itemName: event }
      this.searchForm.patchValue(item)
      this.searchModel.name = item.itemName;
      this.refreshSearch();
    }

    refreshSearchReportRunID(event) {
      const item = { reportRunID: event }
      this.searchForm.patchValue(item)
      this.searchModel.reportRunID = +item
      this.refreshSearch();
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
              this.refreshOrderItemsSearch(search);
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
      this.toggleTypeEmployee          = 0
      this.toggleIsCashCredit          = 0

      if (!this.searchModel) { this.searchModel = {} as IOrderItemSearchModel}

      this.searchModel.id               = 0
      this.searchModel.orderID          = 0

      this.searchModel.name = null;
      this.searchModel.itemTypeID = 0
      this.searchModel.serviceTypeID    = 0;
      this.searchModel.employeeID       = 0;
      this.searchModel.name = null;
      this.searchModel.pageNumber       = 1;

      const site            = this.siteService.getAssignedSite()
      this.employees$       = this.orderService.getActiveEmployees(site)
      this.serviceTypes$    = this.serviceTypes.getSaleTypes(site)
      this.itemTypes$       = this.itemTypeService.getBasicTypes(site)

      this.refreshSearch();
    }

    initEmployeeList(){
      const site           = this.siteService.getAssignedSite()
      this.refreshEmployees();
     }

     refreshEmployees(){
        const site           = this.siteService.getAssignedSite()
        this.employees$      = this.orderService.getActiveEmployees(site)
     }

    refreshOrderItemsSearch(name: string) {
      if (! this.searchModel) {  this.searchModel = {} as IOrderItemSearchModel }
      const searchModel = this.searchModel;
      searchModel.name = name;
      this.pOSOrderItemService.updateSearchModel( searchModel )
      this.outputRefreshSearch.emit('true');
    }


    refreshSearch() {
      if (! this.searchModel) {  this.searchModel = {} as IOrderItemSearchModel }
      const search = this.searchModel;
      this.pOSOrderItemService.updateSearchModel( this.searchModel )
      this.outputRefreshSearch.emit('true');
    }

    refreshToggleAllClosedOpen() {
      if (! this.searchModel) {  this.searchModel = {} as IOrderItemSearchModel }
      // this.searchModel.closedOpenAllPayments = this.toggleIsCashCredit
      this.refreshSearch();
    }

    setItemType(event) {
      if (!event) { return}
      if (! this.searchModel) {  this.searchModel = {} as IOrderItemSearchModel }
      this.searchModel.itemTypeID = event.id
      this.refreshSearch()
    }

    setServiceType(event) {
      if (!event) { return}
      if (! this.searchModel) {  this.searchModel = {} as IOrderItemSearchModel }
      this.searchModel.serviceTypeID = event.id
      this.refreshSearch()
    }

    setEmployee(event) {
      if (!event) { return }
      if (! this.searchModel) {  this.searchModel = {} as IOrderItemSearchModel }
      this.searchModel.employeeID = event.id
      this.refreshSearch()
    }

    setPaymentMethod(event) {
      if (!event) { return }
      if (! this.searchModel) {  this.searchModel = {} as IOrderItemSearchModel }
      this.refreshSearch()
    }

    getPrinterName(){}

    setActiveOrder(id: number) {
      const site  = this.siteService.getAssignedSite();
      const order$ =  this.pOSOrderItemService.getPOSOrderItembyHistory(site, id, false)
      order$.subscribe(data =>
        {
          //get the active order from the order id

          // this.posPaymentService.updatePaymentSubscription(data)
        }
      )
    }

    initDateForm() {
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

      if (! this.searchModel) {  this.searchModel = {} as IOrderItemSearchModel  }

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
      this.refreshSearch()

    }


  }

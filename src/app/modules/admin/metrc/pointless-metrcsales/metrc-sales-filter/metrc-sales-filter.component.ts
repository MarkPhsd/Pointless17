import {Component,  Output,
  OnInit,  ViewChild, ElementRef, EventEmitter, OnDestroy}  from '@angular/core';
import { IUser } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EmployeeService} from 'src/app/_services/people/employee-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { PointlessMETRCSalesService, PointlessMetrcSearchModel } from 'src/app/_services/metrc/pointless-metrcsales.service';
import { BalanceSheetService, IBalanceSheet } from 'src/app/_services/transactions/balance-sheet.service';

@Component({
  selector: 'metrc-sales-filter',
  templateUrl: './metrc-sales-filter.component.html',
  styleUrls: ['./metrc-sales-filter.component.scss']
})
export class MetrcSalesFilterComponent implements OnInit, OnDestroy {
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  value : string;
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  searchForm: FormGroup;

  @Output()  outputClearExceptions : EventEmitter<any> = new EventEmitter();
  @Output() outputCurrentDay :   EventEmitter<any> = new EventEmitter();
  @Output() outputRefreshSearch :   EventEmitter<any> = new EventEmitter();
  get platForm()         {  return Capacitor.getPlatform(); }

  printingEnabled    : boolean;
  electronEnabled    : boolean;
  capacitorEnabled   : boolean;
  printerName        : string;
  printQuantity      : number;

  selectedEmployee            : number;
  selectedType                : number;
  toggleOpenClosedAll            = "1";
  toggleEmployeeDeviceAll        = "0"
  printForm     : FormGroup;
  user          = {} as IUser;
  employees$    : Observable<IItemBasic[]>;
  searchModel   = {} as   PointlessMetrcSearchModel;
  dateRangeForm : FormGroup;
  _searchModel  : Subscription;
  isAuthorized  : boolean;
  filterForm    : FormGroup;
  dateFrom      : Date;
  dateTo        : Date;
  dateRange     : string;
  counter       : number;
  zRun$           : Observable<IBalanceSheet>;

  initSubscriptions() {
      this._searchModel = this.pointlessMetrcSalesReport.searchModel$.subscribe( data => {
        this.searchModel  = data
        if (!data) {
          // console.log('subscription initiSearch')
          // this.initSearchModel();
        }
    })
  }

  constructor(  private _snackBar               : MatSnackBar,
                private fb                      : FormBuilder,
                private siteService             : SitesService,
                private userAuthorization       : UserAuthorizationService,
                private employeeService         : EmployeeService,
                private orderService            : OrdersService,
                private pointlessMetrcSalesReport: PointlessMETRCSalesService,
                private dateHelper              : DateHelperService,
                private balanceSheetService: BalanceSheetService,
              )
  {
    this.initAuthorization();
  }

  ngOnInit(): void {
    this.initSubscriptions();
    this.initPlatForm();
    this.initDateForm()
    this.initSearchForm();
    this.initFormFromSearchModel();
    this.refreshEmployees();
    this.getCurrentDay();
  }

  ngOnDestroy( ) {
    if (this._searchModel) { this._searchModel.unsubscribe()}
  }

  getCurrentDay() {
    const site = this.siteService.getAssignedSite();
    this.zRun$ =  this.balanceSheetService.getZRUNBalanceSheet(site).pipe(switchMap(data => {
      this.reportCurrentSales(data.id)
      return of(data)
    }))
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
  }

  initPlatForm()  {
    const platForm      = this.platForm;
    if (platForm === 'capacitor') { this.capacitorEnabled = true }
    if (platForm === 'electron')  { this.electronEnabled =  true }
  }

  initFormFromSearchModel() {
     if (this.searchModel) {
      const search = this.searchModel;
      if (!search.employeeID) { search.employeeID = 0}
      this.selectedEmployee    = search.employeeID;

      if (this.toggleOpenClosedAll === '1') {
        this.dateRangeForm = this.fb.group({
          startDate: [],
          endDate  : []
        });
      }
      if (this.toggleOpenClosedAll != '1') {
          if (search.startDate || search.endDate) {
          try {
            this.dateRangeForm =  this.fb.group({
              startDate: new Date(search.startDate),
              endDate  : new Date(search.endDate)
            })
          } catch (error) {
          }
        } else {
          this.initDateForm();
        }
        this.subscribeToDatePicker();
      }
    }
  }

  refreshEmployees() {
    const site           = this.siteService.getAssignedSite()
    if (site) {
      this.employees$      = this.orderService.getActiveEmployees(site)
    }
  }

  setEmployee(event) {
    if (!event) { return }
    if (! this.searchModel) {  this.searchModel = {} as PointlessMetrcSearchModel  }
    this.searchModel.employeeID = event.id
    this.refreshSearch()
  }

  notifyEvent(message: string, title: string) {
    this._snackBar.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }

  refreshSearch() {
    if (! this.searchModel) {  this.searchModel = {} as PointlessMetrcSearchModel }
    this.searchModel.currentPage = 1;
    this.outputClearExceptions.emit(true)
    this.pointlessMetrcSalesReport.updateSearchModel( this.searchModel )
  }

  reportCurrentSales(id:number) {
    if (! this.searchModel) {  this.searchModel = {} as PointlessMetrcSearchModel }
    this.searchModel.startDate = null;
    this.searchModel.endDate = null;
    this.searchModel.employeeID = null;
    this.searchModel.name= null;
    this.searchModel.orderID = 0;
    this.searchModel.zRUN = id.toString();
    this.searchModel.currentPage = 1;
    this.outputClearExceptions.emit(true)
    this.pointlessMetrcSalesReport.updateSearchModel( this.searchModel )
  }

  refreshBalanceSearch(event) {
    this.reportCurrentSales(event)
  }

  initSearchModel() {
    const site = this.siteService.getAssignedSite()
    if (!site) { return }
    this.searchModel = {} as PointlessMetrcSearchModel
    console.log('initSearchModel Filter')
    this.pointlessMetrcSalesReport.updateSearchModel(this.searchModel)
    this.searchModel.employeeID  = 0
    this.searchModel.pageNumber  = 1;
    this.searchModel.currentPage = 1;
    this.searchModel.pageSize    = 1000;
    this.employees$      = this.employeeService.getAllActiveEmployees(site)
    this.initSearchForm();
    this.initDateForm()
  }

  refreshDateSearch() {
    this.assignDateSettings();
    this.refreshSearch()
  }

  resetSearch() {
    this.outputClearExceptions.emit(true)
    this.initSearchModel();
    this.assignDateSettings()
    this.refreshSearch();
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
    if (this.searchModel && this.searchModel.zRUN) {
      this.searchForm = this.fb.group({
        itemName : [this.searchModel.zRUN]
      })
    }
  }

  initDateForm() {
    console.log('init Date Form')
    this.dateRangeForm = new FormGroup({
      startDate: new FormControl(),
      endDate  : new FormControl()
    });

    let today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    let endDate = this.dateHelper.add('day', 1 ,today)
    this.dateRangeForm =  this.fb.group({
      startDate: today,
      endDate : endDate // new Date()
    })

    this.subscribeToDatePicker();
  }

  subscribeToDatePicker()  {
    if (this.dateRangeForm) {
      this.dateRangeForm.get('startDate').valueChanges.subscribe(res=>{
        if (!res) {return}
        this.dateFrom = res
      })

      this.dateRangeForm.get('endDate').valueChanges.subscribe(res=>{
        if (!res) {return}
        this.dateTo = res
      })

      this.dateRangeForm.valueChanges.subscribe( res => {
        this.dateFrom = this.dateRangeForm.get("startDate").value
        this.dateTo = this.dateRangeForm.get("endDate").value
        if (this.searchModel) {
          this.searchModel.zRUN = ""
        }
        if (this.dateRangeForm.get("startDate").value && this.dateRangeForm.get("endDate").value) {
        }
      })
    }
  }

  emitDatePickerData(dateRangeStart: HTMLInputElement, dateRangeEnd: HTMLInputElement) {

    if (dateRangeStart && dateRangeEnd) {
      this.dateFrom = this.dateRangeForm.get("startDate").value
      this.dateTo   = this.dateRangeForm.get("endDate").value
      this.refreshDateSearch()
    }
  }

  assignDateSettings() {
    if (! this.searchModel) {  this.searchModel = {} as PointlessMetrcSearchModel  }
    if (this.dateRangeForm ) {
      this.dateFrom = this.dateRangeForm.get("startDate").value
      this.dateTo   = this.dateRangeForm.get("endDate").value
      this.searchModel.zRUN = ''
      if (this.dateTo && this.dateFrom) {
        this.searchModel.startDate = this.dateHelper.format(this.dateFrom.toISOString(), 'MM/dd/yyyy');
        this.searchModel.endDate = this.dateHelper.format(this.dateTo.toISOString(), 'MM/dd/yyyy');
        return
      }
    }
    if (!this.dateRangeForm || !this.dateFrom || !this.dateTo) {
      this.searchModel.startDate = '';
      this.searchModel.endDate   = '';
      return
    }
  }
}

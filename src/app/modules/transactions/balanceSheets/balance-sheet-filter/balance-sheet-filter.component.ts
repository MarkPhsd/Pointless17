import {Component,  Output,
  OnInit,  ViewChild, ElementRef, EventEmitter, OnDestroy}  from '@angular/core';
import { IUser } from 'src/app/_interfaces';
import { IItemBasic, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EmployeeService} from 'src/app/_services/people/employee-service.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { BalanceSheetSearchModel, } from 'src/app/_services/transactions/balance-sheet.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';

@Component({
  selector: 'balance-sheet-filter',
  templateUrl: './balance-sheet-filter.component.html',
  styleUrls: ['./balance-sheet-filter.component.scss']
})
export class BalanceSheetFilterComponent implements  OnInit, OnDestroy {

  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();
  value : string;
  get itemName() { return this.searchForm.get("itemName") as FormControl;}
  searchForm: FormGroup;

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
  searchModel   = {} as   BalanceSheetSearchModel;
  dateRangeForm : FormGroup;
  _searchModel  : Subscription;
  isAuthorized  : boolean;
  filterForm    : FormGroup;
  dateFrom      : Date;
  dateTo        : Date;
  dateRange     : string;
  counter       : number;

  initSubscriptions() {
      this._searchModel = this.sheetMethodsService.balanceSearchModelSheet$.subscribe( data => {
        this.searchModel  = data
        if (!data) {
          this.initSearchModel();
        }
    })
  }

  constructor(  private _snackBar               : MatSnackBar,
                private fb                      : FormBuilder,
                private siteService             : SitesService,
                private userAuthorization       : UserAuthorizationService,
                private employeeService         : EmployeeService,
                private orderService            : OrdersService,
                private sheetMethodsService     : BalanceSheetMethodsService,
                private dateHelper              : DateHelperService,
              )
  {
    this.initAuthorization();
  }

  ngOnInit(): void {
    this.initPlatForm();
    this.initDateForm()
    this.initSearchForm();
    this.initSubscriptions();
    this.initSearchForm();
    this.initFormFromSearchModel();
    this.initEmployeeList();
  }

  ngOnDestroy( ) {
    if (this._searchModel) { this._searchModel.unsubscribe()}
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

    //initsearch form model;
     if (this.searchModel) {
      const search = this.searchModel;

      if (!search.employeeID) { search.employeeID = 0}
      this.selectedEmployee            = search.employeeID;

      if (!search.type) { search.type  = 0 }
      this.selectedType                = search.type;

      if (!search.balanceSheetStatus) {  search.balanceSheetStatus = 0;  }
      this.toggleOpenClosedAll         = search.balanceSheetStatus.toString();

      this.toggleEmployeeDeviceAll     =  search.type.toString();

      if (this.toggleOpenClosedAll === '1') {
        this.dateRangeForm = this.fb.group({
          start: [],
          end  : []
        });
      }
      if (this.toggleOpenClosedAll != '1') {

          if (search.completionDate_From || search.completionDate_To) {
          try {
            this.dateRangeForm =  this.fb.group({
              start: new Date(search.completionDate_From),
              end  : new Date(search.completionDate_To)
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

  initEmployeeList(){
    this.refreshEmployees();
    console.log('employee list')
    const site           = this.siteService.getAssignedSite()
    if (!site) { return }
    setInterval(this.refreshEmployees,  (60*1000) *5);
   }

  refreshEmployees(){
    try {
      const site           = this.siteService.getAssignedSite()
      console.log('site', site)
      if (!site) { return }
      this.employees$      = this.orderService.getActiveEmployees(site)
    } catch (error) {
      console.log('error',error)
    }
  }

  setEmployee(event) {
    if (!event) { return }
    if (! this.searchModel) {  this.searchModel = {} as BalanceSheetSearchModel  }
    this.searchModel.employeeID = event.id
    this.refreshSearch()
  }

  notifyEvent(message: string, title: string) {
    this._snackBar.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }

  refreshSearch() {
    if (! this.searchModel) {  this.searchModel = {} as BalanceSheetSearchModel }
    this.assignDateSettings();
    const search = this.searchModel;

    this.sheetMethodsService.updateBalanceSearchModel( search )
    this.outputRefreshSearch.emit('true');
  }

  refreshToggleAllClosedOpen() {
    if (! this.searchModel) {  this.searchModel = {} as BalanceSheetSearchModel }
    this.searchModel.balanceSheetStatus = parseInt(this.toggleOpenClosedAll)
    this.refreshSearch();
  }

  refreshtoggleEmployeeServerAll() {
    if (! this.searchModel) {  this.searchModel = {} as BalanceSheetSearchModel }
    this.searchModel.type = parseInt(this.toggleEmployeeDeviceAll)
    this.refreshSearch();
  }

  refreshBalanceSearch(event) {
    if (! this.searchModel) {  this.searchModel = {} as BalanceSheetSearchModel }
    this.searchModel.id = event;
    this.refreshSearch();
  }

  initSearchModel() {
    const site = this.siteService.getAssignedSite()
    if (!site) { return }
    this.searchModel = {} as BalanceSheetSearchModel

    this.sheetMethodsService.updateBalanceSearchModel(this.searchModel)

    this.toggleOpenClosedAll     = "1"
    this.toggleEmployeeDeviceAll = "0"

    this.searchModel.employeeID  = 0
    this.searchModel.type        = parseInt(this.toggleEmployeeDeviceAll)
    this.searchModel.balanceSheetStatus =  parseInt(this.toggleOpenClosedAll)

    this.searchModel.pageNumber = 1;
    this.searchModel.pageSize   = 25;
    this.employees$      = this.employeeService.getAllActiveEmployees(site)

    this.initSearchForm();
    this.initDateForm()
  }

  resetSearch() {
    this.initSearchModel();
    this.refreshSearch();
  }

  initSearchForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
    if (this.searchModel && this.searchModel.id) {
      this.searchForm = this.fb.group({
        itemName : [this.searchModel.id]
      })
    }
  }

  async initDateForm() {
    this.dateRangeForm = new FormGroup({
      start: new FormControl(),
      end  : new FormControl()
    });

    let today = new Date();
    const month = today.getMonth();
    const year = today.getFullYear();

    // today = new Date(today.getTime() + (1000 * 60 * 60 * 24));
    let endDate = this.dateHelper.add('day', 1 ,today)
    //// new Date(year, month, 1),
    this.dateRangeForm =  this.fb.group({
      start: today,
      end  : endDate // new Date()
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
      if (!this.dateRangeForm.get("start").value || !this.dateRangeForm.get("end").value) {
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo   = this.dateRangeForm.get("end").value
        this.refreshDateSearch()
      }
    }
  }

  refreshDateSearch() {
    this.assignDateSettings();
    this.refreshSearch()
  }

  assignDateSettings() {
    if (! this.searchModel) {  this.searchModel = {} as BalanceSheetSearchModel  }
    if (this.dateRangeForm ) {
      this.dateFrom = this.dateRangeForm.get("start").value
      this.dateTo   = this.dateRangeForm.get("end").value
      if (this.dateTo && this.dateFrom) {
        this.searchModel.completionDate_From = this.dateFrom.toISOString()
        this.searchModel.completionDate_To = this.dateTo.toISOString()
        return
      }
    }
    if (!this.dateRangeForm || !this.dateFrom || !this.dateTo) {
      this.searchModel.completionDate_From = '';
      this.searchModel.completionDate_To   = '';
      return
    }
  }
}

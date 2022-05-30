import { Component, OnInit , ViewChild, EventEmitter,Output, ElementRef, OnDestroy} from '@angular/core';
import { employee, IUser, jobTypes } from 'src/app/_interfaces';
import {IItemBasic } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EmployeeSearchModel, EmployeeService} from 'src/app/_services/people/employee-service.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable, Subscription } from 'rxjs';
import { Capacitor } from '@capacitor/core';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { JobTypesService } from 'src/app/_services/people/job-types.service';
import { Router } from '@angular/router';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';

@Component({
  selector: 'employee-filter-panel',
  templateUrl: './employee-filter-panel.component.html',
  styleUrls: ['./employee-filter-panel.component.scss']
})
export class EmployeeFilterPanelComponent implements OnInit, OnDestroy  {

  @ViewChild('input', {static: true}) input: ElementRef;

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
  selectedjobTypeID           : number;
  selectedType                : number;
  toggleTerminated             = "1"
  printForm          : FormGroup;
  user               = {} as IUser;
  employees$        :   Observable<IItemBasic[]>;
  searchModel       = {} as   EmployeeSearchModel;
  _searchModel      : Subscription;
  jobTypes$         : Observable<jobTypes[]>;

  isAdmin      : boolean;
  isAuthorized : boolean;
  isStaff      : boolean;
  filterForm   : FormGroup;
  // calDate: IDatePicker;
  dateFrom     : Date;
  dateTo       : Date;
  dateRange    : string;

  counter         : number;
  _currentEmployee: Subscription;
  currentEmployee : employee;

  //Do this next!!
  initSubscriptions() {
      this._searchModel = this.employeeService.searchModel$.subscribe( data => {
        this.searchModel  = data
        if (!data) {
          this.searchModel =    this.initSearchModel();
        }
    })
    this._currentEmployee = this.employeeService.currentEditEmployee$.subscribe( data => {
      this.currentEmployee = data;
    })
  }
  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._searchModel)     {this._searchModel.unsubscribe()}
    if (this._currentEmployee) {this._currentEmployee.unsubscribe()}
    
  }

  constructor(
      private employeeService         : EmployeeService,
      private fb                      : FormBuilder,
      private siteService             : SitesService,
      private userAuthorization       : UserAuthorizationService,
      private jobTypeService          : JobTypesService,
      private router                  : Router,
      private productEditButtonService: ProductEditButtonService,
    )
  {
  this.initAuthorization();
  }

  ngOnInit(): void {
    this.searchModel =    this.initSearchModel();
    const site = this.siteService.getAssignedSite();
    this.jobTypes$ = this.jobTypeService.getTypes(site)
    this.initPlatForm();
    this.initSearchForm();
    this.initSubscriptions();
    this.initFormFromSearchModel();
  }

  async initSearchForm() {
    this.searchForm = this.fb.group({
      itemName : ['']
    })
  }

  initAuthorization() {
    this.isAdmin =  this.userAuthorization.isUserAuthorized('admin')
    this.isAuthorized =  this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff =  this.userAuthorization.isUserAuthorized('admin, manager, employee')
  }

  initPlatForm()  {
    const platForm      = this.platForm;
    if (platForm === 'capacitor') { this.capacitorEnabled = true }
    if (platForm === 'electron')  { this.electronEnabled =  true }
  }

  initFormFromSearchModel() {
    if (this.searchModel) {
      const search = this.searchModel;
      if (!search.jobTypeID) { search.jobTypeID = 0}
      this.selectedjobTypeID   = search.jobTypeID;
      if (!search.terminated) {  search.terminated  = "1";  }
      this.toggleTerminated   = search.terminated.toString();
    }
  }

  applyMetrcKey(){

    if (this.currentEmployee) {
      this.productEditButtonService.openEmployeeMetrcKeyEntryComponent(this.currentEmployee)
    }
  }

  setJobType(event) {
    if (!event) { return }
    if (! this.searchModel) {  this.searchModel = {} as EmployeeSearchModel  }
    this.searchModel.jobTypeID = event.id
    this.selectedjobTypeID = event.id;
    this.refreshSearch()
  }

  resetSearch() {
    const search  = this.initSearchModel();
    this.employeeService.updateSearchModel(search)
    this.refreshSearch()
  }

  initSearchModel(): EmployeeSearchModel {
    const site = this.siteService.getAssignedSite()

    this.searchModel = {} as EmployeeSearchModel
    this.searchModel.pageNumber = 1;
    this.searchModel.pageSize   = 25;

    this.toggleTerminated = "1"
    this.selectedjobTypeID = 0;
    this.initSearchForm();
    this.searchModel.name = ''

    this.searchModel.terminated  = this.toggleTerminated
    this.searchModel.jobTypeID   = this.selectedjobTypeID;

    return this.searchModel
  }

  getSearchModel(): EmployeeSearchModel {

    let search = this.searchModel;
    if (!this.searchModel) {
      search =  this.initSearchModel()
    }

    return search;
  }


  refreshSearchPhrase(event) {
    const search = this.getSearchModel()
    search.name = event;
    this.employeeService.updateSearchModel( search )

  }

  refreshSearch() {
    const search = this.getSearchModel()
    this.employeeService.updateSearchModel( search )
  }

  newEmployee() {
    const employee = {}
    this.router.navigate(['/employee-edit', {id:0}]);
  }

}

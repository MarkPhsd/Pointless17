import {Component, OnDestroy,
  HostListener, OnInit,
  EventEmitter, Output,
  ViewChild, ElementRef,
  }  from '@angular/core';
import { ISite, IUser,  } from 'src/app/_interfaces';
import { IPOSOrderSearchModel,  } from 'src/app/_interfaces/transactions/posorder';
import { ActivatedRoute, Router} from '@angular/router';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Plugins } from '@capacitor/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap,filter,tap } from 'rxjs/operators';
import { Observable, Subject ,fromEvent, Subscription, of } from 'rxjs';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ManifestStatus, ManifestStatusService } from 'src/app/_services/inventory/manifest-status.service';
import { ManifestType, ManifestTypesService } from 'src/app/_services/inventory/manifest-types.service';
import { ManifestInventoryService, ManifestSearchModel } from 'src/app/_services/inventory/manifest-inventory.service';
import { InventoryStatusList } from '../../inventory-list/inventory-list/inventory-list.component';
import { InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatDateRangeComponent } from 'src/app/shared/widgets/mat-date-range/mat-date-range.component';

const { Keyboard } = Plugins;

@Component({
  selector: 'app-mainfest-filter',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    MatDateRangeComponent,
  SharedPipesModule],
  templateUrl: './mainfest-filter.component.html',
  styleUrls: ['./mainfest-filter.component.scss']
})
export class MainfestFilterComponent implements OnInit, OnDestroy {

  //auth - suspended orders, employee selection
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  selectedType       : number;
  user               = {} as IUser;
  paidDateForm      : UntypedFormGroup;
  inputForm         : UntypedFormGroup;
  dateRangeForm     : UntypedFormGroup;
  dateFrom          : any;
  dateTo            : any;

  scheduleDateForm  : UntypedFormGroup;
  scheduleDateFrom  : any;
  scheduleDateTo    : any;

  sendDateForm      : UntypedFormGroup;
  sendDateFrom      : any;
  sendDateTo        : any;

  acceptedDateForm  : UntypedFormGroup;
  acceptedDateFrom  : any;
  acceptedDateTo    : any;

  _searchModel     : Subscription;
  searchModel      : ManifestSearchModel;
  searchForm       : UntypedFormGroup;
  searchPhrase     : Subject<any> = new Subject();
  value            : string;
  smallDevice      = false;

  isAuthorized     : any;
  isStaff          : boolean;
  isUser           : boolean;

  showDateFilter      : boolean;
  showScheduleFilter  = false ;

  _viewType      : Subscription;
  viewType       : number;

  _manifestStatus: Subscription;
  manifestStatus :  ManifestStatus;

  _manifestType  : Subscription;
  manifestType   : ManifestType;

  type$          : Observable<ManifestType[]>;
  status$        : Observable<ManifestStatus[]>;
  sites$         : Observable<ISite[]>;
  active         : boolean;


  inventoryStatus:      InventoryStatusList;
  inventoryStatusID:    number;
  inventoryStatusList  = this.inventoryAssignmentService.inventoryActiveList;

  @Output() outPutHidePanel = new EventEmitter();

  get itemName() { return this.searchForm.get("itemName") as UntypedFormControl;}
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
    this._manifestStatus = this.inventoryManifestService.manifestStatus$.subscribe( data => {
      if (!data) {
        this.manifestStatus = null;
      }
      if (data) {
        this.manifestStatus = data;
      }
    })
  }

  initViewTypeSubscriber() {
    this._manifestType = this.inventoryManifestService.manifestTypes$.subscribe(data => {
      this.manifestType = data;
    })
  }

  initSearchSubscriber() {
    try {
      this._searchModel = this.inventoryManifestService.searchModel$.subscribe( data => {
        this.searchModel = data
        this.initFilter(data)
      })
    } catch (error) {
    }
  }

  initSubscriptions() {
    this.subscribeToDatePicker();
    this.initStatusSubscriber();
    this.initViewTypeSubscriber();
    this.initSearchSubscriber();
  }

  constructor(
      private inventoryManifestService: ManifestInventoryService,
      private manifestTypeService     : ManifestTypesService,
      private manifestStatusService   : ManifestStatusService,
      private sitesService: SitesService,
      public  route              : ActivatedRoute,
      private siteService        : SitesService,
      private matSnack           : MatSnackBar,
      private fb                 : UntypedFormBuilder,
      private userAuthorization  : UserAuthorizationService,
      private _bottomSheet       : MatBottomSheet,
      private dateHelperService  : DateHelperService,
      private inventoryAssignmentService: InventoryAssignmentService,
  )
  {
  }

  ngOnInit() {
    const site   = this.siteService.getAssignedSite();
    this.status$ = this.manifestStatusService.listAll();
    this.type$   = this.manifestTypeService.listAll();
    this.sites$  = this.sitesService.getSites();
    this.initAuthorization();
    this.updateItemsPerPage();
    this.initDateForm();
    this.initForm();
    this.initSubscriptions();
    this.refreshSearch();
    this.initSearchOption();
    return
  }

  displayPanel()  {

  }

  initAuthorization() {

    this.isAuthorized =  this.userAuthorization.isManagement// //('admin, manager')
    this.isStaff =  this.userAuthorization.isStaff // ('admin, manager, employee')
    this.isUser = this.userAuthorization.isUser //

    if (this.isAuthorized) {
      this.showDateFilter = true;
    }
  }

  initForm() {

    this.searchForm   = this.fb.group( {
      itemName          : [''],
    })

    this.inputForm = this.fb.group({
      typeID          : [],
      statusID        : [],
      destinationID   : [],
      status          : [],
      type            : [],
      destinationName : [],
      destinationURL  : [],
      activeStatus    : [2],
    })

    this.inputForm.valueChanges.subscribe( data => {
      this.searchModel = this.inputForm.value as ManifestSearchModel;
      if (this.manifestStatus) {
        this.searchModel.status = this.manifestStatus.name
      }
      if (this.manifestType) {
        this.searchModel.type = this.manifestType.name
      }
      this.refreshDateSearch();
      this.refreshSearch();
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

  getInventoryStatus(event) {
    // if (event.value) {
    //   this.assignInventoryStatus(event.value);
    // } else {
    //   this.inventoryStatus.id = 0
    // }
  }


  assignInventoryStatus(name: string): InventoryStatusList {
    return  this.inventoryStatus = this.inventoryStatusList.find(data =>
      {
        if ( data.name === name ) {
          this.inventoryStatus = data;
          this.inventoryStatusID  = this.inventoryStatus.id
          return
        }
      }
    )
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
            this.refreshSearchPhrase(search);
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
    this.initSearchModel();
    this.initForm();
    this.refreshSearch();
  }

  ngOnDestroy() {
    if (this._searchModel) {
      this._searchModel.unsubscribe();
    }
    if (this._viewType) {
      this._viewType.unsubscribe();
    }
  }

  updateSearchModel(searchModel: ManifestSearchModel) {
    this.inventoryManifestService.updateSearchModel( searchModel )
  }

  initFilter(search: ManifestSearchModel) {
    if (!search) {
      search = {} as ManifestSearchModel
      this.searchModel = search;
      this.searchModel.activeStatus = 1;
    }
  }

  initSearchModel() {
    if (! this.searchModel) {
      this.searchModel = {} as ManifestSearchModel
      this.searchModel.activeStatus = 1;
    }
  }
  refreshSearch() {
    this.initSearchModel();
    let search      = this.searchModel;
    console.log(this.searchModel)
    this.updateSearchModel(search)
    return this._searchItems$
  }

  refreshSearchPhrase(searchPhrase: string) {
    this.initSearchModel();
    this.searchModel.name   = searchPhrase
    this.inventoryManifestService.updateSearchModel( this.searchModel )
  }

  notifyEvent(message: string, title: string) {
    this.matSnack.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
  }

  initDateForm() {
    this.scheduleDateForm = new UntypedFormGroup({
      start: new UntypedFormControl(),
      end: new UntypedFormControl()
    });
    this.sendDateForm = new UntypedFormGroup({
      start: new UntypedFormControl(),
      end: new UntypedFormControl()
    });
    this.acceptedDateForm = new UntypedFormGroup({
      start: new UntypedFormControl(),
      end: new UntypedFormControl()
    });
    this.paidDateForm = new UntypedFormGroup({
      start: new UntypedFormControl(),
      end: new UntypedFormControl()
    });
  }

  subscribeToDatePicker() {
    this.scheduleDateForm.valueChanges.subscribe(res=>{
      if (this.scheduleDateForm.get("start").value && this.scheduleDateForm.get("end").value) {
          this.refreshDateSearch()
        }
      }
    )

    this.sendDateForm.valueChanges.subscribe(res=>{
    if (this.sendDateForm.get("start").value && this.sendDateForm.get("end").value) {
        this.refreshDateSearch()
        }
      }
    )

    this.acceptedDateForm.valueChanges.subscribe(res=>{
      if (this.acceptedDateForm.get("start").value && this.acceptedDateForm.get("end").value) {
          this.refreshDateSearch()
        }
      }
    )

    this.paidDateForm.valueChanges.subscribe(res=>{
      if (this.paidDateForm.get("start").value && this.paidDateForm.get("end").value) {
          this.refreshDateSearch()
        }
      }
    )
  }

  emitDatePickerData(event, type: string) {
    if (this.scheduleDateForm && type === 'schedule') {
      const form = this.scheduleDateForm
      if (!form.get("start").value || !form.get("end").value) {
        this.scheduleDateFrom = form.get("start").value
        this.scheduleDateTo = (  form.get("end").value )
        this.refreshDateSearch()
      }
    }

    if (this.sendDateForm  && type === 'send') {
      const form = this.sendDateForm
      if (!form.get("start").value || !form.get("end").value) {
        this.sendDateFrom = form.get("start").value
        this.sendDateTo = (  form.get("end").value )
        this.refreshDateSearch()
      }
    }

    if (this.acceptedDateForm && type === 'accepted') {
      const form = this.acceptedDateForm
      if (!form.get("start").value || !form.get("end").value) {
        this.acceptedDateFrom = form.get("start").value
        this.acceptedDateTo = (  form.get("end").value )
        this.refreshDateSearch()
      }
    }

    if (this.paidDateForm && type === 'paid') {
      const form = this.paidDateForm
      if (!form.get("start").value || !form.get("end").value) {
        this.refreshDateSearch()
      }
    }
  }

  refreshDateSearch() {
    this.initSearchModel();

    this.searchModel.scheduleDate_From = '';
    this.searchModel.scheduleDate_To   = '';
    this.searchModel.accepted_From = '';
    this.searchModel.accepted_To   = '';
    this.searchModel.send_From = '';
    this.searchModel.send_To   = '';
    this.searchModel.paid_From = '';
    this.searchModel.paid_To   = '';

    if (!this.scheduleDateForm || !this.scheduleDateForm.get("start").value  || !this.scheduleDateForm.get("end").value) {
    } else {
      const to    = this.scheduleDateForm.get("end").value
      const from  = this.scheduleDateForm.get("start").value

      this.searchModel.scheduleDate_From = this.dateHelperService.format(from, 'MM/dd/yyyy')
      this.searchModel.scheduleDate_To   = this.dateHelperService.format(to, 'MM/dd/yyyy')
      console.log(this.searchModel)
    }

    if (!this.scheduleDateForm || !this.scheduleDateForm.get("start").value  || !this.scheduleDateForm.get("end").value) {
    } else {
      const to    = this.scheduleDateForm.get("end").value
      const from  = this.scheduleDateForm.get("start").value

      this.searchModel.accepted_From = this.dateHelperService.format(from, 'MM/dd/yyyy')
      this.searchModel.accepted_To   = this.dateHelperService.format(to, 'MM/dd/yyyy')
    }

    if (!this.sendDateForm || !this.sendDateForm.get("end").value  || !this.sendDateForm.get("start").value) {
    } else {
      const to    = this.scheduleDateForm.get("end").value
      const from  = this.scheduleDateForm.get("start").value

      this.searchModel.send_From   =  this.dateHelperService.format(from, 'MM/dd/yyyy')
      this.searchModel.send_To     =  this.dateHelperService.format(to, 'MM/dd/yyyy')
    }

    if (!this.paidDateForm || !this.paidDateForm.get("end").value  || !this.paidDateForm.get("start").value) {
    } else {
      const to    = this.paidDateForm.get("end").value
      const from  = this.paidDateForm.get("start").value

      this.searchModel.paid_From   =  this.dateHelperService.format(from, 'MM/dd/yyyy')
      this.searchModel.paid_To     =  this.dateHelperService.format(to, 'MM/dd/yyyy')
    }

    console.log( this.searchModel)
    this.refreshSearch()
  }

  setDestinationSite(event) {
    const id = event.value;

    if (event && this.inputForm) {
      this.siteService.getSite(id).subscribe(data => {
        this.inputForm.controls['destinationID'].setValue(data.id);
        this.inputForm.controls['destinationURL'].setValue(data.url);
        this.inputForm.controls['destinationSiteName'].setValue(data.name);
        this.refreshSearch()
      })
    }

  }

  applyType(event) {
    if (event && this.inputForm) {
      this.manifestType = event;
       this.refreshSearch()
    }
  }

  applyStatus(event) {
    if (event && this.inputForm) {
      this.manifestStatus = event;
      this.refreshSearch()
    }
  }

  applyActiveStatus(event) {
    if (event && this.inputForm) {

      this.inputForm.controls['activeStatus'].setValue(event.value.id)
      this.refreshSearch()
    }
  }
}

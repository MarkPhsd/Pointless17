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
import { ManifestStatus, ManifestStatusService } from 'src/app/_services/inventory/manifest-status.service';
import { ManifestType, ManifestTypesService } from 'src/app/_services/inventory/manifest-types.service';
import { ManifestInventoryService, ManifestSearchModel } from 'src/app/_services/inventory/manifest-inventory.service';

const { Keyboard } = Plugins;

@Component({
  selector: 'app-mainfest-filter',
  templateUrl: './mainfest-filter.component.html',
  styleUrls: ['./mainfest-filter.component.scss']
})
export class MainfestFilterComponent implements OnInit, OnDestroy {

  //auth - suspended orders, employee selection
  @ViewChild('input', {static: true}) input: ElementRef;
  @Output() itemSelect  = new EventEmitter();

  selectedType       : number;
  user               = {} as IUser;

  dateRangeForm     : FormGroup;
  dateFrom          : any;
  dateTo            : any;

  scheduleDateForm  : FormGroup;
  scheduleDateFrom  : any;
  scheduleDateTo    : any;

  sendDateForm      : FormGroup;
  sendDateFrom      : any;
  sendDateTo        : any;

  acceptedDateForm  : FormGroup;
  acceptedDateFrom  : any;
  acceptedDateTo    : any;

  _searchModel     : Subscription;
  searchModel      : ManifestSearchModel;
  searchForm       : FormGroup;
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

  active         : boolean;

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
    this.initStatusSubscriber();
    this.initViewTypeSubscriber();
    this.initSearchSubscriber();
  }

  constructor(
      private inventoryManifestService: ManifestInventoryService,
      private manifestTypeService     : ManifestTypesService,
      private manifestStatusService   : ManifestStatusService,
      public  route              : ActivatedRoute,
      private siteService        : SitesService,
      private matSnack           : MatSnackBar,
      private fb                 : FormBuilder,
      private userAuthorization  : UserAuthorizationService,
      private _bottomSheet       : MatBottomSheet
  )
  {
  }

  ngOnInit() {
    const site           = this.siteService.getAssignedSite();
    this.status$ = this.manifestStatusService.listAll();
    this.type$   = this.manifestTypeService.listAll();
    this.initAuthorization();
    this.initScheduledDateForm();
    this.updateItemsPerPage();
    this.initSubscriptions();
    this.initForm();
    this.refreshSearch();
    this.initSearchOption();
    return
  }

  displayPanel()  {
    // const show =  localStorage.getItem('OrderFilterPanelVisible')
    // console.log(show)
    // if (!show || show === 'true') {
    //   localStorage.setItem('OrderFilterPanelVisible', 'false')
    //   this.outPutHidePanel.emit(false)
    //   return
    // }
    // if (show === 'false') {
    //   localStorage.setItem('OrderFilterPanelVisible', 'true')
    //   this.outPutHidePanel.emit(true)
    //   return
    // }
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin, manager, employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isAuthorized) {
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
    this.searchModel = {} as ManifestSearchModel;
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

  initSearch(searchModel: ManifestSearchModel) {
    this.inventoryManifestService.updateSearchModel( searchModel )
  }

  //check
  initFilter(search: ManifestSearchModel) {
    if (!search) {
      search = {} as ManifestSearchModel
      this.searchModel = search;
    }
  }

  refreshSearch() {
    if (! this.searchModel) {  this.searchModel = {} as ManifestSearchModel }
    let search      = this.searchModel;
    search.active   = this.active;

    this.initSearch(search)
    return this._searchItems$
  }

  refreshSearchPhrase(searchPhrase: string) {
    if (! this.searchModel) {  this.searchModel = {} as ManifestSearchModel }
    let search              = this.searchModel;
    search.active           = this.active;
    this.searchModel.name   = searchPhrase
    this.initSearch(search)
    return this._searchItems$
  }

  notifyEvent(message: string, title: string) {
    this.matSnack.open(message, title, {duration: 2000, verticalPosition: 'bottom'})
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

    if (!this.showScheduleFilter) {
      if (this.searchModel) {
        this.searchModel.scheduleDate_From = null;
        this.searchModel.scheduleDate_To = null;
      }
      return
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
  }


  refreshDateSearch() {
    if (! this.searchModel) {  this.searchModel = {} as ManifestSearchModel  }
    this.refreshSearch()
  }


  refreshScheduledDateSearch() {
    if (! this.searchModel) {  this.searchModel = {} as ManifestSearchModel  }

      if (!this.scheduleDateForm || !this.scheduleDateFrom  || !this.scheduleDateTo) {
        this.searchModel.scheduleDate_From = '';
        this.searchModel.scheduleDate_To   = '';
      } else {
        const to    = this.scheduleDateForm.get("start").value
        const from  = this.scheduleDateForm.get("end").value

        this.searchModel.scheduleDate_From = from.toISOString()
        this.searchModel.scheduleDate_To   = to.toISOString()
      }

      if (!this.scheduleDateForm || !this.acceptedDateFrom  || !this.acceptedDateTo) {
        this.searchModel.accepted_From = '';
        this.searchModel.accepted_To   = '';
      } else {
        const to    = this.scheduleDateForm.get("start").value
        const from  = this.scheduleDateForm.get("end").value

        this.searchModel.accepted_From = from.toISOString()
        this.searchModel.accepted_To   = to.toISOString()
      }

      if (!this.sendDateForm || !this.sendDateFrom  || !this.sendDateTo) {
        this.searchModel.send_From = '';
        this.searchModel.send_To   = '';
      } else {
        const to    = this.sendDateForm.get("start").value
        const from  = this.sendDateForm.get("end").value

        this.searchModel.send_To = to.toISOString()
        this.searchModel.send_From   = from.toISOString()
      }

      this.refreshSearch()
  }

}

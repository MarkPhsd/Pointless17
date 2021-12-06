import {Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, Subscription } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { IClientTable, IUserProfile } from 'src/app/_interfaces';
import { IPOSOrder, IPOSOrderSearchModel } from 'src/app/_interfaces/transactions/posorder';
import { AWSBucketService, ContactsService, OrdersService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { IStatuses} from 'src/app/_services/people/status-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-check-in-profile',
  templateUrl: './check-in-profile.component.html',
  styleUrls: ['./check-in-profile.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CheckInProfileComponent implements OnInit {

  inputForm   : FormGroup;
  bucketName  :  string;
  awsBucketURL:  string;
  profile     :  IUserProfile;

  statuses$   : Observable<IStatuses[]>;
  client$     : Observable<IClientTable>;

  @Input() clientTable  : IClientTable;
  @Input() id           : string;

  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  public selectedIndex          : number;
  isAuthorized                  : boolean ;
  isStaff                       : boolean;
  minumumAllowedDateForPurchases: Date

  currentOrder  :  IPOSOrder;
  _currentOrder : Subscription;

  _searchModel     :   Subscription;
  searchModel      :   IPOSOrderSearchModel;

  dateRangeForm     : FormGroup;
  dateFrom          : any;
  dateTo            : any;


  initSubscriptions() {
    this._currentOrder = this.orderService.currentOrder$.subscribe(data=> {
      this.currentOrder = data;
    })

    this._searchModel = this.orderService.posSearchModel$.subscribe( data => {
      this.searchModel = data
      this.initFilter(data)
    })

  }

  constructor(
              private router              : Router,
              public  route               : ActivatedRoute,
              private sanitizer           : DomSanitizer,
              private awsBucket           : AWSBucketService,
              private _snackBar           : MatSnackBar,
              public  contactservice      : ContactsService,
              private clientTableService  : ClientTableService,
              private orderService        : OrdersService,
              private siteService         : SitesService,
              private fbContactsService   : FbContactsService,
              private fb                  : FormBuilder,
              private userAuthorization   : UserAuthorizationService,
            ) {

    this.id = this.route.snapshot.paramMap.get('id');
    this.isAuthorized =  this.userAuthorization.isUserAuthorized('admin, manager')
    this.isStaff      =  this.userAuthorization.isUserAuthorized('admin, manager, employee')
    this.initSubscriptions();
  }

  async ngOnInit() {
    const site = this.siteService.getAssignedSite();
    this.bucketName =   await this.awsBucket.awsBucket();
    this.awsBucketURL = await this.awsBucket.awsBucketURL();
    this.selectedIndex = 0

    this.fillForm( this.id );

    const currentYear = new Date().getFullYear();
    this.minumumAllowedDateForPurchases = new Date(currentYear - 21, 0, 1);

    this.initDateRangeForm();
  }

  emitDatePickerData(event) {
    this.refreshDateSearch()
  }

  refreshOrders() {
    const site = this.siteService.getAssignedSite();
    const searchModel = {} as IPOSOrderSearchModel;
    searchModel.clientID = parseInt (this.id)
    this.orderService.updateOrderSearchModel(searchModel)
  }

  initForm() {
    this.inputForm = this.fbContactsService.initForm(this.inputForm)
    return this.inputForm
  };

  initDateRangeForm() {
    if (this.searchModel) {
      this.searchModel.completionDate_From = null;
      this.searchModel.completionDate_To = null;
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
    this.searchModel.completionDate_To   = this.dateRangeForm.get("start").value;
    this.subscribeToDatePicker();
  }

  subscribeToDatePicker() {
    if (this.dateRangeForm) {
      this.dateRangeForm.get('start').valueChanges.subscribe(res=>{
        if (!res) {return}
        this.dateFrom = res
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

  refreshDateSearch() {
    if (!this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel  }
    this.assignDates();
    this.searchModel.completionDate_From = this.dateFrom.toISOString()
    this.searchModel.completionDate_To   = this.dateTo.toISOString()
    this.refreshSearch()
  }

  refreshSearch() {
    if (!this.searchModel) {
      this.searchModel               = {} as IPOSOrderSearchModel
      this.searchModel.serviceTypeID = 0
      this.searchModel.employeeID    = 0
    }
    this.searchModel.clientID        = parseInt(this.id)
    const search                     = this.searchModel;
    this.initOrderSearch(search)
  }

  initOrderSearch(searchModel: IPOSOrderSearchModel) {
    this.orderService.updateOrderSearchModel( searchModel )
  }

  initFilter(search: IPOSOrderSearchModel) {
    if (!search) {
      search                      = {} as IPOSOrderSearchModel
      search.suspendedOrder       = 0
      search.greaterThanZero      = 0
      search.closedOpenAllOrders  = 1;
      search.clientID   = parseInt(this.id)
      this.searchModel            = search;
    }
  }

  assignDates() {
    if (this.dateRangeForm) {
      if (!this.dateRangeForm.get("start").value || !this.dateRangeForm.get("start").value) {
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo   = this.dateRangeForm.get("end").value
      }
    }
    if (!this.dateRangeForm || !this.dateFrom || !this.dateTo) {
      this.searchModel.completionDate_From = '';
      this.searchModel.completionDate_To   = '';
      this.refreshSearch()
      return
    }
  }

  fillForm(id: any) {
    this.initForm()
    const site   = this.siteService.getAssignedSite();
    const client$ =this.clientTableService.getClient(site, id)
    client$.subscribe(data => {
      this.inputForm.patchValue(data)
      console.log(data)
      return
    })
  }

  postNewCheckIn() {
    const site = this.siteService.getAssignedSite();
    if (this.id) {
      const order$ = this.orderService.getNewDefaultCheckIn(site, this.id)
      order$.subscribe(
        data => {
          this.notifyEvent(`Order Submitted Order # ${data.id}`, "Posted")
          this.refreshOrders();
        }, catchError => {
          this.notifyEvent("Order was not submitted " + catchError, "Error")
        }
      )
    }
  }

  updateUser(): void {
    const site = this.siteService.getAssignedSite();
    let result = ''
    try {
      const client$ = this.clientTableService.saveClient(site, this.inputForm.value)
      client$.pipe(
        switchMap(data =>
          {
            if (!data) { return EMPTY }
            if (this.currentOrder) {
              return this.orderService.getOrder(site, this.currentOrder.id.toString(), false)
            }
            return EMPTY;
          }
        )).subscribe( order => {
          this.orderService.updateOrderSubscription(order)
        })
    } catch (error) {
      this.notifyEvent(result, "Failure")
    }
  };

  updateUserExit() {
    this.updateUser();
    this.goBackToList();
  };

  navUserList() {
    this.goBackToList();
  };

  goBackToList() {
    this.router.navigate(["profileListing"]);
  }

  sanitize(html) {

    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

  selectChange(): void{
    console.log("Selected INDEX: " + this.selectedIndex);
  }

  // Action triggered when user swipes
  swipe(selectedIndex: any, action = this.SWIPE_ACTION.RIGHT) {

    // Out of range
    if ( selectedIndex < 0 || selectedIndex > 1 ) return;

    // Swipe left, next tab
    if (action === this.SWIPE_ACTION.LEFT) {
      const isLast = selectedIndex === 1;
      selectedIndex = isLast ? 0 : selectedIndex + 1;
      console.log("Swipe right - INDEX: " +  selectedIndex);
    }

    // Swipe right, previous tab
    if (action === this.SWIPE_ACTION.RIGHT) {
      const isFirst = selectedIndex === 0;
      selectedIndex = isFirst ? 1 :  selectedIndex - 1;
      console.log("Swipe left - INDEX: " + selectedIndex);
    }
  }

  deleteUser() {
    const result =  window.confirm('Are you sure you want to delete this profile?')

    if (result == true && this.clientTable) {
      const site = this.siteService.getAssignedSite();
      const client$ = this.contactservice.deleteClient(site, this.clientTable.id)
      client$.subscribe( data => {
        this.notifyEvent('This profile has been removed.', 'Success')
        this.router.navigateByUrl('/profileListing')
      })
    }


  }

  startOrder() {
    this.postNewCheckIn()
  }


}

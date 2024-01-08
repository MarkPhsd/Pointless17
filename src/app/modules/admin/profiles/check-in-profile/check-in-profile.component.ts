import {Component, Input, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup } from '@angular/forms';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { MatSnackBar } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { EMPTY, Observable, of, Subscription } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';
import { FbContactsService } from 'src/app/_form-builder/fb-contacts.service';
import { clientType, IClientTable, IUser, IUserProfile } from 'src/app/_interfaces';
import { ClientType } from 'src/app/_interfaces/menu/price-schedule';
import { IPOSOrder, IPOSOrderSearchModel } from 'src/app/_interfaces/transactions/posorder';
import { LabelingService } from 'src/app/_labeling/labeling.service';
import { AWSBucketService, AuthenticationService, ContactsService, OrdersService } from 'src/app/_services';
import { ClientTableService } from 'src/app/_services/people/client-table.service';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { IStatuses} from 'src/app/_services/people/status-type.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { NewOrderTypeComponent } from 'src/app/modules/posorders/components/new-order-type/new-order-type.component';
import { CoachMarksClass, CoachMarksService } from 'src/app/shared/widgets/coach-marks/coach-marks.service';

@Component({
  selector: 'app-check-in-profile',
  templateUrl: './check-in-profile.component.html',
  styleUrls: ['./check-in-profile.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})

export class CheckInProfileComponent implements OnInit, OnDestroy {
  errorMessages = []
  @ViewChild('coachingAlertMessages', {read: ElementRef}) coachingAlertMessages: ElementRef;
  @ViewChild('coachingDisabledMessage', {read: ElementRef}) coachingDisabledMessage: ElementRef;
  @ViewChild('coachingMedical', {read: ElementRef}) coachingMedical: ElementRef;

  pendingOrdersEnabled = false
  closedOrdersEnabled = false
  enableDateRange = false;
  enableStartOrder: boolean;

  selectForm: UntypedFormGroup;
  dateRangeList =
  [
    {name:'Last 90 days', value: '90'},
    {name: 'Last 60 days', value: '60'},
    {name: 'Last 30  days',value: '30'},
    {name: 'Last 10  days',value: '10'},
    {name: 'Open Orders', value: 'open'}
  ]
  inputForm   :  UntypedFormGroup;
  bucketName  :  string;
  awsBucketURL:  string;
  profile     :  IUserProfile;
  bottomSheet$: Observable<any>;
  statuses$   : Observable<IStatuses[]>;
  client$     : Observable<IClientTable>;
  clientType$: Observable<clientType>;
  clientType : clientType
  @Input() clientTable  : IClientTable;
  @Input() id           : string;

  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };

  public selectedIndex          : number;
  isAuthorized                  : boolean;
  isStaff                       : boolean;
  minumumAllowedDateForPurchases: Date

  action$: Observable<any>;
  currentOrder  :  IPOSOrder;
  _currentOrder : Subscription;

  _searchModel     :   Subscription;
  searchModel      :   IPOSOrderSearchModel;

  dateRangeForm     : UntypedFormGroup;
  dateFrom          : any;
  dateTo            : any;
  isUser            : boolean;
  accountDisabled  : boolean;
  transactionUISettings  : TransactionUISettings
  enableMEDClients: boolean;
  validationMessage = ''

  clientForm  : UntypedFormGroup;
  confirmPassword: UntypedFormGroup;
  passwordsMatch      = true;

  password1
  password2
  _user: Subscription;
  user: IUser;

  initSubscriptions() {
    this._currentOrder = this.orderMethodsService.currentOrder$.subscribe(data=> {
      this.currentOrder = data;
    })
    this._searchModel = this.orderMethodsService.posSearchModel$.subscribe( data => {
      this.searchModel = data
      this.initFilter(data)
    })
  }

  initUserSubscriber() {
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
      this.getUserInfo()
    })
  }

  getUserInfo() {
    let user: IUser;
    if (this.user) { user = this.user  }
    if (!this.user) {
       user = JSON.parse(localStorage.getItem('user')) as IUser;
       this.user = user;
    }

    this.enableStartOrder = true
    if (user && user.roles) {
      if (user.roles != 'user' && user.roles != 'guest') {
        this.enableStartOrder = true
      }
    }
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
              private fb                  : UntypedFormBuilder,
              private userAuthorization   : UserAuthorizationService,
              private uiSettingsService   : UISettingsService,
              private orderMethodsService : OrderMethodsService,
              private clientTypeService   :    ClientTypeService,
              private dateHelperService   : DateHelperService,
              public coachMarksService     : CoachMarksService,
              private _bottomSheet         : MatBottomSheet,
              private authenticationService: AuthenticationService,
              public labelingService: LabelingService,


              ) {
    this.id = this.route.snapshot.paramMap.get('id');
    this.isAuthorized =  this.userAuthorization.isUserAuthorized('admin,manager');
    this.isStaff      =  this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser       =  this.userAuthorization.isUserAuthorized('user');
    this.initSubscriptions();
    this.refreshOrderSearch(null);
    this.initUserSubscriber();
  }

  async ngOnInit() {
    this.bucketName    = await this.awsBucket.awsBucket();
    this.awsBucketURL  = await this.awsBucket.awsBucketURL();
    this.uiSettingsService.getSetting('UITransactionSetting').subscribe(data => {
      if (!data) {return}
      this.transactionUISettings = JSON.parse(data.text)
      this.enableMEDClients = this.transactionUISettings.enablMEDClients;
      const site         = this.siteService.getAssignedSite();
      this.selectedIndex = 0
      this.fillForm( this.id );
      const currentYear                   = new Date().getFullYear();
      this.minumumAllowedDateForPurchases = new Date(currentYear - 21, 0, 1);
      this.initDateRangeForm();
      this.initConfirmPassword();
      this.initSelectForm();

    })

  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this.orderMethodsService.updateOrderSearchModel(null)
    if (this._currentOrder) {this._currentOrder.unsubscribe()}
    if (this._searchModel) { this._searchModel.unsubscribe()}
  }

  initSelectForm() {
    this.selectForm = this.fb.group( {
		  rangeSelect: ['']
		})
  }

  checkValidity(client: IClientTable, requiresLicenseValidation: boolean) {

    if (!client) {return}
    let requires : boolean
    const typeID =  client.clientTypeID;
    const site = this.siteService.getAssignedSite()
    this.clientType$   = this.clientTypeService.getClientTypeCached(site, typeID).pipe(switchMap(data => {
      this.refreshClientValidatiy(client, requiresLicenseValidation, data)
      return of(data)
    }))

  }

  refreshClientValidatiy(client, requiresLicenseValidation, data: clientType) {
    this.clientType = data;
    const result =  this.orderMethodsService.validateCustomerForOrder(client,  requiresLicenseValidation, data.name)
    this.accountDisabled = false
    this.validationMessage = '';
    if (!result.valid)  {
      this.accountDisabled = true
      this.validationMessage = result.resultMessage;
    }
    this.validatePatientType()
  }

  initConfirmPassword()  {
		this.confirmPassword = this.fb.group( {
		  confirmPassword: ['']
		})
    this.validateMatchingPasswords();
  }


  validatePatientType() {
    this.errorMessages = []
    const patient = this.clientTable && this.clientTable.patientRecOption;
    // console.log('patient', patient)
    if (this.inputForm.controls['patientRecOption'].value || patient) {
      const client = this.inputForm.value as IClientTable;

      if (!this.clientType) {
        this.errorMessages.push('No Contact Type')
        return false;
      }

      const patCare = this.clientType?.name.toLowerCase() === 'caregiver' ||
                      this.clientType?.name.toLowerCase() === 'patient'

      if (patCare) {

        const type = this.clientType?.name.toLowerCase();

        if (!client.medLicenseNumber) {
          this.errorMessages.push('No OOMP value - Patient')
          return false;
        }


        if (type === 'patient') {
          if (!client.insTertiaryNum) {
            this.errorMessages.push('No OOMP value - Patient')
            return false;
          }
          if (client.insTertiaryNum) {
            if (+client?.insTertiaryNum.length != 7) {
              this.errorMessages.push(`OOMP wrong length ${client.medLicenseNumber}` )
              return false;
            }
          }
        }

        if (type === 'caregiver') {
          if (!client.medLicenseNumber) {
            this.errorMessages.push('No OOMPB value')
            return false;
          }
          if (client.medLicenseNumber) {
            if (+client.medLicenseNumber.length != 7) {
              this.errorMessages.push(`OOMP wrong length ${client.medLicenseNumber}` )
              return false;
            }
          }

          //insTertiaryNum
          if (!client.insTertiaryNum) {
            this.errorMessages.push('No OOMPB value')
            return false;
          }
          if (client.insTertiaryNum) {
            if (+client.insTertiaryNum.length != 7) {
              this.errorMessages.push(`OOMPB wrong length ${client.insTertiaryNum}` )
              return false;
            }
          }
        }
        if (type === 'patient') {
          // if (!client.medLicenseNumber) {
          //   this.errorMessages.push('No OOMP value')
          //   return false;
          // }
        }
        if (this.clientType) {
          if (type === 'caregiver') {

           return false;
          }

       }
      }

            // insTertiaryNum OOMP

            //clientType?.name.toLowerCase() === 'patient'
            // medLicenseNumber OOMPB
    }
  }

  validateMatchingPasswords() {
    try {
      this.confirmPassword.valueChanges.subscribe( data => {
        if (!this.confirmPassword) { this.initConfirmPassword()}
        if (this.confirmPassword) {
          this.password1 = this.confirmPassword.controls['confirmPassword'].value;
          if (this.password1 == this.password2) {
            this.passwordsMatch = true;
            return
          }
        }
        this.passwordsMatch = false
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  validateMatchingPasswords2() {
    try {
      this.clientForm.valueChanges.subscribe( data => {
        if (this.clientForm) {
          this.password2 = this.clientForm.controls['apiPassword'].value;
          if (this.password1 == this.password2) {
            this.passwordsMatch = true;
            return
          }
        }
        this.passwordsMatch = false
      })
    } catch (error) {
      console.log('error', error)
    }
  }

  emitDatePickerData(event) {
    // this.refreshDateSearch()
  }

  chooseDateRangeValue(value: any) {
    this.initDateRangeForm();
    //set the date range to the value
    const now = new Date()
    let start = new Date()
    if (value === '90') {
       start  =this.dateHelperService.add('d', -90, now)
    }
    if (value === '60') {
       start  =this.dateHelperService.add('d', -60, now)
    }

    if (value === '30') {
       start  =this.dateHelperService.add('d', -30, now)
    }
    if (value === '10') {
       start  =this.dateHelperService.add('d', -10, now)
    }
    if (value === 'open') {

    }

    this.searchModel = {} as IPOSOrderSearchModel;
    this.searchModel.completionDate_From = start.toISOString()
    this.searchModel.completionDate_To   = now.toISOString()
    this.searchModel.searchOrderHistory = true;
    this.refreshDateSearch()
  }

  consolidateClientOrders() {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.orderService.consolidateClientOrders(site,this.clientTable.id).pipe(
      switchMap(data => {
        if (!data.id) {
          this.orderService.notificationEvent('Orders not consolidated.' + data.toString(), 'Alert')
          // console.log(data.toString())
          return of(null)
        }
      return  this.orderService.getOrder(site, data.id.toString(), false)
    })).pipe(switchMap(data => {
      this.orderService.notificationEvent('Orders Consolidated. Primary order unsuspended. Check the current order.', 'Alert')
      this.orderMethodsService.updateOrderSubscriptionLoginAction(data);
      return of(data)
    }))
  }

  listAllOrders() {
    const searchModel    = {} as IPOSOrderSearchModel;
    searchModel.clientID = parseInt (this.id)
    searchModel.suspendedOrder        = 2;
    this.orderMethodsService.updateOrderSearchModelDirect(searchModel)
  }

  updateOrderOptionsStatus(search: IPOSOrderSearchModel) {
    this.closedOrdersEnabled = false;
    this.pendingOrdersEnabled = false
    if (search) {
      if (search.completionDate_From) {
        this.closedOrdersEnabled = true;
      }  else {
        this.pendingOrdersEnabled = true
      }
    }
  }

  showOnlyOpenOrders() {
    const search                = {} as IPOSOrderSearchModel
    search.greaterThanZero      = 1
    search.closedOpenAllOrders  = 1;
    search.suspendedOrder       = 0;
    search.clientID             = parseInt(this.id)
    this.searchModel            = search;
    this.orderMethodsService.updateOrderSearchModelDirect(search)
    this.updateOrderOptionsStatus(search)
  }

  showClosedOrders() {
    let search                = {} as IPOSOrderSearchModel
    search.greaterThanZero       = 1
    search.closedOpenAllOrders   = 2;
    search.suspendedOrder        = 0;
    search.clientID             = parseInt(this.id)
    search                      = this.getClosedDates(search)
    this.searchModel            = search;
    this.orderMethodsService.updateOrderSearchModelDirect(search)
    this.updateOrderOptionsStatus(search)
  }

  showSuspendedOrders() {
    let search                = {} as IPOSOrderSearchModel
    search.greaterThanZero       = 1
    search.closedOpenAllOrders   = 1;
    search.suspendedOrder        = 1;
    search.clientID             = parseInt(this.id)
    this.searchModel            = search;
    this.orderMethodsService.updateOrderSearchModelDirect(search)
    this.updateOrderOptionsStatus(search)
  }

  getClosedDates(search: IPOSOrderSearchModel) {

    if (this.dateRangeForm) {

      // // console.log(this.dateRangeForm.value)
      // console.log('start value',  this.dateRangeForm.controls['start'].value.toISOString())
      this.dateFrom =  this.dateRangeForm.controls['start'].value.toISOString();
      this.dateTo =  this.dateRangeForm.controls['end'].value.toISOString();

      search.completionDate_From = this.dateFrom ;
      search.completionDate_To   = this.dateTo
    }

    return search

  }

  initForm() {
    this.inputForm = this.fbContactsService.initForm(this.inputForm)
    if (this.inputForm) {
      this.inputForm.valueChanges.subscribe( data => {
        // console.log(data)
        if (data && this.transactionUISettings &&   this.transactionUISettings.validateCustomerLicenseID) {
          this.checkValidity(this.inputForm.value,  this.transactionUISettings.validateCustomerLicenseID)
        }
      })
    }
    return this.inputForm
  };

  initDateRangeForm() {
    if (this.searchModel) {
      this.searchModel.completionDate_From = null;
      this.searchModel.completionDate_To = null;
    }
    this.dateRangeForm = new UntypedFormGroup({
      start: new UntypedFormControl(),
      end: new UntypedFormControl()
    });
    const today = new Date();
    const month = today.getMonth();
    const year  = today.getFullYear();
    this.dateRangeForm =  this.fb.group({
      start: new Date(year, month, 1),
      end: new Date()
    })
    if (this.dateRangeForm.get("start").value) {
      this.searchModel.completionDate_From = this.dateRangeForm.get("start").value.toISOString();
    }

    if (this.dateRangeForm.get("end").value) {
      this.searchModel.completionDate_To   = this.dateRangeForm.get("end").value.toISOString();
    }
    this.subscribeToDatePicker();
  }

  subscribeToDatePicker() {
    if (this.dateRangeForm) {
      this.dateRangeForm.valueChanges.subscribe( res => {
        if (this.dateRangeForm.get('start').value && this.dateRangeForm.get('end').value) {
          this.dateFrom = this.dateRangeForm.controls['start'].value
          this.dateTo = this.dateRangeForm.controls['end'].value
          this.searchModel.completionDate_From = this.dateFrom.toISOString() ;
          this.searchModel.completionDate_To   =  this.dateTo.toISOString();
          this.refreshDateSearch()
        }
      })
    }
  }

  refreshDateSearch() {
    if (!this.searchModel) {  this.searchModel = {} as IPOSOrderSearchModel  }
    this.refreshOrderSearch(this.searchModel)
  }

  refreshOrderSearch(searchModel: IPOSOrderSearchModel) {
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
    this.orderMethodsService.updateOrderSearchModel( searchModel )
  }

  initFilter(search: IPOSOrderSearchModel) {
    if (!search) {
      search                      = {} as IPOSOrderSearchModel
      search.suspendedOrder       = 0
      search.greaterThanZero      = 0
      search.closedOpenAllOrders  = 1;
      search.suspendedOrder       = 2;
      search.clientID             = parseInt(this.id)
      this.searchModel            = search;
      return search
    }
  }

  refreshOrdersByDates() {
    if (this.dateRangeForm) {
      if (!this.dateRangeForm.get("start").value || !this.dateRangeForm.get("start").value) {
        this.dateFrom = this.dateRangeForm.get("start").value
        this.dateTo   = this.dateRangeForm.get("end").value
      }
    }
    if (!this.dateRangeForm || !this.dateFrom || !this.dateTo) {
      this.searchModel = null;
      this.searchModel = this.initFilter(this.searchModel)
    }
    this.refreshOrderSearch(this.searchModel)
  }

  fillForm(id: any) {
    this.initForm()
    const site   = this.siteService.getAssignedSite();
    const client$ =this.clientTableService.getClient(site, id)
    client$.pipe(
      switchMap(data => {
      this.inputForm.patchValue(data)
      this.clientTable = data;
      if (!data.clientTypeID) {
        this.errorMessages.push('No Client Type Assigned')
      }
      return this.clientTypeService.getClientTypeCached(site, data.clientTypeID)
    })).subscribe(data => {
      if (!data) { return }
      this.checkValidity(   this.clientTable, this.transactionUISettings.validateCustomerLicenseID)
    })
  }

  postNewCheckIn() {
    if (!this.clientTable) { return }
    const site = this.siteService.getAssignedSite()
    const payload = this.orderMethodsService.getPayLoadDefaults(null)
    payload.order.clientID = this.clientTable.id;

    const postOrder$ = this.orderService.postOrderWithPayload(site, payload).pipe(switchMap(data => {
      this.orderMethodsService.updateOrder(data)
      this.changeTransactionType(null)
      return of(data)
    }))
    return postOrder$
  }

  changeTransactionType(event) {
    this.orderMethodsService.toggleChangeOrderType = true;
    const bottomSheet = this._bottomSheet.open(NewOrderTypeComponent)
    this.bottomSheet$ = bottomSheet.afterDismissed()
    this.bottomSheet$.subscribe(data => {
      this.orderMethodsService.updateOrder(null)
      this.orderMethodsService.toggleChangeOrderType = false;
    })
  }

  updateUser(event): void {
    const site = this.siteService.getAssignedSite();
    let result = ''
    const client$ = this.clientTableService.saveClient(site, this.inputForm.value);

    this.action$ = client$.pipe(
      switchMap(data =>
        {
          if (data) {
            if (data.errorMessage === 'Not authorized.') {
              this.siteService.notify(`Not authorized `, 'Close', 5000, 'yellow' );
              return of(null);
            }
          }
          this.checkValidity(data,  this.transactionUISettings?.validateCustomerLicenseID)
          this.notifyEvent('Account updated', 'Success');
          this.inputForm.patchValue(data)
          this.clientTable = data;
          if (!data) { return of(null) }
          if (this.currentOrder) {
            return this.orderService.getOrder(site, this.currentOrder.id.toString(), false)
          }
          return of(null);
        }
      )).pipe(
        switchMap( order => {
        this.orderMethodsService.updateOrderSubscription(order)
        if (event) {
          this.goBackToList();
        }
        return of(order)
      }), catchError(data => {
        this.siteService.notify(`Error ${data} `, 'Close', 5000, 'red' );
        return of(data)
    }))
  };

  updateUserExit(event) {
    this.updateUser(true);
  };

  navUserList(event) {
    this.goBackToList()
  };

  goBackToList() {
    if (this.isStaff) {
      this.router.navigate(["profileListing"]);
      return
    }
    this.router.navigate(["app-main-menu"]);
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
    // console.log("Selected INDEX: " + this.selectedIndex);
  }

  // Action triggered when user swipes
  swipe(selectedIndex: any, action = this.SWIPE_ACTION.RIGHT) {
    // Out of range
    if ( selectedIndex < 0 || selectedIndex > 1 ) return;

    // Swipe left, next tab
    if (action === this.SWIPE_ACTION.LEFT) {
      const isLast = selectedIndex === 1;
      selectedIndex = isLast ? 0 : selectedIndex + 1;
    }

    // Swipe right, previous tab
    if (action === this.SWIPE_ACTION.RIGHT) {
      const isFirst = selectedIndex === 0;
      selectedIndex = isFirst ? 1 :  selectedIndex - 1;
    }
  }

  deleteUser(event) {

    if (this.isStaff && !this.isAuthorized) {
      this.notifyEvent('This operation is not allowed.', 'Failed')
      return
    }

    // const result =  window.confirm('Are you sure you want to delete this profile?')

    // if (result == true && this.clientTable) {
      const site = this.siteService.getAssignedSite();
      const client$ = this.contactservice.deleteClient(site, this.clientTable.id)
      client$.subscribe( data => {
        this.notifyEvent('This profile has been removed.', 'Success')
        this.goBackToList()
      })
    // }
  }

  startOrder(event) {
    const site = this.siteService.getAssignedSite()
    const clientType$  = this.clientTypeService.getClientTypeCached(site, this.clientTable.clientTypeID)
    this.action$ =   clientType$.pipe(
      switchMap( data => {
        if (!data) { return of(null)}
        const result = this.orderMethodsService.validateCustomerForOrder(this.clientTable, false, data?.name)
        if (!result.valid) {
          this.notifyEvent(result.resultMessage, 'Failed');
          return of(null)
        }

        return   this.postNewCheckIn()
    }))

  }

  initPopover() {
    if (this.user?.userPreferences && this.user?.userPreferences?.enableCoachMarks ) {
      this.coachMarksService.clear()

      const items = [
      {id: 1, name: 'alerts', subject: 'Alert Messages will appear here. If the user requires license numbers, or cards are expired, you will see that info here.'},
      {id: 2, name: 'disabled', subject: 'Client Type defines certain settings about the profile. Patiens require special information be filled out and you will see additional fields.'},
      {id: 3, name: 'coachingMedical', subject: 'Medical Information: If the Client Type is Patient or Caregiver, additional fields will show that you will need to complete. '},
      {id: 4, name: '', subject: ''},
      {id: 5, name: '', subject: ''},
      {id: 6, name: '', subject: ''},
      ]

      if (this.isStaff && this.coachingAlertMessages) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingAlertMessages.nativeElement, items[0].subject));
      }

      if (this.isStaff && this.coachingDisabledMessage) {
          this.coachMarksService.add(new CoachMarksClass(this.coachingDisabledMessage.nativeElement, items[1].subject));
        }

      if (this.isStaff && this.coachingMedical) {
        this.coachMarksService.add(new CoachMarksClass(this.coachingMedical.nativeElement, items[2].subject));
      }

	  this.coachMarksService.showCurrentPopover();
    }

  }


  // @ViewChild('coachingAlertMessages', {read: ElementRef}) coachingAlertMessages: ElementRef;
  // @ViewChild('coachingDisabledMessage', {read: ElementRef}) coachingDisabledMessage: ElementRef;
  // @ViewChild('coachingMedical', {read: ElementRef}) coachingMedical: ElementRef;

}

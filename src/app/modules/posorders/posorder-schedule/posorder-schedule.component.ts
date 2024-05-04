import { Component, OnInit, Input,OnDestroy } from '@angular/core';
import { UntypedFormGroup,UntypedFormBuilder, Validators, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IServiceType,  } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { DomSanitizer } from '@angular/platform-browser';
import { RequestMessageService } from 'src/app/_services/system/request-message.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
@Component({
  selector   : 'pos-order-schedule',
  templateUrl: './posorder-schedule.component.html',
  styleUrls  : ['./posorder-schedule.component.scss']
})
export class POSOrderScheduleComponent implements OnInit,OnDestroy {

  @Input() serviceType      : IServiceType;
  action$                   : Observable<any>;
  inputFormNotes            : FormGroup;
  inputForm                 : FormGroup;
  scheduleForm              : FormGroup;
  order                     : IPOSOrder;
  _order                    : Subscription;
  errorMessage    : string;
  SWIPE_ACTION    = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  public          selectedIndex          = 0;
  showSaveButton  = false;
  processingUpdate: boolean;
  scheduledDate   : string;
  messages        = [];

  saving: boolean;
  messages$      = this.getScheduleMessages() //   Observable<IRequestMessage[]>;

  isAuthorized  : boolean;
  isUser        : boolean;
  isStaff       : boolean;
  instructions
  shippingInstructions
  scheduleInstructions;
  dateTimeFormat = 'y-MM-dd h:mm:ss a'
  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.pipe(
      switchMap( data => {
      if (data) {
        this.order =  data
      }
      if (data && data.preferredScheduleDate) {
        this.scheduledDate = data?.preferredScheduleDate;
      }
      const site = this.siteService.getAssignedSite()
      if (data && data.serviceType) {
        return this.serviceTypeService.getTypeCached(site, +data.serviceTypeID)
      }
      const item = {} as IServiceType;
      return of(item)
    })).subscribe(data => {
      this.serviceType = data;

      if (data) {
        this.instructions = this.sanitizer.bypassSecurityTrustHtml(this.serviceType?.instructions);
        this.shippingInstructions = this.sanitizer.bypassSecurityTrustHtml(this.serviceType?.shippingInstructions);
        this.scheduleInstructions = this.sanitizer.bypassSecurityTrustHtml(this.serviceType?.scheduleInstructions);
      }
    })
  }

  constructor(
    private orderService      : OrdersService,
    public orderMethodsService: OrderMethodsService,
    private router            : Router,
    private fb                : UntypedFormBuilder,
    private siteService       : SitesService,
    private matSnack          : MatSnackBar,
    private serviceTypeService: ServiceTypeService,
    private dateHelperService : DateHelperService,
    public platFormService    : PlatformService,
    private requestMessageService: RequestMessageService,
    private sanitizer: DomSanitizer,
    private userAuthorization: UserAuthorizationService,
    // public datepipe: DatePipe
    )
  { }

  ngOnInit(): void {
    if (this.router.url == 'pos-payment'){ this.showSaveButton = true; }
    this.initSubscriptions();
    this.initNotesForm();
    this.initAddressForm();
    this.initScheduleDateForm() ;
    this.initAuthorization();
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {

    }
  }

  initScheduleDateForm() {
    this.scheduleForm = this.fb.group( {
      preferredScheduleDate : [this.order?.preferredScheduleDate],
    })
    // preferedScheduleTime  : [this.dateHelperService.format(this.order?.preferredScheduleDate, 'shortTime')]
  }

  ngOnDestroy(): void {
    if (this._order) {
      this._order.unsubscribe()
    }
  }

  getScheduleMessages() {
    const site = this.siteService.getAssignedSite();
    return this.requestMessageService.getTemplateMessages(site).pipe(
      switchMap(data => {
        console.log('get schedule messages', data)
        if (data) {
          data = data.filter(item => {
            return item.type.toLowerCase() == 'ps'
          })
        }
        return of(data)
      }
      )
    )
  }

  initAddressForm() {
   if (this.order && this.order.clients_POSOrders && !this.order.shipAddress) {
      const client = this.order.clients_POSOrders;
      this.inputForm = this.fb.group({
        address  :[client?.address, Validators.required],
        city     :[client?.city, Validators.required],
        address2 :[, Validators.required],
        state    :[client?.state, Validators.required],
        zip      :[client?.zip, Validators.required],
      })
      return
    }

    this.inputForm = this.fb.group({
      address  :[this.order?.shipAddress, Validators.required],
      address2 :[this.order?.shipAddress2],
      city     :[this.order?.shipCity, Validators.required],
      state    :[this.order?.shipState, Validators.required],
      zip      :[this.order?.shipPostal, Validators.required],
    })
    this.errorMessage = ''
  }

  selectChange() {

  }

  sendPrepRequest() {
    const action$ = this.saveOrderMemo()
    this.processingUpdate = true;
    this.action$ =  action$.pipe(switchMap(data => {
      if (data && data.id) {
        this.processingUpdate = false;
        return this.orderMethodsService.sendNotificationObs(data,1)
      }
      return of(null)
    }))
  }

  sendCheckRequest() {
    const action$ = this.saveOrderMemo()
    this.processingUpdate = true;
    console.log('check prep')
    this.action$ =  action$.pipe(
      switchMap(data => {
        this.processingUpdate = false;
        if (data && data.id) {
          return this.orderMethodsService.sendNotificationObs(data,2)
        }
        return of(null)
    }))
  }

  saveOrderMemo() {
    const site  = this.siteService.getAssignedSite();
    const notes = this.inputFormNotes.controls['productOrderMemo'].value;
    const order = {} as IPOSOrder
    if (!notes) {return of(this.order)};

    this.order.productOrderMemo = notes
    this.processingUpdate = true;
    return this.orderService.putOrder(site, this.order).pipe(
      switchMap(data => {
        this.processingUpdate = false;
        this.orderMethodsService.updateOrderSubscription(data)
        return of(data)
    }))

  }

  initNotesForm() {
    if (this.order && this.order.clients_POSOrders) {
      const client = this.order.clients_POSOrders;
      this.inputFormNotes = this.fb.group({
        productOrderMemo  :[this.order.productOrderMemo, Validators.maxLength(500)],
      })
      return
    }
    this.inputFormNotes =  this.fb.group({
      productOrderMemo  :[this.order?.productOrderMemo, Validators.maxLength(500)],
    })
  }

  save() {
    if (!this.order) {
      this.errorMessage = 'The order is not initialized. Please go back a page.'
      this.matSnack.open(this.errorMessage, 'Alert')
      return
    }

      if (this.order) {
        if (!this.order.tableName) {
          this.order.suspendedOrder = true;
        }

        try {
          const notes                      = this.inputFormNotes.controls['productOrderMemo'].value;
          this.order.productOrderMemo      = notes;
        } catch (error) {
          this.siteService.notify('Error' + error, 'Close', 5000, 'yellow');
          return;
        }

        // logInTime = this.dataHelper.format( clock.logInTime,  this.dateTimeFormat)/
        if (!this.order.preferredScheduleDate && this.serviceType.promptScheduleTime) {
          this.selectedIndex = 2;
          return;
        }

        const site = this.siteService.getAssignedSite();
        this.processingUpdate = true;
        this.action$ = this.orderService.putOrder(site, this.order).pipe(
          switchMap(data => {
            this.processingUpdate = false;
            this.orderMethodsService.updateOrderSubscription(data)
            if (this.selectedIndex == 2) {
              this.selectedIndex = 3;
            }
            if (this.selectedIndex ==3 ) {

            }
            this.router.navigate(['pos-payment'])
            return of(data)
          }
      ));
    }
  }

  selectedServiceType(serviceType: IServiceType) {
    if (!serviceType) { return }
    this.serviceType = serviceType;
    if (serviceType) {

      if (serviceType.deliveryService) {
        this.updateSelectedIndex(1)
        return
      }

      if (serviceType.promptScheduleTime) {
        this.updateSelectedIndex(2)
        return
      }

      this.showSaveButton = true;
      this.updateSelectedIndex(2);
    }
  }

  navigate(event) { 
    console.log(this.selectedIndex, event, this.selectedIndex + event)
    this.updateSelectedIndex(this.selectedIndex + event);
  }

  updateSelectedIndex(index: number) {
    this.selectedIndex = index;
    const site = this.siteService.getAssignedSite();
    this.processingUpdate = true;
    const action$ = this.orderService.changeOrderType(site, this.order.id, this.serviceType.id, true, this.order.history)
    this.action$ =   action$ .pipe(
      switchMap(data => {
        this.processingUpdate = false;
        this.orderMethodsService.updateOrderSubscription(data)
        return of(data)
    }))
  }

  saveShippingAddress(order: IPOSOrder) {
    this.processingUpdate = true;
    this.errorMessage = ''

    const site = this.siteService.getAssignedSite();
    this.action$ = this.orderService.putOrder(site, order).pipe(
      switchMap (data => {
          this.orderMethodsService.updateOrderSubscription(data)
          this.processingUpdate = false;
          this.updateSelectedIndex(2)
          return of(data)
    }))
  }

  saveShippingTime(event) {
    const site = this.siteService.getAssignedSite();
    this.processingUpdate = true;
    this.order.preferredScheduleDate =  this.dateHelperService.format(event, this.dateTimeFormat);
    this.action$ = this.orderService.putOrder(site, this.order).pipe(
      switchMap(data => {
        this.processingUpdate = false;
        this.orderMethodsService.updateOrderSubscription(data)
        this.updateSelectedIndex(3)
        return of(data)
      })
    )
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

  get saveValid() {
    this.messages  = []

    if (!this.serviceType) {
      this.messages.push('No Service Type Assigned')
    }

    if (this.serviceType && this.serviceType?.promptScheduleTime && !this.order.preferredScheduleDate) {
      this.messages.push('Schedule Date Required');
    }

    if (this.serviceType && this.serviceType?.deliveryService) {
      const address = this.inputForm.value
      if (address) {
        if (!address.address || !address.city || !address.state || !address.zip) { 
          this.messages.push('Shipping location required.');
        }
      }
    }

    if (this.messages && this.messages.length >0) {
      return false
    }

    let finalIndex  = 1;

    if (this.serviceType?.deliveryService && !this.order.preferredScheduleDate) {
       finalIndex = 2
    }

    if (this.serviceType?.deliveryService && this.order.preferredScheduleDate) {
       finalIndex = 2
    }

    if (this.serviceType?.deliveryService && this.order.preferredScheduleDate) {
       finalIndex = 3
    }

    if (this.selectedIndex == finalIndex) {
      return true;
    }
  }

  sendMessage(item, order) {
    this.action$ = this.orderMethodsService.sendOrderForMessageService(item, order)
  }



}

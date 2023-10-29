import { Component, OnInit, EventEmitter, Input, Output, OnChanges, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription, debounce, of, switchMap } from 'rxjs';
import { IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { ContactsService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings, UIHomePageSettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-order-header-demo-graphics',
  templateUrl: './order-header-demo-graphics.component.html',
  styleUrls: ['./order-header-demo-graphics.component.scss']
})
export class OrderHeaderDemoGraphicsComponent implements OnInit,OnChanges,OnDestroy  {

  orderNameForm: UntypedFormGroup;
  saveAction$: Observable<any>;

  @Input()  canRemoveClient : boolean = false;
  @Input()  order           : IPOSOrder;
  @Input()  mainPanel        : boolean = false;
  @Input()  disableActions  : boolean;
  @Output() outPutOpenClient:   EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutRemoveClient:   EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutAssignCustomer:   EventEmitter<any> = new EventEmitter<any>();

  isAuthorized: boolean;
  isStaff : boolean;
  isUser: boolean;

  _uiSettings : Subscription;
  uiSettings  : UIHomePageSettings;
  user  = this.userAuthorization.user;
  transactionSettings: TransactionUISettings;

  homePageSubscriber(){
    this._uiSettings = this.uiSettingsService.homePageSetting$.subscribe ( data => {
      this.uiSettings = data;
    })
    // this.order.customerName;
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin,manager')
    this.isStaff  = this.userAuthorization.isUserAuthorized('admin,manager,employee');
    this.isUser  = this.userAuthorization.isUserAuthorized('user');
    if (this.isUser) {

    }
  }

  constructor(private router: Router,
              private siteService: SitesService,
              private contactService: ContactsService,
              private fb: UntypedFormBuilder,
              private uiSettingsService: UISettingsService,
              private userAuthorization: UserAuthorizationService,
              private orderService: OrdersService,
              private cd: ChangeDetectorRef,
              public orderMethodsService: OrderMethodsService,
            )
               { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const i = 0
    this.uiSettingsService.transactionUISettings$.subscribe(data => {
      this.transactionSettings = data;
    })
    if (this.userAuthorization.isManagement) {
      this.canRemoveClient = true;
    }
    this.homePageSubscriber();
    this.initOrderFormName();
    this.initAuthorization();
  }

  ngOnDestroy() {
    if (this._uiSettings) { this._uiSettings.unsubscribe()}

  }

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    this.initOrderFormName()
  }

  initOrderFormName() {
    //Add '${implements OnChanges}' to the class.
    this.orderNameForm = this.fb.group({
      name: [''],
    })
    if (this.order) {
      // console.log('initOrderFormName', this.order.serviceArea)
      this.orderNameForm = this.fb.group({
        name: [this.order.customerName],
      })
    }

    this.subscribeOrderNameForm()
  }

  subscribeOrderNameForm() {
    if (this.orderNameForm) {
      this.orderNameForm.valueChanges.subscribe(data => {
        const item = data?.name;
        this.cd.detectChanges()
        this.saveAction$ = this.orderService.setOrderName(this.order.id, item).pipe(switchMap(data => {
          this.order.customerName = item;
          this.order.serviceArea = item;
          this.orderMethodsService.updateOrderSubscriptionOnly(this.order)
          return of(data)
        }))
      })
    }
  }

  removeClient() {
    // this.outPutRemoveClient.emit(true)
  }

  openClient() {
    if (this.disableActions) { return }
    if (this.order) {
      if (this.order.clients_POSOrders) {
        this.router.navigate(["/profileEditor", {id: this.order.clientID}]);
        return;
      }
    }
  }

  saveOrderName(orderName) {

    if (this.order) {
      this.orderService.setOrderName(this.order.id, orderName).subscribe( data => {

      })
    }
  }



  addClient(){
    const site = this.siteService.getAssignedSite();
    const user = {} as IUserProfile;
    const client$ = this.contactService.addClient(site, user)
    client$.subscribe( {
        next: (data) => {
          this.editItem(data.id)
        },
        error: (err) =>  {
          console.log('err', err)
        }
      }
    )
  }

  editItem(clientID:number) {
    this.router.navigate(["/profileEditor/", {id:clientID}]);
  }

  assignCustomer(client) {

    if (client) {
      if (client.id && client.id != 0) {
        this.assignClientID(client)
      }
    }
  }

  assignClientID(client) {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      if (client) {
        try {
          this.order.clientID = client?.id;
          this.order.customerName = client?.lastName.substr(0,2) + ', ' + client?.firstName
        } catch (error) {
        }
      }
      this.orderService.putOrder(site, this.order).subscribe(data => {
        this.orderMethodsService.updateOrderSubscription(data)
      })
    }
  }

  clearClient() {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.clientID = 0
      this.order.customerName = ''
      this.orderService.putOrder(site, this.order).subscribe(data => {
        this.orderMethodsService.updateOrderSubscription(data)
      })
   }
  }

}


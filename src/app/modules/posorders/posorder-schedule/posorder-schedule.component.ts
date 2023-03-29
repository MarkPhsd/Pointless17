import { Component, OnInit, Input,OnDestroy } from '@angular/core';
import { FormGroup,FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IServiceType,  } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DatePipe } from '@angular/common'
import { MatSnackBar } from '@angular/material/snack-bar';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
@Component({
  selector   : 'pos-order-schedule',
  templateUrl: './posorder-schedule.component.html',
  styleUrls  : ['./posorder-schedule.component.scss']
})
export class POSOrderScheduleComponent implements OnInit,OnDestroy {
  @Input() serviceType          : IServiceType;
  action$: Observable<any>;
  inputFormNotes       : FormGroup;
  inputForm            : FormGroup;
  order                : IPOSOrder;
  _order               : Subscription;
  errorMessage: string;
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  public       selectedIndex          = 0;
  showSaveButton = false;
  processingUpdate: boolean;
  scheduledDate: string;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.pipe(
      switchMap( data => {
      if (data) {
        this.order =  data
      }
      if (data && data.preferredScheduleDate) {
        this.scheduledDate = data?.preferredScheduleDate;
      }
      const site = this.siteService.getAssignedSite()
      return this.serviceTypeService.getTypeCached(site, +data.serviceTypeID)
    })).subscribe(data => {
      this.serviceType = data;
    })
  }

  constructor(
    private orderService      : OrdersService,
    private router            : Router,
    private fb :                FormBuilder,
    private siteService :      SitesService,
    private matSnack          : MatSnackBar,
    private serviceTypeService: ServiceTypeService,
    public datepipe: DatePipe)
  { }

  ngOnInit(): void {
    if (this.router.url == 'pos-payment'){ this.showSaveButton = true; }
    this.initSubscriptions();
    this.initNotesForm();
  }

  ngOnDestroy(): void {
    if (this._order) {
      this._order.unsubscribe()
    }
  }

  selectChange() {

  }

  initNotesForm() {
    if (this.order && this.order.clients_POSOrders) {
      const client = this.order.clients_POSOrders;
      this.inputFormNotes = this.fb.group({
        productOrderMemo  :[this.order.productOrderMemo],
      })
      return
    }
    this.inputFormNotes =  this.fb.group({
      productOrderMemo  :[''],
    })
  }

  initForm() {
    if (this.order && this.order.clients_POSOrders) {
      const client = this.order.clients_POSOrders;
      this.inputForm = this.fb.group({
        address  :[client.address],
        city     :[],
        address2 :[client.city],
        state    :[client.state],
        zip      :[client.zip],
      })
      return
    }
    this.inputForm = this.fb.group({
      address  :['', Validators.required],
      city     :['', Validators.required],
      address2 :[''],
      state    :['', Validators.required],
      zip      :['', Validators.required],
    })
    this.errorMessage = ''
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
          this.siteService.notify('Error' + error, 'Close', 5000, 'yellow')
        }

        this.order.preferredScheduleDate = this.scheduledDate;

        if (this.serviceType) {
          this.order.serviceType   = this.serviceType.name;
          this.order.serviceTypeID = this.serviceType.id
        }

        const site = this.siteService.getAssignedSite();
        this.orderService.putOrder(site, this.order).subscribe(data => {
          this.orderService.updateOrderSubscription(data)
          if (this.selectedIndex == 2) { 
            this.selectedIndex = 3;
          }
          if (this.selectedIndex ==3 ) {
            
          }
          this.router.navigate(['pos-payment'])
        }
      )
    }
  }

  saveOrderMemo() {
    const site = this.siteService.getAssignedSite();
    this.orderService.putOrder(site, this.order).subscribe(data => {
      this.orderService.updateOrderSubscription(data)
      this.router.navigate(['pos-payment'])
    })
  }

  selectedServiceType(serviceType: IServiceType) {
    if (!serviceType) { return }
    this.serviceType = serviceType;
    if (serviceType) {

      if (serviceType.deliveryService) {
        this.updateSelectedIndex(0)
        return
      }
      if (serviceType.promptScheduleTime) {
        this.updateSelectedIndex(1)
        return
      }

      this.showSaveButton = true;
      this.updateSelectedIndex(2)
    }
  }

  updateSelectedIndex(index: number) {
    this.selectedIndex = index;
  }

  saveShippingAddress(order: IPOSOrder) {
    this.processingUpdate = true;
    this.errorMessage = ''

    const site = this.siteService.getAssignedSite();
    this.orderService.putOrder(site, order).subscribe(
      {next: data => {
        this.orderService.updateOrderSubscription(data)
        this.processingUpdate = false;
        this.updateSelectedIndex(2)
      }, error: err =>{
        this.processingUpdate = false;
        this.errorMessage = "Error occured. Please check your address and save again." + err
      }}
    )
  }

  saveShippingTime(event) {
    const site = this.siteService.getAssignedSite();
    this.order.preferredScheduleDate = event;
    this.action$ = this.orderService.putOrder(site, this.order).pipe(switchMap(data => {
      this.orderService.updateOrderSubscription(data)
      return of(data)
    }))
    this.updateSelectedIndex(3)
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

}

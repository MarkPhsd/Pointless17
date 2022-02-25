import { Component, OnInit, Input,OnDestroy } from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, of, Subscription } from 'rxjs';
import { IPOSOrder, IServiceType,  } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { DatePipe } from '@angular/common'
@Component({
  selector   : 'pos-order-schedule',
  templateUrl: './posorder-schedule.component.html',
  styleUrls  : ['./posorder-schedule.component.scss']
})
export class POSOrderScheduleComponent implements OnInit,OnDestroy {

  inputFormNotes       : FormGroup;
  inputForm            : FormGroup;
  order                : IPOSOrder;
  _order               : Subscription;
  serviceType          : IServiceType;
  errorMessage: string;
  SWIPE_ACTION = { LEFT: 'swipeleft', RIGHT: 'swiperight' };
  public       selectedIndex          : number;
  showSaveButton = false;

  processingUpdate: boolean;

  scheduledDate: string;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      if (data) {
        this.order =  data
      }
      if (data) {
        this.scheduledDate = data.preferredScheduleDate;
      }
    })
  }

  constructor(
    private orderService      : OrdersService,
    private router            : Router,
    private fb :                FormBuilder,
    private siteService :      SitesService,
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
      address  :[''],
      city     :[''],
      address2 :[''],
      state    :[''],
      zip      :[''],
    })
    this.errorMessage = ''
  }

  save() {

    if (!this.order) { this.errorMessage = 'The order appears to not be initialized. Please go back a page.'}

      if (this.order) {

        // const scheduledDate = this.datepipe.transform( this.scheduledDate, 'mm/dd/yyyy');
        const notes                      = this.inputFormNotes.controls['productOrderMemo'].value;
        this.order.suspendedOrder        = true;
        this.order.preferredScheduleDate = this.scheduledDate;
        this.order.productOrderMemo      = notes;
        if (this.serviceType) {
          this.order.serviceType   = this.serviceType.name;
          this.order.serviceTypeID = this.serviceType.id
        }

        const site = this.siteService.getAssignedSite();
        this.orderService.putOrder(site, this.order).subscribe(data => {
          this.orderService.updateOrderSubscription(data)
          this.router.navigate(['pos-payment'])
        }, err =>{
          // this.notify
          this.processingUpdate = false;
          this.errorMessage = "Error occured. Please check your address and save again." + err
        }
      )
    }
  }

  saveOrderMemo() {
    const site = this.siteService.getAssignedSite();
    this.orderService.putOrder(site, this.order).subscribe(data => {
      this.orderService.updateOrderSubscription(data)

    })
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
      this.updateSelectedIndex(3)
      console.log(this.selectedIndex)
    }
  }

  updateSelectedIndex(index: number) {
    this.selectedIndex = index;
  }

  saveShippingAddress(order: IPOSOrder) {
    this.processingUpdate = true;
    this.errorMessage = ''

    const site = this.siteService.getAssignedSite();
    this.orderService.putOrder(site, order).subscribe(data => {
        this.orderService.updateOrderSubscription(data)
        this.processingUpdate = false;
        this.updateSelectedIndex(2)
      }, err =>{
        // this.notify
        this.processingUpdate = false;
        // this.updateSelectedIndex(2)
        this.errorMessage = "Error occured. Please check your address and save again." + err
      }
    )
  }

  saveShippingTime(event) {
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

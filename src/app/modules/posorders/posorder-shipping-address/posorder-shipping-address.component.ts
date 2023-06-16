import { Component, OnInit, Input,OnDestroy, EventEmitter, Output } from '@angular/core';
import { UntypedFormGroup,UntypedFormBuilder } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { IPOSOrder, IServiceType, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector: 'posorder-shipping-address',
  templateUrl: './posorder-shipping-address.component.html',
  styleUrls: ['./posorder-shipping-address.component.scss']
})
export class POSOrderShippingAddressComponent implements OnInit, OnDestroy {

  @Input() inputForm            : UntypedFormGroup;
  @Input() serviceType          : IServiceType;
  @Input() serviceTypes$        : Observable<IServiceType[]>;
  @Input() serviceType$         : Observable<IServiceType>;
  @Input() order                : IPOSOrder;
  _order               : Subscription;
  errorMessage         : string;
  @Output() outPutSaveAddress = new EventEmitter();

  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private orderService      : OrdersService,
    public orderMethodsService: OrderMethodsService,
    private serviceTypeService: ServiceTypeService,
    private sitesService      : SitesService,
    public  platFormService   : PlatformService,
    private fb :                UntypedFormBuilder ) { }

  ngOnInit(): void {
    this.initSubscriptions();
    this.initForm();
    this.initServiceTypeInfo();
   }
   ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if ( this._order) { this._order.unsubscribe()}
   }

  initServiceTypeInfo() {
    const site = this.sitesService.getAssignedSite();
    if (!this.order) {return}
    this.serviceType$ = this.serviceTypeService.getTypeCached(site, this.order.serviceTypeID)
  }



  initForm() {
    if (this.order && this.order.clients_POSOrders) {
      const client = this.order.clients_POSOrders;
      this.inputForm = this.fb.group({
        address  :[client.address],
        city     :[client.city],
        address2 :[''],
        state    :[client.state],
        zip      :[client.zip],
      })
      this.errorMessage = ''
      return
    }
    this.initEmptyForm();
  }

  initEmptyForm() {
    this.inputForm = this.fb.group({
      address  :[''],
      address2 :[''],
      city     :[''],
      state    :[''],
      zip      :[''],
    })
    this.errorMessage = ''
  }

  save() {
    this.saveShippingAddress();

  }

  delete() {

    this.initEmptyForm()
    this.order.shipAddress     = '';
    this.order.shipAddress2    = '';
    this.order.shipCity        = '';
    this.order.shipPostal      = '';
    this.order.shipPostalCode  =  '';
    this.order.shipCity        = '';

  }

  saveShippingAddress() {

    if (this.inputForm) {
      const address = this.inputForm.controls['address'].value;
      const address2 = this.inputForm.controls['address2'].value;
      const state = this.inputForm.controls['state'].value;
      const zip = this.inputForm.controls['zip'].value;
      const city = this.inputForm.controls['city'].value;

      if (this.order) {
        this.order.shipAddress = address;
        this.order.shipAddress2 = address2;
        this.order.shipCity = city;
        this.order.shipPostal = zip;
        this.order.shipPostalCode  = zip;
        this.order.shipCity = city;
        this.orderMethodsService.updateOrderSubscription(this.order)
        this.outPutSaveAddress.emit(this.order)
        console.log('update order')
      }
    }

  }

}

import { Component, OnInit, Input,OnDestroy } from '@angular/core';
import { FormGroup,FormBuilder } from '@angular/forms';
import { Observable, of, Subscription } from 'rxjs';
import { IPOSOrder, IServiceType, ISite } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';

@Component({
  selector: 'posorder-shipping-address',
  templateUrl: './posorder-shipping-address.component.html',
  styleUrls: ['./posorder-shipping-address.component.scss']
})
export class POSOrderShippingAddressComponent implements OnInit, OnDestroy {

  inputForm            : FormGroup;
  serviceTypes$        : Observable<IServiceType[]>;
  order                : IPOSOrder;
  _order               : Subscription;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private orderService      : OrdersService,
    private sitesService      : SitesService,
    private platFormService   : PlatformService,
    private serviceTypeService: ServiceTypeService,
    private fb :                FormBuilder ) { }

  ngOnInit(): void {
    this.initSubscriptions();
    this.initForm();
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._order) {
      this._order.unsubscribe()
    }
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
    this.initEmptyForm();
  }

  initEmptyForm() {
    this.inputForm = this.fb.group({
      address  :[''],
      city     :[''],
      address2 :[''],
      state    :[''],
      zip      :[''],
    })
  }

  save() {

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
        this.orderService.updateOrderSubscription(this.order)
      }

    }

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

}

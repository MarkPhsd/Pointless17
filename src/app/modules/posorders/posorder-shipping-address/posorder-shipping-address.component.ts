import { Component, OnInit, Input,OnDestroy, EventEmitter, Output } from '@angular/core';
import { Observable, Subscription } from 'rxjs';
import { IPOSOrder, IServiceType } from 'src/app/_interfaces';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { UntypedFormGroup,UntypedFormBuilder, Validators, FormGroup } from '@angular/forms';

@Component({
  selector: 'posorder-shipping-address',
  templateUrl: './posorder-shipping-address.component.html',
  styleUrls: ['./posorder-shipping-address.component.scss']
})
export class POSOrderShippingAddressComponent implements OnInit, OnDestroy {

  @Input() inputForm            : FormGroup;
  @Input() serviceType          : IServiceType;
  @Input() serviceTypes$        : Observable<IServiceType[]>;
  @Input() serviceType$         : Observable<IServiceType>;
  @Input() order                : IPOSOrder;
  _order               : Subscription;
  errorMessage         : string;
  @Output() outPutSaveAddress = new EventEmitter();
  @Output() outPutBack = new EventEmitter<number>();
  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    public orderMethodsService: OrderMethodsService,
    private serviceTypeService: ServiceTypeService,
    private sitesService      : SitesService,
    public  platFormService   : PlatformService,
    private fb :                UntypedFormBuilder ) { }

  ngOnInit(): void {
    this.initSubscriptions();
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


  resetForm() {
    this.inputForm = this.fb.group({
      address  :['', Validators.required],
      address2 :[''],
      city     :['', Validators.required],
      state    :['', Validators.required, Validators.minLength(2),Validators.maxLength(2) ],
      zip      :['', Validators.required, Validators.minLength(5), Validators.maxLength(5) ],
    })
    this.errorMessage = ''
  }

  save() {
    this.saveShippingAddress();
  }

  delete() {
    this.resetForm()
    this.order.shipAddress     = '';
    this.order.shipAddress2    = '';
    this.order.shipCity        = '';
    this.order.shipPostal      = '';
    this.order.shipPostalCode  = '';
    this.order.shipCity        = '';
    this.order.shipState       = '';
  }

  saveShippingAddress() {

    if (this.inputForm) {
      const address  = this.inputForm.controls['address'].value;
      const address2 = this.inputForm.controls['address2'].value;
      const state    = this.inputForm.controls['state'].value;
      const zip      = this.inputForm.controls['zip'].value;
      const city     = this.inputForm.controls['city'].value;

      if (this.order) {
        this.order.shipAddress = address;
        this.order.shipAddress2 = address2;
        this.order.shipCity = city;
        this.order.shipPostal = zip;
        this.order.shipPostalCode  = zip;
        this.order.shipState = state;
        this.orderMethodsService.updateOrderSubscription(this.order)
        this.outPutSaveAddress.emit(this.order)
      }
    }
  }

  back() { 
    this.outPutBack.emit(-1)
  }
}

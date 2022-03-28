import { Component, OnInit, ViewChild , OnDestroy, Input, Output,EventEmitter, Inject} from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { StripeService, StripeCardComponent, StripeInstance, StripeFactoryService, StripePaymentElementComponent } from 'ngx-stripe';
import {
  PaymentIntent,
  StripeCardElementOptions,
  StripeElement,
  StripeElementsOptions
} from '@stripe/stripe-js';
import { StripeAPISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, Subscription, switchMap } from 'rxjs';
import { IStripePaymentIntent, StripePaymentService } from 'src/app/_services/stripe/stripe-payment.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';
import { OrdersService } from 'src/app/_services';
import { DialogData } from 'src/app/modules/menu/menuitems/menu-item-card/menu-item-card.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'stripe-check-out',
  templateUrl: './stripe-check-out.component.html',
  styleUrls: ['./stripe-check-out.component.scss']
})
export class StripeCheckOutComponent implements OnInit, OnDestroy  {

  @ViewChild(StripePaymentElementComponent) paymentElement: StripePaymentElementComponent;
  @Input() amount  : number;
  @Input() testMode: boolean;
  @Input() maxAmount: number;
  @Output() outPutPayment: EventEmitter<any> = new EventEmitter();
  posPayment:  IPOSPayment;
  _posPayment: Subscription;
  title: string;

  order  : IPOSOrder;
  _order : Subscription;

  paymentForm      : FormGroup;
  stripeCardValid  = false;
  result: any;
  token: any;

  _apiSetting      : Subscription;
  stripeAPISetting : StripeAPISettings;
  stripeInstance   : StripeInstance;
  errorMessage     : string;

  elements:  Element;
  // card: StripeElement;
  paymentStatus: any;
  submitted: any;
  paymentIntent$ : Observable<IStripePaymentIntent>;
  paying = false;

  @ViewChild(StripeCardComponent) card: StripeCardComponent;

  cardOptions: StripeCardElementOptions = {
    hidePostalCode: true,
    style: {
      base: {
        iconColor: '#666EE8',
        color: '#31325F',
        fontWeight: 300,
        fontFamily: '"Helvetica Neue", Helvetica, sans-serif',
        fontSize: '18px',
        '::placeholder': {
          color: '#CFD7E0',
        },
      },
    },
  };

  get validForm() {
    return this.paymentForm.valid && this.stripeCardValid;
  }

  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  initSubscriptions(){

    this._posPayment = this.posPaymentService.currentPayment$.subscribe( data => {
      this.posPayment = data;
      if (!this.testMode) {
        if (!this.posPayment) {
          this.posPayment = {} as IPOSPayment
        }
      }
    })

    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data;
    })





  }

  initStripeIntent() {
    this.uISettingsService.stripeAPISettings$.pipe(
      switchMap(data => {

        if (data) {
          if (!this.amount) { this.amount = 1 }
          this.stripeAPISetting  = data;
          this.stripeInstance    = this.stripeService.setKey(data.apiKey);
        }
        this.validateAmount()
        return  this.createPaymentIntent(this.amount)
      }
    )).subscribe(data => {
      console.log('initStripeIntent', data)
      this.elementsOptions.clientSecret =  data.clientSecret;
      this.errorMessage = data.errorMessage;
    })

    this.stripeInstance.confirmPayment
  }

  cancel() {
    this.dialogRef.close();
  }

  validateAmount() {
    if (this.maxAmount !=0) {
      if (this.amount > this.maxAmount ){
        this.amount = this.maxAmount
      }
    }
  }

  constructor(
                private uISettingsService: UISettingsService,
                private matSnack         : MatSnackBar,
                private fb               : FormBuilder,
                private stripeService    : StripeService,
                private orderService     : OrdersService,
                private posPaymentService   : POSPaymentService,
                public dialogRef: MatDialogRef<StripeCheckOutComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private sitesService     : SitesService,
                private stripePaymentService: StripePaymentService) {
    if (this.data) {
      this.amount = data?.amount;
      this.maxAmount = data?.amount;
      this.title = data?.title;
    }
  }

  ngOnInit() {
    if (this.amount == 0) { this.amount = 1}
    this.initSubscriptions();
    this.initForm();
    this.initStripeIntent();
  }

  private createPaymentIntent(amount: number): Observable<IStripePaymentIntent> {
    if (!this.testMode) {
      return this.stripePaymentService.createPaymentIntentOrderBalance(this.order.id , 'usd')
    }
    return this.stripePaymentService.createPaymentIntent(amount,'usd')
  }

  initForm() {
    this.paymentForm = this.fb.group({
      name  : ['', [Validators.required]],
      amount: [this.amount, [Validators.required, Validators.pattern(/\d+/)]],
    });

    this.paymentForm.valueChanges.subscribe(data => {
      console.log(data)
      this.validateAmount();
      this.initStripeIntent();
    })
  }

  ngOnDestroy() {
    if(this._apiSetting){ this._apiSetting.unsubscribe()}
  }

  onChange({ type, event }) {
    console.log('type', type)
    console.log('event', event)
    if (type === 'change') {
      this.stripeCardValid = event.complete;
    }
  }

  setAmount() {
    if (!this.elementsOptions) { return }
    this.elementsOptions.clientSecret = '';
    this.amount =  this.paymentForm.controls['amount'].value;
    this.validateAmount()

    if (!this.amount || this.amount == 0) {return}

    this.createPaymentIntent(this.amount).subscribe(data => {
      this.elementsOptions.clientSecret =  data.clientSecret;
      this.errorMessage = data.errorMessage;
    })
  }

  pay() {
    if (this.paymentForm.valid) {
      this.paying = true;
      this.stripeService.confirmPayment({
        elements: this.paymentElement.elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: this.paymentForm.get('name').value
            }
          }
        },
        redirect: 'if_required'
      }).pipe(
        switchMap( result => {
        this.paying = false;

        this.result = result;

        if (result.error) {
          // Show error to your customer (e.g., insufficient funds)
          // alert({ success: false, error: result.error.message });
          this.matSnack.open('Process failed ' + result.error.message, 'Sorry')
          return
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            // Show a success message to your customer
            // alert({ success: true });
            this.matSnack.open('Process successfull', 'Success')
          }
        }

        if (this.testMode) { return null  }

        const site = this.sitesService.getAssignedSite();
        if (!this.posPayment) { this.posPayment = {} as IPOSPayment}

        this.posPayment.transactionData = JSON.stringify(result.paymentIntent);
        this.posPayment.approvalCode = this.elementsOptions?.clientSecret
        this.posPayment.amountPaid = this.amount;
        return this.posPaymentService.makeStripePayment(site, this.posPayment , this.order)

      })).subscribe( data => {
        if (data) {
          if (data.orderCompleted )  {
            this.outPutPayment.emit(data)
          }
          this.posPaymentService.updatePaymentSubscription(data.payment)
          this.dialogRef.close(data);
        }
      });
    } else {
      console.log(this.paymentForm.value);
    }
  }


}
// return this.paymentService.currentPayment$
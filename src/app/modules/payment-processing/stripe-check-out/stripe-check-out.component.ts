import { Component, OnInit, ViewChild , OnDestroy, Input, Output,EventEmitter, Inject, TemplateRef, Optional, ElementRef} from '@angular/core';
import { UntypedFormGroup, UntypedFormBuilder, Validators } from '@angular/forms';
import { StripeService, StripeCardComponent, StripeInstance, StripePaymentElementComponent } from 'ngx-stripe';
import {
  StripeCardElementOptions,
  StripeElementsOptions
} from '@stripe/stripe-js';
import { StripeAPISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IStripePaymentIntent, StripePaymentService } from 'src/app/_services/stripe/stripe-payment.service';
import { POSPaymentService } from 'src/app/_services/transactions/pospayment.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'stripe-check-out',
  templateUrl: './stripe-check-out.component.html',
  styleUrls: ['./stripe-check-out.component.scss']
})
export class StripeCheckOutComponent implements OnInit, OnDestroy  {
  @ViewChild('ngxStripeComponent') ngxStripeComponent: TemplateRef<any>;
  ngxStripeRef: TemplateRef<any>;
  @ViewChild(StripePaymentElementComponent) paymentElement: StripePaymentElementComponent;
  @ViewChild('name') name: ElementRef;
  @ViewChild('paymentTemplateRef') paymentTemplateRef: TemplateRef<any>;
  outletTemplate: TemplateRef<any>;

  @Input() amount    = 0;
  @Input() testMode : boolean;
  @Input() maxAmount: number;
  @Output() outPutPayment: EventEmitter<any> = new EventEmitter();
  posPayment:  IPOSPayment;
  _posPayment: Subscription;
  title: string;

  order  : IPOSOrder;
  _order : Subscription;

  paymentForm      : UntypedFormGroup;
  stripeCardValid  = false;
  result: any;
  token: any;

  _apiSetting      : Subscription;
  stripeAPISetting : StripeAPISettings;
  stripeInstance   : StripeInstance;
  errorMessage     : string;
  paymentFormValid : boolean;

  elements:  Element;
  paymentStatus: any;
  submitted: any;
  paymentIntent$ : Observable<IStripePaymentIntent>;
  paying = false;

  stripeTipValue = 0;

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

  elementsOptions: StripeElementsOptions
  // = {
  //   locale: 'en'
  // };

  initSubscriptions(){
    this._posPayment = this.posPaymentService.currentPayment$.subscribe( data => {
      this.posPayment = data;
      if (!this.testMode) {
        if (!this.posPayment) {
          this.posPayment = {} as IPOSPayment
        }
      }
    })
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data;
    })
  }

  initStripeIntent() {

    const stripeSettings$ = this.uISettingsService.getSetting('StripeAPISettings')
    // this.uiSettings = data;
    // this.stripeAPISettings   = JSON.parse(data.text) as StripeAPISettings
    this.errorMessage = '';

    stripeSettings$.pipe(
      switchMap(data => {
        if (data) {
          this.stripeAPISetting  = JSON.parse(data.text) as StripeAPISettings
          this.stripeInstance    = this.stripeService.setKey(this.stripeAPISetting.apiKey);
          if (!this.amount) { this.amount = 1 }
        }
        this.validateAmount()
        return  this.createPaymentIntent(this.amount + this.stripeTipValue)
      }
    )).subscribe(
      {next: data => {
        // console.log('data', data)
        if (data) {
          if (data.clientSecret) {
            if (!this.elementsOptions) {
              this.elementsOptions = {locale: 'en' } as StripeElementsOptions
            }
            this.outletTemplate = this.paymentTemplateRef;
            this.elementsOptions.clientSecret =  data.clientSecret;
            this.ngxStripeRef = this.ngxStripeComponent;
          }
          this.errorMessage   = data.errorMessage;
        }
      },
      error : err => {
        this.ngxStripeRef = null;
        this.errorMessage   = err.toString()
        this.outletTemplate = null;
      }
    })

    if (!this.stripeInstance || !this.stripeInstance.confirmPayment) {
      this.ngxStripeRef = null;
      this.errorMessage = 'Initiating.'
      return;
    }
    this.stripeInstance.confirmPayment;
  }


  cancel() {
    if (!this.dialogRef) { return}
    this.dialogRef.close();
  }

  validateAmount() {
    if (this.maxAmount !=0) {
      if (this.amount > this.maxAmount ){
        this.amount = this.maxAmount
      }
    }
  }

  constructor(  @Optional() public dialogRef: MatDialogRef<StripeCheckOutComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private uISettingsService: UISettingsService,
                private matSnack         : MatSnackBar,
                private fb               : UntypedFormBuilder,
                private stripeService    : StripeService,
                private orderService     : OrdersService,
                public orderMethodsService: OrderMethodsService,
                private posPaymentService   : POSPaymentService,
                private sitesService     : SitesService,
                private stripePaymentService: StripePaymentService
                ) {


    if (this.data) {
      this.amount = data?.amount;
      this.maxAmount = data?.amount;
      this.stripeTipValue = +data?.tip;
      this.title = data?.title;
    }
  }

  ngOnInit() {
    if (this.amount == 0) { this.amount = 1}
    this.initSubscriptions();
    this.initForm();
    this.initStripeIntent();
  }

  ngOnDestroy() {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    if (this._apiSetting)  {this._apiSetting.unsubscribe()}
    if (this._order)       { this._order.unsubscribe()}
    if (this._posPayment)  { this._posPayment.unsubscribe()}
  }

  private createPaymentIntent(amount: any): Observable<IStripePaymentIntent> {
    // if (!this.testMode) {
    //   return this.stripePaymentService.createPaymentIntentOrderBalance(this.order.id , 'usd')
    // }
    console.log('amount', amount)
    return this.stripePaymentService.createPaymentIntentByTotal(this.order.id,'usd', amount)
  }

  initForm() {

    if (!this.stripeTipValue)  { this.stripeTipValue = 0}
    if (!this.amount)          { this.amount   = 0 }

    const value = +(this.amount + this.stripeTipValue)
    const amount = (value).toFixed(2)

    this.paymentForm = this.fb.group({
      name  : ['', [Validators.required]],
      amount: [ amount, [Validators.required, Validators.pattern(/\d+/)]],
    });

    this.paymentForm.controls['amount'].valueChanges.subscribe(data => {
      this.validateAmount();
      this.initStripeIntent();
      this.paymentFormValid = this.paymentForm.valid;
    })
  }

  onChange({ type, event }) {
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
    this.errorMessage = ''
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

        if (result?.error) {
          // Show error to your customer (e.g., insufficient funds)
          // alert({ success: false, error: result.error.message });
          this.errorMessage = result?.error?.message;
          this.matSnack.open('Process failed ' + result.error.message, 'Sorry')
          return
        } else {
          // The payment has been processed!
          if (result.paymentIntent.status === 'succeeded') {
            // Show a success message to your customer
            // alert({ success: true });
            this.matSnack.open('Process successfull', 'Success', {duration: 2000})
          }
        }

        if (this.testMode) { return null  }

        const site = this.sitesService.getAssignedSite();
        if (!this.posPayment) { this.posPayment = {} as IPOSPayment}

        this.posPayment.applicationLabel = 'stripe'
        this.posPayment.transactionData = JSON.stringify(result.paymentIntent);
        this.posPayment.approvalCode = this.elementsOptions?.clientSecret

        console.log('amount', this.amount, 'tip', this.stripeTipValue)

        // const amount = this.paymentForm.controls['amount'].value
        this.posPayment.amountPaid   = this.amount
        this.posPayment.tipAmount    = this.stripeTipValue;
        return this.posPaymentService.makeStripePayment(site, this.posPayment , this.order)

      })).subscribe( data => {
        if (data) {
          if (data.orderCompleted )  {
            this.outPutPayment.emit(data)
          }
          this.posPaymentService.updatePaymentSubscription(data.payment)
          if (!this.dialogRef) { return}
          this.dialogRef.close(data);
        }
      });
    } else {
      console.log(this.paymentForm.value);
    }
  }


}
// return this.paymentService.currentPayment$

import { Injectable } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { StripeService } from 'ngx-stripe';
import {
  StripeElementsOptions,
} from '@stripe/stripe-js';
import { SitesService } from '../reporting/sites.service';

export interface IStripePaymentIntent {
  clientSecret: string;
  errorMessage: string;
}


@Injectable({
  providedIn: 'root'
})
export class StripePaymentService {

  // stripeTest = this.fb.group({
  //   name: ['Angular v12', [Validators.required]],
  //   amount: [1109, [Validators.required, Validators.pattern(/\d+/)]]
  // });


  elementsOptions: StripeElementsOptions = {
    locale: 'en'
  };

  paying = false;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private stripeService: StripeService,
    private siteService: SitesService,
  ) {}

  getPaymentIntentWithAmount(amount: number, currency: string): Observable<IStripePaymentIntent> {

    const site = this.siteService.getAssignedSite();

    const controller = '/StripeEvents/'

    const endPoint = 'GetPaymentIntentWithAmount'

    const parameters = `?amount=${amount}&currency=${currency}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IStripePaymentIntent>(url)

  }

  createPaymentIntent(paymentID: number, currency: string): Observable<IStripePaymentIntent> {

    const site = this.siteService.getAssignedSite();

    const controller = '/StripeEvents/'

    const endPoint = 'GetPaymentIntent'

    const parameters = `?paymentID=${paymentID}&currency=${currency}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IStripePaymentIntent>(url)

  }


  createPaymentIntentOrderBalance(id: number, currency: string): Observable<IStripePaymentIntent> {

    const site = this.siteService.getAssignedSite();

    const controller = '/StripeEvents/'

    const endPoint = 'GetPaymentIntentBalanceRemaing'

    const parameters = `?id=${id}&currency=${currency}`

    const url = `${site.url}${controller}${endPoint}${parameters}`

    return  this.http.get<IStripePaymentIntent>(url)

  }

  pay(name: string , paymentElement ) {

    this.paying = true;
    this.stripeService.confirmPayment({
      elements:  paymentElement.elements,
      confirmParams: {
        payment_method_data: {
          billing_details: {
            name: name
          }
        }
      },
      redirect: 'if_required'
    }).subscribe(result => {
      this.paying = false;
      if (result.error) {
        // Show error to your customer (e.g., insufficient funds)
        alert({ success: false, error: result.error.message });
      } else {
        // The payment has been processed!
        if (result.paymentIntent.status === 'succeeded') {
          // Show a success message to your customer
          alert({ success: true });
        }
      }
    });

  }

  // private createPaymentIntent(amount: number): Observable<PaymentIntent> {
  //   return this.http.post<PaymentIntent>(
  //     `${env.apiUrl}/create-payment-intent`,
  //     { amount }
  //   );
  // }
}

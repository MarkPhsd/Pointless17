import { Injectable } from '@angular/core';
import { HttpClient,  } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription, } from 'rxjs';
import { IPaymentResponse, IPOSOrder, IPOSPayment, IPOSPaymentsOptimzed, ISite }   from 'src/app/_interfaces';
import { environment } from 'src/environments/environment';
import { catchError, concatMap, exhaustMap, map, mergeMap, switchMap, tap } from 'rxjs/operators';
import { IPagedList } from '../system/paging.service';
import { IItemBasic } from '../menu/menu.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor, Plugins } from '@capacitor/core';
import { HttpClientCacheService } from 'src/app/_http-interceptors/http-client-cache.service';
import { SitesService } from '../reporting/sites.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IPaymentMethod } from './payment-methods.service';
import { POSPaymentService } from './pospayment.service';

@Injectable({
  providedIn: 'root'
})
export class PaymentsMethodsProcessService {

  constructor(
    private sitesService     : SitesService,
    private paymentService : POSPaymentService,
    private matSnackBar     : MatSnackBar,) {

  }

  async enterPointCashValue(event, paymentMethod: IPaymentMethod, posPayment: IPOSPayment, order: IPOSOrder, ) {
    const site = this.sitesService.getAssignedSite();
    //apply payment as cash value
    if (posPayment && event && paymentMethod && order) {
      const amountPaid = event;
      if (order.balanceRemaining >= amountPaid)  {
        return await this.processRewardPoints(site, posPayment, order, amountPaid, paymentMethod)
      }
      if (amountPaid > order.balanceRemaining )  {
        this.notify('Amount entered is greater than the total. Please try again.', 'Oops!', 1500)
        return
      }
    }
  }

  async processCashPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
    const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    const results =  await payment$.pipe().toPromise();
    return results
  }

  async processCreditPayment(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
    const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
    const results =  await payment$.pipe().toPromise();
    return results
  }

  async processRewardPoints(site: ISite, posPayment: IPOSPayment, order: IPOSOrder, amount: number, paymentMethod: IPaymentMethod): Promise<IPaymentResponse> {
    if (order.clients_POSOrders) {
      if (order.clients_POSOrders.loyaltyPointValue >= amount) {
        const payment$ = this.paymentService.makePayment(site, posPayment, order, amount, paymentMethod)
        const results  = await payment$.pipe().toPromise();
        return results
      } else  {
        this.notify(`There are not enough points to pay this amount. The client has $${order.clients_POSOrders.loyaltyPointValue} in total.`, 'Try Again',3000)
        return
      }
    }
  }

  getPointsRequiredToPayBalance(balanceRemaining: number, loyaltyPointValue: number) {

    if (!loyaltyPointValue || loyaltyPointValue == 0) { return 0}

    let amountPaid = 0

    if (loyaltyPointValue >= balanceRemaining) {  amountPaid = balanceRemaining  }

    if (balanceRemaining >= loyaltyPointValue) { amountPaid = loyaltyPointValue  }

    return amountPaid

  }

  async getResults(amount, paymentMethod: IPaymentMethod,
                  posPayment: IPOSPayment, order: IPOSOrder): Promise<IPaymentResponse> {
    //if credit card - prompt for credit card payment
    const site = this.sitesService.getAssignedSite();

    if (paymentMethod && posPayment && order)
    {
      // console.log('pos method, payment method, order are true')
    }

    if (paymentMethod && posPayment && order)

      //cash
      if (paymentMethod.isCash) {
        return await this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }

      //else
      if (paymentMethod.isCreditCard) {
        return await this.processCreditPayment(site, posPayment, order, amount, paymentMethod)
      }

      //else
      if (paymentMethod.name.toLowerCase()  == 'check') {
        return await this.processCashPayment(site, posPayment, order, amount, paymentMethod)
      }

      if (paymentMethod.name.toLowerCase() === 'rewards points' || paymentMethod.name.toLowerCase() === 'loyalty points') {
        return await this.enterPointCashValue(amount, paymentMethod, posPayment, order)
      }

      //else
      if (paymentMethod.companyCredit) {

      }

      //else
      if (paymentMethod.name.toLowerCase() === 'gift card') {

      }
  }
  //   return
  // }


  validatePaymentAmount(amount, isCash: boolean, balanceRemaining: number): boolean {
    if (  +amount > + balanceRemaining ) {
      if (!isCash) {
        this.notify(`Enter amount smaller than ${balanceRemaining}.`, 'Try Again',3000)
        return false
      }
    }
    return true
  }
  notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 1000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }


  isOrderBalanceZero(order: IPOSOrder) {
    if (order) {
      if ( order.balanceRemaining > 0)  {
        return  false;
      }
      if ( order.balanceRemaining == 0)  {
        return  true;
      }
    }
  }

}

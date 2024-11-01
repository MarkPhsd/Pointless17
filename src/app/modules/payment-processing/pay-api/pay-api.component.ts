import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { DcapPayAPIService, KeyResponse } from '../services/dcap-pay-api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment, IUser } from 'src/app/_interfaces';
import { TransactionUISettings, UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Router } from '@angular/router';
// declare var DatacapWebToken : any; // This allows TypeScript to recognize the global variable
// declare let window: any; // Broad approach, makes window accept any property
// declare global {
//   interface Window { DatacapWebToken: any; }
// }
@Component({
  selector: 'app-pay-api',
  templateUrl: './pay-api.component.html',
  styleUrls: ['./pay-api.component.scss']
})
export class PayAPIComponent implements OnInit {

  @Input() paymentForm: FormGroup;
  @ViewChild('formView')   payment_form!: ElementRef;
  @ViewChild('tokenInput') tokenInput!: ElementRef;
  fieldsClass: string;
  encodedString: string;
  inputForm: FormGroup;
  errorMessage: string;

  scriptUrl: string;
  expInvalid: boolean;
  cardInValid: boolean;
  cvvInvalid: boolean;
  action$: Observable<any>;
  isApproved: boolean;
  @Input() order: IPOSOrder;
  @Input() paymentAmount: number;
  @Input() creditBalanceRemaining: number;
  @Input() uiTransactions: TransactionUISettings;
  @Output() setStep = new EventEmitter<any>();
  @Output() outPutRefresh = new EventEmitter<any>();

  formInitialized: boolean;
  publicKey: string;//"[Token Key Goes Here]"
  payAPIKeyEnabled: boolean;
  payAPIKeyExists$ : Observable<any>;
  payMID$: Observable<any>;
  payment$: Observable<any>;
  processing: boolean;
  certMode$: Observable<any>;
  uiTransactions$ : Observable<TransactionUISettings>;
  certMode: boolean;
  user: IUser;
  debugMode = false

  get isAdmin() {
    if (this.user?.roles === 'admin' || this.user?.roles === 'Admin') {
      return true
    }
  }


  constructor(
    private fb: FormBuilder,
    public  platFormService: PlatformService,
    private siteService: SitesService,
    private orderMethodsService: OrderMethodsService,
    private uiSettingService: UISettingsService,
    private dcapPayAPIService: DcapPayAPIService,
    private userAuthorization: UserAuthorizationService,
    private router: Router,
  ) { }

  ngOnInit(): void {

    this.user = this.userAuthorization.currentUser()
    if (!this.uiTransactions) {
      this.uiTransactions$ = this.uiSettingService.getUITransactionSetting().pipe(switchMap(data => {
        this.uiTransactions = data;
        return of(data)
      }))
    }


    this.certMode$ = this.dcapPayAPIService.getCertMode().pipe(switchMap(data => {
        if (data) {
          if (data == 'cert' || data == 'test') {
            this.certMode = true
          }
        }
        return of(data)
      })
    );


    this.errorMessage = '';
    this.payAPIKeyExists();

    this.payMID$ = this.getPayMID().pipe(switchMap(data => {
      if (this.publicKey) {
        this.initDCap()
        return of(data)
      }
    }))

    // this.payApiEnabled = this.uiTransactions?.dcapPayAPIEnabled
  }

  getPayMID() :Observable<string> {
    let getKey$    =  this.dcapPayAPIService.getPayMID()
    return getKey$.pipe(switchMap(data => {
      this.publicKey = data;
      return of(data)
    }))
  }

  initDCap() {
    // Load the Datacap WebToken script dynamically
    const script = document.createElement('script');
    let certMode = this.certMode;

    let scriptUrl = ''
    if (certMode) {
      scriptUrl  = 'https://token-cert.dcap.com/v1/client'
    } else {
      scriptUrl = 'https://token.dcap.com/v1/client';
    }
    this.scriptUrl = scriptUrl
    // console.log('script', scriptUrl)
    this.loadScript(scriptUrl)
    .then(() => {
      this.formInitialized = true
      console.log(window.DatacapWebToken);
    })
    .catch((error) => {
      const message = 'Error loading the DatacapWebToken script:'
      const errMessage = JSON.stringify(error)
      this.siteService.notify(`${message}  ${errMessage}}`, 'close', 10000, 'red')
      console.log(message, errMessage)
      }
    );
  }

  loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve();
      script.onerror = () => reject('Failed to load script');
      document.head.appendChild(script);
    });
  }

  get payApiEnabled() {
    if ( this.uiTransactions?.dcapPayAPIEnabled) {
      if (this.platFormService.isApp()) {  return false  }
      return true
    }
    return false
  }

  requestToken(): void {
     this.errorMessage = ''
     this.processing = true;
     const tokenCallback = (response: any) => {
          console.log('requestToken token request', response)
          // this.processing = false;
          if (response.Error) {
            // alert("Token error: " + response.Error);
            this.siteService.notify(`${response?.Error} - Please verify your card, exp and cvv.`, 'Close', 5000 , 'red', 'top')
            this.errorMessage = response?.Error;
            this.processing = false;
          } else {

            // Here, you might want to do something with the token, like sending it to your server;
            if (response.Token) {


                let posPayment = {} as IPOSPayment;
                posPayment.orderID    = this.order.id;
                posPayment.amountPaid = this.order?.total;
                posPayment.tipAmount   = this.getTipValue
                posPayment.preAuth    = response?.Token;
                this.payment$ = this.dcapPayAPIService.sale(response, posPayment).pipe(switchMap(data => {
                  this.siteService.notify(data?.responseMessage, 'close', 5000, 'green')
                  this.orderMethodsService.updateOrder(data?.order)
                  this.orderMethodsService.updateOrderSubscription(data?.order)
                  this.processing = false;

                  if (data?.responseMessage === 'Approved') {
                    this.isApproved = true
                    this.outPutRefresh.emit(true);
                    this.router.navigate( ['payment-completed',  { id:  this.order.id} ] );
                    // this.router.navigateByURL([])
                  }
                  return of(data)
                }
            ))
          }
        };
      }

      let mid  = this.publicKey
      // console.log(mid, this.payment_form);
      window.DatacapWebToken.requestToken(mid, "payment_form", tokenCallback);
  }

 get getTipValue() : number {
    if (this.paymentForm) {
        return +this.paymentForm.controls['tipAmount'].value
    }
    return 0;
  }

  get surchargeValue() {

    return +(this.order?.total * +this.uiTransactions.dCapPayAPISurchargeValue).toFixed(2)

 }

 get totalValue() {
  return +(this.order?.total + this.getTipValue +(this.order?.total * +this.uiTransactions.dCapPayAPISurchargeValue)).toFixed(2)
 }
 getTipAmount(posPayment) {
  if (!this.paymentForm) {  return posPayment}
  let tipAmount = 0
  if (this.paymentForm.controls['tipAmount'].value) {
     tipAmount = +this.paymentForm.controls['tipAmount'].value
  }
  posPayment.tipAmount = tipAmount;
  return posPayment;
 }

  payAPIKeyExists() {
    this.payAPIKeyExists$ = this.dcapPayAPIService.payAPIKeyExists().pipe(switchMap(data => {
      this.payAPIKeyEnabled = data;
      return of(data)
    }))
  }

}

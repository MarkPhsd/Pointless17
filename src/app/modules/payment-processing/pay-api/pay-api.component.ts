import { Component, ElementRef, Input, OnInit, ViewChild } from '@angular/core';
import { DcapPayAPIService, KeyResponse } from '../services/dcap-pay-api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
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
  @ViewChild('tokenInput') tokenInput!: ElementRef;
  fieldsClass: string;
  encodedString: string;
  inputForm: FormGroup;

  expInvalid: boolean;
  cardInValid: boolean;
  cvvInvalid: boolean;
  action$: Observable<any>;

  @Input() order: IPOSOrder;
  formInitialized: boolean;
  publicKey: string;//"[Token Key Goes Here]"
  payAPIKeyEnabled: boolean;
  payAPIKeyExists$ : Observable<any>;
  payMID$: Observable<any>;
  payment$: Observable<any>;
  constructor(
    private fb: FormBuilder,
    private dcapPayAPIService: DcapPayAPIService) { }

  // private setTokenValue(token: string): void {
  //   this.tokenInput.nativeElement.value = token;
  // }

  ngOnInit(): void {
    // this.initForm()
    this.encodeUrl()
    if (!this.order) {
      this.order = {} as IPOSOrder;
      this.order.subTotal    = 1.00;
      this.order.taxTotal    = .07
      this.order.total       = 1.07
      this.order.id          = 871919
    }

    this.payAPIKeyExists()
    this.payMID$ = this.getPayMID().pipe(switchMap(data => {
      if (this.publicKey) {
        this.initDCap()
        return of(data)
      }
    }))
  }

  encodeUrl(){
    const originalString = "COASTSAND0GP:41543bd14e444bc5bf3598e15b9f7a78";
      // Encode the string
    this.encodedString = btoa(originalString);
    console.log(this.encodedString);
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
    let cerMode = true;
    let scriptUrl = ''
    if (cerMode) {
      scriptUrl  = 'https://token-cert.dcap.com/v1/client'
    } else {
      scriptUrl = 'https://token.dcap.com/v1/client';
    }
    this.loadScript(scriptUrl)
    .then(() => {
      this.formInitialized = true
      console.log(window.DatacapWebToken);
    })
    .catch((error) => console.error('Error loading the DatacapWebToken script:', error));
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

  // initForm() {
  //   this.inputForm = this.fb.group({
  //     cvv : [201],
  //     exp_year: [2026],
  //     exp_month: [12],
  //     card_number: [4761739001010119],
  //   })

  //   this.inputForm.valueChanges.subscribe(data => {
  //     this.isCardValid(data)
  //     this.isExpValid(data)
  //     this.isCVVValid(data)
  //   })
  // }

  // checkIfDataIsValid() {
  //   const data = this.inputForm.value
  //   this.isCardValid(data)
  //   this.isExpValid(data)
  //   this.isCVVValid(data)
  // }

  // isExpValid(data) {
  //   let month = data?.exp_month
  //   let year = data?.exp_year
  //   if (year && year) {
  //     let  validCard = window.DatacapWebToken.validateExpirationDate(month,year);
  //     this.expInvalid = false
  //     if (!validCard) {
  //       this.expInvalid = true
  //     }
  //   }
  // }

  // isCardValid(data) {
  //   let card = data?.card_number
  //   if (card) {
  //     let  validCard = window.DatacapWebToken.validateCardNumber(card);
  //     this.cardInValid = false
  //     if (!validCard) {
  //       this.cardInValid = true
  //     }
  //   }
  // }

  // isCVVValid(data) {
  //   let cvv = data?.cvv
  //   if (cvv) {

  //     let  validCard = window.DatacapWebToken.validateCardNumber(cvv);
  //     this.cvvInvalid = false
  //     if (!validCard) {
  //       this.cvvInvalid = true
  //     }
  //   }
  // }

  // initializeForm(): void {
  //   var tokenCallback = (response: any) => {
  //     if (response.Token) {
  //       this.setTokenValue(response.Token);
  //     } else {
  //       // Handle error or no token scenario
  //     }
  //   };
  //   window.DatacapWebToken.requestToken(this.publicKey, "payment_form", tokenCallback);
  // }

  requestToken(): void {

    console.log('request token')
     const tokenCallback = (response: any) => {
         console.log('All response', response)
          if (response.Error) {
            alert("Token error: " + response.Error);
          } else {

            console.log('response', response.Token)
            // Here, you might want to do something with the token, like sending it to your server;
            if (response.Token) {
                let posPayment = {} as IPOSPayment;
                posPayment.orderID    = this.order.id;
                posPayment.amountPaid = this.order.total;
                posPayment.preAuth    = response?.Token;
                this.payment$ = this.dcapPayAPIService.sale(response,posPayment).pipe(switchMap(data => {
                   return of(data)
                }))

          }
        };
      }

      console.log('public key', this.publicKey)
      let mid  = this.publicKey
      window.DatacapWebToken.requestToken(mid, "payment_form", tokenCallback);

  }

  payAPIKeyExists() {
    this.payAPIKeyExists$ = this.dcapPayAPIService.payAPIKeyExists().pipe(switchMap(data => {
      this.payAPIKeyEnabled = data;
      return of(data)
    }))
  }


}

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
  aquireKey$: Observable<any>;
  payment$: Observable<any>;
  @Input() order: IPOSOrder;
  formInitialized: boolean;
  publicKey: string;//"[Token Key Goes Here]"

  constructor(
    private fb: FormBuilder,
    private paymentService: DcapPayAPIService) { }

  private setTokenValue(token: string): void {
    this.tokenInput.nativeElement.value = token;
  }

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

    this.aquireKey$ = this.getAPIKey().pipe(switchMap(data => {
      this.publicKey = data?.apiKey
      if (this.publicKey) {
        this.initDCap()
        return of(data)
      }
    }))
  }

  encodeUrl(){
    const originalString = "COASTSAND0GP:qvfznJd-edvaYyYNe6eRf_Itgt0tqF4aS8TZ1SBaQbWUT-7yS6L33YdQGYzAON3c3yDVxOIYZooyiuSs1yivSQ";
      // Encode the string
    this.encodedString = btoa(originalString);
    console.log(this.encodedString);
  }

  getAPIKey() :Observable<KeyResponse> {
    let getKey$    =  this.paymentService.getPrivatePayAPIKey()
    let aquireKey$ =  this.paymentService.acquireApiKey();
    return getKey$.pipe(switchMap(data => {
      if ( !data || !data.apiKey ) {
        return aquireKey$
      }
      return of(data)
    })).pipe(switchMap(data => {
      this.publicKey = data?.apiKey;
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
      console.log('DatacapWebToken script loaded successfully');
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

  initializeForm(): void {
    var tokenCallback = (response: any) => {
      if (response.Token) {
        this.setTokenValue(response.Token);
      } else {
        // Handle error or no token scenario
      }
    };
    window.DatacapWebToken.requestToken("[Token Key Goes Here]", "payment_form", tokenCallback);
  }

  requestToken(): void {
    const tokenCallback = (response: any) => {
      if (response.Error) {
        alert("Token error: " + response.Error);
      } else {
        const tokenElement = document.getElementById("token");
        if (tokenElement instanceof HTMLInputElement) { // This check ensures that tokenElement is not null and is an input element
          tokenElement.value = response.Token;
          // Here, you might want to do something with the token, like sending it to your server;
          if (response.token) {
            let posPayment = {} as IPOSPayment;
            posPayment.orderID    = this.order.id;
            posPayment.amountPaid = this.order.total;
            posPayment.preAuth    = response?.token;
            this.payment$ = this.paymentService.sale(posPayment).pipe(switchMap(data => {
              ///then we use this to apply to an order
              //and complete the sale
              return of(data)
            }))
          }
        } else {
          console.error("Token input element not found");
        }
      }
    };

    window.DatacapWebToken.requestToken(this.publicKey, "payment_form", tokenCallback);
  }

  acquireInitialApiKey() {
    this.aquireKey$ = this.paymentService.acquireInitialApiKey().pipe(switchMap(data => {
      this.publicKey = data.apiKey
      return of(data)
    }))
  }

  acquireApiKey() {
    this.aquireKey$ = this.paymentService.acquireApiKey().pipe(switchMap(data => {
      this.publicKey = data.apiKey
      return of(data)
    }))
  }



}

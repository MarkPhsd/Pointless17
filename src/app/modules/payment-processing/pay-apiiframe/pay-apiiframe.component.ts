import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DcapPayAPIService } from '../services/dcap-pay-api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IPOSOrder, IPOSPayment } from 'src/app/_interfaces';
import { Observable, of, switchMap } from 'rxjs';
// declare var DatacapHostedWebToken: any; // This allows TypeScript to recognize the global variable

@Component({
  selector: 'app-pay-apiframe',
  templateUrl: './pay-apiiframe.component.html',
  styleUrls: ['./pay-apiiframe.component.scss']
})
export class PayAPIFrameComponent implements OnInit {
  @ViewChild('tokenInput') tokenInput!: ElementRef;
  fieldsClass: string;
  customCSS = ".card-data { background-color: #ADD8E6; color: white; font-size: 1.3em; margin:5px}";
  inputForm: FormGroup;
  order = {} as IPOSOrder;

  payAPIKeyEnabled: boolean;
  payAPIKeyExists$ : Observable<any>;
  payMID$: Observable<any>;
  payment$: Observable<any>;

  constructor(
    private fb: FormBuilder,
    private paymentService: DcapPayAPIService) { }

  private setTokenValue(token: string): void {
    this.tokenInput.nativeElement.value = token;
  }

  ngOnInit(): void {
    // // Load the Datacap WebToken script dynamically
    const script = document.createElement('script');
    let cerMode = true;
    if (cerMode) {
      script.src = 'https://token-cert.dcap.com/v1/client/hosted'
    } else {
      script.src = 'https://token.dcap.com/v1/client/hosted';
    }
    if (!this.order) {
      this.order = {} as IPOSOrder;
      this.order.subTotal    = 1.00;
      this.order.taxTotal    = .07
      this.order.total       = 1.07
      this.order.id          = 871919
    }
    document.head.appendChild(script);
    script.onload = () => {
      this.initializeForm();
    };
  }

  initializeForm(): void {
    var tokenCallback  = (response: any) => {
      console.log('response', response)
      if (response.Token) {
        // this.setTokenValue(response.Token);

        if (response.token) {
          let posPayment = {} as IPOSPayment;
          posPayment.orderID    = this.order.id;
          posPayment.amountPaid = this.order.total;
          posPayment.preAuth    = response?.token;
          this.payment$ = this.paymentService.sale(response, posPayment).pipe(switchMap(data => {
          return of(data)
       }))


      } else {
      }
    }

    const token = '41543bd14e444bc5bf3598e15b9f7a78'
    window.DatacapHostedWebToken.init('41543bd14e444bc5bf3598e15b9f7a78', 'token-iframe', tokenCallback);
  }}

  requestToken() {
    window.DatacapHostedWebToken.requestToken()
  }


}

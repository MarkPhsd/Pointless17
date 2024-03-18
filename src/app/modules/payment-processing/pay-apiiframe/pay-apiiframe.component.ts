import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { DcapPayAPIService } from '../services/dcap-pay-api.service';
import { FormBuilder, FormGroup } from '@angular/forms';
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

    document.head.appendChild(script);
    script.onload = () => {
      this.initializeForm();
    };
  }

  initializeForm(): void {
    var tokenCallback  = (response: any) => {
      console.log('response', response)
      if (response.Token) {
        this.setTokenValue(response.Token);
      } else {
      }
    }

    const token = 'qvfznJd-edvaYyYNe6eRf_Itgt0tqF4aS8TZ1SBaQbWUT-7yS6L33YdQGYzAON3c3yDVxOIYZooyiuSs1yivSQ'
    window.DatacapHostedWebToken.init(token, 'token-iframe', tokenCallback);
  }

  requestToken() {
    window.DatacapHostedWebToken.requestToken()
  }





}

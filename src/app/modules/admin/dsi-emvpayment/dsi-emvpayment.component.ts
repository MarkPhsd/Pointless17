import { Component } from '@angular/core';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-dsi-emvpayment',
  templateUrl: './dsi-emvpayment.component.html',
  styleUrls: ['./dsi-emvpayment.component.scss']
})

export class DsiEMVPaymentComponent  {

  isApp       = this.platFormService.isApp();
  androidApp  = this.platFormService.androidApp;
  result      : any;
  instance    : any;
  echoResponse: any;
  echoPluginResponse: any;
  err: any
  responseCheck: any;

  status: any;
  constructor(
    private platFormService: PlatformService,
    private router: Router,
    // private DsiEmvPaymentsService: DsiEmvPaymentsService
  ) {

  }

  get isAndroid() {
    return this.platFormService.androidApp
  }

  reset() {
    this.result = ''
    this.responseCheck = ''
    this.instance = ''
  }

  async checkPermission() {
      try {
      // const options = { value: ' echo this '}
      // const status = await DSIEMVAndroid.echo(options)
      // this.responseCheck = status
      // this.result = status
    } catch (error) {
      this.err = error
      this.instance = 'Instance Implementation not available.'
    }
  }

  async testTransaction() {
    // const dsiemvandroidPlugin = typeof  dsiemvandroid
    try {
      // const options = { value: ' echo this '}
      // const status = await Transaction.getAmount()
      // this.responseCheck = status
      // this.result = status
  } catch (error) {
    this.err = error
    this.instance = 'Instance Implementation not available. ' + error
  }
}

  async checkResponse() {
    // const dsiemvandroidPlugin = typeof  dsiemvandroid
    try {
    // const options = { value: ' echo this '}
    // const status = await DSIEMVAndroid.echo(options)
    // this.echoResponse = status
    // this.result = status
  } catch (error) {
    this.err = error
    this.instance = 'Instance Implementation not available. ' + error
  }
}


  async getInstance() {
    try {
      // const DSIEMVAndroid = typeof DSIEMVAndroid
      const options = { value: ' echo this '}

      // const status = await DSIEMVAndroid.getInstance()
      // this.instance = status
    } catch (error) {
      console.log(error)
      this.err = error
      this.instance = 'Error: Instance Implementation not available. ' + error
    }
  }

  async setFoundation() {
    // try {
    //   const status = await dsiPayments.foundation();
    //   this.instance = status
    // } catch (error) {
    //   console.log(error)
    //   this.err = error
    //   this.echoResponse = 'Implementation not available.'
    // }
  }

  // async checkEcho() {
  //   try {
  //     const options = { value: ' echo this '}
  //     const status = await DSIEMVAndroidWebView.echo(options)
  //     this.echoResponse = status
  //     this.result = status
  //   } catch (error) {
  //     this.err = error
  //     this.instance = 'Instance Implementation not available.'
  //   }
  // }

  login() {
    this.router.navigate(['login'])
  }
}

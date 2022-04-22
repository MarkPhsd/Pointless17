import { Component } from '@angular/core';
// import 'dsiemv-android-plugin';
// import  'dsiemv-android-plugin';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { Router } from '@angular/router';
// need to use interfaces direct from plugin.
// web interface works as dsemandroid
// // import { shared}
import { Plugins} from '@capacitor/core'
const  { dsiemvandroidPlugin, ZebraLabelPrinterPlugin } = Plugins;
import 'ionic-zebra-label-printer'

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
  constructor(
    private platFormService: PlatformService,
    private router: Router,
    // private DsiEmvPaymentsService: DsiEmvPaymentsService
  ) { }
  status: any;

  reset() {
    this.result = ''
    this.instance = ''
  }
  async checkPermission() {
      // const dsiemvandroidPlugin = typeof  dsiEMVAndroidinstancePlugin
      // const options = { value: ' echo this '}
      // const status = await dsiemvandroidPlugin
      // console.log('status', status)
      // this.result = status
  }

  async getInstance() {
    try {
      const status = await dsiemvandroidPlugin.getInstance();
      this.instance = status
    } catch (error) {
      console.log(error)
      this.err = error
      this.instance = 'Instance Implementation not available.'
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

  async getEcho() {

    const options = { value: ' Get Echo. Following output is from Plugin: '}
    if (this.androidApp) {
      try {
        const status = await dsiemvandroidPlugin.echo(options)
        this.echoResponse = status.value;
      } catch (error) {
        console.log(error)
        this.echoResponse = 'Implementation not available.'
        this.err = error
      }
    }

    if (!this.isApp) {
      try {
        const status = await dsiemvandroidPlugin.echo(options)
        this.echoResponse = status.value;
      } catch (error) {
        console.log(error)
        this.echoResponse = 'Implementation not available.'
        this.err = error
      }
    }
  }

  login() {
    this.router.navigate(['login'])
  }
}

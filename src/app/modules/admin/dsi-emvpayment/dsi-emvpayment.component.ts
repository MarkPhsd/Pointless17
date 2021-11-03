import { Component, OnInit } from '@angular/core';
// import 'dsiemv-android-plugin';
import { Plugins} from '@capacitor/core';

@Component({
  selector: 'app-dsi-emvpayment',
  templateUrl: './dsi-emvpayment.component.html',
  styleUrls: ['./dsi-emvpayment.component.scss']
})
export class DsiEMVPaymentComponent  {
  result: any;
  instance: any;
  constructor() { }
  status: any;

  async checkPermission() {
  //   const { dsiemvandroid } = Plugins;
  //   const options = { value: ' '}
  //   const status = await dsiemvandroid.echo( options );
    this.result = status
  }

  async getInstance() {
  //   const { dsiEMVAndroidinstance } = Plugins;
  //   const options = { value: 'CCS APP - '}
  //   const status = await dsiEMVAndroidinstance.getInstance();
    this.instance = status
  }



}

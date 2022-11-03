import { Component, OnInit } from '@angular/core';
import { NgZone } from '@angular/core';

@Component({
  selector: 'call-us-selector',
  templateUrl: './call-us-selector.component.html',
  styleUrls: ['./call-us-selector.component.scss']
})
export class CallUsSelectorComponent implements OnInit {

  srcUrl  = `http://192.168.0.6:4200/chat.html`

  constructor(private _ngZone: NgZone) { }

  ngOnInit(): void {
    this._ngZone.runOutsideAngular(() => {
      // this.loadScript() //'https://downloads-global.3cx.com/downloads/livechatandtalk/v1/callus.js');
      // console.log('')
    })
  }

  public loadScript() {

    // const html = `<call-us-selector phonesystem-url="https://pointlesspos.ca.3cx.us:6001" party="LiveChat702266">
    //               </call-us-selector>`
    // const src =  `https://downloads-global.3cx.com/downloads/livechatandtalk/v1/callus.js`
    // const body = <HTMLDivElement> document.body;
    // const script = document.createElement('script');
    // script.innerHTML = html;
    // script.src = src;
    // script.async = false;
    // script.defer = true;
    // body.appendChild(script);
  }

}

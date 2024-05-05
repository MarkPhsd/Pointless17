import { Component, OnInit } from '@angular/core';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { Renderer2, Inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { UIHomePageSettings } from 'src/app/_services/system/settings/uisettings.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { of, switchMap,Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-three-cxfab',
  templateUrl: './three-cxfab.component.html', // `<call-us-selector phonesystem-url="{{server}}" party="{{party}}">  </call-us-selector>`,
  styleUrls: ['./three-cxfab.component.scss']
})
export class ThreeCXFabComponent {
  message: string;

  templateString: string;
  chatApp = ``
  dialogRef: any;
  settings: UIHomePageSettings;

  server: string;
  party: string;
  hide = false;
  href: string;

  get exceptions() {
    this.hide = false  ;
    // console.log('hide', this.hide)
    // (this.href.substring(0, 11 ) === '/display-menu')
    if ((this.href.substring(0, 13 ) === '/display-menu')) {
      this.hide = true;
    }
    return true
  }

  // action$ : Observable<any>;
  action$ = this.settingsService.getUIHomePageSettings().pipe(
    switchMap(
      data => {

        this.exceptions;
        this.settings = data;
        if (data.threeParty && data.threecxChatLink) {
          const server  = data.threecxChatLink
          const party   = data.threeParty;
          this.chatApp = `<call-us-selector phonesystem-url="${server}" party="${party}">  </call-us-selector>`
          this.loadJsScript(this.render, this.chatApp)
        }

        return of(data)

      }
    )
  )

  constructor(
    private render: Renderer2,
    private settingsService: SettingsService,
    private router: Router,
    @Inject(DOCUMENT) private document: Document,

   ) {
    this.href = this.router.url;
   }


  loadJsScript(renderer: Renderer2, src: string) {
    // const script = renderer.createElement('script');
    // script.type = 'text/javascript';
    // script.src = src;
    // this.message = 'loaded ' + src;
    this.message = src

    let script = renderer.createElement('html');
    script.type = 'text/html';
    script.src = src;

    // render  er.(this.document.body, script);

  }

}

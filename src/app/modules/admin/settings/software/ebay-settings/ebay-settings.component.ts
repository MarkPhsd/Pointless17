import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, UntypedFormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { switchMap, of, Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EbayAPIService, ebayHeaders, ebayoAuthorization } from 'src/app/_services/resale/ebay-api.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';

@Component({
  selector: 'app-ebay-settings',
  templateUrl: './ebay-settings.component.html',
  styleUrls: ['./ebay-settings.component.scss']
})
export class EbaySettingsComponent implements OnInit {

  @Input() authCodeApproval : string;

  auth: string;
  actionResult: any;
  ebaySettings$: Observable<any>;
  ebayForm: FormGroup
  ebaySettings    : ebayoAuthorization;
  ebayPostResults$: Observable<ebayoAuthorization>;
  isAdmin: boolean
  action$ : Observable<any>;
  setting: ISetting;
  decodedValue: string;
  href: string;
  decoder: FormGroup;
  authDisabled: boolean;

  constructor(
    private uISettingsService: UISettingsService,
    private settingService   : SettingsService,
    private sitesService     : SitesService,
    private ebayService: EbayAPIService,
    private fb: UntypedFormBuilder,
    private router: Router,
    private authenticationService: AuthenticationService,) { }

  ngOnInit(): void {

    if (this.href === '/ebay-auth-redirect') {
      this.authDisabled = true
    }

    this.initEbaySettings();
    this.decoder = this.fb.group({
      code: []
    })
    this.decoder.valueChanges.subscribe(data => {
      if (data) {

      }
    })
  }

  applyAuthCode() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.getRefreshToken(site, this.authCodeApproval).pipe(
      switchMap(data => {

        return of(data)
      })
    )
}


  decodeAuth(data) {
    this.decodedValue = this.authenticationService.decodeAuth(data)
  }

  ngOndestroy() {

  }

  refresh() {
    this.initEbaySettings();
  }

  initEbaySettings() {
    this.initEbayForm( )
    this.action$ = this._getSettings()
  }

  _getSettings() {
    const site = this.sitesService.getAssignedSite()
    return  this.uISettingsService.getSetting('ebaySettings').pipe(
      switchMap( data => {

        this.setting = data;
        if (!data) {
          const setting = this.getSettingState();
          return  this.settingService.postSetting(site, setting)
        }

        if (data.text) {
          if (!data.text) {
            this.ebaySettings = {} as ebayoAuthorization;
          } else {
            this.ebaySettings = JSON.parse(data.text) as ebayoAuthorization;
          }
          this.ebaySettings.id = data.id;

          // this.
        }

        this.auth = window.btoa(`${this.ebaySettings?.clientID}:${this.ebaySettings?.client_secret}`);
        this.ebayForm.patchValue( this.ebaySettings )
        return of(this.ebaySettings);
    }));
  }

  clearAuthorization() {
    const site = this.sitesService.getAssignedSite()
    const action$ = this.settingService.clearEbayAuth(site, this.setting)
    this.action$ =  action$.pipe(switchMap(data => {
      return this._getSettings()
    }))
  }

  openEbayAuthAgreement() {
    if (this.ebaySettings && this.ebaySettings.brandedoAuthLink) {
      this.router.navigateByUrl(this.ebaySettings.brandedoAuthLink)
    }
  }

  saveEbaySettings() {
    const site = this.sitesService.getAssignedSite()
    this.setting.text = JSON.stringify(this.ebayForm.value);
    let setting = this.setting;
    if (!setting) {
      // console.log('settting', setting)
      return ;
    }

    const confirm = window.confirm('If you save this, it will ovewrite your current ID, Secret and RUName Settings. Only do this if you mean it.')

    if (!confirm) {return}

    this.action$ =  this.settingService.putSetting(site, setting.id, setting).pipe(switchMap(data => {
      this.sitesService.notify('Saved', 'Close', 3000, 'green')
      return of(data)
    }))
  }

  getSettingState() {
    const setting = {} as ISetting;
    let item = {} as ebayHeaders
    if (!this.ebayForm) {
      item = this.ebayForm.value as ebayHeaders
    } else {
      item = this.ebayForm.value as ebayHeaders
    }
    const json = JSON.stringify(item)
    setting.text = json
    setting.name = 'ebaySettings'
    return setting;
  }

  getEbayTime() {
    this.ebayPostResults$
  }
  initEbayForm() {
    this.ebayForm = this.fb.group({
      brandedoAuthLink: [],
      devName: [],
      appName : [],
      clientID: [],
      oAuthUserToken: [],
      token: [],
      client_secret: [],
      rUName: [],
      sandBox: [],
      access_token: [],
      refresh_token: [],
      id: []
    })
  }

  getOAuthToken() {
    if (this.ebayForm) {
      let item = this.ebayForm.value as ebayoAuthorization
      if (item) {
        item.sandBox = true;
        const site = this.sitesService.getAssignedSite()
        this.action$ = this.ebayService.getOAuthToken(site).pipe(switchMap(data => {
          this.actionResult = data;
          return of(data)})
          )
      }
    }
  }

  // getRefreshToken() {
  //   if (this.ebayForm) {
  //     let item = this.ebayForm.value as ebayoAuthorization
  //     if (item) {
  //       item.sandBox = true;
  //       const site = this.sitesService.getAssignedSite()
  //       this.action$ = this.ebayService.getRefreshToken(site).pipe(switchMap(data => {
  //         this.actionResult = data;
  //         return of(data)})
  //         )
  //     }
  //   }
  // }

  clearResults() {
    this.actionResult = null
  }

  getEbayAuth() {
    if (this.ebayForm && this.ebayForm.controls['brandedoAuthLink'].value) {
      const link = this.ebayForm.controls['brandedoAuthLink'].value
      this.ebayService.navEbayAuth(link)
    }
  }


}

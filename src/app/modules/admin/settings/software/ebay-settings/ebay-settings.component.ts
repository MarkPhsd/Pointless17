import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormGroup, FormsModule, ReactiveFormsModule, UntypedFormBuilder } from '@angular/forms';
import { MatDividerModule } from '@angular/material/divider';
import { MatLegacyButtonModule } from '@angular/material/legacy-button';
import { MatLegacyCardModule } from '@angular/material/legacy-card';
import { MatLegacyInputModule } from '@angular/material/legacy-input';
import { MatLegacyProgressSpinnerModule } from '@angular/material/legacy-progress-spinner';
import { MatLegacySliderModule } from '@angular/material/legacy-slider';
import { Router } from '@angular/router';
import { switchMap, of, Observable } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { AuthenticationService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { EbayAPIService, ebayHeaders, ebayoAuthorization } from 'src/app/_services/resale/ebay-api.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { ValueFieldsComponent } from '../../../products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';

@Component({
  selector: 'app-ebay-settings',
  standalone: true,
  imports: [CommonModule,NgxJsonViewerModule, FormsModule,ReactiveFormsModule,AppMaterialModule,ValueFieldsComponent,
    ValueFieldsComponent,MatLegacyButtonModule,MatLegacyProgressSpinnerModule,
    MatLegacyInputModule,MatLegacySliderModule,MatLegacyCardModule,MatDividerModule
  ],
  templateUrl: './ebay-settings.component.html',
  styleUrls: ['./ebay-settings.component.scss']
})
export class EbaySettingsComponent implements OnInit {

  @Input() authCodeApproval : string;
  fufillment$: Observable<any>;
  return$ : Observable<any>;
  locations$ : Observable<any>;
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

  // getOAuthToken() {
  //   if (this.ebayForm) {
  //     let item = this.ebayForm.value as ebayoAuthorization
  //     if (item) {
  //       item.sandBox = true;
  //       const site = this.sitesService.getAssignedSite()
  //       this.action$ = this.ebayService.getOAuthToken(site, item.token).pipe(switchMap(data => {
  //         this.actionResult = data;
  //         return of(data)})
  //         )
  //     }
  //   }
  // }

  applyAuthCode() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.applyAuthResponse(site, this.authCodeApproval).pipe(
      switchMap(data => {
        this.actionResult = data
        return of(data)
      })
    )
  }

  getRefreshToken() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.getRefreshToken(site).pipe(
      switchMap(data => {
        this.actionResult = data
        return of(data)
      })
    )
  }

  createInventoryLocation() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.createInventoryLocation(site).pipe(
      switchMap(data => {
        this.actionResult = data
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
    return  this.settingService.getPublicEbay(site).pipe(
      switchMap( data => {
        if (data) {
          this.ebaySettings = data;
          this.ebaySettings.id = data.id;
          // }

          // this.auth = window.btoa(`${this.ebaySettings?.clientID}:${this.ebaySettings?.client_secret}`);
         this.ebayForm.patchValue( this.ebaySettings )
        }
        // this.setting = data;
        // if (!data) {
        //   const setting = this.getSettingState();
        //   return  this.settingService.postSetting(site, setting)
        // }

        // if (data.text) {
        //   if (!data.text) {
        //     this.ebaySettings = {} as ebayoAuthorization;
        //   } else {
        //     this.ebaySettings = JSON.parse(data.text) as ebayoAuthorization;
        //   }

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

  testPublish() {
    const site = this.sitesService.getAssignedSite()
    this.action$ =  this.ebayService.testPublish(site).pipe(switchMap(data => {
      console.log(data)
      return of(data)
    }))
  }

  saveEbaySettings() {
    const site = this.sitesService.getAssignedSite()
    const ebayValue = this.ebayForm.value
    const ebayText = JSON.stringify(this.ebayForm.value);
    let setting = {} as ISetting;
    setting.id = ebayValue.id;
    setting.text = ebayText ;
    setting.name = 'EbaySettings';

    if (!setting) {
      return ;
    }

    const confirm = window.confirm('If you save this, it will ovewrite your current ID, Secret and RUName Settings. Only do this if you mean it.')

    if (!confirm) {return}

    this.action$ =  this.settingService.putEbaySetting(site, setting.id, setting).pipe(switchMap(data => {
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


  clearResults() {
    this.actionResult = null
  }

  getEbayAuth() {
    if (this.ebayForm && this.ebayForm.controls['brandedoAuthLink'].value) {
      const link = this.ebayForm.controls['brandedoAuthLink'].value
      this.ebayService.navEbayAuth(link)
    }
  }

  nav(value){
    if (value == '1'){
      this.router.navigate(['ebay-fufillment-policy'])
    }
    if (value == '2'){
      this.router.navigate(['ebay-return-policy'])
    }
  }

  listReturn() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.listPolicies(site,'POSReturnPolicy').pipe(switchMap(data =>
      {
        this.actionResult = data
        return of(data)
      }
    ))
  }

  listFufillment() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.listPolicies(site, 'POSFufillmentPolicy').pipe(switchMap(data =>
      {
        this.actionResult = data
        return of(data)
      }
    ))
  }

  listPayment() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.listPolicies(site, 'POSPaymentPolicy').pipe(switchMap(data =>
      {
        this.actionResult = data
        return of(data)
      }
    ))
  }

  getLocations() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.getAsync(site, '/sell/inventory/v1/location/').pipe(switchMap(data =>
      {
        this.actionResult = data
        return this.ebayService.getPOSLocation(site) //, '/sell/inventory/v1/location/')
      }
    )).pipe(switchMap(data => {

      return of(data)
    }))
  }

  createLocation() {
    const site = this.sitesService.getAssignedSite()
    this.action$ = this.ebayService.createInventoryLocation(site).pipe(switchMap(data =>
      {
        this.actionResult = data
        return of(data)
      }
    ))
  }
}

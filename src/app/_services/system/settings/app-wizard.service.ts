import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ISetting } from 'src/app/_interfaces';
import { SitesService } from '../../reporting/sites.service';
import { SettingsService } from '../settings.service';

export interface IAppWizardStatus {
  disableAppWizard: boolean;
  setupCompany: boolean;

  setupItemsTypes: boolean;
  configureGenericItemType: boolean;

  //requires 1st two
  addedTax			: boolean;
  associateItemTaxes	: boolean;
  setupItemTaxes		: boolean;
  importProducts    : boolean;
  setupPaymentTypes	: boolean;
  setupTransactionTypes: boolean;
  setupFirstItem		: boolean;
  confirmReceipt		: boolean;

  setupUserType		: boolean;
  setupAuthorizations : boolean;
  setupFirstEmployee	: boolean;
  setupMerchantAccount: boolean;
  
  setupAdjustments	: boolean;

  firstSale: boolean;
  firstBalanceSheet: boolean;
  firstCloseOfDay: boolean;
}

export interface AppStatus { 
  completed: number;
  total: number;
  percentage: number;
  disabled: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class SystemInitializationService {

  appWizardStatus: IAppWizardStatus;
  iAppWizardStatus: IAppWizardStatus;
  public _AppWizardStatus   = new BehaviorSubject<IAppWizardStatus>(null);
  public  appWizardStatus$ = this._AppWizardStatus.asObservable();
  public appWizardSetting: ISetting  ;

  constructor(
    private siteService   : SitesService,
    private settingService: SettingsService) {
  }

  initAppWizard() {
    const site = this.siteService.getAssignedSite();
    this.settingService.getSettingByName(site, 'AppWizard').subscribe(data => {
      if (data.text) {
        const appWizard = JSON.parse(data.text) as IAppWizardStatus
        this._AppWizardStatus.next(appWizard)
        this.appWizardStatus = appWizard
      }
      const appWizard = {} as IAppWizardStatus
      this._AppWizardStatus.next(appWizard)
    })
  }

  getAppWizard() {
    const site = this.siteService.getAssignedSite();
    return this.settingService.getSettingByName(site, 'AppWizard') //.subscribe(data => {
  }

  saveAppWizard() {
    const site = this.siteService.getAssignedSite();
    if (this.appWizardSetting) {
      this.appWizardSetting.text = JSON.stringify(this.appWizardStatus)
      return this.settingService.putSetting(site, this.appWizardSetting.id, this.appWizardSetting)
    }
    if (!this.appWizardSetting) {
      const setting = {} as ISetting // this.appWizardSetting 
      setting.text = JSON.stringify(this.appWizardStatus)
      setting.name = 'AppWizard';
      return this.settingService.postSetting(site,  setting)
    }
  }

  getStatusCount(item: IAppWizardStatus): AppStatus { 
    let count = 0;
      if (!item) { 
        const returnItem = {completed: 0, total: 0, percentage: 0, disabled: false} as AppStatus
        return returnItem;
        return 
      }
    // if (item.disableAppWizard) {  };

    if (item.setupCompany) { ++count }
  
    if (item.setupItemsTypes) { ++count }
    if (item.configureGenericItemType) { ++count }
  
    //requires 1st two
    if (item.addedTax			) { ++count }
    if (item.associateItemTaxes	) { ++count }
    if (item.setupItemTaxes		) { ++count }
  
    if (item.setupPaymentTypes	) { ++count }
    if (item.setupTransactionTypes) { ++count }
    if (item.setupFirstItem		) { ++count }
    if (item.confirmReceipt		) { ++count }
  
    if (item.setupUserType		) { ++count }
    if (item.setupAuthorizations ) { ++count }
    if (item.setupFirstEmployee	) { ++count }
    if (item.setupMerchantAccount) { ++count }
  
    if (item.setupAdjustments	) { ++count }
  
    if (item.firstSale) { ++count }
    if (item.firstBalanceSheet) { ++count }
    if (item.firstCloseOfDay) { ++count }

    const returnItem = {completed: count, total: 19, percentage: count/19, disabled: item.disableAppWizard} as AppStatus

    return returnItem;
    
  }

}

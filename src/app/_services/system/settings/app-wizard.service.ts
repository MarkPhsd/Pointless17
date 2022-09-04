import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of,switchMap } from 'rxjs';
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

  posTerminalSetup: boolean;
}

export interface AppStatus { 
  completed: number;
  total: number;
  percentage: string;
  disabled: boolean;
}
@Injectable({
  providedIn: 'root'
})
export class SystemInitializationService {

  public  _appStatus   = new BehaviorSubject<AppStatus>(null);
  public  appStatus$ = this._appStatus.asObservable();

  appWizardStatus: IAppWizardStatus;
  iAppWizardStatus: IAppWizardStatus;

  public _AppWizardStatus   = new BehaviorSubject<IAppWizardStatus>(null);
  public  appWizardStatus$ = this._AppWizardStatus.asObservable();
  public appWizardSetting: ISetting  ;

  constructor(
    private siteService   : SitesService,
    private settingService: SettingsService) {
    this.initAppWizard();
  }

  initAppWizard() {
    const site = this.siteService.getAssignedSite();
    this.settingService.getSettingByName(site, 'AppWizard').pipe(
      switchMap(data => { 
        if (data) { 
          return of(data)
        } 
        if (!data) { 
          const setting = this.wizardSettingValue;
          return  this.settingService.saveSettingObservable(site, setting);
        }
      }
    )).subscribe(data => { 
      this.appWizardSetting = data;
      if (data.text) {
        const appWizard = JSON.parse(data.text) as IAppWizardStatus
        this._AppWizardStatus.next(appWizard)
        this.appWizardStatus = appWizard
        if (appWizard) {
          this._appStatus.next(this.getStatusCount(appWizard))
        }
        return
      }
      const appWizard = {} as IAppWizardStatus
      this.appWizardStatus = appWizard
      this._AppWizardStatus.next(appWizard)
      console.log('appWizard', appWizard)
      if (appWizard) {
        this._appStatus.next(this.getStatusCount(appWizard))
      }
    })
  }

  getAppWizard() {
    const site = this.siteService.getAssignedSite();
    return this.settingService.getSettingByName(site, 'AppWizard') //.subscribe(data => {
  }

  saveAppWizard(item: IAppWizardStatus): Observable<any> {
    const site = this.siteService.getAssignedSite();
    if (item) {
      if (this.appWizardSetting) { 
        this.appWizardSetting.text = JSON.stringify(item)
        return this.settingService.putSetting(site, this.appWizardSetting.id,
                                              this.appWizardSetting);
      }
    }
    return of('Failed')
  }

  get wizardSettingValue() { 
    if (!this.appWizardSetting) {
      this.appWizardSetting = {} as ISetting;
    }
    this.appWizardSetting.name = 'AppWizard';
    return  this.appWizardSetting
  }

  getStatusCount(item: IAppWizardStatus): AppStatus { 
    let count = 0;
    console.log('getStatusCount', item)

    // if (!item) { 
    //   const returnItem = {completed: 0, total: 0, percentage: '0', disabled: false} as AppStatus
    //   return returnItem;
    // }
    if (item.disableAppWizard) {  };
    
    if (item.setupCompany) { count = 1 + count }
  
    if (item.setupItemsTypes) { count = 1 + count  }
    if (item.configureGenericItemType) { count = 1 + count  }
  
    //requires 1st two
    if (item.addedTax			) { count = 1 + count  }
    if (item.associateItemTaxes	) { count = 1 + count  }
    if (item.setupItemTaxes		) { count = 1 + count  }
  
    if (item.setupPaymentTypes	){ count = 1 + count  }
    if (item.setupTransactionTypes) { count = 1 + count  }
    if (item.setupFirstItem		) { count = 1 + count  }
    if (item.confirmReceipt		) { count = 1 + count  }
  
    if (item.setupUserType		) { count = 1 + count  }
    if (item.setupAuthorizations ){ count = 1 + count  }
    if (item.setupFirstEmployee	) { count = 1 + count  }
    if (item.setupMerchantAccount) { count = 1 + count  }
  
    if (item.setupAdjustments	) { count = 1 + count  }
  
    if (item.firstSale) { count = 1 + count  }
    if (item.firstBalanceSheet) { count = 1 + count  }
    if (item.firstCloseOfDay) { count = 1 + count  }
    console.log(count)
    const returnItem = {completed: count, total: 19, percentage: (count/19 * 100).toFixed(0), disabled: item.disableAppWizard} as AppStatus
    this._appStatus.next(returnItem);

    return returnItem;
    
  }

}

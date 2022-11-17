import { Injectable} from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { ISetting, IUser } from 'src/app/_interfaces';
import { SitesService } from '../../reporting/sites.service';
import { EmailModel } from '../../twilio/send-grid.service';
import { SettingsService } from '../settings.service';
import { UserAuthorizationService } from '../user-authorization.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { MatDialog } from '@angular/material/dialog';
import { PosEditSettingsComponent } from 'src/app/modules/admin/settings/pos-list/pos-edit-settings/pos-edit-settings.component';
import { ElectronService } from 'ngx-electron';
import { PlatformService } from '../platform.service';

export interface TransactionUISettings {
  id                     : number;
  displayNotes           : boolean;
  displayView            : boolean;
  displayAdd             : boolean;
  displayQuantity        : boolean;
  lockOrders             : boolean;
  deleteUnClosedPrintedOrders: boolean;
  closeOrderTimeCutOff   : string;
  ordersRequireCustomer  : boolean;
  validateCustomerLicenseID: boolean;
  qrDefaultServiceTypeID : number;
  defaultClientTypeID    : number;
  enablMEDClients        : boolean;
  enableLimitsView       : boolean;
  splitCheckByItem       : boolean;
  prefixBarcodeLabel     : string;
  mAXOrdersOpen          : string;
  loyaltyPointSystemValue: string;
  lotPreBarCode          : string;
  creditRecieptMinimum   : string;
  buyerAmountDiscount    : string;
  idleTime               : string;
  highTipInputPercentage : string;
  onlyAllowInventory     : boolean;
  showOrderName          : boolean;
  recmedPricing          : boolean;
  applyTaxChangesToDiscountedItems  : boolean;
  fuzzyMatchBarcodeLookup: boolean;
  requireEnterTabBarcodeLookup: boolean;
  cardPointPreAuth        : boolean;
  cardPointBoltEnabled   : boolean;
  cardPointAndroidEnabled: boolean;
  cardPointRequestTip    : boolean;
  dsiEMVAndroidEnabled   : boolean;
  dsiEMVNeteEpayEnabled  : boolean;
  dsiEMVIP               : boolean;

}

export interface StripeAPISettings {
  id: number;
  apiKey     : string;
  apiSecret: string;
  enabled: boolean;
  paymentAgreement: string;
}

export interface DSIEMVSettings {
  id        : number;
  hostOrIP  : string;
  ipPort    : string;
  merchantID: string;
  terminalID: string;
  operatorID: string;
  userTrace : string;
  tranCode  : string;
  secureDevice: string;
  comPort   : string;
  pinPadIpAddress: string;
  pinPadIpPort: string;
  sequenceNo: string;
  displayTextHandle: string;
  enabled: boolean;
}

export interface DSIEMVAndroidSettings {

}

export interface WebAppSettings {
  usersEnabled: Boolean;
}

export interface InstalledAppSettings {
  defaultReceipt     : string;
  promptBalanceSheet: boolean;
}

export interface MetrcSettings {
  enabled: boolean;
}

export interface EndOfDayProcedures {

}

export interface RStream {
  CmdResponse: CmdResponse;
}

export interface CmdResponse{
  ResponseOrigin: string;
  DSIXReturnCode: string;
  CmdStatus: string;
  TextResponse: string;
  SequenceNo: string;
  UserTrace: string;
}

export interface UIHomePageSettings {
  id                : number;
  menuEnabled       : boolean;
  brandsEnabled     : boolean;
  categoriesEnabled : boolean;
  typesEnabled      : boolean;
  departmentsEnabled: boolean;
  tierMenuEnabled   : boolean;
  staffMenuEnabled       : boolean;
  staffBrandsEnabled : boolean;
  staffCategoriesEnabled: boolean;
  staffDepartmentsEnabled: boolean;
  staffTierMenuEnabled  : boolean;
  staffTypesEnabled   : boolean;
  menuItemSize        : number; //pixels
  itemsPerPage        : number;
  backgroundImage     : string;
  tinyLogo            : string;
  logoHomePage        : string;  //  : [config.logoHomePage],
  displayCompanyName  : string;  //     : [config.displayCompanyName],
  wideOrderBar        : boolean;
  sideToolbarDefaultBrand  : boolean;
  sideToolbarEnableBrand   : boolean;
  sideToolbarEnableType    : boolean;
  sideToolbarEnableCategory: boolean;

  sendGridOrderTemplate: string;
  sendGridSalesReportTemplate : string;
  sendGridBalanceSheetTemplate : string;
  sendGridPasswordResetTemplate : string;
  sendGridNotificationTemplate: string;
  sendGridOrderReadyNotificationTemplate: string;

  administratorEmail : string;
  outGoingCustomerSupportEmail: string;
  salesReportsEmail  : string;
  twilioEnabled      : string;
  smtpEmailEnabled   : string;

  threecxChatLink    : string;
  threeParty         : string;
}

@Injectable({
  providedIn: 'root'
})

export class UISettingsService {

  pricingRecMed = [
    {id: 0, name: 'Both'}, {id: 1, name: 'Rec'}, {id: 2, name: 'Med'}
  ]

  //section cacluates the order panel so that all items are properly displayed and scrollable.
  private _totalOrderHeightVal   : number;

  private _totalOrderHeight          = new BehaviorSubject<number>(null);
  public  totalOrderHeight$          = this._totalOrderHeight.asObservable();

  private  _remainingHeight          = new BehaviorSubject<number>(null);
  public  remainingHeight$          = this._remainingHeight.asObservable();
  private windowHeight: number;

  private orderHeaderHeight   :number;
  private customerOrderHeight :number;
  private specialOrderHeight  :number;
  private orderItemsHeight    : number;
  private limitOrderHeight: number;

  private _orderSpecialsHeight        = new BehaviorSubject<number>(null);
  public  orderSpecialsHeight$        = this._orderSpecialsHeight.asObservable();

  private _orderHeaderHeight          = new BehaviorSubject<number>(null);
  public  orderHeaderHeight$          = this._orderHeaderHeight.asObservable();

  private _customerOrderHeight        = new BehaviorSubject<number>(null);
  public  customerOrderHeight$        = this._customerOrderHeight.asObservable();

  private _limitOrderHeight           = new BehaviorSubject<number>(null);
  public  limitOrderHeight$           = this._limitOrderHeight.asObservable();

  private _orderItemsHeight           = new BehaviorSubject<number>(null);
  public  orderItemsHeight$           = this._orderItemsHeight.asObservable();
 ////section end.

  private _emailModel  = new BehaviorSubject<EmailModel>(null);
  public  EmailModel$  = this._emailModel.asObservable();
  emailModel: EmailModel

  public  posDeviceInfo            : ITerminalSettings;
  public  posDevice               = new BehaviorSubject<ITerminalSettings>(null);
  private _posDevice$             = new BehaviorSubject<ITerminalSettings>(null);

  private _transactionUISettings  = new BehaviorSubject<TransactionUISettings>(null);
  public  transactionUISettings$  = this._transactionUISettings.asObservable();

  private _homePageSetting         = new BehaviorSubject<UIHomePageSettings>(null);
  public  homePageSetting$        = this._homePageSetting.asObservable();
  private uihomePageSetting         : UIHomePageSettings

  private _DSIEMVSettings         = new BehaviorSubject<DSIEMVSettings>(null);
  public  dsiEMVSettings$        = this._DSIEMVSettings.asObservable();

  private _DSIEMVAndroidSettings         = new BehaviorSubject<DSIEMVAndroidSettings>(null);
  public  dsiEMVAndroidSettings$        = this._DSIEMVAndroidSettings.asObservable();

  private _StripeAPISettings         = new BehaviorSubject<StripeAPISettings>(null);
  public  stripeAPISettings$        = this._StripeAPISettings.asObservable();

  updateorderHeaderHeight(item: number, windowHeight: number) {
    this.windowHeight = windowHeight;
    this._orderHeaderHeight.next(item);
    this.orderHeaderHeight = item;
    this.calcOrderHeight();
  }

  updatecustomerOrderHeight(item: number, windowHeight: number) {
    this.windowHeight = windowHeight;
    this._customerOrderHeight.next(item);
    this.customerOrderHeight = item
    this.calcOrderHeight();
  }

  updateLimitOrderHeight(item: number, windowHeight: number)  {
    this.windowHeight = windowHeight;
    this._limitOrderHeight.next(item);
    this.limitOrderHeight = item;
    this.calcOrderHeight();
  }

  updatespecialOrderHeight(item: number, windowHeight: number)  {
    this.windowHeight = windowHeight;
    this._orderSpecialsHeight.next(item);
    this.specialOrderHeight = item;
    this.calcOrderHeight();
  }

  calcOrderHeight() {
    if (!this.customerOrderHeight) {
      this.customerOrderHeight = 0
    }
    if (!this.customerOrderHeight) {
      this.customerOrderHeight = 0
    }
    if (!this.specialOrderHeight) {
      this.specialOrderHeight = 0
    }
    if (!this.limitOrderHeight) {
      this.limitOrderHeight = 0
    }

    const totalHeight = this.orderHeaderHeight + this.customerOrderHeight +
                        this.specialOrderHeight + this.limitOrderHeight ;
    this._totalOrderHeightVal = +totalHeight.toFixed(0);
    this._totalOrderHeight.next(+totalHeight.toFixed(0));

    // console.log('windowHeight', this.windowHeight)
    if (this.windowHeight != 0) {
      const remainder = this.windowHeight - +totalHeight - 100
      this._remainingHeight.next(remainder)
    }
  }

  updateEmailModel(item: EmailModel) {
    this._emailModel.next(item);
    this.emailModel = item;
  }

  updateHomePageSetting(ui: UIHomePageSettings) {
    this._homePageSetting.next(ui);
    this.uihomePageSetting = ui;
  }

  updateUITransactionSubscription(ui: TransactionUISettings) {
    this._transactionUISettings.next(ui);
  }

  updateUISubscription(ui: TransactionUISettings) {
    this._transactionUISettings.next(ui);
  }

  updateStripeAPISettings(ui: StripeAPISettings) {
    this._StripeAPISettings.next(ui);
  }

  updateDSIEMVSettings(ui: DSIEMVSettings) {
    this._DSIEMVSettings.next(ui)
  }

  updateDSIEMVAndroidSettings(ui: DSIEMVAndroidSettings) {
    this._DSIEMVAndroidSettings.next(ui)
  }

  constructor(
      private _fb            : FormBuilder,
      private siteService    : SitesService,
      private matSnack       : MatSnackBar,
      private userAuthorizationService     : UserAuthorizationService,
      private dialog                : MatDialog,
      private platFormService   : PlatformService,
      private electronService: ElectronService,
      private settingsService: SettingsService) {
    this.initSecureSettings()
    this.getUIHomePageSettings();
  }

  initSecureSettings() {
    if (this.userAuthorizationService.currentUser()) {
      this.getTransactionUISettings();
      this.subscribeToStripedCachedConfig();
      this.getDSSIEmvSettings();
    }
  }

  getTransactionUISettings() {

    if (!this.userAuthorizationService.user) {
      return;
    }

    if (this.userAuthorizationService.user.username === 'Temp') {
      return;
    }

    this.settingsService.getUITransactionSetting().subscribe(data => {
      this._transactionUISettings.next(data)
    })
  }

  getUIHomePageSettings() {
    if (!this.userAuthorizationService.user) {  this._homePageSetting.next(null)  }
    this.settingsService.getUIHomePageSettings().subscribe(data => {
      this._homePageSetting.next(data)
    })
  }

  getEmailModel() {
    if (!this.userAuthorizationService.user) {  this._emailModel.next(null)  }
    this.settingsService.getEmailModel().subscribe(data => {
      this._emailModel.next(data)
    })
  }

  getPOSDeviceSettings() {
    return this.settingsService.getDeviceSettings()
  }

  updatePOSDevice(data: ITerminalSettings) {
    this.posDeviceInfo = data;
    this._posDevice$.next(data)
  }

  openEditPOSDevice(data): Observable<typeof dialogRef> {
    let dialogRef: any;
    dialogRef = this.dialog.open(PosEditSettingsComponent,
      { width:        '800px',
        minWidth:     '800px',
        height:       '650px',
        minHeight:    '650px',
        data   : data
      },
    )
    return dialogRef;
  }

  getDSSIEmvSettings() {
    if (!this.userAuthorizationService.user) {
      this._DSIEMVSettings.next(null)
      return;
    }
     if (!this.userAuthorizationService.user) { return }
     this.settingsService.getDSIEMVSettings().subscribe(data => {
      this._DSIEMVSettings.next(data)
    })
  }
  ////////////// subscribeToStripedCachedConfig
  subscribeToStripedCachedConfig()  {
    if (!this.userAuthorizationService.user) {
      return;
    }
    if (this.userAuthorizationService.user.username === 'Temp') {
      return;
    }

   this.settingsService.getStripeAPISetting().subscribe(data => {
      this.updateStripeAPISettings(data);
   });
  }

  get homePageSetting(): UIHomePageSettings {
    if (this.uihomePageSetting) { return  this.uihomePageSetting }
  }

  getSetting(name: string): Observable<ISetting> {
    const site = this.siteService.getAssignedSite();
    const user =  JSON.parse(localStorage.getItem('user')) as IUser
    if (user && user.username && user.token && (user.roles != '' && user.roles != 'user' )) {
      return this.settingsService.getSettingByName(site, name)
    }
    return this.settingsService.getSettingByNameNoRoles(site, name);
  }

  getDSIEMVSettings(name: string): Observable<DSIEMVSettings> {
    if (!this.userAuthorizationService.user) {
      this._DSIEMVSettings.next(null)
      return;
    }
    this.settingsService.getDSIEMVSettings().subscribe(data => {
      this.updateDSIEMVSettings(data);
   });
    return this.settingsService.getDSIEMVSettings()
  }

  saveConfig(fb: FormGroup, name: string): Observable<ISetting>  {
    const setting = fb.value;

    if (!setting || (!setting?.id || setting?.id === '')) {
      this.getSetting(name).pipe(
        switchMap(data => {
          console.log('setting', data)
          setting.id = data.id;
          return this.setSetting(setting, name)
      })).pipe(
        switchMap(data => {
        // console.log('returning Pipe', data)
        return this.setSetting(setting, name)
      }))
    }
    return this.setSetting(setting, name)
  }

  setSetting(uiSetting: any, name: string): Observable<ISetting> {
    const site    = this.siteService.getAssignedSite();
    const setting = {} as ISetting;
    console.log(uiSetting);

    if (!uiSetting || !uiSetting.id) { return null }
    setting.id    = uiSetting.id
    setting.name  = name
    setting.text  = JSON.stringify(uiSetting);

    if ( name == 'UITransactionSetting' ) {
      this.updateUISubscription(uiSetting)
    }
    if ( name == 'UIHomePageSettings' ) {
      this.updateHomePageSetting(uiSetting)
    }
    if ( name == 'DSIEMVSetting' ) {
      this.updateDSIEMVAndroidSettings(uiSetting)
    }
    if ( name == 'StripeAPISettings' ) {
      this.updateStripeAPISettings(uiSetting)
    }

    return this.settingsService.putSetting(site, setting.id, setting)
  }

  initHomePageForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id                    : [''],
      brandsEnabled         : [''],
      typesEnabled          : [''],
      categoriesEnabled     : [''],
      departmentsEnabled    : [''],
      tierMenuEnabled       : [''],
      itemsPerPage          : [''],
      menuItemSize          : [''],
      staffBrandsEnabled    : [''],
      staffCategoriesEnabled: [''],
      staffDepartmentsEnabled: [''],
      staffTierMenuEnabled  : [''],
      staffTypesEnabled     : [''],
      backgroundImage       : [''],
      logoHomePage          : [''],
      displayCompanyName    : [''],
      tinyLogo              : [''],
      wideOrderBar          : [''],
      sideToolbarDefaultBrand  : [''],
      sideToolbarEnableBrand   : [''],
      sideToolbarEnableType    : [''],
      sideToolbarEnableCategory: [''],
      sendGridOrderTemplate: [''],
      sendGridSalesReportTemplate : [''],
      sendGridBalanceSheetTemplate : [''],
      sendGridPasswordResetTemplate: [''],
      sendGridNotificationTemplate: [''],
      sendGridOrderReadyNotificationTemplate: [''],
      administratorEmail : [''],
      outGoingCustomerSupportEmail: [''],
      salesReportsEmail: [''],
      twilioEnabled: [''],
      smtpEmailEnabled: [''],
      threecxChatLink: [''],
      threeParty: [''],
      menuEnabled: [''],
      staffMenuEnabled: [''],
     })
    return fb
  }

  initDSIEMVForm(fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id        : [''],
      hostOrIP  : [''],
      ipPort    : [''],
      merchantID: [''],
      terminalID: [''],
      operatorID: [''],
      userTrace : [''],
      tranCode  : [''],
      secureDevice: [''],
      comPort   : [''],
      pinPadIpAddress: [''],
      pinPadIpPort:[''],
      sequenceNo:  [''],
      displayTextHandle: [''],
      enabled:     [''],
    })
    return fb
  }

  initStripeAPISettingsForm(config: any, fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id               : [''],
      apiSecret        : [''],
      apiKey           : [''],
      enabled          : [''],
      paymentAgreement : [''],
    })
    if (!config) { return fb}
    fb.patchValue(config)
    return fb
  }

  initEmailModel(config: any, fb: FormGroup): FormGroup {
    fb = this._fb.group({
      id     : [''],
      name     : [''],
      email     : [''],
      password     : [''],
      smtpSender_SMPTHOST     : [''],
      mailGunSender_Enabled     : [''],
      mailGunSender_Domain     : [''],
      mailGunSender_APIKey     : [''],
      sendGridSender_Enabled     : [''],
      sendGridSender_APIKey     : [''],
      mailkitSender_Enabled    : [''],
      mailKitSender_Server     : [''],
      mailKitSender_Port     : [''],
      mailKitSender_UseSSL     : [''],
      mailKitSender_User     : [''],
      endOfDayAddresses    : [''],
      alertAddresses    : [''],
    })
    if (!config) { return fb}
    fb.patchValue(config)
    return fb
  }

  initDSIEMVSettingsForm(config: any, fb: FormGroup): FormGroup {
    if (!config) { return this.initDSIEMVForm(fb)};
    fb = this._fb.group({
      id               : [config.id],
      HostOrIP         : [config.DisplayTextHandle],
      IpPort           : [config.IpPort],
      MerchantID       : [config.MerchantID],
      TerminalID       : [config.TerminalID],
      OperatorID       : [config.OperatorID],
      UserTrace        : [config.UserTrace],
      TranCode         : [config.TranCode],
      SecureDevice     : [config.SecureDevice],
      ComPort          : [config.ComPort],
      PinPadIpAddress  : [config.PinPadIpAddress],
      PinPadIpPort     : [config.PinPadIpPort],
      SequenceNo       : [config.SequenceNo],
      DisplayTextHandle: [config.DisplayTextHandle]
    })
    return fb
  }

  initHomePageSettingsForm(config: any, fb: FormGroup): FormGroup {
    if (!config) { return this.initHomePageForm(fb) }
    fb = this.initHomePageForm(fb);
    console.log('init Home Page', config)
    fb.patchValue(config);
    return fb
  }

  initForm(fb: FormGroup): FormGroup {
    return this._fb.group({
      id                     : [],
      displayNotes           : [],
      displayView            : [],
      displayAdd             : [],
      displayQuantity        : [],
      lockOrders             : [],
      deleteUnClosedPrintedOrders: [],
      closeOrderTimeCutOff   : [],
      ordersRequireCustomer  : [],
      validateCustomerLicenseID: [],
      defaultClientTypeID    : [],
      enablMEDClients        : [],
      enableLimitsView       : [],
      splitCheckByItem       : [],
      prefixBarcodeLabel     : [],
      mAXOrdersOpen          : [],
      loyaltyPointSystemValue: [],
      lotPreBarCode          : [],
      creditRecieptMinimum   : [],
      buyerAmountDiscount    : [],
      idleTime               : [],
      highTipInputPercentage : [],
      onlyAllowInventory     : [],
      showOrderName          : [],
      recmedPricing          : [],
      applyTaxChangesToDiscountedItems : [],
      fuzzyMatchBarcodeLookup: [''],
      requireEnterTabBarcodeLookup: [''],
      cardPointRequestTip    : [''],
      cardPointPreAuth       : [''],
      cardPointBoltEnabled   : [''],
      cardPointAndroidEnabled: [''],
      dsiEMVAndroidEnabled   : [''],
      dsiEMVNeteEpayEnabled  : [''],
      dsiEMVIP               : [''],

     })
  }

  initUITransactionsForm(config: TransactionUISettings, fb: FormGroup): FormGroup {
    fb = this.initForm(fb);
    fb.patchValue(config)
    return fb
  }

  setFormValue(      inputForm: FormGroup,
                     setting: ISetting,
                     name: string): Observable<ISetting> {
    inputForm = this.initForm(inputForm);
    return  this.initConfig(setting, name)
  }

  initForms_Sub(inputForm: FormGroup, name: string, config: any): FormGroup {
    if (name == 'UITransactionSetting') {
      return this.initUITransactionsForm(config, inputForm);
    }

    if (name == 'UIHomePageSettings') {
      return this.initHomePageSettingsForm(config, inputForm);
    }

    if (name == 'DSIEMVSettings') {
      return this.initDSIEMVSettingsForm(config, inputForm);
    }

    if (name == 'StripeAPISettings') {
      return this.initStripeAPISettingsForm(config, inputForm);
    }

    if (name == 'EmailModel') {
      return this.initStripeAPISettingsForm(config, inputForm);
    }
  }

  initConfig(setting: ISetting, name: string): Observable<ISetting> {
    const ui = {} as TransactionUISettings

    if (!setting || setting.id) {
      const site    = this.siteService.getAssignedSite();
      return this.settingsService.getSettingByNameNoRoles(site, name).pipe()
    };

    ui.id = setting.id
    return this.setSetting(ui, name)
  }

  updateUIJSONSetting(name: string, settingText: string) {
    const config = JSON.parse(settingText) // as TransactionUISettings
    if (name == 'UITransactionSetting') {
      this.updateUISubscription(config)
    }
    if (name == 'UIHomePageSettings') {
      this.updateHomePageSetting(config)
    }
    if (name == 'DSIEMVSettings') {
      this.updateDSIEMVSettings(config)
    }
    if (name == 'StripeAPISettings') {
      this.updateStripeAPISettings(config)
    }
  }

   electronZoom(value) {
    // console.log('Zoom Occured')
    if (this.platFormService.isAppElectron) {
      const electron = this.electronService.remote.require('./index.js');
      if (!electron) {
        // console.log('electron is undefined')
      }
      electron.electronZoomControl(value)
    }
  }

  notify(message: string, title: string) {
    this.matSnack.open(message, title, {duration: 1000})
  }
}

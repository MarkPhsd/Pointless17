import { Injectable} from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { BehaviorSubject, Observable, of, switchMap } from 'rxjs';
import { ISetting, ISite, IUser } from 'src/app/_interfaces';
import { SitesService } from '../../reporting/sites.service';
import { EmailModel } from '../../twilio/send-grid.service';
import { SettingsService } from '../settings.service';
import { UserAuthorizationService } from '../user-authorization.service';
import { ITerminalSettings } from 'src/app/_services/system/settings.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { PosEditSettingsComponent } from 'src/app/modules/admin/settings/pos-list/pos-edit-settings/pos-edit-settings.component';
// import { ElectronService } from 'ngx-electron';
// import { ElectronService } from 'ngx-electronyzer';
import { PlatformService } from '../platform.service';
import { UserPreferencesComponent } from 'src/app/modules/admin/clients/user-preferences/user-preferences.component';
import { TtsService } from '../tts-service.service';

export interface ContactFieldOptions {
  id: number;
  exp: boolean;
  account: boolean;
}

export interface ProcessorInfo {
  batchTypeSetting: number; // 0 is auto, 1 is user, 2 is user auto
  batchTypeEcomSetting: number; // 0 is auto, 1 is user, 2 is user auto
  emvSupport: number;
  cardHolderVerification: number;
  localBatchReport: number;
  localDuplicateChecking: number;
  storeAndForward: number;
  contactlessSupport: number;
  emvContactlessCvmLimit: number;
  chinaUnionPaySupport: number;
  customNotes: string;
}

export interface TransactionUISettings {

  voiceServiceName: string;
  binaryStoreValue        : any;
  multiButtonKPrepHeader  : number;
  multiButtonPrepHeader  : number;
  autoSelectItemPOSearch: boolean;
  billOnHold: boolean;
  paxA920AutoOpenCart: boolean;
  rewardsEnabled         : any;
  id                     : number;
  displayNotes           : boolean;
  displayView            : boolean;
  displayAdd             : boolean;
  displayQuantity        : boolean;
  lockOrders             : boolean;
  disableTipGratutity: boolean;
  disableRequestOptions: boolean;
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
  dCapEnabled            : boolean;
  dCapSurcharge          : boolean;
  dCapSurchargeValue     : string;
  dcapMultiPrice         : boolean
  dcapDualPriceValue     : number;
  disableTipEntry: boolean;
  dsiTipPrompt           : boolean;
  dsiTipPromptValues     : string;
  dcapSurchargeOption    : number;
  dcapPayAPIEnabled         : boolean;
  dcapPayAPIPreAuth         : boolean;
  dcapPayAPIZeroAuth        : boolean;
  dcapPayAPITokenAuth       : boolean;
  dcapPayAPIRecurringAuth   : boolean;
  dCapPayAPISurcharge          : boolean;
  dCapPayAPISurchargeValue     : number;
  dcapPayAPIMultiPrice         : boolean
  dcapPayAPIDualPriceValue     : number;
  dcapDisableDualPayOptions : boolean;
  dCapDualPayEnableDebit: boolean;
  dCapAllowCreditOnlyOption: boolean;

  diableDescrepencies    : boolean;
  disableCreditFilter    : boolean;
  allowPreAuth           : boolean;
  payPalEnabled          : boolean;
  payPalClientID         : string;
  payPalCurrency         : string;
  creditCardFee          : string;
  updateInventoryOnScan  : boolean;
  giftCardLength         : number;
  vipCustomerID          : number;
  enableGiftCards        : boolean;
  triposEnabled          : boolean;
  displayEditCardOnHeader: boolean;
  showCustomerOption: boolean;
  splitEntry: boolean;
  idParseOnlyAgeConfirmation: boolean;
  assignBarcodeAsSerial: boolean;
  minClientAge: number;
  storeCreditAPI: string;
  contactAPI: string;
  startNewOrderOnCloseOrder: boolean;
  prepOrderOnClose: boolean;
  disablePrintPrepOnPrint: boolean;
  printLabelsOnclose: boolean;
  enableExactChange: boolean;
  preventDuplicateBarcodes: boolean;
  scanIncreaseQuantity: boolean;
  mixMatchTierPricing: boolean;
  toggleUserOrAllOrders: boolean;
  defaultOrderTypeID: number;
  defaultNewOrderCategoryID: number;
  weightGraceValue: number;
  remove100thDecimalForPrice: boolean;
  disableBarcodScanning: boolean;
  displayItemPOSTTotal: boolean;
  expoPrinter: string;
  expoTemplateID: number;
  applyTableNameToOrderName: boolean;
  showNumberPad: boolean;
  enableTransactionTypeChoice: boolean;
  autoPrintReceiptOnClose: boolean;
  disableMenuItemExpandInApp: boolean;
  enableRounding: boolean;
  autoNotifyOnItemCompletion: boolean;
  singlePrintReceipt: boolean;
  prepOrderOnExit: boolean;
  exitOrderOnPrintReceipt: boolean;
  preferredMargin: number;
  enableItemReOrder: boolean;
  disableNonCrediTip: boolean;
  resaleCostRatio: number;
  rewardPointValue: number;
  enableOnScreenKeyboard : boolean;
  employeeClockNotifier  : number;
  printServerDevice      : string;
  multiButtonOrderHeader : number;
  multiButtonOrderMain   : number;
  multiButtonOrderPayment: number;
  multiButtonOrderService: number;
  enableQuickMenu: boolean;
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
  HostOrIP  : string;
  IpPort    : string;
  MerchantID: string;
  TerminalID: string;
  OperatorID: string;
  POSPackageID: string;
  TranDeviceID: string;
  UserTrace : string;
  TranCode  : string;
  SecureDevice: string;
  ComPort   : string;
  pinPadIpAddress: string;
  PinPadIpPort: string;
  SequenceNo: string;
  DisplayTextHandle: string;
  enabled: boolean;
  partialAuth: boolean;
  deviceValue: string;
  supressedForms: boolean;
  promptConfirmAmount: boolean;
  timerBringToFront: number;
  v2: boolean;
  sendToBack: boolean;
  checkPartialAuth: number;
  checkPartialAuthCompleted: number;
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

  //move to it's own interface one day
  catalogColumnsEnableUOM: boolean;

  ipInfoToken: string;
  binaryStoreValue: any;
  mobileEnabled: boolean;
  pinPadDefaultOnApp: boolean;
  lockTerminalToBalanceSheet: boolean;
  gloabalSecondLanguage: boolean;
  id                : number;
  employeeOnClockList: boolean;
  autoClockEmployeeOnLogin: boolean;
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
  suppressMenuItems: boolean;
  scheduleSubMenu: boolean;
  staffscheduleSubMenu: boolean;
  enableInventoryPerItem: boolean;
  sendGridOrderTemplate: string;
  sendGridSalesReportTemplate : string;
  sendGridBalanceSheetTemplate : string;
  sendGridPasswordResetTemplate : string;
  sendGridNotificationTemplate: string;
  sendGridOrderReadyNotificationTemplate: string;
  ebayEnabled        : boolean;
  administratorEmail : string;
  outGoingCustomerSupportEmail: string;
  salesReportsEmail  : string;
  twilioEnabled      : string;
  smtpEmailEnabled   : string;

  threecxChatLink    : string;
  threeParty         : string;

  wordpressHeadless: string;
  displaySendButton: boolean;

  staffHideSearchBar: boolean;
  hideSearchBar: boolean;
  timeOutValue: number
  timeOut: boolean;

  storeNavigation: boolean;
  suppressItemsInStoreNavigation: boolean;

  colorFilter: boolean;
  sizeFilter: boolean;
  speciesFilter: boolean;
  gluetenFilter: boolean;
  brandFilter: boolean;
  itemTypeFilter: boolean;
  departmentFilter: boolean;
  categoryFilter: boolean;
  subCategoryFilter: boolean;
  disableSearchFeaturesInItemsList: boolean;
  accordionMenu: boolean;
  accordionMenuSideBar: boolean;
  staffAccordionMenuSideBar: boolean;

  minQuantityFilter: number;
  enableRecentAssociatedItems: boolean;
  enableSimliarItems: boolean;
  enableShippingInfo: boolean;
  resaleMenu: boolean;
  disableSearchFieldInMenu: boolean;
  catalogScheduleMenuEnabled: boolean;
  staffcatalogScheduleMenuEnabled: boolean;

  condensedMenuButtons: boolean;
}

@Injectable({
  providedIn: 'root'
})

export class UISettingsService {

  dcapSurchargeOptionList = [{name: 'None', value: 0, id: 0} , {name: 'Total', value: 1, id: 1} , {name: 'Subt Total', value: 2, id: 2 }, {name: 'Sub Plus Total', value: 3, id: 3} ]

  pricingRecMed = [
    {id: 0, name: 'Both'}, {id: 1, name: 'Rec'}, {id: 2, name: 'Med'}
  ]

  private _toggleKeyboard          = new BehaviorSubject<boolean>(null);
  public  toggleKeyboard$          = this._toggleKeyboard.asObservable();
  //section cacluates the order panel so that all items are properly displayed and scrollable.
  private _totalOrderHeightVal   : number;

  private toggleKeyboard: boolean
  private _totalOrderHeight          = new BehaviorSubject<number>(null);
  public  totalOrderHeight$          = this._totalOrderHeight.asObservable();

  private  _remainingHeight          = new BehaviorSubject<number>(null);
  public  remainingHeight$          = this._remainingHeight.asObservable();
  private windowHeight: number;

  private orderHeaderHeight   :number;
  private customerOrderHeight :number;
  private specialOrderHeight  :number;
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
  public  _posDevice              = new BehaviorSubject<ITerminalSettings>(null);
  public  posDevice$               = this._posDevice.asObservable();

  public _transactionUISettings  = new BehaviorSubject<TransactionUISettings>(null);
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

  private _relativeValue         = new BehaviorSubject<unknown>(null);
  public  relativeValue$        = this._relativeValue.asObservable();


  get theme() {
    // if (this.toggleTheme === 'dark-theme' ) {
    //   localStorage.setItem('angularTheme', 'light-theme')
    // } else {
    //  const theme = localStorage.getItem('angularTheme')
    // }
    const theme = localStorage.getItem('angularTheme');
    if (theme == 'dark-theme') {
      return 'dark'
    }
    if (theme == 'light-theme') {
      return 'light'
    }
    return 'light'
  }

  updateRelativeValue(value: unknown) {
    this._relativeValue.next(value)
  }
  updateToggleKeyboard()  {
    this.toggleKeyboard = !this.toggleKeyboard
    this._toggleKeyboard.next(this.toggleKeyboard)
  }

  updateSetKeyboard(value: boolean)  {
    this.toggleKeyboard = value
    this._toggleKeyboard.next(value)
  }

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

  updateUISubscription(ui: TransactionUISettings) {
    this.ttsService.setDefaultVoice(ui?.voiceServiceName)
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
      private _fb            : UntypedFormBuilder,
      private siteService    : SitesService,
      private matSnack       : MatSnackBar,
      private userAuthorizationService     : UserAuthorizationService,
      private dialog                : MatDialog,
      private platFormService   : PlatformService,
      // private electronService: ElectronService,
      private ttsService: TtsService,
      private settingsService: SettingsService) {
    this.initSecureSettings()
    this.getUIHomePageSettings();
  }

  initSecureSettings(user?: IUser) {
    if (!user) {
      const item = this.userAuthorizationService.currentUser();
      if (!item) {return}
      this.getTransactionUISettings();
    }
    this.subscribeToStripedCachedConfig();
    this.getDSSIEmvSettings();
  }

  getTransactionUISettings() {
    if (!this.userAuthorizationService.user) {
      return;
    }
    if (this.userAuthorizationService?.user?.username === 'Temp') {
      return;
    }
    const item = this.userAuthorizationService.currentUser()
    this.settingsService.getUITransactionSetting().subscribe(data => {
      this._transactionUISettings.next(data)
    })
  }

  getUITransactionSetting() {
    return this.settingsService.getUITransactionSetting()
  }

  getUIHomePageSettings() {
    if (!this.userAuthorizationService.user) {  this._homePageSetting.next(null)  }
    this.settingsService.getUIHomePageSettings().subscribe(data => {
      this._homePageSetting.next(data)
    })
    return this._homePageSetting.value;
  }

  get UIHomePageSettings() {
    return this.settingsService.getUIHomePageSettings()
  }

  getEmailModel() {
    if (!this.userAuthorizationService.user) {  this._emailModel.next(null)  }
    this.settingsService.getEmailModel().subscribe(data => {
      this._emailModel.next(data)
    })
  }

  getPOSDeviceSettings(deviceName: string) {
    const site = this.siteService.getAssignedSite()
    return this.settingsService.getSettingByNameCachedNoRoles(site, deviceName)
  }

  getPOSDevice(deviceName: string, noCache?: boolean) {
    let setting$ =this.getPOSDeviceSettings(deviceName);
    if (noCache) {
      const site = this.siteService.getAssignedSite()
      setting$ = this.settingsService.getSettingByName(site, deviceName)
    }

    return setting$.pipe(
      switchMap(data => {
        if (data && data?.text) {
          try {
            const posDevice = JSON.parse(data?.text) as ITerminalSettings;
            return of(posDevice)
          } catch (error) {

          }
        }
        return of(null)
      }));
  }



  updatePOSDevice(data: ITerminalSettings) {
    this.posDeviceInfo = data;
    this._posDevice.next(data)
  }

  openEditPOSDevice(data): any {
    let dialogRef: any;
    // console.log('open device')
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

  openUserPreferences(): any {
    let dialogRef: any;
    // console.log('open device')
    dialogRef = this.dialog.open(UserPreferencesComponent,
      { width:        '800px',
        minWidth:     '800px',
        height:       '650px',
        minHeight:    '650px',
      },
    )
    return dialogRef;
  }


  getDSSIEmvSettings() {
    if (!this.userAuthorizationService.user) { return }
    if (!this.platFormService.isAppElectron) { return }

    if (!this.userAuthorizationService.user) {
      this._DSIEMVSettings.next(null)
      return;
    }

     this.settingsService.getDSIEMVSettings().subscribe(data => {
      if (!data) { return }
      this._DSIEMVSettings.next(data)
    })
  }
  ////////////// subscribeToStripedCachedConfig
  subscribeToStripedCachedConfig()  {
    if (!this.userAuthorizationService.user) {
      return;
    }
    if (this.userAuthorizationService?.user?.username === 'Temp') {
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

  saveConfig(fb: UntypedFormGroup, name: string): Observable<ISetting>  {
    const setting = fb.value;
    if (!setting || (!setting?.id || setting?.id === '')) {
      this.getSetting(name).pipe(
        switchMap(data => {
          // console.log('setting', data)
          setting.id = data.id;
          return this.setSetting(setting, name)
      }))
      // .pipe(
      //   switchMap(data => {
      //     console.log('returning Pipe', data)
      //     return this.setSetting(setting, name)
      // }))
    }
    return this.setSetting(setting, name)
  }

  setSetting(uiSetting: any, name: string): Observable<ISetting> {
    const site    = this.siteService.getAssignedSite();
    const setting = {} as ISetting;
    // console.log(uiSetting);

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

  initHomePageForm(fb: UntypedFormGroup): UntypedFormGroup {
    fb = this._fb.group({
      id                    : [''],
      autoClockEmployeeOnLogin: [],
      employeeOnClockList: [],
      gloabalSecondLanguage: [],
      pinPadDefaultOnApp    : [],
      lockTerminalToBalanceSheet: [],
      brandsEnabled         : [''],
      typesEnabled          : [''],
      categoriesEnabled     : [''],
      departmentsEnabled    : [''],
      tierMenuEnabled       : [''],
      itemsPerPage          : [''],
      condensedMenuButtons  : [''],
      menuItemSize          : [''],
      staffBrandsEnabled    : [''],
      staffCategoriesEnabled: [''],
      staffDepartmentsEnabled: [''],
      staffTierMenuEnabled  : [''],
      staffTypesEnabled     : [''],
      backgroundImage       : [''],
      logoHomePage          : [''],
      staffHideSearchBar    : [''],
      hideSearchBar         : [''],
      scheduleSubMenu       : [],
      staffscheduleSubMenu  : [],
      ebayEnabled: [],
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
      wordpressHeadless: [],
      timeOut: [],
      timeOutValue: [],
      displaySendButton: [],
      suppressMenuItems: [],
      storeNavigation: [], //
      disableSearchFieldInMenu: [], //
      suppressItemsInStoreNavigation: [], //
      disableSearchFeaturesInItemsList: [], //

      accordionMenu: [],
      itemTypeFilter: [], //: boolean;
      departmentFilter: [], //: boolean;
      categoryFilter: [], //: boolean;
      subCategoryFilter: [], //: boolean;
      brandFilter: [], //: boolean;
      colorFilter: [], //: boolean;
      sizeFilter: [], //: boolean;
      speciesFilter: [], //: boolean;
      gluetenFilter: [], //: boolean;

      accordionMenuSideBar: [],
      staffAccordionMenuSideBar: [],
      minQuantityFilter: [],
      enableInventoryPerItem: [],
      enableRecentAssociatedItems: [],
      enableSimliarItems : [],
      enableShippingInfo: [],
      resaleMenu: [],
      staffcatalogScheduleMenuEnabled: [],
      catalogScheduleMenuEnabled: [],
      binaryStoreValue: [],
      catalogColumnsEnableUOM: [],
      ipInfoToken:[],
     })
    return fb
  }





  initEmailModel(config: any, fb: UntypedFormGroup): UntypedFormGroup {
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

  initDSIEMVSettingsForm(config: any, fb: UntypedFormGroup): UntypedFormGroup {
    if (!config) { return this.initDSIEMVForm(fb)};
    fb = this._fb.group({
      id               : [config?.id],
      HostOrIP         : [config?.DisplayTextHandle],
      IpPort           : [config?.IpPort],
      MerchantID       : [config?.MerchantID],
      TerminalID       : [config?.TerminalID],
      OperatorID       : [config?.OperatorID],
      UserTrace        : [config?.UserTrace],
      TranCode         : [config?.TranCode],
      SecureDevice     : [config?.SecureDevice],
      ComPort          : [config?.ComPort],
      PinPadIpAddress  : [config?.PinPadIpAddress],
      PinPadIpPort     : [config?.PinPadIpPort],
      SequenceNo       : [config?.SequenceNo],
      DisplayTextHandle: [config?.DisplayTextHandle],
      partialAuth      : [config?.partialAuth],
      v2               : [config?.v2]
    })
    return fb
  }


  initDSIEMVForm(fb: UntypedFormGroup): UntypedFormGroup {
    fb = this._fb.group({
      id        : [''],
      MerchantID: [''],
      TerminalID: [''],
      OperatorID: [''],
      IpPort    : [''],
      UserTrace : ['PointlessPOS'],
      TranCode  : [''],
      SecureDevice: [''],
      ComPort   : [''],
      PinPadIpAddress: [''],
      PinPadIpPort:[''],
      HostOrIP  : [''],
      SequenceNo:  ['0010010010'],
      DisplayTextHandle: [''],
      enabled:     [''],
      partialAuth: [],
      supressedForms: [],
      promptConfirmAmount: [],
      v2: [],
    })
    return fb
  }

  initHomePageSettingsForm(config: any, fb: UntypedFormGroup): UntypedFormGroup {
    if (!config) { return this.initHomePageForm(fb) }
    fb = this.initHomePageForm(fb);
    // console.log('init Home Page', config)
    fb.patchValue(config);
    return fb
  }

  initProcessorForm() {
      ///credit settings
      return this._fb.group({
      processor_batchTypeSetting :[] , //0 is auto, 1 is user, 2, is user auto
      processor_batchTypeEcomSetting :[] , //0 is auto, 1 is user, 2, is user auto
      processor_EMVSupport: [],
      processor_CardHolderVerification: [],
      processor_LocalBatchReport: [],
      processor_LocalDuplicateChecking: [],
      processor_StoreAndForward: [],
      processor_ContactlessSupport: [],
      processor_EMVContactlessCVMLimit: [],
      processor_ChinaUnionPaySupport: [],
      })
  }

  initForm(fb: UntypedFormGroup): UntypedFormGroup {
    return this._fb.group({
      voiceServiceName: [],
      multiButtonKPrepHeader  : [],
      multiButtonPrepHeader   : [],
      autoSelectItemPOSearch : [],
      billOnHold : [],
      paxA920AutoOpenCart : [],
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
      disableDiscrepancy     : [],
      disableCreditFilter    : [],
      enablMEDClients        : [],
      enableLimitsView       : [],
      splitCheckByItem       : [],
      prefixBarcodeLabel     : [],
      mAXOrdersOpen          : [],
      loyaltyPointSystemValue: [],
      lotPreBarCode          : [],
      creditRecieptMinimum   : [],
      buyerAmountDiscount    : [],
      giftCardLength         : [],
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
      disableTipGratutity:  [],
      dsiEMVAndroidEnabled   : [''],
      dsiEMVNeteEpayEnabled  : [''],
      dsiEMVIP               : [''],
      dcapDisableDualPayOptions: [],
      dCapDualPayEnableDebit : [],
      dsiTipPrompt           : [''],
      dCapEnabled            : [],
      dCapSurcharge          : [],
      dCapAllowCreditOnlyOption: [],
      dCapSurchargeValue     : [],
      dcapMultiPrice         : [],
      dcapDualPriceValue     : [],
      dcapSurchargeOption    : [],
      dcapDisableOkayAmount:[],
      disableRequestOptions: [],
      enableQuickMenu         : [],
      payPalEnabled          : [ ],
      payPalClientID         : [''],
      payPalCurrency         : [ ],
      creditCardFee          : [ ],
      updateInventoryOnScan: [ ],
      triposEnabled:          [],
      displayEditCardOnHeader: [],
      showCustomerOption: [],
      splitEntry: [],
      idParseOnlyAgeConfirmation: [],

      assignBarcodeAsSerial: [],
      minClientAge:  [],
      storeCreditAPI: [],
      contactAPI:  [],
      startNewOrderOnCloseOrder: [],
      prepOrderOnClose: [],
      printLabelsOnclose: [],
      enableExactChange: [],
      enableGiftCards: [],
      preventDuplicateBarcodes: [],
      scanIncreaseQuantity: [],
      mixMatchTierPricing: [],
      toggleUserOrAllOrders: [],
      defaultOrderTypeID: [],
      defaultNewOrderCategoryID: [],
      weightGraceValue: [],
      remove100thDecimalForPrice: [],
      disableBarcodScanning: [],
      displayItemPOSTTotal:[],
      expoPrinter: [],
      expoTemplateID:[],
      applyTableNameToOrderName: [],
      showNumberPad: [],
      enableTransactionTypeChoice: [],
      autoPrintReceiptOnClose: [],
      disableMenuItemExpandInApp: [],
      enableRounding: [],
      autoNotifyOnItemCompletion: [],
      singlePrintReceipt: [],
      prepOrderOnExit: [],
      preferredMargin: [],
      disablePrintPrepOnPrint: [],
      exitOrderOnPrintReceipt: [],
      enableItemReOrder: [],
      resaleCostRatio: [],
      rewardPointValue: [],
      enableOnScreenKeyboard:[],
      employeeClockNotifier: [],
      dsiTipPromptValues: [],
      allowPreAuth: [],
      printServerDevice: [],
      multiButtonOrderHeader: [],
      disableNonCrediTip: [],
      dcapPayAPIEnabled         : [],
      dcapPayAPIPreAuth         : [],
      dcapPayAPIZeroAuth        : [],
      dcapPayAPITokenAuth       : [],
      dcapPayAPIRecurringAuth   : [],
      dCapPayAPISurcharge          : [],
      dCapPayAPISurchargeValue     : [],
      dcapPayAPIMultiPrice         : [],
      dcapPayAPIDualPriceValue     : [],

      // disableMenuItemExpandInApp : [],
      enableRetailQuickMenu : [],
      // expoTemplateID  : [],

      // expoTemplateID: [''],
      // disableMenuItemExpandInApp: [''],
      // disableRequestOptions: [''],
      // disableNonCrediTip: [''],
     })
  }

  initUITransactionsForm(config: TransactionUISettings, fb: UntypedFormGroup): UntypedFormGroup {
    fb = this.initForm(fb);
    fb.patchValue(config)
    return fb
  }

  setFormValue(      inputForm: UntypedFormGroup,
                     setting: ISetting,
                     name: string): Observable<ISetting> {
    inputForm = this.initForm(inputForm);
    return  this.initConfig(setting, name)
  }

  initForms_Sub(inputForm: UntypedFormGroup, name: string, config: any): UntypedFormGroup {
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
      // return this.initStripeAPISettingsForm(config, inputForm);
    }

    if (name == 'EmailModel') {
      // return this.initStripeAPISettingsForm(config, inputForm);
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

  //  electronZoom(value) {
  //   // console.log('Zoom Occured')
  //   if (this.platFormService.isAppElectron) {
  //     const electron = this.electronService.remote.require('./index.js');
  //     if (!electron) {
  //       // console.log('electron is undefined')
  //     }
  //     console.log('value', value)
  //     electron.electronZoomControl(value)
  //   }
  // }
  electronZoom(value: number): void {
    (window as any).electron.setZoom(value);
  }

  notify(message: string, title: string) {
    this.matSnack.open(message, title, {duration: 1000})
  }
}

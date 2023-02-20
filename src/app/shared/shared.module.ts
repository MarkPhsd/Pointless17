import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './widgets/filter/filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';
import { AppMaterialModule } from '../app-material.module';
import { RouterModule } from '@angular/router';
import { AreaComponent } from '../modules/admin/reports/area/area.component';
import { HighchartsChartModule } from 'highcharts-angular';
import { ChartTableComponent } from '../modules/admin/reports/chart-table/chart-table.component';
import { HeaderComponent} from './components/header/header.component';
import { FooterComponent} from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { DashboardComponent } from '../modules/admin/reports/dashboard/dashboard.component';
import { CardComponent } from '../modules/admin/reports/card/card.component';
import { PieComponent } from '../modules/admin/reports/pie/pie.component';
import { SummarycardComponent } from '../modules/admin/reports/summarycard/summarycard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ProgressUploaderComponent } from './widgets/progress-uploader/progress-uploader.component';
import { FormSelectListComponent } from './widgets/formSelectList/form-select-list.component';
import { PageNotFoundComponent } from './widgets/page-not-found/page-not-found.component';
import { SalesTaxReportComponent } from 'src/app/modules/admin/reports/sales-tax-report/sales-tax-report.component';
import { PagerBlobComponent } from './widgets/pager-blob/pager-blob.component';
import { SiteSelectorComponent } from './widgets/site-selector/site-selector.component';
import { HammerCardComponent } from './widgets/hammer-card/hammer-card.component';
import { TiersCardComponent } from '../modules/tv-menu/tv-price-specials/tiers-card/tiers-card.component';
import { FacilitySearchSelectorComponent } from 'src/app/shared/widgets/facility-search-selector/facility-search-selector.component';
import { ProductSearchSelectorComponent } from 'src/app/shared/widgets/product-search-selector/product-search-selector.component';
import { ListProductSearchInputComponent } from './widgets/search-list-selectors/list-product-search-input/list-product-search-input.component';
import { MoveInventoryLocationComponent } from 'src/app/modules/admin/inventory/move-inventory-location/move-inventory-location.component';
import { AdjustmentReasonsComponent } from './widgets/adjustment-reasons/adjustment-reasons.component';
import { InventoryAdjustmentNoteComponent } from './widgets/adjustment-notes/adjustment-note/adjustment-note.component';
import { CategoryScrollComponent } from './widgets/test/category-scroll/category-scroll.component';
import { Label1by8Component } from '../modules/admin/settings/printing/label1by8/label1by8.component';
import { ChemicalValuesComponent } from '../modules/admin/products/productedit/_product-edit-parts/chemical-values/chemical-values.component';
import { SpeciesListComponent } from '../modules/admin/products/productedit/_product-edit-parts/species-list/species-list.component';
import { CategorySelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/category-select/category-select.component';
import { DepartmentSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/department-select/department-select.component';
import { GenericIdSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/generic-id-select/generic-id-select.component';
import { GenericNameSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/generic-name-select/generic-name-select.component';
import { TaxFieldsComponent } from '../modules/admin/products/productedit/_product-edit-parts/tax-fields/tax-fields.component';
import { WebEnabledComponent } from '../modules/admin/products/productedit/_product-edit-parts/web-enabled/web-enabled.component';
import { ItemTypeSortComponent } from '../modules/admin/products/item-type/item-type-sort/item-type-sort.component';
import { MenuMinimalComponent } from './widgets/menus/menu-minimal/menu-minimal.component';
import { AccordionComponent } from './widgets/menus/accordion/accordion.component';
import { MetaTagChipsComponent } from '../modules/admin/products/productedit/_product-edit-parts/meta-tag-chips/meta-tag-chips.component';
import { MenuCompactComponent } from './widgets/menus/menu-compact/menu-compact.component';
import { IonicGeoLocationComponent } from './widgets/ionic-geo-location/ionic-geo-location.component';
import { BtPOSPrinterComponent } from '../modules/admin/settings/printing/bt-posprinter/bt-posprinter.component';
import { PriceCategorySelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/price-category-select/price-category-select.component';
import { MenuTinyComponent } from './widgets/menus/menu-tiny/menu-tiny.component';
import { ProductTypeSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/product-type-select/product-type-select.component';
import { EditButtonsStandardComponent } from './widgets/edit-buttons-standard/edit-buttons-standard.component';
import { ClientTypesLookupComponent } from '../modules/admin/profiles/parts/client-types-lookup/client-types-lookup.component';
import { StatusLookupComponent } from '../modules/admin/profiles/parts/status-lookup/status-lookup.component';
import { UnitTypeFieldsComponent } from '../modules/admin/products/productedit/_product-edit-parts/unit-type-fields/unit-type-fields.component';
import { ValueFieldsComponent } from '../modules/admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { CartButtonComponent } from './widgets/cart-button/cart-button.component';
import { PriceCategorySearchComponent } from '../modules/admin/products/productedit/_product-edit-parts/price-category-search/price-category-search.component';
import { MenuSearchBarComponent } from './components/menu-search-bar/menu-search-bar.component';
import { MatSpinnerOverlayComponent } from './widgets/mat-spinner-overlay/mat-spinner-overlay.component';
import { ChemicalSpinnersComponent } from '../modules/menu/menuitem/menuItemParts/chemical-spinners/chemical-spinners.component';
import { MenuItemGalleryComponent } from '../modules/menu/menuitem/menuItemParts/menu-item-gallery/menu-item-gallery.component';
import { GalleryModule, GALLERY_CONFIG } from '@ngx-gallery/core';
import { ValueSpinnerComponent } from './widgets/value-spinner/value-spinner.component';
import { ChipsDisplayComponent } from './widgets/chips-display/chips-display.component';
import { MatToggleSelectorComponent } from './widgets/mat-toggle-selector/mat-toggle-selector.component';
import { ButtonRendererComponent } from '../_components/btn-renderer.component';
import { BtBlueToothScannerComponent } from './widgets/bt-blue-tooth-scanner/bt-blue-tooth-scanner.component';
import { AutofocusDirective } from '../_directives/auto-focus-input.directive';
import { HammerModule } from '@angular/platform-browser';
import { ClientSearchSelectorComponent } from './widgets/client-search-selector/client-search-selector.component';
import { LimitValuesProgressBarsComponent } from '../modules/posorders/limit-values-progress-bars/limit-values-progress-bars.component';
import { ProgressBarComponent } from './widgets/progress-bar/progress-bar.component';
import { ScaleReaderComponent } from './widgets/scale-reader/scale-reader.component';
import { ProfileBillingAddressComponent } from '../modules/admin/profiles/parts/profile-billing-address/profile-billing-address.component';
import { ProfileShippingAddressComponent } from '../modules/admin/profiles/parts/profile-shipping-address/profile-shipping-address.component';
import { OrderHeaderDemoGraphicsComponent } from '../modules/posorders/pos-order/order-header-demo-graphics/order-header-demo-graphics.component';
import { MenuPriceSelectionComponent } from '../modules/menu/menu-price-selection/menu-price-selection.component';
import { PrinterLocationSelectionComponent } from '../modules/admin/products/productedit/_product-edit-parts/printer-location-selection/printer-location-selection.component';
import { ExitLabelSelectionComponent } from '../modules/admin/products/productedit/_product-edit-parts/exit-label-selection/exit-label-selection.component';
import { MatSelectComponent } from './widgets/mat-select/mat-select.component';
import { PrinterLocationsComponent } from '../modules/admin/products/printer-locations/printer-locations.component';
import { KeyPadComponent } from './widgets/key-pad/key-pad.component';
import { ToggleThemeComponent } from './widgets/toggle-theme/toggle-theme.component';
import { TruncateTextPipe } from '../_pipes/truncate-text.pipe';
import { PosOrderFunctionButtonsComponent } from '../modules/posorders/pos-order-function-buttons/pos-order-function-buttons.component';
import { PosOrderTransactionDataComponent } from '../modules/posorders/pos-order-transaction-data/pos-order-transaction-data.component';
import { PaymentBalanceComponent } from '../modules/posorders/payment-balance/payment-balance.component';
import { DeviceInfoComponent } from '../modules/admin/settings/device-info/device-info.component';
import { CannabisItemEditComponent } from '../modules/admin/products/productedit/cannabis-item-edit/cannabis-item-edit.component';
import { LiquorProductEditComponent } from '../modules/admin/products/productedit/liquor-product-edit/liquor-product-edit.component';
import { RetailProductEditComponent } from '../modules/admin/products/productedit/retail-product-edit/retail-product-edit.component';
import { ChangeDueComponent } from '../modules/posorders/components/balance-due/balance-due.component';
import { NewOrderTypeComponent } from '../modules/posorders/components/new-order-type/new-order-type.component';
import { AdjustPaymentComponent } from '../modules/posorders/adjust/adjust-payment/adjust-payment.component';
import { RequestMessagesComponent } from '../modules/admin/profiles/request-messages/request-messages.component';
import { PosPaymentEditComponent } from '../modules/posorders/pos-payment/pos-payment-edit/pos-payment-edit.component';
import { CashValueCalcComponent } from '../modules/transactions/balanceSheets/balance-sheet-edit/cash-value-calc/cash-value-calc.component';
import { PosOrderItemsComponent } from '../modules/posorders/pos-order/pos-order-items/pos-order-items.component';
import { PosOrderItemComponent } from 'src/app/modules/posorders/pos-order-item/pos-order-item.component';
import { IonicModule } from '@ionic/angular';
import { IonicSwipeToDeleteComponent } from './widgets/ionic-swipe-to-delete/ionic-swipe-to-delete.component';
import { DisableControlDirective } from '../_directives/disable-control-directive.directive';
import { PaymentReportComponent } from '../modules/admin/reports/payment-report/payment-report.component';
import { ItemSalesCardComponent } from '../modules/admin/reports/item-sales-card/item-sales-card.component';
import { SearchDebounceInputComponent } from './widgets/search-debounce-input/search-debounce-input.component';
import { UserAuthorizedDirective } from '../_directives/user-authorized.directive';
import { APISettingComponent } from '../modules/login/apisetting/apisetting.component';
import { ApiStoredValueComponent } from './widgets/api-stored-value/api-stored-value.component';
import { ScaleSettingsComponent } from '../modules/admin/settings/software/scale-settings/scale-settings.component';
import { ApiStatusDisplayComponent } from './widgets/api-status-display/api-status-display.component';
import { MatSelectNGModelComponent } from './widgets/mat-select-ngmodel/mat-select-ngmodel.component';
import { MatDateRangeComponent } from './widgets/mat-date-range/mat-date-range.component';
import { OrderHeaderComponent } from '../modules/posorders/pos-order/order-header/order-header.component';
import { OrderTotalComponent } from '../modules/posorders/pos-order/order-total/order-total.component';
import { PriceTierScheduleComponent } from '../modules/admin/products/price-tiers/price-tier-edit/price-tier-schedule/price-tier-schedule.component';
import { QuantiySelectorComponent } from './widgets/quantiy-selector/quantiy-selector.component';
import { BackgroundCoverComponent } from './widgets/background-cover/background-cover.component';
import { UploaderComponent } from './widgets/AmazonServices';
import { PaymentReportCardComponent } from '../modules/admin/reports/payment-report/payment-report-card/payment-report-card.component';
import { DSIEMVElectronComponent } from '../modules/admin/settings/software/dsiemvelectron/dsiemvelectron.component';
import { DepartmentMenuComponent } from '../modules/menu/department-menu/department-menu.component';
import { OverLayComponent } from './widgets/over-lay/over-lay.component';
import { MyThingComponent } from './widgets/over-lay/my-thing/my-thing.component';
import { LogoComponent } from './widgets/logo/logo.component';
import { FilterPipe } from '../_pipes/filter.pipe';
import { ProfileMedInfoComponent } from '../modules/admin/profiles/parts/profile-med-info/profile-med-info.component';
import { ImageSwiperComponent } from './widgets/image-swiper/image-swiper.component';
import { SwiperModule } from 'swiper/angular';
import { CompanyInfoHeaderComponent } from './widgets/company-info-header/company-info-header.component';
import { GridsterModule } from 'angular-gridster2';
import { ColorPickerModule } from 'ngx-color-picker';
import { MatMenuBasicComponent } from './widgets/mat-menu-basic/mat-menu-basic.component';
import { IFrameComponent } from './widgets/i-frame/i-frame.component';
import { YoutubePlayerComponent } from './widgets/youtube-player/youtube-player.component';
import { SafeHtmlPipe } from '../_pipes/safe-html.pipe';
import {YouTubePlayerModule} from '@angular/youtube-player'
import { StrainIndicatorComponent } from '../modules/tv-menu/strain-indicator/strain-indicator.component';
import { CardDashboardComponent } from '../modules/admin/reports/card-dashboard/card-dashboard.component';
import { DashBoardRoutingModule } from '../dash-board-routing.module';
import { DsiEMVPaymentComponent } from '../modules/admin/dsi-emvpayment/dsi-emvpayment.component';
import { AgIconFormatterComponent } from '../_components/_aggrid/ag-icon-formatter/ag-icon-formatter.component';
import { StoreCreditInfoComponent } from '../modules/posorders/pos-order/store-credit-info/store-credit-info.component';
import { StoreCreditSearchComponent } from './widgets/search-list-selectors/store-credit-search/store-credit-search.component';
import { EmailSettingsComponent } from '../modules/admin/settings/email-settings/email-settings.component';
import { UIHomePageSettingsComponent } from '../modules/admin/settings/software/uihome-page-settings/uihome-page-settings.component';
import { ProductSearchSelector2Component } from '../modules/admin/products/productedit/_product-edit-parts/product-search-selector/product-search-selector.component';
import { FastUserSwitchComponent } from '../modules/profile/fast-user-switch/fast-user-switch.component';
import { AppWizardProgressButtonComponent } from './widgets/app-wizard-progress-button/app-wizard-progress-button.component';
import { TipEntryComponent } from '../modules/posorders/components/tip-entry/tip-entry.component';
import { EmailEntryComponent } from './widgets/email-entry/email-entry.component';
import { ElectronZoomControlComponent } from './widgets/electron-zoom-control/electron-zoom-control.component';
import { QROrderComponent } from '../modules/posorders/qrorder/qrorder.component';
import { QRCodeTableComponent } from '../modules/orders/qrcode-table/qrcode-table.component';
import { RequestMessageComponent } from '../modules/admin/profiles/request-messages/request-message/request-message.component';
import { ThreeCXFabComponent } from './widgets/three-cxfab/three-cxfab.component';
import { CallUsSelectorComponent } from './widgets/call-us-selector/call-us-selector.component';
import { SimpleTinyComponent } from '../_components/tinymce/tinymce.component';
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { NumericDirective } from '../_directives/numeric-directive.directive';
import { ArrayFilterPipe, ArraySortPipe } from '../_pipes/array.pipe';
import { BackgroundUrlPipe } from '../_pipes/background-url.pipe';
import { DisplayMenuMenuComponent } from '../modules/display-menu/display-menu-menu/display-menu-menu.component';
import { RewardsAvailibleComponent } from '../modules/posorders/rewards-availible/rewards-availible.component';
import { PriceScheduleMenuListComponent } from '../modules/priceSchedule/price-schedule-menu-list/price-schedule-menu-list.component';
import { BlogPostListComponent } from './widgets/blog-post-list/blog-post-list.component';
import { BlogPostComponent } from './widgets/blog-post/blog-post.component';
import { TagChipsProductsComponent } from '../modules/admin/products/productedit/_product-edit-parts/tag-chips-products/tag-chips-products.component';
import { CashDrawerSettingsComponent } from '../modules/admin/settings/software/cash-drawer-settings/cash-drawer-settings.component';
import { PaymentReportDataComponent } from '../modules/admin/reports/payment-report/payment-report-data/payment-report-data.component';
import { ClockInOutComponent } from './widgets/clock-in-out/clock-in-out.component';
import { TruncateRightPipe } from '../_pipes/truncate-right.pipe';
import { PosCheckOutButtonsComponent } from '../modules/posorders/pos-order/pos-check-out-buttons/pos-check-out-buttons.component';
import { SplitEntrySelectorComponent } from '../modules/posorders/pos-order/split-entry-selector/split-entry-selector.component';

// import { QuicklinkStrategy } from 'ngx-quicklink';
// import { QuicklinkModule } from 'ngx-quicklink';
// export class MyHammerConfig extends HammerGestureConfig {
//     overrides = <any> {
//         'pinch': { enable: false },
//         'rotate': { enable: false }
//     }
// }
@NgModule({
  declarations: [
    SafeHtmlPipe,
    ArrayFilterPipe,
    ArraySortPipe,
    BackgroundUrlPipe,

    AccordionComponent,
    AdjustmentReasonsComponent,
    AdjustPaymentComponent,
    AreaComponent,
    AppWizardProgressButtonComponent,
    APISettingComponent,
    ApiStoredValueComponent,
    ApiStatusDisplayComponent,
    AutofocusDirective,
    BlogPostListComponent,
    BlogPostComponent,
    ChangeDueComponent,
    BackgroundCoverComponent,
    AgIconFormatterComponent,
    ButtonRendererComponent,
    BtBlueToothScannerComponent,
    BtPOSPrinterComponent,
    DashboardComponent,
    DisableControlDirective,
    DisplayMenuMenuComponent,
    CashValueCalcComponent,
    CashDrawerSettingsComponent,
    CardComponent,
    CardDashboardComponent,
    CompanyInfoHeaderComponent,
    ClientSearchSelectorComponent,
    CannabisItemEditComponent,
    CategorySelectComponent,
    CategoryScrollComponent,
    ChipsDisplayComponent,
    ChartTableComponent,
    ChemicalValuesComponent,
    ChemicalSpinnersComponent,
    ClientTypesLookupComponent,
    ClientSearchSelectorComponent,
    ClockInOutComponent,
    DepartmentSelectComponent,
    DeviceInfoComponent,
    DSIEMVElectronComponent,
    DsiEMVPaymentComponent,
    DepartmentMenuComponent,
    EmailSettingsComponent,
    EmailEntryComponent,
    ExitLabelSelectionComponent,
    EditButtonsStandardComponent,
    FacilitySearchSelectorComponent,
    FastUserSwitchComponent,
    FilterComponent,
    FilterPipe,
    FormSelectListComponent,
    // FoodProductEditComponent,
    FooterComponent,
    HeaderComponent,
    GenericIdSelectComponent,
    GenericNameSelectComponent,
    HammerCardComponent,
    InventoryAdjustmentNoteComponent,
    IonicGeoLocationComponent,
    ItemTypeSortComponent,
    ItemSalesCardComponent,
    ImageSwiperComponent,
    KeyPadComponent,
    Label1by8Component,
    LimitValuesProgressBarsComponent,
    LiquorProductEditComponent,
    ListProductSearchInputComponent,
    MatDateRangeComponent,
    MatSelectComponent,
    MatSpinnerOverlayComponent,
    MatToggleSelectorComponent,
    MatMenuBasicComponent,
    MatSelectNGModelComponent,
    MetaTagChipsComponent,
    MenuCompactComponent,
    MenuCompactComponent,
    MenuItemGalleryComponent,
    MenuMinimalComponent,
    MenuPriceSelectionComponent,
    MenuSearchBarComponent,
    MenuTinyComponent,
    MoveInventoryLocationComponent,
    NewOrderTypeComponent,
    NumericDirective,
    OrderHeaderDemoGraphicsComponent,
    OrderTotalComponent,
    OrderHeaderComponent,
    QROrderComponent,
    PagerBlobComponent,
    PageNotFoundComponent,
    PaymentBalanceComponent,
    PaymentReportComponent,
    PaymentReportCardComponent,
    PaymentReportDataComponent,
    PieComponent,
    PosOrderItemComponent,
    PosOrderItemsComponent,
    PosCheckOutButtonsComponent,
    IonicSwipeToDeleteComponent,
    PosOrderFunctionButtonsComponent,
    PosOrderTransactionDataComponent,
    PosPaymentEditComponent,
    PriceCategorySelectComponent,
    PriceTierScheduleComponent,
    PrinterLocationSelectionComponent,
    PrinterLocationsComponent,
    ProgressUploaderComponent,
    ProductSearchSelectorComponent,
    ProductSearchSelector2Component,
    ProductTypeSelectComponent,
    ProfileShippingAddressComponent,
    ProfileBillingAddressComponent,
    ProfileMedInfoComponent,
    ProgressBarComponent,
    PriceCategorySearchComponent,

    PriceScheduleMenuListComponent,
    RewardsAvailibleComponent,
    RetailProductEditComponent,
    SimpleTinyComponent,

    SplitEntrySelectorComponent,

    SalesTaxReportComponent,
    ScaleReaderComponent,
    ScaleSettingsComponent,
    SidebarComponent,
    SiteSelectorComponent,
    SpeciesListComponent,
    StatusLookupComponent,
    StoreCreditInfoComponent,
    StrainIndicatorComponent,
    StoreCreditSearchComponent,
    SummarycardComponent,
    TagChipsProductsComponent,
    TaxFieldsComponent,
    TiersCardComponent,
    QuantiySelectorComponent,
    ToggleThemeComponent,
    TruncateTextPipe,
    TruncateRightPipe,
    UnitTypeFieldsComponent,
    WebEnabledComponent,
    ValueFieldsComponent,
    CartButtonComponent,
    UIHomePageSettingsComponent,
    UserAuthorizedDirective,
    MatSpinnerOverlayComponent,
    QRCodeTableComponent,
    ValueSpinnerComponent,
    ProgressBarComponent,
    SearchDebounceInputComponent,
    UploaderComponent,
    OverLayComponent,
    MyThingComponent,
    TipEntryComponent,
    LogoComponent,
    IFrameComponent,
    YoutubePlayerComponent,
    SafeHtmlPipe,
    ElectronZoomControlComponent,
    RequestMessageComponent,
    RequestMessagesComponent,
    ThreeCXFabComponent,
    CallUsSelectorComponent,
  ],

  imports: [
    AppRoutingModule,
    DashBoardRoutingModule,
    AppMaterialModule,
    CommonModule,
    BrowserAnimationsModule,
    HighchartsChartModule,
    FlexLayoutModule,
    FormsModule,
    GalleryModule,
    HammerModule,
    IonicModule.forRoot(),
    ColorPickerModule,
    GridsterModule,
    RouterModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    SwiperModule,
    YouTubePlayerModule,
  ],

  exports: [
    SafeHtmlPipe,
    ArrayFilterPipe,
    ArraySortPipe,
    BackgroundUrlPipe,
    AccordionComponent,
    AdjustPaymentComponent,
    AreaComponent,
    AutofocusDirective,
    APISettingComponent,
    ApiStoredValueComponent,
    ApiStatusDisplayComponent,
    AppWizardProgressButtonComponent,
    BlogPostListComponent,
    BlogPostComponent,
    EmailEntryComponent,
    UserAuthorizedDirective,
    CashValueCalcComponent,
    ChangeDueComponent,
    AgIconFormatterComponent,
    ButtonRendererComponent,
    BtBlueToothScannerComponent,
    BtPOSPrinterComponent,
    CashDrawerSettingsComponent,
    CallUsSelectorComponent,
    CardComponent,
    CardDashboardComponent,
    ColorPickerModule,
    CategorySelectComponent,
    ClientSearchSelectorComponent,
    ExitLabelSelectionComponent,
    CannabisItemEditComponent,
    ChartTableComponent,
    ChemicalSpinnersComponent,
    ChemicalValuesComponent,
    ChipsDisplayComponent,
    ClientTypesLookupComponent,
    ClockInOutComponent,
    CompanyInfoHeaderComponent,
    EmailSettingsComponent,
    ElectronZoomControlComponent,
    DashboardComponent,
    DepartmentSelectComponent,
    DeviceInfoComponent,
    DisableControlDirective,
    DisplayMenuMenuComponent,
    DSIEMVElectronComponent,
    DsiEMVPaymentComponent,
    DepartmentMenuComponent,
    EditButtonsStandardComponent,
    FacilitySearchSelectorComponent,
    FastUserSwitchComponent,
    FilterComponent,
    FilterPipe,
    FooterComponent,
    FormSelectListComponent,
    GenericIdSelectComponent,
    GenericNameSelectComponent,
    GridsterModule,
    HeaderComponent,
    IonicGeoLocationComponent,
    IonicSwipeToDeleteComponent,
    ItemTypeSortComponent,
    ItemSalesCardComponent,
    ImageSwiperComponent,
    KeyPadComponent,
    LimitValuesProgressBarsComponent,
    LiquorProductEditComponent,
    LogoComponent,
    Label1by8Component,
    MatDateRangeComponent,
    MatMenuBasicComponent,
    MatToggleSelectorComponent,
    MatSelectComponent,
    MatSelectNGModelComponent,
    MatSpinnerOverlayComponent,
    MetaTagChipsComponent,
    MenuCompactComponent,
    MenuItemGalleryComponent,
    MenuPriceSelectionComponent,
    MenuMinimalComponent,
    MenuSearchBarComponent,
    MenuTinyComponent,
    MoveInventoryLocationComponent,
    NewOrderTypeComponent,
    OrderHeaderDemoGraphicsComponent,
    OrderTotalComponent,
    OrderHeaderComponent,
    QROrderComponent,
    QRCodeTableComponent,
    PageNotFoundComponent,
    PaymentBalanceComponent,
    PaymentReportDataComponent,
    PieComponent,
    PriceCategorySearchComponent,
    PriceCategorySelectComponent,
    PriceCategorySearchComponent,
    PriceTierScheduleComponent,
    PrinterLocationSelectionComponent,
    PrinterLocationsComponent,
    PriceScheduleMenuListComponent,

    ProfileMedInfoComponent,
    PaymentReportComponent,
    PosOrderItemComponent,
    PosOrderItemsComponent,
    PosCheckOutButtonsComponent,
    PosOrderFunctionButtonsComponent,
    PosOrderTransactionDataComponent,
    PosPaymentEditComponent,
    ProductTypeSelectComponent,
    ProductSearchSelectorComponent,
    ProductSearchSelector2Component,
    ProfileBillingAddressComponent,
    ProfileShippingAddressComponent,
    ProgressBarComponent,
    RewardsAvailibleComponent,
    RetailProductEditComponent,
    RequestMessageComponent,
    RequestMessagesComponent,
    QuantiySelectorComponent,

    SplitEntrySelectorComponent,

    SalesTaxReportComponent,
    ScaleSettingsComponent,
    ScaleReaderComponent,
    SearchDebounceInputComponent,
    SidebarComponent,
    SpeciesListComponent,
    StatusLookupComponent,
    StrainIndicatorComponent,
    StoreCreditInfoComponent,
    StoreCreditSearchComponent,
    SummarycardComponent,
    TagChipsProductsComponent,
    TaxFieldsComponent,
    TiersCardComponent,
    TipEntryComponent,
    ThreeCXFabComponent,
    ToggleThemeComponent,
    TruncateTextPipe,
    TruncateRightPipe,
    UIHomePageSettingsComponent,
    UnitTypeFieldsComponent,
    UploaderComponent,
    ValueFieldsComponent,
    WebEnabledComponent,
    SimpleTinyComponent,
    NumericDirective,
  ],

  providers: [
    { provide: GALLERY_CONFIG, useValue: { dots: true, imageSize: 'cover' } },
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
  ]

})

export class SharedModule { }

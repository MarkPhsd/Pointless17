import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

// Components
import { ButtonRendererComponent } from '../modules/admin/report-designer/widgets/button-renderer/button-renderer.component';
import { ProductEditButtonService } from '../_services/menu/product-edit-button.service';

// Services
import { InventoryEditButtonService } from '../_services/inventory/inventory-edit-button.service';
import { MBMenuButtonsService } from '../_services/system/mb-menu-buttons.service';

import { IonicModule } from '@ionic/angular';
import { AppMaterialModule } from '../app-material.module';

import { MatMenuBasicComponent } from '../shared/widgets/mat-menu-basic/mat-menu-basic.component';
import { ClientSearchSelectorComponent } from '../shared/widgets/client-search-selector/client-search-selector.component';
import { ValueFieldsComponent } from '../modules/admin/products/productedit/_product-edit-parts/value-fields/value-fields.component';
import { OrderTotalComponent } from '../modules/posorders/pos-order/order-total/order-total.component';
import { StrainIndicatorComponent } from '../modules/tv-menu/strain-indicator/strain-indicator.component';
import { UploaderComponent } from '../shared/widgets/AmazonServices';
import { ApiStatusDisplayComponent } from '../shared/widgets/api-status-display/api-status-display.component';
import { EditButtonsStandardComponent } from '../shared/widgets/edit-buttons-standard/edit-buttons-standard.component';
import { LogoComponent } from '../shared/widgets/logo/logo.component';
import { ProductSearchSelectorComponent } from '../shared/widgets/product-search-selector/product-search-selector.component';
import { ToggleThemeComponent } from '../shared/widgets/toggle-theme/toggle-theme.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { GridcomponentPropertiesDesignComponent } from '../modules/admin/grid-menu-layout/grid-component-properties/gridcomponent-properties-design/gridcomponent-properties-design.component';
import { LimitValuesCardComponent } from '../modules/posorders/limit-values-card/limit-values-card.component';
import { OrderHeaderDemographicsBoardComponent } from '../modules/posorders/pos-order/order-header-demographics-board/order-header-demographics-board.component';
import { OrderTotalBoardComponent } from '../modules/posorders/pos-order/order-total-board/order-total-board.component';
import { CategoryItemsBoardItemComponent } from '../modules/tv-menu/category-items-board/category-items-board-item/category-items-board-item.component';
import { CategoryItemsBoardComponent } from '../modules/tv-menu/category-items-board/category-items-board.component';
import { TvPriceSpecialsComponent } from '../modules/tv-menu/tv-price-specials/tv-price-specials.component';
import { TvPriceTierMenuItemsComponent } from '../modules/tv-menu/tv-price-tier-menu-items/tv-price-tier-menu-items.component';
import { LimitValuesProgressBarsComponent } from '../modules/posorders/limit-values-progress-bars/limit-values-progress-bars.component';
import { ProgressBarComponent } from '../shared/widgets/progress-bar/progress-bar.component';
import { TiersCardComponent } from '../modules/tv-menu/tv-price-specials/tiers-card/tiers-card.component';
import { OrderHeaderDemoGraphicsComponent } from '../modules/posorders/pos-order/order-header-demo-graphics/order-header-demo-graphics.component';
import { BalanceSheetViewComponent } from './printing/balance-sheet-view/balance-sheet-view.component';
import { LabelViewSelectorComponent } from './printing/label-view-selector/label-view-selector.component';
import { ReceiptLayoutComponent } from './printing/receipt-layout/receipt-layout.component';
import { PrintTemplatePopUpComponent } from './printing/reciept-pop-up/print-template-pop-up/print-template-pop-up.component';
import { PrintTemplateComponent } from './printing/reciept-pop-up/print-template/print-template.component';
import { ReceiptViewComponent } from './printing/reciept-pop-up/receipt-view/receipt-view.component';
import { CreditCardPaymentsPrintListComponent } from '../modules/transactions/balanceSheets/credit-card-payments-print-list/credit-card-payments-print-list.component';
import { ItemSalesCardComponent } from '../modules/admin/reports/item-sales-card/item-sales-card.component';
import { PaymentReportComponent } from '../modules/admin/reports/payment-report/payment-report.component';
import { PaymentReportDataComponent } from '../modules/admin/reports/payment-report/payment-report-data/payment-report-data.component';
import { PaymentReportCardComponent } from '../modules/admin/reports/payment-report/payment-report-card/payment-report-card.component';
import { BalanceSheetHeaderViewComponent } from '../modules/transactions/balanceSheets/balance-sheet-header-view/balance-sheet-header-view.component';
import { BalanceSheetCalculationsViewComponent } from '../modules/transactions/balanceSheets/balance-sheet-calculations-view/balance-sheet-calculations-view.component';
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';
import { SalesItemsComponent } from '../modules/admin/reports/item-sales-card/sales-items/sales-items.component';
import { ClockViewComponent } from '../shared/widgets/clock-in-out/clock-view/clock-view.component';
import { QRCodeModule } from 'angularx-qrcode';
import { AgGridImageFormatterComponent } from '../_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { AgGridToggleComponent } from '../_components/_aggrid/ag-grid-toggle/ag-grid-toggle.component';
import { AgGridTestComponent } from '../shared/widgets/ag-grid-test/ag-grid-test.component';
import { CSVImportComponent } from '../modules/admin/settings/database/csv-import/csv-import.component';
import { AngularSignaturePadModule } from '@almothafar/angular-signature-pad';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { HammerModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { YouTubePlayerModule } from '@angular/youtube-player';
import { AgGridModule } from 'ag-grid-angular';
import { GridsterModule } from 'angular-gridster2';
import { HighchartsChartModule } from 'highcharts-angular';
import { GalleryModule } from 'ng-gallery';
import { LightboxModule } from 'ng-gallery/lightbox';
import { ColorPickerModule } from 'ngx-color-picker';
import { NgxColorsModule } from 'ngx-colors';
import { NgxImageCaptureModule } from 'ngx-image-compress';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { FormSelectListComponent } from '../shared/widgets/formSelectList/form-select-list.component';
import { SetTokenComponent } from './set-token/set-token.component';
import { StripeCheckOutComponent } from '../modules/payment-processing/stripe-check-out/stripe-check-out.component';
import { NgxStripeModule } from 'ngx-stripe';
import { SaveChangesButtonComponent } from './save-changes-button/save-changes-button.component';
import { ApiStoredValueComponent } from '../shared/widgets/api-stored-value/api-stored-value.component';
import { APISettingComponent } from '../modules/login/apisetting/apisetting.component';
import { CacheSettingsComponent } from '../modules/admin/settings/database/cache-settings/cache-settings.component';
import { DatabaseSchemaComponent } from '../modules/admin/settings/database/database-schema/database-schema.component';
import { ExportDataComponent } from '../modules/admin/settings/database/export-data/export-data.component';
import { InventoryComponent } from '../modules/admin/settings/inventory/inventory.component';
import { SoftwareSettingsComponent } from '../modules/admin/settings/software/software.component';
import { ScaleSettingsComponent } from '../modules/admin/settings/software/scale-settings/scale-settings.component';
import { EmailSettingsComponent } from '../modules/admin/settings/email-settings/email-settings.component';
import { IonicGeoLocationComponent } from '../shared/widgets/ionic-geo-location/ionic-geo-location.component';
import { DefaultReceiptSelectorComponent } from '../modules/admin/settings/printing/default-receipt-selector/default-receipt-selector.component';
import { ListPrintersElectronComponent } from '../modules/admin/settings/printing/list-printers-electron/list-printers-electron.component';
import { EbayFulfillmentPolicyComponent } from '../modules/admin/inventory/ebay/ebay-fulfillment-policy/ebay-fulfillment-policy.component';
import { EbayReturnPolicyComponent } from '../modules/admin/inventory/ebay/ebay-return-policy/ebay-return-policy.component';
import { EbayAuthRedirectComponent } from '../modules/admin/settings/software/ebay-settings/ebay-auth-redirect/ebay-auth-redirect.component';
import { EbaySettingsComponent } from '../modules/admin/settings/software/ebay-settings/ebay-settings.component';
import { BalanceSheetEmployeeSalesComponent } from '../modules/transactions/balanceSheets/balance-sheet-edit/balance-sheet-employee-sales/balance-sheet-employee-sales.component';
import { KeyboardButtonComponent } from '../shared/widgets/keyboard-button/keyboard-button.component';
import { KeyboardComponent } from '../shared/widgets/keyboard/keyboard.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { MatDateRangeComponent } from '../shared/widgets/mat-date-range/mat-date-range.component';
import { NgxMatDateRangePicker } from '@angular-material-components/datetime-picker';
import { MatToggleSelectorComponent } from '../shared/widgets/mat-toggle-selector/mat-toggle-selector.component';
import { TierPricesComponent } from '../modules/menu/tierMenu/tier-prices/tier-prices.component';
import { TierPriceLineComponent } from '../modules/menu/tierMenu/tiers-with-prices/tier-price-line/tier-price-line.component';
import { TierItemsComponent } from '../modules/menu/tierMenu/tier-items/tier-items.component';
import { AutofocusDirective } from '../_directives/auto-focus-input.directive';
import { DisableControlDirective } from '../_directives/disable-control-directive.directive';
import { FreeDraggingHandleDirective } from '../_directives/free-dragging-handle.directive';
import { FreeDraggingDirective } from '../_directives/free-dragging.directive';
import { InstructionDirective } from '../_directives/instruction.directive';
import { NgControlAttributeDirective } from '../_directives/ng-control-attribute.directive';
import { NumericDirective } from '../_directives/numeric-directive.directive';
import { UserAuthorizedDirective } from '../_directives/user-authorized.directive';

@NgModule({
  declarations: [

    NgControlAttributeDirective,
    NumericDirective,
    UserAuthorizedDirective,
    NgxDaterangepickerMd,
    NgControlAttributeDirective,
    FreeDraggingDirective,
    FreeDraggingHandleDirective,
    AutofocusDirective,
    DisableControlDirective,
    InstructionDirective,

    AgGridImageFormatterComponent,
    AgGridToggleComponent,
    ButtonRendererComponent,


    ClientSearchSelectorComponent,


    TvPriceTierMenuItemsComponent,
    TvPriceSpecialsComponent,
    TiersCardComponent,
    OrderTotalBoardComponent,
    OrderHeaderDemoGraphicsComponent,

    LimitValuesCardComponent,
    ProgressBarComponent,
    LimitValuesProgressBarsComponent,

    OrderHeaderDemographicsBoardComponent,
    CategoryItemsBoardComponent,
    CategoryItemsBoardItemComponent,

    //receipts

    ReceiptViewComponent,
    PrintTemplatePopUpComponent,
    PrintTemplateComponent,

    ClockViewComponent,

    CreditCardPaymentsPrintListComponent,
    StripeCheckOutComponent,

    //moved from shared

    PaymentReportComponent,
    PaymentReportDataComponent,
    ReceiptViewComponent,
    PaymentReportCardComponent,

    BalanceSheetViewComponent,
    //move to module
    EbayAuthRedirectComponent,
    EbayReturnPolicyComponent,
    EbayFulfillmentPolicyComponent,


  ],
  imports: [

    ApiStatusDisplayComponent,
    CommonModule,
    IonicModule,
    AppMaterialModule,
    ReactiveFormsModule,
    FormsModule,
    SharedPipesModule,
    QRCodeModule,
    LogoComponent,
    AgGridModule,
    DragDropModule,
    BrowserAnimationsModule,
    HighchartsChartModule,
    FormsModule,
    HammerModule,
    QRCodeModule,
    GalleryModule,
    LightboxModule ,
    ColorPickerModule,
    GridsterModule,
    RouterModule,
    ReactiveFormsModule,
    YouTubePlayerModule,
    NgxJsonViewerModule,
    NgxColorsModule,
    NgxStripeModule,
    NgxImageCaptureModule,

    NgxDaterangepickerMd.forRoot(),

    AngularSignaturePadModule,
    ToggleThemeComponent,
    //standalones
    FormSelectListComponent,

    CacheSettingsComponent,
    DatabaseSchemaComponent,
    ExportDataComponent,
    InventoryComponent,
    ListPrintersElectronComponent,

    UploaderComponent,
    EmailSettingsComponent,
    ValueFieldsComponent,
    SaveChangesButtonComponent, //uihomagepage  transactionsettings
    DefaultReceiptSelectorComponent,
    LabelViewSelectorComponent,
    ReceiptLayoutComponent,
    EbaySettingsComponent,
    ApiStoredValueComponent,
    IonicGeoLocationComponent,
    ScaleSettingsComponent,
    SetTokenComponent,
    SoftwareSettingsComponent,
    CSVImportComponent,
    EditButtonsStandardComponent,

    MatMenuBasicComponent,
    ItemSalesCardComponent,
    SalesItemsComponent,
    BalanceSheetCalculationsViewComponent,
    BalanceSheetHeaderViewComponent,
    BalanceSheetEmployeeSalesComponent,
    ProductSearchSelectorComponent,

    KeyboardButtonComponent,
    KeyboardComponent,

    StrainIndicatorComponent,
    MatDateRangeComponent,
    MatToggleSelectorComponent,
    TierItemsComponent,
    TierPriceLineComponent,
    TierPricesComponent,
  ],

  exports: [
    NgControlAttributeDirective,
    NumericDirective,
    UserAuthorizedDirective,
    NgxDaterangepickerMd,
    NgControlAttributeDirective,
    FreeDraggingDirective,
    FreeDraggingHandleDirective,
    AutofocusDirective,
    DisableControlDirective,
    InstructionDirective,


    MatToggleSelectorComponent,
    MatDateRangeComponent,
    ApiStoredValueComponent,
    AgGridToggleComponent,
    ButtonRendererComponent,
    SetTokenComponent,
    MatMenuBasicComponent,
    LogoComponent,
    ProductSearchSelectorComponent,
    ValueFieldsComponent,
    UploaderComponent,
    EditButtonsStandardComponent,
    ToggleThemeComponent,
    ApiStatusDisplayComponent,
    StrainIndicatorComponent,
    OrderTotalComponent,
    ClientSearchSelectorComponent,
    FormSelectListComponent,
    SaveChangesButtonComponent,
    CSVImportComponent,

    //should be in databasemodule
    CacheSettingsComponent,
    DatabaseSchemaComponent,
    ExportDataComponent,
    InventoryComponent,

    TvPriceTierMenuItemsComponent,
    TvPriceSpecialsComponent,
    TiersCardComponent,
    OrderTotalBoardComponent,
    OrderHeaderDemoGraphicsComponent,

    LimitValuesCardComponent,
    ProgressBarComponent,
    LimitValuesProgressBarsComponent,

    OrderHeaderDemographicsBoardComponent,
    CategoryItemsBoardComponent,
    CategoryItemsBoardItemComponent,

    //receipts
    ReceiptLayoutComponent,
    ReceiptViewComponent,
    PrintTemplatePopUpComponent,
    PrintTemplateComponent,
    LabelViewSelectorComponent,
    ClockViewComponent,

    CreditCardPaymentsPrintListComponent,
    StripeCheckOutComponent,

    //moved from shared
    ItemSalesCardComponent,
    PaymentReportComponent,
    PaymentReportDataComponent,
    ReceiptViewComponent,
    PaymentReportCardComponent,

    SalesItemsComponent,

    BalanceSheetViewComponent,

    BalanceSheetCalculationsViewComponent,

    SoftwareSettingsComponent,

    ScaleSettingsComponent,
    EmailSettingsComponent,
    InventoryComponent,

    IonicGeoLocationComponent,
    DefaultReceiptSelectorComponent,
    ListPrintersElectronComponent,

    //move to module
    EbaySettingsComponent,
    EbayAuthRedirectComponent,
    EbayReturnPolicyComponent,
    EbayFulfillmentPolicyComponent,

    BalanceSheetCalculationsViewComponent,
    BalanceSheetHeaderViewComponent,
    BalanceSheetEmployeeSalesComponent,

    KeyboardButtonComponent,
    KeyboardComponent,

    TierItemsComponent,
    TierPriceLineComponent,
    TierPricesComponent,
  ],
  providers: [
    InventoryEditButtonService,
    ProductEditButtonService,
    MBMenuButtonsService,
  ]
})
export class SharedUiModule { }

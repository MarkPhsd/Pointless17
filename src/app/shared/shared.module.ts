import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FilterComponent } from './widgets/filter/filter.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
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
import { ListPrintersElectronComponent } from '../modules/admin/settings/printing/list-printers-electron/list-printers-electron.component';
import { DSIEMVAndroidPayBtnComponent } from '../modules/posorders/pos-payment/dsiemvandroid-pay-btn/dsiemvandroid-pay-btn.component';
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
import { SaveChangesButtonComponent } from './widgets/save-changes-button/save-changes-button.component';
import { BrandTypeSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/brand-type-select/brand-type-select.component';
import { ValueFromListSelectorComponent } from './widgets/value-from-list-selector/value-from-list-selector.component';
import { ScaleValueViewComponent } from './widgets/scale-value-view/scale-value-view.component';
import { BalanceSheetReportComponent } from '../modules/admin/reports/balance-sheet-report/balance-sheet-report.component';
import { ImageContainerComponent } from './widgets/image-container/image-container.component';
import { LastImageDisplayComponent } from './widgets/last-image-display/last-image-display.component';
import { KeyboardComponent } from './widgets/keyboard/keyboard.component';
import { KeyboardViewComponent } from './widgets/keyboard-view/keyboard-view.component';
import { FreeDraggingHandleDirective } from '../_directives/free-dragging-handle.directive';
import { FreeDraggingDirective } from '../_directives/free-dragging.directive';
import { NgControlAttributeDirective } from '../_directives/ng-control-attribute.directive';
import { KeyboardButtonComponent } from './widgets/keyboard-button/keyboard-button.component';
import { M22ResizableComponent } from './widgets/m22-resizable/m22-resizable.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MetrcSummaryComponent } from '../modules/admin/reports/metrc-summary/metrc-summary.component';
import { InstructionDirective } from '../_directives/instruction.directive';
import { DynamicAgGridComponent } from './widgets/dynamic-ag-grid/dynamic-ag-grid.component';
import { AgGridModule } from 'ag-grid-angular';
import { PagingInfoComponent } from './widgets/paging-info/paging-info.component';
import { AggregateSelectorComponent } from '../modules/admin/report-designer/designer/aggregate-selector/aggregate-selector.component';
import { AndOrSelectorComponent } from '../modules/admin/report-designer/designer/and-or-selector/and-or-selector.component';
import { DesignerEditorComponent } from '../modules/admin/report-designer/designer/designer-editor/designer-editor.component';
import { DesignerListComponent } from '../modules/admin/report-designer/designer/designer-list/designer-list.component';
import { FieldTypeSelectorComponent } from '../modules/admin/report-designer/designer/field-type-selector/field-type-selector.component';
import { FieldSelectorComponent } from '../modules/admin/report-designer/designer/field-selector/field-selector.component';
import { FieldValueSelectorComponent } from '../modules/admin/report-designer/designer/field-value-selector/field-value-selector.component';
import { FilterBuilderComponent } from '../modules/admin/report-designer/designer/filter-builder/filter-builder.component';
import { GroupByTypesComponent } from '../modules/admin/report-designer/designer/group-by-types/group-by-types.component';
import { ReportGroupSelectorComponent } from '../modules/admin/report-designer/designer/report-group-selector/report-group-selector.component';
import { ReportTypesComponent } from '../modules/admin/report-designer/designer/report-types/report-types.component';
import { SortSelectorComponent } from '../modules/admin/report-designer/designer/sort-selector/sort-selector.component';
import { EditBarComponent } from '../modules/admin/report-designer/widgets/edit-bar/edit-bar.component';
import { MatSelectorComponent } from '../modules/admin/report-designer/widgets/mat-selector/mat-selector.component';
import { FieldListTypeAssignerComponent } from '../modules/admin/report-designer/designer/field-list-type-assigner/field-list-type-assigner.component';
import { UserBarComponent } from './components/user-bar/user-bar.component';
import { CategoryMenuSelectorComponent } from './widgets/category-menu-selector/category-menu-selector.component';
import { CategorySelectListFilterComponent } from './widgets/category-select-list-filter/category-select-list-filter.component';
import { OptionsSelectFilterComponent } from './widgets/options-select-filter/options-select-filter.component';
import { ProductFilterComponent } from './widgets/product-filter/product-filter.component';
import { CheckBoxCellComponent } from './widgets/check-box-cell/check-box-cell.component';
import { TimeChartReportComponent } from '../modules/admin/reports/time-chart-report/time-chart-report.component';
import { ProductChartReportComponent } from '../modules/admin/reports/product-chart-report/product-chart-report.component';
import { AverageHourlySalesLaborChartComponent } from '../modules/admin/reports/average-hourly-sales-labor-chart/average-hourly-sales-labor-chart.component';
import { EmployeeClockListComponent } from '../modules/admin/employeeClockAdmin/employee-clock-list/employee-clock-list.component';
import { EmployeeClockEditComponent } from '../modules/admin/employeeClockAdmin/employee-clock-edit/employee-clock-edit.component';
import { EmployeeClockFilterComponent } from '../modules/admin/employeeClockAdmin/employee-clock-filter/employee-clock-filter.component';
import { ZoomComponent } from './widgets/zoom/zoom.component';
import { PartUsageGraphComponent } from '../modules/admin/products/part-builder/part-usage-graph/part-usage-graph.component';
import { CoachMarksComponent } from './widgets/coach-marks/coach-marks.component';
import { CoachMarksButtonComponent } from './widgets/coach-marks-button/coach-marks-button.component';
import { SalesItemsComponent } from '../modules/admin/reports/item-sales-card/sales-items/sales-items.component';
import { DerpPipe } from '../_pipes/derp.pipe';
import { POSOrderScheduleCardComponent } from '../modules/posorders/posorder-schedule/posorder-schedule-card/posorder-schedule-card.component';
import { AuditPaymentComponent } from '../modules/admin/reports/item-sales-card/audit-payment/audit-payment.component';
import { QRCodeModule } from 'angularx-qrcode'
import { UnitTypeSelectorComponent } from './widgets/unit-type-selector/unit-type-selector.component';
import { ItemassociationsComponent } from '../modules/admin/products/productedit/_product-edit-parts/itemassociations/itemassociations.component';
import { SearchFieldsComponent } from './widgets/search-fields/search-fields.component';
import { LightboxModule } from 'ng-gallery/lightbox';
import { ImageGalleryComponent } from './widgets/image-gallery/image-gallery.component';
import { GalleryModule } from 'ng-gallery';
import { ImageLightHouseComponent } from './widgets/image-light-house/image-light-house.component';
import { ClockInPanelComponent } from '../modules/admin/clients/clock-in-panel/clock-in-panel.component';
import { UserPreferencesComponent } from '../modules/admin/clients/user-preferences/user-preferences.component';
import { ClockViewComponent } from './widgets/clock-in-out/clock-view/clock-view.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { NgxColorsModule } from 'ngx-colors';
import { CloseFloatingButtonComponent } from './widgets/close-floating-button/close-floating-button.component';
import { MenuCardCategoriesComponent } from '../modules/menu/categories/menu-card-categories/menu-card-categories.component';
import { SortSelectorsComponent } from './widgets/sort-selectors/sort-selectors.component';
import { SetTokenComponent } from '../modules/admin/settings/set-token/set-token.component';
import { DCAPResponseMessageComponent } from '../modules/dsiEMV/Dcap/dcaptransaction/dcapresponse-message/dcapresponse-message.component';
import { EmployeesOnClockListComponent } from '../modules/admin/employeeClockAdmin/employees-on-clock-list/employees-on-clock-list.component';
import { FunctionButtonsListComponent } from '../modules/admin/settings/function-groups/function-buttons-list/function-buttons-list.component';
import { DsiEMVCardPayBtnComponent } from '../modules/posorders/pos-payment/dsi-emvcard-pay-btn/dsi-emvcard-pay-btn.component';
import { SiteFooterComponent } from './components/site-footer/site-footer.component';
import { SiteCardComponent } from './widgets/site-card/site-card.component';
import { OnlinePaymentCompletedComponent } from '../modules/payment-processing/online-payment-completed/online-payment-completed.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import {
  DataUrl,
  DOC_ORIENTATION,
  NgxImageCaptureModule,
  NgxImageCompressService,
  UploadResponse,
} from 'ngx-image-compress';
import { OrderItemScannerComponent } from './widgets/search-list-selectors/order-item-scanner/order-item-scanner.component';
import { MessageMenuSenderComponent } from '../modules/admin/message-editor-list/message-menu-sender/message-menu-sender.component';

// import { QrPaymentComponent } from '../modules/orders/qr-payment/qr-payment.component';

// import { ReceiptLayoutComponent } from '../modules/admin/settings/printing/receipt-layout/receipt-layout.component';

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
    DsiEMVCardPayBtnComponent,
    SafeHtmlPipe,
    ArrayFilterPipe,
    ArraySortPipe,
    BackgroundUrlPipe,
    DerpPipe,
    BrandTypeSelectComponent,
    AccordionComponent,
    AdjustmentReasonsComponent,
    AdjustPaymentComponent,
    AreaComponent,
    AppWizardProgressButtonComponent,
    APISettingComponent,
    ApiStoredValueComponent,
    ApiStatusDisplayComponent,
    AutofocusDirective,
    BalanceSheetReportComponent,
    BlogPostListComponent,
    BlogPostComponent,
    ChangeDueComponent,
    CoachMarksComponent,
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
    TimeChartReportComponent,
    ProductChartReportComponent,
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
    ClockViewComponent,
    ClockInPanelComponent,
    UserPreferencesComponent,
    DepartmentSelectComponent,
    DeviceInfoComponent,
    DSIEMVElectronComponent,
    DsiEMVPaymentComponent,
    DepartmentMenuComponent,
    DCAPResponseMessageComponent,
    DynamicAgGridComponent,
    DSIEMVAndroidPayBtnComponent,
    EmailSettingsComponent,
    EmailEntryComponent,
    EmployeeClockListComponent,
    EmployeesOnClockListComponent,
    EmployeeClockEditComponent,
    EmployeeClockFilterComponent,
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
    SalesItemsComponent,
    ImageSwiperComponent,
    ImageContainerComponent,
    InstructionDirective,
    KeyPadComponent,
    Label1by8Component,
    LimitValuesProgressBarsComponent,
    LiquorProductEditComponent,
    ListProductSearchInputComponent,
    OrderItemScannerComponent,
    ListPrintersElectronComponent,

    MatDateRangeComponent,
    MatSelectComponent,
    MatSpinnerOverlayComponent,
    MatToggleSelectorComponent,
    MatMenuBasicComponent,
    MatSelectNGModelComponent,
    MetaTagChipsComponent,
    ItemassociationsComponent,
    MenuCompactComponent,
    MenuCompactComponent,
    MenuMinimalComponent,
    MenuPriceSelectionComponent,
    MenuSearchBarComponent,
    MenuTinyComponent,
    MetrcSummaryComponent,
    MessageMenuSenderComponent,

    FunctionButtonsListComponent,
    AverageHourlySalesLaborChartComponent,
    MoveInventoryLocationComponent,
    NewOrderTypeComponent,
    NgControlAttributeDirective,
    NumericDirective,
    OrderHeaderDemoGraphicsComponent,
    OrderTotalComponent,
    OrderHeaderComponent,
    QROrderComponent,
    // QrPaymentComponent,
    // PayAPIComponent,
    // PayAPIFrameComponent,
    OnlinePaymentCompletedComponent,
    PagingInfoComponent,
    PagerBlobComponent,
    PageNotFoundComponent,
    PaymentBalanceComponent,
    PaymentReportComponent,
    PaymentReportCardComponent,
    PaymentReportDataComponent,
    PieComponent,
    POSOrderScheduleCardComponent,
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
    PartUsageGraphComponent,
    //ProductFilterComponent
    ProductFilterComponent,
    CategorySelectListFilterComponent,
    OptionsSelectFilterComponent,
    CategoryMenuSelectorComponent,
    MenuCardCategoriesComponent,
    // ReceiptLayoutComponent,
    //*** */
    AuditPaymentComponent,
    PriceScheduleMenuListComponent,
    RewardsAvailibleComponent,
    RetailProductEditComponent,
    SimpleTinyComponent,
    ScaleValueViewComponent,
    SplitEntrySelectorComponent,
    SaveChangesButtonComponent,
    SalesTaxReportComponent,
    ScaleReaderComponent,
    ScaleSettingsComponent,
    SidebarComponent,
    SiteSelectorComponent,
    SiteCardComponent,
    SpeciesListComponent,
    StatusLookupComponent,
    StoreCreditInfoComponent,
    StrainIndicatorComponent,
    StoreCreditSearchComponent,
    SetTokenComponent,
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
    ValueFromListSelectorComponent,
    CallUsSelectorComponent,
    LastImageDisplayComponent,
    KeyboardComponent,
    KeyboardViewComponent,
    FreeDraggingDirective,
    FreeDraggingHandleDirective,
    KeyboardButtonComponent,
    M22ResizableComponent,
    AggregateSelectorComponent,
    AndOrSelectorComponent,
    DesignerEditorComponent,
    DesignerListComponent,
    FieldTypeSelectorComponent,
    FieldSelectorComponent,
    FieldValueSelectorComponent,
    FieldListTypeAssignerComponent,
    FilterBuilderComponent,
    GroupByTypesComponent,
    ReportGroupSelectorComponent,
    ReportTypesComponent,
    SortSelectorComponent,
    SortSelectorsComponent,
    MatSelectorComponent,
    EditBarComponent,
    UserBarComponent,
    CheckBoxCellComponent,
    ZoomComponent,
    CoachMarksComponent,
    CoachMarksButtonComponent,
    UnitTypeSelectorComponent,
    SearchFieldsComponent,
    ImageGalleryComponent,
    ImageLightHouseComponent,
    ClockViewComponent,
    CloseFloatingButtonComponent,
    SiteFooterComponent,

  ],

  imports: [
    IonicModule.forRoot(),
    AgGridModule,
    AppRoutingModule,
    DashBoardRoutingModule,
    DragDropModule,
    AppMaterialModule,
    CommonModule,
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
    SwiperModule,
    YouTubePlayerModule,
    NgxJsonViewerModule,
    NgxColorsModule,
    NgxImageCaptureModule,
    NgxDaterangepickerMd.forRoot(),

  ],

  exports: [
    NgxJsonViewerModule,
    AgGridModule,
    DragDropModule,
    SafeHtmlPipe,
    ArrayFilterPipe,
    ArraySortPipe,
    BackgroundUrlPipe,
    DerpPipe,
    BrandTypeSelectComponent,
    ListProductSearchInputComponent,
    OrderItemScannerComponent,
    FunctionButtonsListComponent,
    AuditPaymentComponent,
    AccordionComponent,
    AdjustPaymentComponent,
    AreaComponent,
    AutofocusDirective,
    APISettingComponent,
    ApiStoredValueComponent,
    ApiStatusDisplayComponent,
    AppWizardProgressButtonComponent,
    BalanceSheetReportComponent,
    BlogPostListComponent,
    BlogPostComponent,
    EmailEntryComponent,
    UserAuthorizedDirective,
    CashValueCalcComponent,
    ChangeDueComponent,
    CoachMarksComponent,
    AgIconFormatterComponent,
    ButtonRendererComponent,
    BtBlueToothScannerComponent,
    BtPOSPrinterComponent,
    CashDrawerSettingsComponent,
    CallUsSelectorComponent,
    CardComponent,
    DSIEMVAndroidPayBtnComponent,
    DsiEMVCardPayBtnComponent,
    TimeChartReportComponent,
    ProductChartReportComponent,
    CardDashboardComponent,
    ColorPickerModule,
    CoachMarksButtonComponent,
    CategorySelectComponent,
    ClientSearchSelectorComponent,
    CloseFloatingButtonComponent,
    ExitLabelSelectionComponent,
    CannabisItemEditComponent,
    ChartTableComponent,
    ChemicalSpinnersComponent,
    ChemicalValuesComponent,
    ChipsDisplayComponent,
    ClientTypesLookupComponent,

    // PayAPIComponent,
    // PayAPIFrameComponent,
    OnlinePaymentCompletedComponent,
    ClockViewComponent,
    CompanyInfoHeaderComponent,
    EmailSettingsComponent,
    ElectronZoomControlComponent,
    DashboardComponent,
    DCAPResponseMessageComponent,
    DepartmentSelectComponent,
    DeviceInfoComponent,
    DisableControlDirective,
    DisplayMenuMenuComponent,
    DSIEMVElectronComponent,
    DsiEMVPaymentComponent,
    DepartmentMenuComponent,
    DynamicAgGridComponent,
    EditButtonsStandardComponent,
    EmployeeClockListComponent,
    EmployeeClockEditComponent,
    EmployeesOnClockListComponent,
    EmployeeClockFilterComponent,
    ImageGalleryComponent,
    FacilitySearchSelectorComponent,
    FastUserSwitchComponent,
    FilterComponent,
    FilterPipe,
    FooterComponent,
    FormSelectListComponent,
    FreeDraggingDirective,
    FreeDraggingHandleDirective,
    GenericIdSelectComponent,
    GenericNameSelectComponent,
    GridsterModule,
    HeaderComponent,
    IonicGeoLocationComponent,
    IonicSwipeToDeleteComponent,
    ImageContainerComponent,
    InstructionDirective,
    ItemTypeSortComponent,
    ItemSalesCardComponent,
    SalesItemsComponent,
    ImageSwiperComponent,
    KeyPadComponent,
    KeyboardComponent,
    KeyboardButtonComponent,
    KeyboardViewComponent,
    LastImageDisplayComponent,

    LimitValuesProgressBarsComponent,
    LiquorProductEditComponent,
    ListPrintersElectronComponent,
    LogoComponent,
    Label1by8Component,
    MatDateRangeComponent,

    // NgcCookieConsentModule.forRoot(cookieConfig),
    NgxDaterangepickerMd,
    MatMenuBasicComponent,
    MatToggleSelectorComponent,
    MatSelectComponent,
    MatSelectNGModelComponent,
    MatSpinnerOverlayComponent,
    MetaTagChipsComponent,
    ItemassociationsComponent,
    MenuCardCategoriesComponent,
    MenuCompactComponent,
    MenuPriceSelectionComponent,
    MenuMinimalComponent,
    MenuSearchBarComponent,
    MenuTinyComponent,
    MessageMenuSenderComponent,

    UserBarComponent,
    MetrcSummaryComponent,
    AverageHourlySalesLaborChartComponent,
    M22ResizableComponent,
    MoveInventoryLocationComponent,
    NewOrderTypeComponent,
    NgControlAttributeDirective,
    OrderHeaderDemoGraphicsComponent,
    OrderTotalComponent,
    OrderHeaderComponent,
    QROrderComponent,
    QRCodeTableComponent,
    // QrPaymentComponent,
    PagingInfoComponent,
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

    POSOrderScheduleCardComponent,
    //ProductFilterComponent
    ProductFilterComponent,
    CategorySelectListFilterComponent,
    OptionsSelectFilterComponent,
    CategoryMenuSelectorComponent,
    //*** */
    SiteFooterComponent,
    PartUsageGraphComponent,

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
    // ReceiptLayoutComponent,
    QuantiySelectorComponent,
    UnitTypeSelectorComponent,
    UserPreferencesComponent,
    SiteCardComponent,
    SearchFieldsComponent,
    SaveChangesButtonComponent,
    ScaleValueViewComponent,
    SplitEntrySelectorComponent,
    SalesTaxReportComponent,
    ScaleSettingsComponent,
    ScaleReaderComponent,
    SearchDebounceInputComponent,
    SetTokenComponent,
    SidebarComponent,
    SpeciesListComponent,
    StatusLookupComponent,
    StrainIndicatorComponent,
    StoreCreditInfoComponent,
    StoreCreditSearchComponent,
    SortSelectorComponent,
    SortSelectorsComponent,
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
    ValueFromListSelectorComponent,

    AggregateSelectorComponent,
    AndOrSelectorComponent,
    DesignerEditorComponent,
    DesignerListComponent,
    FieldTypeSelectorComponent,
    FieldSelectorComponent,
    FieldValueSelectorComponent,
    FilterBuilderComponent,
    FieldListTypeAssignerComponent,
    GroupByTypesComponent,
    ReportGroupSelectorComponent,
    ReportTypesComponent,
    MatSelectorComponent,
    EditBarComponent
  ],

  providers: [
    // { provide: GALLERY_CONFIG, useValue: { dots: true, imageSize: 'cover', previewFullscreen : true } },
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
    // {provude: Gallery},
    NgxImageCompressService,
    KeyboardComponent,
  ]

})

export class SharedModule { }

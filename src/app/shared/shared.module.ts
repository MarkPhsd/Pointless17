import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from '../app-material.module';
import { RouterModule } from '@angular/router';
import { HighchartsChartModule } from 'highcharts-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AutofocusDirective } from '../_directives/auto-focus-input.directive';
import { HammerModule } from '@angular/platform-browser';
import { IonicModule } from '@ionic/angular';
import { IonicSwipeToDeleteComponent } from './widgets/ionic-swipe-to-delete/ionic-swipe-to-delete.component';
import { UserAuthorizedDirective } from '../_directives/user-authorized.directive';
import { GridsterModule } from 'angular-gridster2';
import { ColorPickerModule } from 'ngx-color-picker';
import { DashBoardRoutingModule } from '../dash-board-routing.module';
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { KeyboardComponent } from './widgets/keyboard/keyboard.component';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { AgGridModule } from 'ag-grid-angular';
import { QRCodeModule } from 'angularx-qrcode'
import { LightboxModule } from 'ng-gallery/lightbox';
import { GalleryModule } from 'ng-gallery';
// import { ClockViewComponent } from './widgets/clock-in-out/clock-view/clock-view.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { NgxColorsModule } from 'ngx-colors';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

import {
  DataUrl,
  DOC_ORIENTATION,
  NgxImageCaptureModule,
  NgxImageCompressService,
  UploadResponse,
} from 'ngx-image-compress';
;
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';
import { SharedUiModule } from '../shared-ui/shared-ui.module';
import { SharedUtilsModule } from '../shared-utils/shared-utils.module';
import { AppRoutingModule } from '../app-routing.module';


// import { QrPaymentComponent } from '../modules/orders/qr-payment/qr-payment.component';


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

    //move last

  ],

  imports: [
    IonicSwipeToDeleteComponent,

    // HeaderComponent,
    // FooterComponent,
    // DashboardComponent,
    // BalanceSheetReportComponent,
    // AppWizardProgressButtonComponent,
    // AreaComponent,
    // AdjustPaymentComponent,
    // AdjustmentReasonsComponent,
    // AccordionComponent,
    // DsiEMVCardPayBtnComponent,
    // BlogPostComponent,
    // ChangeDueComponent,
    // CoachMarksComponent,
    // BackgroundCoverComponent,

    // AgIconFormatterComponent,
    // ButtonRendererComponent,

    // BtBlueToothScannerComponent,
    // BtPOSPrinterComponent,
    // DisplayMenuMenuComponent,
    // CashValueCalcComponent,
    // CashDrawerSettingsComponent,
    // TimeChartReportComponent,
    // ProductChartReportComponent,
    // CardDashboardComponent,
    // CardComponent,
    // CompanyInfoHeaderComponent,
    // CannabisItemEditComponent,
    // BrandTypeSelectComponent,
    // CategorySelectComponent,
    // CategoryScrollComponent,
    // ChipsDisplayComponent,
    // ChartTableComponent,
    // ChemicalValuesComponent,
    // ChemicalSpinnersComponent,
    // ClientTypesLookupComponent,
    // ClockInOutComponent,
    // ClockInPanelComponent,
    // CustomerDateSelectorComponent,
    // UserPreferencesComponent,

    // DepartmentSelectComponent,
    // DSIEMVElectronComponent,
    // DsiEMVPaymentComponent,
    // DepartmentMenuComponent,
    // DCAPResponseMessageComponent,
    // EmailEntryComponent,
    // EmployeeClockListComponent,
    // EmployeeClockEditComponent,
    // EmployeeClockFilterComponent,
    // ExitLabelSelectionComponent,
    // FacilitySearchSelectorComponent,
    // FilterComponent,
    // InventoryAdjustmentNoteComponent,
    // ItemTypeSortComponent,
    // ImageContainerComponent,
    // Label1by8Component,

    // LiquorProductEditComponent,
    // ListProductSearchInputComponent,

    // OrderItemScannerComponent,
    // MatChipListComponent,
    // MatSelectComponent,
    // MatSpinnerOverlayComponent,
    // MatSelectNGModelComponent,
    // MetaTagChipsComponent,
    // ItemassociationsComponent,
    // MenuCompactComponent,
    // MenuMinimalComponent,
    // MenuPriceSelectionComponent,
    // MenuSearchBarComponent,
    // MetrcSummaryComponent,
    // TtsComponent,
    // FunctionButtonsListComponent,
    // AverageHourlySalesLaborChartComponent,
    // MoveInventoryLocationComponent,
    // NewOrderTypeComponent,
    // OrderHeaderComponent,
    // QROrderComponent,
    // ScheduleSelectorComponent,
    // OnlinePaymentCompletedComponent,
    // PagingInfoComponent,
    // PagerBlobComponent,
    // PaymentTypesSelectionComponent,
    // PieComponent,

    // PosOrderItemComponent,
    // PosOrderItemsComponent,
    // PosCheckOutButtonsComponent,

    // PosOrderFunctionButtonsComponent,
    // MessageMenuSenderComponent,
    // PosOrderTransactionDataComponent,
    // POSOrderScheduleCardComponent,
    // PosPaymentEditComponent,
    // PriceCategorySelectComponent,
    // PriceTierScheduleComponent,
    // PrinterLocationSelectionComponent,
    // PrinterLocationsComponent,

    // ProgressUploaderComponent,
    // ProductSearchSelector2Component,
    // ProductTypeSelectComponent,

    // ProfileShippingAddressComponent,
    // ProfileBillingAddressComponent,
    // ProfileMedInfoComponent,
    // PriceCategorySearchComponent,

    // PartUsageGraphComponent,
    // PriceScheduleMenuListComponent,
    // MenuCardCategoriesComponent,
    // AuditPaymentComponent,
    // RewardsAvailibleComponent,
    // RetailProductEditComponent,
    // ScaleValueViewComponent,
    // SalesTaxReportComponent,
    // SidebarComponent,
    // SiteSelectorComponent,
    // SiteCardComponent,
    // SpeciesListComponent,
    // StatusLookupComponent,
    // StoreCreditInfoComponent,
    // StoreCreditSearchComponent,
    // SummarycardComponent,

    // TagChipsProductsComponent,
    // TaxFieldsComponent,
    // QuantiySelectorComponent,
    // UnitTypeFieldsComponent,
    // CartButtonComponent,
    // MatSpinnerOverlayComponent,
    // QRCodeTableComponent,
    // PaymentBalanceComponent,
    // SplitEntrySelectorComponent,
    // DSIEMVAndroidPayBtnComponent,
    // ValueSpinnerComponent,
    // OverLayComponent,
    // TipEntryComponent,
    // IFrameComponent,
    // ElectronZoomControlComponent,
    // RequestMessagesComponent,
    // RequestMessagesComponent,
    // ValueFromListSelectorComponent,
    // CallUsSelectorComponent,
    // LastImageDisplayComponent,
    // M22ResizableComponent,
    // AggregateSelectorComponent,
    // AndOrSelectorComponent,
    // DesignerEditorComponent,
    // DesignerListComponent,
    // FieldTypeSelectorComponent,
    // FieldSelectorComponent,
    // FieldValueSelectorComponent,
    // FieldListTypeAssignerComponent,
    // FilterBuilderComponent,
    // GroupByTypesComponent,
    // ReportGroupSelectorComponent,
    // ReportTypesComponent,
    // SortSelectorComponent,
    // MatSelectorComponent,
    // EditBarComponent,
    // MenuTinyComponent,
    // RequestMessageComponent,
    // BlogPostListComponent,
    // SiteFooterComponent,
    // UserBarComponent,
    // CheckBoxCellComponent,
    // ZoomComponent,
    // CoachMarksButtonComponent,
    // CoachMarksComponent,

    // UnitTypeSelectorComponent,
    // SearchFieldsComponent,
    // ImageGalleryComponent,
    // ImageLightHouseComponent,
    // CloseFloatingButtonComponent,
    // YoutubePlayerComponent,
    // AngularSignaturePadModule,
    // SimpleTinyComponent,
    // SortSelectorsComponent,
    // EmployeesOnClockListComponent,
    // FastUserSwitchComponent,
    // KeyPadComponent,
    // LoginInfoComponent,
    // ThreeCXFabComponent,
    // SignatureComponent,
    // ProductFilterComponent,
    // CategoryMenuSelectorComponent,
    // CategorySelectListFilterComponent,
    // OptionsSelectFilterComponent,
    // ScheduleDateRangeSelectorComponent,
    // PageNotFoundComponent,
    // DynamicAgGridComponent,
    // MatDateRangeComponent,
    // SearchDebounceInputComponent,

    IonicModule.forRoot(),
    NgxDaterangepickerMd.forRoot(),
    CommonModule,
    SharedUiModule,
    SharedUtilsModule,
    SharedPipesModule,
    AppMaterialModule,
    AgGridModule,
    AppRoutingModule,
    RouterModule,
    DashBoardRoutingModule,
    DragDropModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    HighchartsChartModule,
    FormsModule,
    HammerModule,
    QRCodeModule,
    GalleryModule,
    LightboxModule ,
    ColorPickerModule,
    GridsterModule,
    ReactiveFormsModule,
    NgxJsonViewerModule,
    NgxColorsModule,
    NgxImageCaptureModule,

  ],

  exports: [

    SharedUiModule,
    SharedUtilsModule,
    SharedPipesModule,

    IonicModule,
    NgxDaterangepickerMd,
    CommonModule,
    SharedUiModule,
    SharedUtilsModule,
    SharedPipesModule,
    AppMaterialModule,
    AgGridModule,
    AppRoutingModule,
    RouterModule,
    DashBoardRoutingModule,
    DragDropModule,
    AppMaterialModule,
    BrowserAnimationsModule,
    HighchartsChartModule,
    FormsModule,
    HammerModule,
    QRCodeModule,
    GalleryModule,
    LightboxModule ,
    ColorPickerModule,
    GridsterModule,
    ReactiveFormsModule,
    NgxJsonViewerModule,
    NgxColorsModule,
    NgxImageCaptureModule,

    AutofocusDirective,
    UserAuthorizedDirective,

    // HeaderComponent,
    // FooterComponent,
    // DashboardComponent,
    // BalanceSheetReportComponent,
    // AppWizardProgressButtonComponent,
    // AreaComponent,
    // AdjustPaymentComponent,
    // AdjustmentReasonsComponent,
    // AccordionComponent,
    // DsiEMVCardPayBtnComponent,
    // BlogPostComponent,
    // ChangeDueComponent,
    // CoachMarksComponent,
    // BackgroundCoverComponent,

    // AgIconFormatterComponent,
    // ButtonRendererComponent,

    // BtBlueToothScannerComponent,
    // BtPOSPrinterComponent,
    // DisplayMenuMenuComponent,
    // CashValueCalcComponent,
    // CashDrawerSettingsComponent,
    // TimeChartReportComponent,
    // ProductChartReportComponent,
    // CardDashboardComponent,
    // CardComponent,
    // CompanyInfoHeaderComponent,
    // CannabisItemEditComponent,
    // BrandTypeSelectComponent,
    // CategorySelectComponent,
    // CategoryScrollComponent,
    // ChipsDisplayComponent,
    // ChartTableComponent,
    // ChemicalValuesComponent,
    // ChemicalSpinnersComponent,
    // ClientTypesLookupComponent,
    // ClockInOutComponent,
    // ClockInPanelComponent,
    // CustomerDateSelectorComponent,
    // UserPreferencesComponent,

    // DepartmentSelectComponent,
    // DSIEMVElectronComponent,
    // DsiEMVPaymentComponent,
    // DepartmentMenuComponent,
    // DCAPResponseMessageComponent,
    // EmailEntryComponent,
    // EmployeeClockListComponent,
    // EmployeeClockEditComponent,
    // EmployeeClockFilterComponent,
    // ExitLabelSelectionComponent,
    // FacilitySearchSelectorComponent,
    // FilterComponent,
    // InventoryAdjustmentNoteComponent,
    // ItemTypeSortComponent,
    // ImageContainerComponent,
    // Label1by8Component,

    // LiquorProductEditComponent,
    // ListProductSearchInputComponent,

    // OrderItemScannerComponent,
    // MatChipListComponent,
    // MatSelectComponent,
    // MatSpinnerOverlayComponent,
    // MatSelectNGModelComponent,
    // MetaTagChipsComponent,
    // ItemassociationsComponent,
    // MenuCompactComponent,
    // MenuMinimalComponent,
    // MenuPriceSelectionComponent,
    // MenuSearchBarComponent,
    // MetrcSummaryComponent,
    // TtsComponent,
    // FunctionButtonsListComponent,
    // AverageHourlySalesLaborChartComponent,
    // MoveInventoryLocationComponent,
    // NewOrderTypeComponent,
    // OrderHeaderComponent,
    // QROrderComponent,
    // ScheduleSelectorComponent,
    // OnlinePaymentCompletedComponent,
    // PagingInfoComponent,
    // PagerBlobComponent,
    // PaymentTypesSelectionComponent,
    // PieComponent,

    // PosOrderItemComponent,
    // PosOrderItemsComponent,
    // PosCheckOutButtonsComponent,

    // PosOrderFunctionButtonsComponent,
    // MessageMenuSenderComponent,
    // PosOrderTransactionDataComponent,
    // POSOrderScheduleCardComponent,
    // PosPaymentEditComponent,
    // PriceCategorySelectComponent,
    // PriceTierScheduleComponent,
    // PrinterLocationSelectionComponent,
    // PrinterLocationsComponent,

    // ProgressUploaderComponent,
    // ProductSearchSelector2Component,
    // ProductTypeSelectComponent,

    // ProfileShippingAddressComponent,
    // ProfileBillingAddressComponent,
    // ProfileMedInfoComponent,
    // PriceCategorySearchComponent,

    // PartUsageGraphComponent,
    // PriceScheduleMenuListComponent,
    // MenuCardCategoriesComponent,
    // AuditPaymentComponent,
    // RewardsAvailibleComponent,
    // RetailProductEditComponent,
    // ScaleValueViewComponent,
    // SalesTaxReportComponent,
    // SidebarComponent,
    // SiteSelectorComponent,
    // SiteCardComponent,
    // SpeciesListComponent,
    // StatusLookupComponent,
    // StoreCreditInfoComponent,
    // StoreCreditSearchComponent,
    // SummarycardComponent,

    // TagChipsProductsComponent,
    // TaxFieldsComponent,
    // QuantiySelectorComponent,
    // UnitTypeFieldsComponent,
    // CartButtonComponent,
    // MatSpinnerOverlayComponent,
    // QRCodeTableComponent,
    // PaymentBalanceComponent,
    // SplitEntrySelectorComponent,
    // DSIEMVAndroidPayBtnComponent,
    // ValueSpinnerComponent,
    // OverLayComponent,
    // TipEntryComponent,
    // IFrameComponent,
    // ElectronZoomControlComponent,
    // RequestMessagesComponent,
    // RequestMessagesComponent,
    // ValueFromListSelectorComponent,
    // CallUsSelectorComponent,
    // LastImageDisplayComponent,
    // M22ResizableComponent,
    // AggregateSelectorComponent,
    // AndOrSelectorComponent,
    // DesignerEditorComponent,
    // DesignerListComponent,
    // FieldTypeSelectorComponent,
    // FieldSelectorComponent,
    // FieldValueSelectorComponent,
    // FieldListTypeAssignerComponent,
    // FilterBuilderComponent,
    // GroupByTypesComponent,
    // ReportGroupSelectorComponent,
    // ReportTypesComponent,
    // SortSelectorComponent,
    // MatSelectorComponent,
    // EditBarComponent,
    // MenuTinyComponent,
    // RequestMessageComponent,
    // BlogPostListComponent,
    // SiteFooterComponent,
    // UserBarComponent,
    // CheckBoxCellComponent,
    // ZoomComponent,
    // CoachMarksButtonComponent,
    // CoachMarksComponent,

    // UnitTypeSelectorComponent,
    // SearchFieldsComponent,
    // ImageGalleryComponent,
    // ImageLightHouseComponent,
    // CloseFloatingButtonComponent,
    // YoutubePlayerComponent,
    // AngularSignaturePadModule,
    // SimpleTinyComponent,
    // SortSelectorsComponent,
    // EmployeesOnClockListComponent,
    // FastUserSwitchComponent,
    // KeyPadComponent,
    // LoginInfoComponent,
    // ThreeCXFabComponent,
    // SignatureComponent,
    // ProductFilterComponent,
    // CategoryMenuSelectorComponent,
    // CategorySelectListFilterComponent,
    // OptionsSelectFilterComponent,
    // ScheduleDateRangeSelectorComponent,
    // PageNotFoundComponent,
    // DynamicAgGridComponent,
    // MatDateRangeComponent,
    // SearchDebounceInputComponent,

  ],

  providers: [
    // { provide: GALLERY_CONFIG, useValue: { dots: true, imageSize: 'cover', previewFullscreen : true } },
    { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
    // {provude: Gallery},
    NgxImageCompressService,
    // KeyboardComponent,

  ],
  // schemas: [NO_ERRORS_SCHEMA],
})

export class SharedModule { }

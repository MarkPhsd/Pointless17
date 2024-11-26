import { NgModule, ClassProvider } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { LoggingInterceptor } from 'src/app/_http-interceptors/loggin.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { CdkTableModule } from '@angular/cdk/table';
import { DndDirective, ScrollableDirective } from 'src/app/_directives/';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { NgPipesModule } from 'ngx-pipes';
import { RouteReuseService } from '../_services/system/route-reuse.service';
import { AdjustItemComponent } from '../modules/posorders/adjust/adjust-item/adjust-item.component';
import { HammerModule } from '@angular/platform-browser';
import { PosPaymentComponent } from '../modules/posorders/pos-payment/pos-payment.component';
import { IonicModule } from '@ionic/angular';
import { NgxStripeModule } from 'ngx-stripe';
import { DashBoardRoutingModule } from '../dash-board-routing.module';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { AngularResizeEventModule } from 'angular-resize-event';
import { NgxPayPalModule } from 'ngx-paypal';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { NgxColorsModule } from 'ngx-colors';
import {NgcCookieConsentModule} from 'ngx-cookieconsent';
import { SharedUiModule } from '../shared-ui/shared-ui.module';
import { SharedUtilsModule } from '../shared-utils/shared-utils.module';
import { AppRoutingModule } from '../app-routing.module';

// import { PosOrderItemEditorComponent } from '../modules/posorders/pos-order/pos-order-items/pos-order-item-edit/pos-order-item-edit.component';

const LOGGING_INTERCEPTOR_PROVIDER: ClassProvider = {
  provide: HTTP_INTERCEPTORS ,
  useClass: LoggingInterceptor,
  multi: true
};

@NgModule({
  declarations: [
    ScrollableDirective,
    DndDirective,
    // NewUserGuestComponent,
    // DefaultComponent,
    // PayAPIComponent,
    // PayAPIFrameComponent,

    // BrandClassEditorComponent,
    // BrandFilterComponent,
    // BrandEditorMainComponent,

    // ResaleClassesEditorComponent,
    // ResaleClassesFilterComponent,
    // ResaleClassesMainComponent,
    // BuySellMainComponent,

    // ItemTypeCategoryAssignmentComponent,
    // ItemTypeDisplayAssignmentComponent,
    // ItemTypeComponent,
    // ItemTypeTogglesEditComponent,
    // ItemTypeEditorComponent,

    // AppWizardStatusComponent,
    // AccordionMenuItemEditComponent,
    // ActivityTogglesComponent,
    // ActivityTogglesMetrcComponent,
    // AdjustItemComponent,


    // AddInventoryItemComponent,
    // AddItemByTypeComponent,
    // AgPaginationComponent,

    // BalanceSheetsComponent,
    // BalanceSheetFilterComponent,
    // BalanceSheetEditComponent,
    // BalanceSheetQuickViewComponent,

    // BrandslistComponent,

    // CategoriesComponent,
    // CategorieslistviewComponent,
    // CashPaymentButtonComponent,
    // CheckInProfileComponent,
    // ClientInfoComponent,
    // ClientTypeSelectionComponent,
    // CloseDayValidationComponent,
    // // CreditCardPaymentsPrintListComponent,

    // CookieConsentComponent,
    // //adminModule
    // AdminbranditemComponent,
    // AdminbrandslistComponent,
    // AdminDisplayMenuListComponent,
    // AdminDisplayMenuComponent,
    // AdminDisplayMenuSelctorComponent,

    // BlogListEditComponent,
    // BlogPostEditComponent,
    // BlogPostSortComponent,

    // ClientTypeListComponent,
    // ClientTypeEditComponent,
    // CompanyEditComponent,

    // ClockBreaksTypesComponent,

    // DailyReportComponent,
    // DevxReportDesignerComponent,
    // ReportViewerComponent,
    // InventoryMenuItemComponent,

    // MessageEditorListComponent,
    // MessageEditorComponent,
    // ManifestEditorHeaderComponent,
    // ManifestsComponent,
    // MainfestFilterComponent,
    // MainfestEditorComponent,

    // ManifestStatusComponent,
    // ManifestTypeComponent,
    // FacilitiesListComponent,

    // FlatRateEditComponent,
    // FlatRateListComponent,
    // FlatTaxRateListComponent,

    // PaymentMethodListComponent,
    // PaymentMethodSettingsComponent,
    // PaymentMethodEditComponent,
    // PayPalTransactionComponent,
    // PosOrderItemListComponent,
    // PurchaseItemSalesComponent,
    // PurchaseItemCostHistoryComponent,
    // PriceCategoriesEditComponent,
    // PriceCategoryPriceFieldsComponent,
    // PriceCategoryConversionsComponent,


    // PriceCategoryTimeFiltersComponent,
    // LinkedPriceSelectorComponent,
    // PriceCategoriesComponent,

    // WicEBTCardPayBtnComponent,
    // TriPOSCardPayBtnComponent,
    // StripeCardPayBtnComponent,
    // PaypalCardPayBtnComponent,
    // GiftCardPayBtnComponent,
    // CardPointeCardPayBtnComponent,

    // ItemsMainComponent,
    // ItemsFilterComponent,

    // PointlessMETRCSalesComponent,
    // MetrcSalesFilterComponent,

    // PriceTierEditComponent,
    // PriceTiersComponent,
    // UnitTypeListComponent,
    // UnitTypeEditComponent,
    // UnitTypePromptComponent,


    // UnitTypeSelectComponent,
    // ProductSelectorComponent,
    // PartBuilderSelectorComponent,
    // ServiceTypeEditComponent,
    // ServiceTypeListComponent,


    // StrainsAddComponent,
    // StrainPackagesComponent,

    // StrainProductEditComponent,

    // ServiceTypeEditComponent,
    // ServiceTypeListComponent,

    // StoreCreditEditorComponent,
    // StoreCreditListComponent,


    // CatalogScheduleInfoComponent,
    // CatalogScheduleInfoListComponent,
    // DisplayMenuMainComponent,

    // DisplayMenuListComponent,
    // DisplayMenuTitleComponent,
    // DisplayMenuSortComponent,

    // MenuSectionComponent,
    // DiscountOptionsComponent,
    // DemographicsComponent,
    // DiscountTypeSelectionComponent,

    // DSIEMVTransactionComponent,
    // DCAPTransactionComponent,
    // EditSelectedItemsComponent,
    // EditCSSStylesComponent,
    // EditSettingsComponent,
    // EmployeeLookupComponent,
    // EmployeeDetailsPanelComponent,
    // EmployeeEditComponent,
    // EmployeeFilterPanelComponent,
    // EmployeeListComponent,
    // EmployeeMetrcKeyEntryComponent,

    // EmployeeSelectPopUpComponent,

    // FunctionGroupListComponent,
    // FunctionGroupEditComponent,
    // FunctionGroupButtonEditComponent,

    // HTMLEditPrintingComponent,

    // JobTypesEditComponent,
    // JobTypesListComponent,

    // HouseAccountsListComponent,
    // InventoryLocationsComponent,
    // InventoryListComponent,
    // InventoryHistoryListComponent,

    // InventoryHeaderValuesComponent,
    // InventoryHistoryItemComponent,
    // InventoryCountsViewComponent,
    // SearchInventoryInputComponent,

    // ItemCategoriesListComponent,
    // ItemSortComponent,
    // ItemCategoriesEditComponent,


    // MenuGroupItemEditComponent,

    // MenuitemComponent,
    // MenuItemCardComponent,
    // MenuItemExtendedPricesComponent,
    // MenuItemProductCountComponent,
    // MenuManagerComponent,
    // InventoryMenuItemComponent,

    // MessagesToUserComponent,
    // MetrcIndividualPackageComponent,
    // MetrcInventoryPropertiesComponent,
    // MainMenuComponent,
    // MetrcIntakeHeaderComponent,
    // MenuItemsInfiniteComponent,
    // MetrcSalesListComponent,
    // METRCProductsAddComponent,
    // MetrcRequirementsComponent,

    // MenuBoardComponent,
    // MenuItemModalComponent,
    // NewInventoryItemComponent,

    // EbayAspectsComponent,
    // EbayPublishProductComponent,

    // NumericDirective,
    // OrderItemsListComponent,
    // OrderItemListComponent,
    // OrderBarComponent,
    // OrderTypeSelectionComponent,
    // OrderCardComponent,
    // OrderPrepComponent,
    // OrderCardsComponent,
    // OrderFilterPanelComponent,
    // OrdersListComponent,
    // OrdersMainComponent,
    // OrderPanelComponent,
    // TransferOrderComponent,

    // QrPaymentComponent,
    // PayAPIComponent,
    // PayAPIFrameComponent,

    // PartBuilderMainComponent,
    // PartBuilderEditComponent,
    // PartBuilderFilterComponent,
    // PartBuilderComponentEditComponent,
    // PartBuilderUsageListComponent,
    // PartBuilderTreeComponent,

    // PackageListComponent,
    // PackageSearchSelectorComponent,

    // PriceCategoryMultiplePricesComponent,
    // POSSplitItemsComponent,
    // PosSplitOrdersComponent,
    // PosSplitGroupsComponent,
    // PosOrderEditorComponent,

    // PrintGroupReceiptComponent,
    // PrepOrderComponent,
    // PrepContainerComponent,
    // PrepOrderFilterComponent,
    // PrepOrderItemComponent,
    // PriceTierLineEditComponent,


    // ProductListByBarcodeComponent,
    // TVPriceTiersComponent,
    // PosListComponent,
    // PosEditSettingsComponent,

    // DcDirectSettingsComponent,
    // PosOrderComponent,
    // PosOrderItemEditorComponent,
    // PosOrderItemEditComponent,
    // NewOrderItemComponent,
    // PosOrderListComponent,


    PosPaymentComponent,

    // POSOrderScheduleComponent,
    // POSOrderServiceTypeComponent,
    // POSOrderShippingAddressComponent,
    // PosOrderItemCalcValuesComponent,
    // PosOrderNotesComponent,
    // POSOrderScheduleFormComponent,
    // PosOrderPriceScheduleInfoComponent,
    // PosOrderScheduleDescriptionComponent,
    // PosOrderBoardComponent,
    // PriceOptionsComponent,

    // PriceScheduleComponent,
    // PriceScheduleListComponent,
    // PriceScheduleConstraintsComponent,
    // PriceScheduleInfoComponent,
    // PriceScheduleFieldsComponent,
    // PriceScheduleMenuOptionsComponent,
    // PriceScheduleMenuItemsComponent,
    // PriceScheduleSortComponent,
    // QuickPayButtonsComponent,
    // ProfileRolesComponent,
    // ProfileListComponent,
    // ProfileComponent,

    // ProfileDemographicsComponent,
    // ProfileEditorComponent,
    // ProfileIDCardInfoComponent,
    // ProfileLookupComponent,
    // PasswordValidationComponent,
    // ProducteditComponent,
    // ProductlistviewComponent,
    // ProductInfoPanelComponent,
    // LabelSelectPrinterComponent,

    // PromptGroupsComponent,
    // PromptGroupEditComponent,
    // PromptSubGroupEditComponent,
    // PromptSubGroupsComponent,
    // PromptInfoPanelComponent,
    // PromptItemSelectionComponent,
    // PromptSelectedItemsComponent,
    // PromptSubGroupAssociationComponent,
    // PromptKitsComponent,

    // PromptGroupSelectComponent,
    // PromptWalkThroughComponent,
    // PromptSubGroupPanelComponent,
    // PromptPanelMenuItemsComponent,
    // PromptPanelMenuItemComponent,
    // PromptItemsSelectedComponent,
    // PSMenuGroupListComponent,
    // PSMenuGroupEditComponent,

    // RecieptPopUpComponent,
    // ReportsComponent,
    // RequiresSerialComponent,
    // ReviewComponent,
    // ReviewsComponent,
    // ReviewEditComponent,
    // RewardTypeFilterComponent,
    // RewardTypeResultsSelectorComponent,

    // SearchPanelComponent,

    // ScheduledMenuContainerComponent,
    // ScheduledMenuItemsComponent,
    // ScheduledMenuHeaderComponent,
    // ScheduledMenuListComponent,
    // ScheduledMenuItemComponent,
    // ScheduledMenuImageComponent,
    // SearchResultsComponent,

    // SitepointsComponent,
    // SitepurchasesComponent,

    // SitesComponent,
    // StickyHeaderComponent,
    // StoreCreditIssueComponent,
    // StoreCreditPopUpComponent,

    // MenuItemCardDashboardComponent,

    // TaxEditComponent,
    // TaxListComponent,
    // TaxRateListComponent,
    // TierMenuComponent,

    // TriPosTransactionsComponent,
    // TriposSettingsComponent,
    // TypeFilterComponent,
    // TypeResultsSelectorComponent,
    // TypeBoardComponent,


    // UsermessagesComponent,
    // UseGroupTaxAssignmentComponent,
    // WeekDaySelectionComponent,
    // WishlistComponent,

    // CardPointIDTECHAndroidComponent,
    // CardpointeTransactionsComponent,

    // DsiEMVAndroidComponent,


    // DSIAndroidSettingsComponent,
    // DsiAndroidResultsComponent,
    // EditSettingsComponent,

    // DateScheduleComponent,
    // TimeScheduleComponent,
    //
   ],

   imports: [
      DashBoardRoutingModule,
      AngularResizeEventModule,
      AppRoutingModule,
      AppMaterialModule,
      BrowserAnimationsModule,
      CommonModule,
      CdkTableModule,
      FormsModule,
      HammerModule,
      IonicModule.forRoot(),
      InfiniteScrollModule,
      NgPipesModule,
      ReactiveFormsModule,
      RouterModule,

      SharedModule,
      SharedUtilsModule,
      SharedUiModule,

      NgxStripeModule.forRoot(),
      NgxCsvParserModule,
      NgxPayPalModule,
      NgxJsonViewerModule,
      NgxColorsModule,
      FormsModule,
      NgcCookieConsentModule,
      // KeyboardButtonComponent,
      // KeyboardComponent,

      // StrainCardComponent,
      // StrainBoardComponent, //imported in menu board

    ],

  exports: [
    AdjustItemComponent,
    BrowserAnimationsModule,
    RouterModule,
    HammerModule,
    NgxPayPalModule,
    NgxJsonViewerModule,
    NgxColorsModule,
    SharedModule,
    // KeyboardButtonComponent,
    // KeyboardComponent,
  ],

  providers: [
    AgGridService,
    DatePipe,
    LoggingInterceptor,
    {provide: RouteReuseStrategy , useClass: RouteReuseService},
  ],
})

export class DefaultModule { }

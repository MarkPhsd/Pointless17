import { NgModule, ClassProvider } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { SitesComponent } from 'src/app/modules/sites/sites.component';
import { ProfileComponent } from 'src/app/modules/profile/profile.component';
import { LoggingInterceptor } from 'src/app/_http-interceptors/loggin.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DefaultComponent } from './default.component';
import { CdkTableModule } from '@angular/cdk/table';
import { SitepurchasesComponent } from 'src/app/modules/profile/details/sitepurchases/sitepurchases.component';
import { SitepointsComponent } from 'src/app/modules/profile/details/sitepoints/sitepoints.component';
import { CategoriesComponent } from 'src/app/modules/menu/categories/categories.component';
import { ProducteditComponent } from 'src/app/modules/admin/products/productedit/productedit.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { UsermessagesComponent } from 'src/app/shared/widgets/usermessages/usermessages.component';
import { WishlistComponent } from 'src/app/modules/profile/wishlist/wishlist.component';
import { DndDirective, ScrollableDirective } from 'src/app/_directives/';
import { CategorieslistviewComponent } from 'src/app/modules/admin/products/categorieslistview/categoriestlistview.component';
import { MenuitemComponent } from 'src/app/modules/menu/menuitem/menuitem.component';

import { BrandslistComponent } from 'src/app/modules/menu/brandslist/brandslist.component';
import { MenuItemCardComponent } from 'src/app/modules/menu/menuitems/menu-item-card/menu-item-card.component';
import { ProfileEditorComponent } from 'src/app/modules/admin/profiles/profile-editor/profile-editor.component';
import { CheckInProfileComponent } from 'src/app/modules/admin/profiles/check-in-profile/check-in-profile.component';
import { ProfileLookupComponent } from 'src/app/modules/admin/profiles/profile-lookup/profile-lookup.component';
import { ProfileListComponent } from 'src/app/modules/admin/profiles/profile-list/profile-list.component';
import { DemographicsComponent } from 'src/app/modules/profile/demographics/demographics.component';
import { ImageCaptureComponent } from 'src/app/shared/widgets/image-capture/image-capture.component';
import { MessagesToUserComponent } from 'src/app/modules/profile/messages-to-user/messages-to-user.component';
import { SearchResultsComponent } from 'src/app/modules/menu/search-results/search-results.component';
import { AdminComponent } from 'src/app/modules/admin/admin.component';
import { SettingsComponent } from 'src/app/modules/admin/settings/settings.component';
import { PosListComponent } from 'src/app/modules/admin/settings/pos-list/pos-list.component';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ProductlistviewComponent } from 'src/app/modules/admin/products/productlistview/productlistview.component';
import { SiteEditComponent } from 'src/app/modules/admin/settings/site-edit/site-edit.component';
import { ReviewEditComponent } from 'src/app/modules/reviews/review-edit/review-edit.component';
import { ReviewComponent } from 'src/app/modules/reviews/review/review.component';
import { ReviewsComponent } from 'src/app/modules/reviews/reviews.component';
import { PosOrderListComponent } from 'src/app/modules/posorders/pos-order-list/pos-order-list.component';
import { StickyHeaderComponent } from 'src/app/_components/sticky-header.component';
import { ReportsComponent } from 'src/app/modules/admin/reports/reports.component';
import { OrderItemsListComponent } from 'src/app/modules/posorders/order-items-list/order-items-list.component';
import { OrderItemListComponent } from 'src/app/modules/posorders/order-items-list/order-item-list/order-item-list.component';
import { MainMenuComponent } from 'src/app/modules/menu/mainMenu/main-menu/main-menu.component';
import { OrderBarComponent } from 'src/app/shared/components/order-bar/order-bar.component';
import { PosOrderComponent } from 'src/app/modules/posorders/pos-order/pos-order.component';
import { MenuItemModalComponent } from 'src/app/modules/menu/menuitems/menu-item-card/menu-item-modal/menu-item-modal.component';
import { TierItemsComponent } from '../modules/menu/tierMenu/tier-items/tier-items.component';
import { TierPricesComponent } from '../modules/menu/tierMenu/tier-prices/tier-prices.component';
import { TierMenuComponent } from '../modules/menu/tierMenu/tier-menu/tier-menu.component';
import { PriceCategoriesEditComponent } from '../modules/admin/products/pricing/price-categories-edit/price-categories-edit.component';
import { PriceCategoriesComponent } from '../modules/admin/products/pricing/price-categories/price-categories.component';
import { PackageListComponent } from '../modules/admin/metrc/packages/package-list.component';
import { StrainsAddComponent } from '../modules/admin/metrc/packages/strains-add/strains-add.component';
import { METRCProductsAddComponent } from '../modules/admin/metrc/packages/metrc-products-add/products-add.component';
import { InventoryLocationsComponent } from '../modules/admin/inventory/inventory-locations/inventory-locations.component';
import { ItemCategoriesListComponent } from '../modules/admin/metrc/items/item-categories-list/item-categories-list.component';
import { ItemCategoriesEditComponent } from '../modules/admin/metrc/items/item-categories-edit/item-categories-edit.component';
import { InventoryListComponent } from '../modules/admin/inventory/inventory-list/inventory-list/inventory-list.component';
import { MetrcSalesListComponent } from '../modules/admin/metrc/metrc-sales-list/metrc-sales-list.component';
// import { StrainProductEditComponent } from '../modules/admin/products/productedit/strain-product-edit/strain-product-edit.component';
import { ItemTypeComponent } from '../modules/admin/products/item-type/item-type.component';
import { ItemTypeEditorComponent } from '../modules/admin/products/item-type/item-type-editor/item-type-editor.component';
// import { FlatRateEditComponent } from '../modules/admin/products/flatRate/flat-rate-edit/flat-rate-edit.component';
// import { FlatRateListComponent } from '../modules/admin/products/flatRate/flat-rate-list/flat-rate-list.component';
// import { FlatTaxRateListComponent } from '../modules/admin/products/item-type/flat-tax-rate-list/flat-tax-rate-list.component';
import { TaxRateListComponent } from '../modules/admin/products/item-type/tax-rate-list/tax-rate-list.component';
import { TaxEditComponent } from '../modules/admin/products/taxes/tax-edit/tax-edit.component';
import { TaxListComponent } from '../modules/admin/products/taxes/tax-list/tax-list.component';

import { DatabaseSchemaComponent } from '../modules/admin/settings/database/database-schema/database-schema.component';
import { CSVImportComponent } from '../modules/admin/settings/database/csv-import/csv-import.component';
// import { ProductFilterComponent } from './widgets/product-filter/product-filter.component';
// import { CategorySelectListFilterComponent } from './widgets/category-select-list-filter/category-select-list-filter.component';

import { InstalledPrintersComponent } from '../modules/admin/settings/printing/installed-printers/installed-printers.component';
import { MenuItemsInfiniteComponent } from '../modules/menu/menuitems/menu-items-infinite/menu-items-infinite.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { HTMLEditPrintingComponent } from '../modules/admin/settings/printing/htmledit-printing/htmledit-printing.component';
import { ReceiptLayoutComponent } from '../modules/admin/settings/printing/receipt-layout/receipt-layout.component';
import { CacheSettingsComponent } from '../modules/admin/settings/database/cache-settings/cache-settings.component';
import { InventoryHistoryListComponent } from '../modules/admin/inventory/inventory-history-list/inventory-history-list.component';
import { InventoryHistoryItemComponent } from '../modules/admin/inventory/inventory-history-item/inventory-history-item.component';
import { LabelViewSelectorComponent } from '../modules/admin/settings/printing/label-view-selector/label-view-selector.component';
import { InventoryComponent } from '../modules/admin/settings/inventory/inventory.component';
import { StrainPackagesComponent } from '../modules/admin/metrc/packages/strains-add/strain-packages/strain-packages.component';
import { MetrcIndividualPackageComponent } from '../modules/admin/metrc/packages/metrc-individual-package/metrc-individual-package.component';
import { NgPipesModule } from 'ngx-pipes';
import { NewInventoryItemComponent } from '../modules/admin/inventory/new-inventory-item/new-inventory-item.component';
import { PriceScheduleComponent } from '../modules/admin/products/price-schedule/price-schedule.component';
import { WeekDaySelectionComponent } from '../modules/admin/products/price-schedule/time/week-day-selection/week-day-selection.component';
import { OrderTypeSelectionComponent } from '../modules/admin/products/price-schedule/order-type-selection/order-type-selection.component';
import { ClientTypeSelectionComponent } from '../modules/admin/products/price-schedule/client-type-selection/client-type-selection.component';
import { MetrcInventoryPropertiesComponent } from '../modules/admin/metrc/packages/metrc-inventory-properties/metrc-inventory-properties.component';
import { AddInventoryItemComponent } from '../modules/admin/inventory/add-inventory-item/add-inventory-item.component';
import { TimeScheduleComponent } from '../modules/admin/products/price-schedule/time/time-schedule/time-schedule.component';
import { DateScheduleComponent } from '../modules/admin/products/price-schedule/time/date-schedule/date-schedule.component';
import { PriceScheduleInfoComponent } from '../modules/admin/products/price-schedule/price-schedule-info/price-schedule-info.component';
import { DiscountOptionsComponent } from '../modules/admin/products/price-schedule/discounts/discount-options/discount-options.component';
import { DiscountTypeSelectionComponent } from '../modules/admin/products/price-schedule/discounts/discount-type-selection/discount-type-selection.component';
import { TypeFilterComponent } from '../modules/admin/products/price-schedule/item-selections/type-filter/type-filter.component';
import { SearchPanelComponent } from '../modules/admin/products/price-schedule/item-selections/search-panel/search-panel.component';
import { AccordionMenuItemEditComponent } from '../modules/admin/settings/menus-manager/accordion-menu-item-edit/accordion-menu-item-edit.component';
import { MenuManagerComponent } from '../modules/admin/settings/menus-manager/menu-manager/menu-manager.component';
import { PriceScheduleConstraintsComponent } from '../modules/admin/products/price-schedule/price-schedule-constraints/price-schedule-constraints.component';
import { MenuGroupItemEditComponent } from '../modules/admin/settings/menus-manager/menu-group-item-edit/menu-group-item-edit.component';

import { TypeResultsSelectorComponent } from '../modules/admin/products/price-schedule/item-selections/type-results-selector/type-results-selector.component';
import { EditSelectedItemsComponent } from '../modules/admin/products/productedit/edit-selected-items/edit-selected-items.component';
import { AddItemByTypeComponent } from '../modules/admin/products/productedit/add-item-by-type/add-item-by-type.component';
import { AgPaginationComponent } from '../shared/widgets/ag-pagination/ag-pagination.component';
import { RewardTypeFilterComponent } from '../modules/admin/products/price-schedule/rewards/reward-type-filter/reward-type-filter.component';
import { RewardTypeResultsSelectorComponent } from '../modules/admin/products/price-schedule/rewards/reward-type-results-selector/reward-type-results-selector.component';
import { PriceScheduleFieldsComponent } from '../modules/admin/products/price-schedule/price-schedule-info/price-schedule-fields/price-schedule-fields.component';
import { ProductInfoPanelComponent } from '../modules/admin/products/product-info-panel/product-info-panel.component';

import { UseGroupTaxAssignmentComponent } from '../modules/admin/products/item-type/use-group-tax-assignment/use-group-tax-assignment.component';
import { PriceScheduleListComponent } from '../modules/admin/products/price-schedule/price-schedule-list/price-schedule-list.component';

import { RouteReuseService } from '../_services/system/route-reuse.service';
import { OrderFilterPanelComponent } from '../modules/orders/order-filter-panel/order-filter-panel.component';
import { OrderCardComponent } from '../modules/orders/order-card/order-card.component';
import { OrdersMainComponent } from '../modules/orders/orders-main/orders-main.component';
import { PackageSearchSelectorComponent } from '../shared/widgets/package-search-selector/package-search-selector.component';
import { AdjustItemComponent } from '../modules/posorders/adjust/adjust-item/adjust-item.component';
import { HammerModule } from '@angular/platform-browser';
import { PaymentMethodListComponent } from '../modules/admin/transactions/paymentMethods/payment-method-list/payment-method-list.component';
import { PaymentMethodEditComponent } from '../modules/admin/transactions/paymentMethods/payment-method-edit/payment-method-edit.component';
import { PosPaymentsFilterComponent } from '../modules/transactions/pos-payments-main/pos-payments-filter/pos-payments-filter.component';
import { PosPaymentComponent } from '../modules/posorders/pos-payment/pos-payment.component';
import { POSPaymentsComponent } from '../modules/transactions/pos-payments-main/pospayments/pospayments.component';
import { IonicModule } from '@ionic/angular';
import { BalanceSheetsComponent } from '../modules/transactions/balanceSheets/balance-sheets/balance-sheets.component';
import { BalanceSheetEditComponent } from '../modules/transactions/balanceSheets/balance-sheet-edit/balance-sheet-edit.component';
import { BalanceSheetFilterComponent } from '../modules/transactions/balanceSheets/balance-sheet-filter/balance-sheet-filter.component';
import { EmployeeLookupComponent } from '../modules/admin/profiles/parts/employee-lookup/employee-lookup.component';

import { PromptWalkThroughComponent } from '../modules/posorders/prompt-walk-through/prompt-walk-through.component';
import { PromptSubGroupPanelComponent } from '../modules/posorders/prompt-walk-through/prompt-sub-group-panel/prompt-sub-group-panel.component';
import { PromptPanelMenuItemsComponent } from '../modules/posorders/prompt-walk-through/prompt-sub-group-panel/prompt-panel-menu-items/prompt-panel-menu-items.component';
import { PromptPanelMenuItemComponent } from '../modules/posorders/prompt-walk-through/prompt-sub-group-panel/prompt-panel-menu-items/prompt-panel-menu-item/prompt-panel-menu-item.component';
import { PromptGroupSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/prompt-group-select/prompt-group-select.component';
import { PromptItemsSelectedComponent } from '../modules/posorders/prompt-walk-through/prompt-items-selected/prompt-items-selected.component';

import { EmployeeListComponent } from '../modules/admin/employees/employee-list/employee-list.component';
import { EmployeeFilterPanelComponent } from '../modules/admin/employees/employee-filter-panel/employee-filter-panel.component';
import { EmployeeEditComponent } from '../modules/admin/employees/employee-edit/employee-edit.component';
import { EmployeeDetailsPanelComponent } from '../modules/admin/employees/employee-details-panel/employee-details-panel.component';
import { RecieptPopUpComponent } from '../modules/admin/settings/printing/reciept-pop-up/reciept-pop-up.component';
import { EditCSSStylesComponent } from '../modules/admin/settings/printing/edit-cssstyles/edit-cssstyles.component';
import { PosOperationsComponent } from '../modules/transactions/operations/pos-operations/pos-operations.component';
import { PosOrderItemEditComponent } from '../modules/posorders/pos-order-item/pos-order-item-edit/pos-order-item-edit.component';
import { EditSettingsComponent } from '../modules/admin/transactions/paymentMethods/edit-settings/edit-settings.component';
import { PaymentMethodSettingsComponent } from '../modules/admin/transactions/paymentMethods/payment-method-settings/payment-method-settings.component';

import { UITransactionsComponent } from '../modules/admin/settings/software/UISettings/uitransactions/uitransactions.component';
import { ListPrintersElectronComponent } from '../modules/admin/settings/printing/list-printers-electron/list-printers-electron.component';
import { DefaultReceiptSelectorComponent } from '../modules/admin/settings/printing/default-receipt-selector/default-receipt-selector.component';
import { RequiresSerialComponent } from '../modules/posorders/requires-serial/requires-serial.component';
import { BalanceSheetCalculationsViewComponent } from '../modules/transactions/balanceSheets/balance-sheet-calculations-view/balance-sheet-calculations-view.component';
import { BalanceSheetHeaderViewComponent } from '../modules/transactions/balanceSheets/balance-sheet-header-view/balance-sheet-header-view.component';
import { BalanceSheetQuickViewComponent } from '../modules/transactions/balanceSheets/balance-sheet-quick-view/balance-sheet-quick-view.component';
import { PriceOptionsComponent } from '../modules/posorders/price-options/price-options.component';
import { ProfileDemographicsComponent } from '../modules/admin/profiles/parts/demographics/demographics.component';
import { ProfileIDCardInfoComponent } from '../modules/admin/profiles/parts/profile-idcard-info/profile-idcard-info.component';
import { OrderCardsComponent } from '../modules/orders/order-cards/order-cards.component';
import { OrdersListComponent } from '../modules/orders/orders-list/orders-list.component';
import { PriceTierLineEditComponent } from '../modules/admin/products/price-tiers/price-tier-line-edit/price-tier-line-edit.component';
import { TVPriceTiersComponent } from '../modules/tv-menu/price-tiers/price-tiers.component';
import { TiersWithPricesComponent } from '../modules/menu/tierMenu/tiers-with-prices/tiers-with-prices.component';

import { ItemSortComponent } from '../modules/admin/products/price-schedule/item-selections/item-sort/item-sort.component';

import { MenuItemExtendedPricesComponent } from '../modules/menu/menuitem/menu-item-extended-prices/menu-item-extended-prices.component';
import { ScheduledMenuContainerComponent } from '../modules/menu/scheduleMenus/scheduled-menu-container/scheduled-menu-container.component';
import { ScheduledMenuItemsComponent } from '../modules/menu/scheduleMenus/scheduled-menu-items/scheduled-menu-items.component';
import { ScheduledMenuItemComponent } from '../modules/menu/scheduleMenus/scheduled-menu-items/scheduled-menu-item/scheduled-menu-item.component';
import { ScheduledMenuHeaderComponent } from '../modules/menu/scheduleMenus/scheduled-menu-container/scheduled-menu-header/scheduled-menu-header.component';
import { ScheduledMenuListComponent } from '../modules/menu/scheduleMenus/scheduled-menu-list/scheduled-menu-list.component';

import { ActivityTogglesComponent } from '../modules/admin/products/productedit/_product-edit-parts/activity-toggles/activity-toggles.component';
import { ItemTypeTogglesEditComponent } from '../modules/admin/products/item-type/item-type-editor/item-type-toggles-edit/item-type-toggles-edit.component';

import { ActivityTogglesMetrcComponent } from '../modules/admin/metrc/packages/metrc-inventory-properties/activity-toggles-metrc/activity-toggles-metrc.component';
import { MetrcIntakeHeaderComponent } from '../modules/admin/metrc/packages/metrc-inventory-properties/metrc-intake-header/metrc-intake-header.component';
import { SearchInventoryInputComponent } from '../modules/admin/inventory/inventory-list/inventory-list/search-inventory-input/search-inventory-input.component';
import { POSOrderServiceTypeComponent } from '../modules/posorders/posorder-service-type/posorder-service-type.component';
import { POSOrderScheduleComponent } from '../modules/posorders/posorder-schedule/posorder-schedule.component';
import { POSOrderShippingAddressComponent } from '../modules/posorders/posorder-shipping-address/posorder-shipping-address.component';
import { InventoryCountsViewComponent } from '../modules/admin/inventory/inventory-counts-view/inventory-counts-view.component';
import { InventoryHeaderValuesComponent } from '../modules/admin/inventory/inventory-header-values/inventory-header-values.component';
import { EmployeeMetrcKeyEntryComponent } from '../modules/admin/employees/employee-metrc-key-entry/employee-metrc-key-entry.component';
import { TierPriceLineComponent } from '../modules/menu/tierMenu/tiers-with-prices/tier-price-line/tier-price-line.component';
import { ProfileRolesComponent } from '../modules/admin/profiles/profile-roles/profile-roles.component';
import { MenuItemProductCountComponent } from '../modules/menu/menuitem/menu-item-product-count/menu-item-product-count.component';
import { OrderPanelComponent } from '../modules/orders/order-panel/order-panel.component';
import { PosOrderNotesComponent } from '../modules/posorders/pos-order-notes/pos-order-notes.component';
import { POSOrderScheduleFormComponent } from '../modules/posorders/posorder-schedule-form/posorder-schedule-form.component';
import { FunctionGroupButtonEditComponent } from '../modules/admin/settings/function-groups/function-group-edit/function-group-button-edit/function-group-button-edit.component';
import { FunctionGroupEditComponent } from '../modules/admin/settings/function-groups/function-group-edit/function-group-edit.component';
import { FunctionGroupListComponent } from '../modules/admin/settings/function-groups/function-group-list/function-group-list.component';
import { PrepContainerComponent } from '../modules/prep/prep-container/prep-container.component';
import { PrepOrderComponent } from '../modules/prep/prep-order/prep-order.component';
import { PrepOrderFilterComponent } from '../modules/prep/prep-order-filter/prep-order-filter.component';
import { PrepOrderItemComponent } from '../modules/prep/prep-order-item/prep-order-item.component';
import { PosOrderPriceScheduleInfoComponent } from '../modules/posorders/pos-order-price-schedule-info/pos-order-price-schedule-info.component';
import { PosOrderScheduleDescriptionComponent } from '../modules/posorders/pos-order-price-schedule-info/pos-order-schedule-description/pos-order-schedule-description.component';
import { ScheduledMenuImageComponent } from '../modules/menu/scheduleMenus/scheduled-menu-container/scheduled-menu-image/scheduled-menu-image.component';
import { StrainBoardComponent } from '../modules/tv-menu/strainBoard/strain-board/strain-board.component';
import { StrainCardComponent } from '../modules/tv-menu/strainBoard/strain-card/strain-card.component';
import { TypeBoardComponent } from '../modules/tv-menu/type-board/type-board.component';
import { TypeBoardItemsComponent } from '../modules/tv-menu/type-board-items/type-board-items.component';
import { MenuBoardComponent } from '../modules/tv-menu/menu-board/menu-board.component';
import { StripeSettingsComponent } from '../modules/admin/settings/stripe-settings/stripe-settings.component';
import { NgxStripeModule } from 'ngx-stripe';
import { StripeCheckOutComponent } from '../modules/admin/settings/stripe-settings/stripe-check-out/stripe-check-out.component';
import { DSIEMVTransactionComponent } from '../modules/dsiEMV/transactions/dsiemvtransaction/dsiemvtransaction.component';

import { PosOrderBoardComponent } from '../modules/posorders/pos-order/pos-order-board/pos-order-board.component';
import { MenuItemCardDashboardComponent } from '../modules/menu/menu-item-card/menu-item-card.component';
import { DashBoardRoutingModule } from '../dash-board-routing.module';
import { OrderPrepComponent } from '../modules/orders/order-prep/order-prep.component';
import { POSSplitItemsComponent } from '../modules/posorders/pos-payment/possplit-items/possplit-items.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';
// import { ExportDataComponent } from '../modules/admin/settings/database/export-data/export-data.component';
import { PosEditSettingsComponent } from '../modules/admin/settings/pos-list/pos-edit-settings/pos-edit-settings.component';
import { ReceiptViewComponent } from '../modules/admin/settings/printing/reciept-pop-up/receipt-view/receipt-view.component';

import { StoreCreditPopUpComponent } from '../modules/posorders/pos-payment/store-credit-pop-up/store-credit-pop-up.component';
import { StoreCreditIssueComponent } from '../modules/posorders/pos-order/store-credit-issue/store-credit-issue.component';
import { BalanceSheetViewComponent } from '../modules/admin/settings/printing/balance-sheet-view/balance-sheet-view.component';
import { CloseDayValidationComponent } from '../modules/transactions/operations/pos-operations/close-day-validation/close-day-validation.component';
import { PasswordValidationComponent } from '../modules/admin/profiles/password-validation/password-validation.component';
import { CreditCardPaymentsPrintListComponent } from '../modules/transactions/balanceSheets/credit-card-payments-print-list/credit-card-payments-print-list.component';
import { AngularResizeEventModule } from 'angular-resize-event';
import { ProductListByBarcodeComponent } from '../modules/menu/product-list-by-barcode/product-list-by-barcode.component';
import { AppWizardStatusComponent } from '../modules/admin/settings/software/app-wizard-status/app-wizard-status.component';
import { FloorPlanComponent } from '../modules/floor-plan/floor-plan/floor-plan.component';
import { CardPointSettingsComponent } from '../modules/payment-processing/cardPointe/card-point-settings/card-point-settings.component';
import { CardpointeTransactionsComponent } from '../modules/payment-processing/cardPointe/cardpointe-transactions/cardpointe-transactions.component';
import { CardPointIDTECHAndroidComponent } from '../modules/payment-processing/cardPointe/card-point-idtechandroid/card-point-idtechandroid.component';
import { CpVIVO3300Component } from '../modules/payment-processing/cardPointe/cp-vivo3300/cp-vivo3300.component';
import { DsiAndroidResultsComponent } from '../modules/payment-processing/dsiEMVAndroid/dsi-android-results/dsi-android-results.component';
import { DSIAndroidSettingsComponent } from '../modules/payment-processing/dsiEMVAndroid/dsiandroid-settings/dsiandroid-settings.component';
import { DsiEMVAndroidComponent } from '../modules/payment-processing/dsiEMVAndroid/dsi-emvandroid/dsi-emvandroid.component';
import { ZoomFloorPlanComponent } from '../modules/floor-plan/zoom-floor-plan/zoom-floor-plan.component';
import { SoftwareComponent } from '../modules/admin/settings/software/software.component';

import { PSMenuGroupListComponent } from '../modules/admin/products/price-schedule-menu-groups/psmenu-group-list/psmenu-group-list.component';
import { PSMenuGroupEditComponent } from '../modules/admin/products/price-schedule-menu-groups/psmenu-group-edit/psmenu-group-edit.component';
import { PromptGroupEditComponent } from '../modules/admin/menuPrompt/prompt-groups/prompt-group-edit/prompt-group-edit.component';
import { PromptGroupsComponent } from '../modules/admin/menuPrompt/prompt-groups/prompt-groups.component';
import { PromptInfoPanelComponent } from '../modules/admin/menuPrompt/prompt-groups/prompt-info-panel/prompt-info-panel.component';
import { PromptItemSelectionComponent } from '../modules/admin/menuPrompt/prompt-item-selection/prompt-item-selection.component';
import { PromptSelectedItemsComponent } from '../modules/admin/menuPrompt/prompt-item-selection/prompt-selected-items/prompt-selected-items.component';
import { PromptKitsComponent } from '../modules/admin/menuPrompt/prompt-kits/prompt-kits.component';
import { PromptSubGroupAssociationComponent } from '../modules/admin/menuPrompt/prompt-sub-group-association/prompt-sub-group-association.component';
import { PromptSubGroupEditComponent } from '../modules/admin/menuPrompt/prompt-sub-groups/prompt-sub-group-edit/prompt-sub-group-edit.component';
import { PromptSubGroupsComponent } from '../modules/admin/menuPrompt/prompt-sub-groups/prompt-sub-groups.component';
import { ItemTypeCategoryAssignmentComponent } from '../modules/admin/products/item-type/item-type-category-assignment/item-type-category-assignment.component';
import { ItemTypeDisplayAssignmentComponent } from '../modules/admin/products/item-type/item-type-display-assignment/item-type-display-assignment.component';
import { ExportDataComponent } from '../modules/admin/settings/database/export-data/export-data.component';
import { ClientTypeEditComponent } from '../modules/admin/clients/client-types/client-type-edit/client-type-edit.component';
import { ClientTypeListComponent } from '../modules/admin/clients/client-types/client-type-list/client-type-list.component';
import { CompanyEditComponent } from '../modules/admin/company-edit/company-edit.component';
import { AdminbranditemComponent } from '../modules/admin/products/adminbrandslist/adminbranditem/adminbranditem.component';
import { AdminbrandslistComponent } from '../modules/admin/products/adminbrandslist/adminbrandslist.component';
import { ManifestStatusComponent } from '../modules/admin/inventory/manifest-status/manifest-status.component';
import { ManifestTypeComponent } from '../modules/admin/inventory/manifest-type/manifest-type.component';
import { MainfestEditorComponent } from '../modules/admin/inventory/manifests/mainfest-editor/mainfest-editor.component';
import { ManifestEditorHeaderComponent } from '../modules/admin/inventory/manifests/mainfest-editor/manifest-editor-header/manifest-editor-header.component';
import { MainfestFilterComponent } from '../modules/admin/inventory/manifests/mainfest-filter/mainfest-filter.component';
import { ManifestsComponent } from '../modules/admin/inventory/manifests/manifests.component';
import { ServiceTypeEditComponent } from '../modules/admin/transactions/serviceTypes/service-type-edit/service-type-edit.component';
import { FacilitiesListComponent } from '../modules/admin/metrc/facilities/facilities-list/facilities-list.component';
import { FlatRateEditComponent } from '../modules/admin/products/flatRate/flat-rate-edit/flat-rate-edit.component';
import { FlatRateListComponent } from '../modules/admin/products/flatRate/flat-rate-list/flat-rate-list.component';
import { FlatTaxRateListComponent } from '../modules/admin/products/item-type/flat-tax-rate-list/flat-tax-rate-list.component';
import { PriceTierEditComponent } from '../modules/admin/products/price-tiers/price-tier-edit/price-tier-edit.component';
import { PriceTiersComponent } from '../modules/admin/products/price-tiers/price-tiers.component';
import { PriceCategoryConversionsComponent } from '../modules/admin/products/pricing/price-categories-edit/price-category-conversions/price-category-conversions.component';
import { PriceCategoryPriceFieldsComponent } from '../modules/admin/products/pricing/price-categories-edit/price-category-price-fields/price-category-price-fields.component';
import { PriceCategoryTimeFiltersComponent } from '../modules/admin/products/pricing/price-categories-edit/price-category-time-filters/price-category-time-filters.component';
import { UnitTypePromptComponent } from '../modules/admin/products/pricing/price-categories-edit/unit-type-prompt/unit-type-prompt.component';
import { StrainProductEditComponent } from '../modules/admin/products/productedit/strain-product-edit/strain-product-edit.component';
import { UnitTypeSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/unit-type-select/unit-type-select.component';
import { UnitTypeEditComponent } from '../modules/admin/products/unit-type-list/unit-type-edit/unit-type-edit.component';
import { UnitTypeListComponent } from '../modules/admin/products/unit-type-list/unit-type-list.component';
import { SiteEditFormComponent } from '../modules/admin/settings/site-edit/site-edit-form/site-edit-form.component';
import { StoreCreditEditorComponent } from '../modules/admin/store-credit/store-credit-editor/store-credit-editor.component';
import { StoreCreditListComponent} from '../modules/admin/store-credit/store-credit-list/store-credit-list.component';
import { ServiceTypeListComponent } from '../modules/admin/transactions/serviceTypes/service-type-list/service-type-list.component';
import { PriceScheduleMenuOptionsComponent } from '../modules/admin/products/price-schedule/price-schedule-menu-options/price-schedule-menu-options.component';
import { AdminDisplayMenuListComponent } from '../modules/admin/products/display-menu/display-menu-list/display-menu-list.component';
import { AdminDisplayMenuComponent } from '../modules/admin/products/display-menu/display-menu/display-menu.component';
import { DisplayMenuListComponent } from '../modules/display-menu/display-menu-list/display-menu-list.component';

import { AdminDisplayMenuSelctorComponent } from '../modules/admin/products/display-menu/display-menu/display-menu-selctor/display-menu-selctor.component';
import { DisplayMenuMainComponent } from '../modules/display-menu/display-menu/display-menu-main/display-menu-main.component';
import { DisplayMenuTitleComponent } from '../modules/display-menu/display-menu-title/display-menu-title.component';
import { OrderMethodsService } from '../_services/transactions/order-methods.service';
import { PriceScheduleMenuItemsComponent } from '../modules/priceSchedule/price-schedule-menu-items/price-schedule-menu-items.component';
import { PriceScheduleSortComponent } from '../modules/admin/products/price-schedule/price-schedule-sort/price-schedule-sort.component';
import { DisplayMenuSortComponent } from '../modules/admin/products/display-menu/display-menu-sort/display-menu-sort.component';
import { NgxPayPalModule } from 'ngx-paypal';
import { PayPalTransactionComponent } from '../modules/payment-processing/payPal/pay-pal-transaction/pay-pal-transaction.component';
import { SiteFooterComponent } from '../shared/components/site-footer/site-footer.component';
import { BlogListEditComponent } from '../modules/admin/blogEditor/blog-list-edit/blog-list-edit.component';
import { BlogPostEditComponent } from '../modules/admin/blogEditor/blog-post-edit/blog-post-edit.component';
import { BlogPostSortComponent } from '../modules/admin/blogEditor/blog-post-sort/blog-post-sort.component';
import { PosOrderItemListComponent } from '../modules/posorders/pos-order/pos-order-item-list/pos-order-item-list.component';
import { PrintTemplateComponent } from '../modules/admin/settings/printing/reciept-pop-up/print-template/print-template.component';
import { PrintTemplatePopUpComponent } from '../modules/admin/settings/printing/reciept-pop-up/print-template-pop-up/print-template-pop-up.component';
// import { DxReportDesignerModule, DxReportViewerModule } from 'devexpress-reporting-angular';
import { DevxReportDesignerComponent } from '../modules/admin/devx-reporting/devx-report-designer/devx-report-designer.component';
import { ReportViewerComponent } from '../modules/admin/devx-reporting/report-viewer/report-viewer.component';
import { JobTypesEditComponent } from '../modules/admin/clients/jobs/job-types-edit/job-types-edit.component';
import { JobTypesListComponent } from '../modules/admin/clients/jobs/job-types-list/job-types-list.component';
import { BalanceSheetEmployeeSalesComponent } from '../modules/transactions/balanceSheets/balance-sheet-edit/balance-sheet-employee-sales/balance-sheet-employee-sales.component';
// import { EmployeeClockEditComponent } from '../modules/admin/employeeClockAdmin/employee-clock-edit/employee-clock-edit.component';
// import { EmployeeClockFilterComponent } from '../modules/admin/employeeClockAdmin/employee-clock-filter/employee-clock-filter.component';
// import { EmployeeClockListComponent } from '../modules/admin/employeeClockAdmin/employee-clock-list/employee-clock-list.component';
import { ClockBreaksTypesComponent } from '../modules/admin/employeeClockAdmin/clock-breaks-types/clock-breaks-types.component';
import { DailyReportComponent } from '../modules/admin/settings/printing/daily-report/daily-report.component';
import { QuickPayButtonsComponent } from '../modules/posorders/pos-order/quick-pay-buttons/quick-pay-buttons.component';
import { CardPointeCardPayBtnComponent } from '../modules/posorders/pos-payment/card-pointe-card-pay-btn/card-pointe-card-pay-btn.component';
import { DsiEMVCardPayBtnComponent } from '../modules/posorders/pos-payment/dsi-emvcard-pay-btn/dsi-emvcard-pay-btn.component';
import { GiftCardPayBtnComponent } from '../modules/posorders/pos-payment/gift-card-pay-btn/gift-card-pay-btn.component';
import { PaypalCardPayBtnComponent } from '../modules/posorders/pos-payment/paypal-card-pay-btn/paypal-card-pay-btn.component';
import { StripeCardPayBtnComponent } from '../modules/posorders/pos-payment/stripe-card-pay-btn/stripe-card-pay-btn.component';
import { TriPOSCardPayBtnComponent } from '../modules/posorders/pos-payment/tri-poscard-pay-btn/tri-poscard-pay-btn.component';
import { WicEBTCardPayBtnComponent } from '../modules/posorders/pos-payment/wic-ebtcard-pay-btn/wic-ebtcard-pay-btn.component';
import { DSIEMVAndroidPayBtnComponent } from '../modules/posorders/pos-payment/dsiemvandroid-pay-btn/dsiemvandroid-pay-btn.component';
import { CashPaymentButtonComponent } from '../modules/posorders/pos-payment/cash-payment-button/cash-payment-button.component';
import { TriPosTransactionsComponent } from '../modules/payment-processing/tri-pos-transactions/tri-pos-transactions.component';
import { PointlessMETRCSalesComponent } from '../modules/admin/metrc/pointless-metrcsales/pointless-metrcsales.component';
import { MetrcSalesFilterComponent } from '../modules/admin/metrc/pointless-metrcsales/metrc-sales-filter/metrc-sales-filter.component';
import { PosSplitGroupsComponent } from '../modules/posorders/pos-payment/possplit-items/pos-split-groups/pos-split-groups.component';
import { PrintGroupReceiptComponent } from '../modules/posorders/pos-payment/possplit-items/print-group-receipt/print-group-receipt.component';
import { TriposSettingsComponent } from '../modules/payment-processing/tri-pos-transactions/tripos-settings/tripos-settings.component';
import { NgxJsonViewerModule } from 'ngx-json-viewer';
import { LinkedPriceSelectorComponent } from '../modules/admin/products/pricing/price-categories-edit/linked-price-selector/linked-price-selector.component';
import { PriceCategoryMultiplePricesComponent } from '../modules/admin/products/pricing/price-categories-edit/price-category-multiple-prices/price-category-multiple-prices.component';
import { PurchaseItemSalesComponent } from '../modules/posorders/pos-order/purchase-item-sales/purchase-item-sales.component';
import { PurchaseItemCostHistoryComponent } from '../modules/posorders/pos-order/purchase-item-cost-history/purchase-item-cost-history.component';
import { ClientInfoComponent } from '../modules/posorders/client-info/client-info.component';
import { NgxColorsModule } from 'ngx-colors';
import { PartBuilderEditComponent } from '../modules/admin/products/part-builder/part-builder-edit/part-builder-edit.component';
import { PartBuilderMainComponent } from '../modules/admin/products/part-builder/part-builder-main/part-builder-main.component';
import { PartBuilderComponentEditComponent } from '../modules/admin/products/part-builder/part-builder-component-edit/part-builder-component-edit.component';
import { HouseAccountsListComponent } from '../modules/orders/house-accounts-list/house-accounts-list.component';
import { PartBuilderFilterComponent } from '../modules/admin/products/part-builder/part-builder-filter/part-builder-filter.component';
import { ProductSelectorComponent } from '../modules/admin/products/productedit/_product-edit-parts/product-selector/product-selector.component';
import { PartBuilderSelectorComponent } from '../modules/admin/products/productedit/_product-edit-parts/part-builder-selector/part-builder-selector.component';
import { RoomLayoutDesignerComponent } from '../modules/floor-plan/floor-plan-designer/floor-plan-designer.component';
import { ChairsLayoutComponent } from '../modules/floor-plan/chairs-layout/chairs-layout.component';
import { PreviewFurnitureComponent } from '../modules/floor-plan/preview-furniture/preview-furniture.component';
import { PointlessFloorPlanViewComponent } from '../modules/floor-plan/pointless-floor-plan-view/pointless-floor-plan-view.component';
import { NewOrderItemComponent } from '../modules/posorders/pos-order/new-order-item/new-order-item.component';
import { PartBuilderUsageListComponent } from '../modules/admin/products/part-builder/part-builder-usage-list/part-builder-usage-list.component';
import { PartBuilderTreeComponent } from '../modules/admin/products/part-builder/part-builder-tree/part-builder-tree.component';
import { MessageEditorListComponent } from '../modules/admin/message-editor-list/message-editor-list.component';
import { MessageEditorComponent } from '../modules/admin/message-editor-list/message-editor/message-editor.component';
import { PosOrderItemCalcValuesComponent } from '../modules/posorders/pos-order/pos-order-item-calc-values/pos-order-item-calc-values.component';
import { InventoryMenuItemComponent } from '../modules/menu/menuitem/inventory-menu-item/inventory-menu-item.component';

import { BrandFilterComponent } from '../modules/admin/resale_manager/brands/filter/filter.component';
import { BrandEditorMainComponent } from '../modules/admin/resale_manager/brands/main/main.component';
import { ResaleClassesEditorComponent } from '../modules/admin/resale_manager/classes/resale-classes-editor/resale-classes-editor.component';
import { ResaleClassesFilterComponent } from '../modules/admin/resale_manager/classes/resale-classes-filter/resale-classes-filter.component';
import { ResaleClassesMainComponent } from '../modules/admin/resale_manager/classes/resale-classes-main/resale-classes-main.component';
import { BuySellMainComponent } from '../modules/buySell/buy-sell-main/buy-sell-main.component';
import { BrandClassEditorComponent } from '../modules/admin/resale_manager/brands/brand-class-editor/brand-class-editor.component';
import { EbayPublishProductComponent } from '../modules/admin/inventory/ebay/ebay-publish-product/ebay-publish-product.component';
import { ItemsMainComponent } from '../modules/transactions/itemTransactions/items-main/items-main.component';
import { ItemsFilterComponent } from '../modules/transactions/itemTransactions/items-filter/items-filter.component';
import { EbaySettingsComponent } from '../modules/admin/settings/software/ebay-settings/ebay-settings.component';
import { EbayAuthRedirectComponent } from '../modules/admin/settings/software/ebay-settings/ebay-auth-redirect/ebay-auth-redirect.component';
import { EbayReturnPolicyComponent } from '../modules/admin/inventory/ebay/ebay-return-policy/ebay-return-policy.component';
import { EbayFulfillmentPolicyComponent } from '../modules/admin/inventory/ebay/ebay-fulfillment-policy/ebay-fulfillment-policy.component';
import { EbayAspectsComponent } from '../modules/admin/inventory/ebay/ebay-publish-product/ebay-aspects/ebay-aspects.component';
import { PosSplitOrdersComponent } from '../modules/posorders/pos-payment/possplit-items/pos-split-orders/pos-split-orders.component';
import { TransferOrderComponent } from '../modules/orders/transfer-order/transfer-order.component';
import { DCAPTransactionComponent } from '../modules/dsiEMV/Dcap/dcaptransaction/dcaptransaction.component';
import { MenuSectionComponent } from '../modules/display-menu/display-menu-list/menu-section/menu-section.component';
import { PosOrderEditorComponent } from '../modules/posorders/pos-order/pos-order-editor/pos-order-editor.component';
import { CatalogScheduleInfoComponent } from '../modules/admin/products/price-schedule/catalog-schedule-info/catalog-schedule-info.component';
import { CatalogScheduleInfoListComponent } from '../modules/admin/products/price-schedule/catalog-schedule-info-list/catalog-schedule-info-list.component';

const LOGGING_INTERCEPTOR_PROVIDER: ClassProvider = {
  provide: HTTP_INTERCEPTORS ,
  useClass: LoggingInterceptor,
  multi: true
};

@NgModule({
  declarations: [

    BrandClassEditorComponent,
    BrandFilterComponent,
    BrandEditorMainComponent,

    ResaleClassesEditorComponent,
    ResaleClassesFilterComponent,
    ResaleClassesMainComponent,
    BuySellMainComponent,

    ItemTypeCategoryAssignmentComponent,
    ItemTypeDisplayAssignmentComponent,
    ItemTypeComponent,
    ItemTypeTogglesEditComponent,
    ItemTypeEditorComponent,

    AppWizardStatusComponent,
    AccordionMenuItemEditComponent,
    ActivityTogglesComponent,
    ActivityTogglesMetrcComponent,
    AdjustItemComponent,
    AdminComponent,

    AddInventoryItemComponent,
    AddItemByTypeComponent,
    AgPaginationComponent,

    BalanceSheetsComponent,
    BalanceSheetFilterComponent,
    BalanceSheetEditComponent,
    BalanceSheetCalculationsViewComponent,
    BalanceSheetHeaderViewComponent,
    BalanceSheetQuickViewComponent,
    BalanceSheetViewComponent,

    BrandslistComponent,

    CacheSettingsComponent,
    CategoriesComponent,
    CategorieslistviewComponent,
    CashPaymentButtonComponent,
    CheckInProfileComponent,
    ClientInfoComponent,
    ClientTypeSelectionComponent,
    CloseDayValidationComponent,
    CreditCardPaymentsPrintListComponent,

    //adminModule
    AdminbranditemComponent,
    AdminbrandslistComponent,
    AdminDisplayMenuListComponent,
    AdminDisplayMenuComponent,
    AdminDisplayMenuSelctorComponent,

    BalanceSheetEmployeeSalesComponent,

    BlogListEditComponent,
    BlogPostEditComponent,
    BlogPostSortComponent,

    // EmployeeClockEditComponent,
    // EmployeeClockListComponent,
    // EmployeeClockFilterComponent,

    ClientTypeListComponent,
    ClientTypeEditComponent,
    CompanyEditComponent,

    ClockBreaksTypesComponent,
    CSVImportComponent,
    DailyReportComponent,
    DatabaseSchemaComponent,
    DevxReportDesignerComponent,
    ReportViewerComponent,
    InventoryMenuItemComponent,

    MessageEditorListComponent,
    MessageEditorComponent,
    ManifestEditorHeaderComponent,
    ManifestsComponent,
    MainfestFilterComponent,
    MainfestEditorComponent,
    ManifestStatusComponent,
    ManifestTypeComponent,
    FacilitiesListComponent,
    FlatRateEditComponent,
    FlatRateListComponent,
    FlatTaxRateListComponent,

    PaymentMethodListComponent,
    PaymentMethodSettingsComponent,
    PaymentMethodEditComponent,
    PayPalTransactionComponent,
    PosOrderItemListComponent,
    PurchaseItemSalesComponent,
    PurchaseItemCostHistoryComponent,
    PriceCategoriesEditComponent,
    PriceCategoryPriceFieldsComponent,
    PriceCategoryConversionsComponent,
    PriceCategoryTimeFiltersComponent,
    LinkedPriceSelectorComponent,
    PriceCategoriesComponent,

    WicEBTCardPayBtnComponent,
    TriPOSCardPayBtnComponent,
    StripeCardPayBtnComponent,
    PaypalCardPayBtnComponent,
    GiftCardPayBtnComponent,
    DsiEMVCardPayBtnComponent,
    DSIEMVAndroidPayBtnComponent,
    CardPointeCardPayBtnComponent,

    ItemsMainComponent,
    ItemsFilterComponent,

    PointlessMETRCSalesComponent,
    MetrcSalesFilterComponent,

    PriceTierEditComponent,
    PriceTiersComponent,
    UnitTypeListComponent,
    UnitTypeEditComponent,
    UnitTypePromptComponent,
    UnitTypeSelectComponent,
    ProductSelectorComponent,
    PartBuilderSelectorComponent,
    ServiceTypeEditComponent,
    ServiceTypeListComponent,
    StrainsAddComponent,
    StrainPackagesComponent,
    StrainProductEditComponent,

    SiteEditComponent,
    SiteEditFormComponent,

    SiteFooterComponent,
    ServiceTypeEditComponent,
    ServiceTypeListComponent,

    StoreCreditEditorComponent,
    StoreCreditListComponent,

    PrintTemplatePopUpComponent,
    PrintTemplateComponent,
    ///end admin

    CatalogScheduleInfoComponent,
    CatalogScheduleInfoListComponent,
    DisplayMenuMainComponent,
    DisplayMenuListComponent,
    DisplayMenuTitleComponent,
    DisplayMenuSortComponent,
    MenuSectionComponent,
    // DisplayMenuComponent,

    DefaultComponent,
    DiscountOptionsComponent,
    DefaultReceiptSelectorComponent,
    DemographicsComponent,
    DiscountTypeSelectionComponent,
    DndDirective,
    DSIEMVTransactionComponent,
    DCAPTransactionComponent,
    EditSelectedItemsComponent,
    EditCSSStylesComponent,
    EditSettingsComponent,
    EmployeeLookupComponent,
    EmployeeDetailsPanelComponent,
    EmployeeEditComponent,
    EmployeeFilterPanelComponent,
    EmployeeListComponent,
    EmployeeMetrcKeyEntryComponent,
    ExportDataComponent,
    // FacilitiesListComponent,
    // FlatRateEditComponent,
    // FlatRateListComponent,
    // FlatTaxRateListComponent,
    // PointlessViewComponent,
    ZoomFloorPlanComponent,
    ChairsLayoutComponent,
    FloorPlanComponent,
    PreviewFurnitureComponent,
    RoomLayoutDesignerComponent,
    PointlessFloorPlanViewComponent,
    // PointlessFloorPlanViewComponent,
    FunctionGroupListComponent,
    FunctionGroupEditComponent,
    FunctionGroupButtonEditComponent,
    HTMLEditPrintingComponent,

    JobTypesEditComponent,
    JobTypesListComponent,

    HouseAccountsListComponent,
    // ItemTypeCategoryAssignmentComponent,
    // ItemTypeDisplayAssignmentComponent,
    // ItemTypeComponent,
    // ItemTypeTogglesEditComponent,
    // ItemTypeEditorComponent,

    InstalledPrintersComponent,

    InventoryLocationsComponent,
    InventoryListComponent,
    InventoryHistoryListComponent,
    InventoryComponent,
    InventoryHeaderValuesComponent,
    InventoryHistoryItemComponent,
    InventoryCountsViewComponent,
    SearchInventoryInputComponent,

    ItemCategoriesListComponent,
    ItemSortComponent,
    ItemCategoriesEditComponent,
    ImageCaptureComponent,
    LabelViewSelectorComponent,
    ListPrintersElectronComponent,

    MenuGroupItemEditComponent,

    MenuitemComponent,
    MenuItemCardComponent,
    MenuItemExtendedPricesComponent,
    MenuItemProductCountComponent,
    MenuManagerComponent,
    InventoryMenuItemComponent,

    MessagesToUserComponent,
    MetrcIndividualPackageComponent,
    MetrcInventoryPropertiesComponent,
    MainMenuComponent,
    MetrcIntakeHeaderComponent,
    MenuItemsInfiniteComponent,
    MetrcSalesListComponent,
    METRCProductsAddComponent,

    MenuBoardComponent,
    MenuItemModalComponent,
    NewInventoryItemComponent,
    EbayPublishProductComponent,
    EbayReturnPolicyComponent,
    EbayFulfillmentPolicyComponent,
    EbayAspectsComponent,
    // NumericDirective,
    OrderItemsListComponent,
    OrderItemListComponent,
    OrderBarComponent,
    OrderTypeSelectionComponent,
    OrderCardComponent,
    OrderPrepComponent,
    OrderCardsComponent,
    OrderFilterPanelComponent,
    OrdersListComponent,
    OrdersMainComponent,
    OrderPanelComponent,
    TransferOrderComponent,

    PartBuilderMainComponent,
    PartBuilderEditComponent,
    PartBuilderFilterComponent,
    PartBuilderComponentEditComponent,
    PartBuilderUsageListComponent,
    PartBuilderTreeComponent,

    PackageListComponent,
    PackageSearchSelectorComponent,

    PriceCategoryMultiplePricesComponent,
    POSSplitItemsComponent,
    PosSplitOrdersComponent,
    PosSplitGroupsComponent,
    PosOrderEditorComponent,

    PrintGroupReceiptComponent,
    PrepOrderComponent,
    PrepContainerComponent,
    PrepOrderFilterComponent,
    PrepOrderItemComponent,
    PriceTierLineEditComponent,
    // PriceTierEditComponent,
    // PriceTiersComponent,
    ProductListByBarcodeComponent,
    TVPriceTiersComponent,
    PosListComponent,
    PosEditSettingsComponent,
    PosOrderComponent,
    PosOrderItemEditComponent,
    NewOrderItemComponent,
    PosOrderListComponent,
    PosOperationsComponent,
    PosPaymentsFilterComponent,
    PosPaymentComponent,
    POSPaymentsComponent,
    PosPaymentComponent,
    POSOrderScheduleComponent,
    POSOrderServiceTypeComponent,
    POSOrderShippingAddressComponent,
    PosOrderItemCalcValuesComponent,
    PosOrderNotesComponent,
    POSOrderScheduleFormComponent,
    PosOrderPriceScheduleInfoComponent,
    PosOrderScheduleDescriptionComponent,
    PosOrderBoardComponent,
    PriceOptionsComponent,

    PriceScheduleComponent,
    PriceScheduleListComponent,
    PriceScheduleConstraintsComponent,
    PriceScheduleInfoComponent,
    PriceScheduleFieldsComponent,
    PriceScheduleMenuOptionsComponent,
    PriceScheduleMenuItemsComponent,
    PriceScheduleSortComponent,
    QuickPayButtonsComponent,
    ProfileRolesComponent,
    ProfileListComponent,
    ProfileComponent,
    ProfileDemographicsComponent,
    ProfileEditorComponent,
    ProfileIDCardInfoComponent,
    ProfileLookupComponent,
    PasswordValidationComponent,
    ProducteditComponent,
    ProductlistviewComponent,
    ProductInfoPanelComponent,

    PromptGroupsComponent,
    PromptGroupEditComponent,
    PromptSubGroupEditComponent,
    PromptSubGroupsComponent,
    PromptInfoPanelComponent,
    PromptItemSelectionComponent,
    PromptSelectedItemsComponent,
    PromptSubGroupAssociationComponent,
    PromptKitsComponent,

    PromptGroupSelectComponent,
    PromptWalkThroughComponent,
    PromptSubGroupPanelComponent,
    PromptPanelMenuItemsComponent,
    PromptPanelMenuItemComponent,
    PromptItemsSelectedComponent,
    PSMenuGroupListComponent,
    PSMenuGroupEditComponent,

    ReceiptLayoutComponent,
    RecieptPopUpComponent,
    ReportsComponent,
    RequiresSerialComponent,
    ReviewComponent,
    ReviewsComponent,
    ReviewEditComponent,
    RewardTypeFilterComponent,
    RewardTypeResultsSelectorComponent,

    SearchPanelComponent,
    ScrollableDirective,
    ScheduledMenuContainerComponent,
    ScheduledMenuItemsComponent,
    ScheduledMenuHeaderComponent,
    ScheduledMenuListComponent,
    ScheduledMenuItemComponent,
    ScheduledMenuImageComponent,
    SearchResultsComponent,

    SettingsComponent,
    // SimpleTinyComponent,
    SitepointsComponent,
    SitepurchasesComponent,

    SitesComponent,

    // StrainsAddComponent,
    // StrainPackagesComponent,
    // StrainProductEditComponent,

    StrainBoardComponent,
    StrainCardComponent,

    StickyHeaderComponent,
    // StoreCreditListComponent,
    // StoreCreditEditorComponent,
    StoreCreditIssueComponent,

    StoreCreditPopUpComponent,
    SoftwareComponent,

    ReceiptViewComponent,
    MenuItemCardDashboardComponent,
    StripeSettingsComponent,
    StripeCheckOutComponent,
    UITransactionsComponent,
    EbaySettingsComponent,
    EbayAuthRedirectComponent,
    TaxEditComponent,
    TaxListComponent,
    TaxRateListComponent,
    TierMenuComponent,
    TierItemsComponent,
    TierPriceLineComponent,
    TierPricesComponent,
    TiersWithPricesComponent,

    TriPosTransactionsComponent,
    TriposSettingsComponent,
    TypeFilterComponent,
    TypeResultsSelectorComponent,
    TypeBoardComponent,
    TypeBoardItemsComponent,
    //price categories first before moving to admin
    // PriceCategoriesEditComponent,
    // PriceCategoryPriceFieldsComponent,
    // PriceCategoryConversionsComponent,
    // PriceCategoryTimeFiltersComponent,
    // PriceCategoriesComponent,

    // UnitTypeListComponent,
    // UnitTypeEditComponent,
    // UnitTypePromptComponent,
    // UnitTypeSelectComponent,


    UsermessagesComponent,
    UseGroupTaxAssignmentComponent,
    WeekDaySelectionComponent,
    WishlistComponent,
    ZoomFloorPlanComponent,

    CardPointSettingsComponent,
    CardPointIDTECHAndroidComponent,
    CardpointeTransactionsComponent,
    CpVIVO3300Component,
    DsiEMVAndroidComponent,
    DSIAndroidSettingsComponent,
    DsiAndroidResultsComponent,

    EditSettingsComponent,

    DateScheduleComponent,
    TimeScheduleComponent,
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
      NgxStripeModule.forRoot(),
      NgxCsvParserModule,
      NgxPayPalModule,
      NgxJsonViewerModule,
      NgxColorsModule,
      FormsModule,
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
  ],

  providers: [
    AgGridService,
    DatePipe,
    LoggingInterceptor,
    {provide: RouteReuseStrategy , useClass: RouteReuseService},
  ],
})

export class DefaultModule { }

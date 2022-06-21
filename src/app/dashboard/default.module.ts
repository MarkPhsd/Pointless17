import { NgModule, ClassProvider } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { RouteReuseStrategy, RouterModule } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { SitesComponent } from 'src/app/modules/sites/sites.component';
import { ProfileComponent } from 'src/app/modules/profile/profile.component';
import { AnimationCountService, AWSBucketService, DevService } from 'src/app/_services/';
import { DashboardService } from 'src/app/_services/reporting/dashboard.service';
import { ReportingService } from 'src/app/_services/';
import { UserService } from 'src/app/_services/';
import { MenuService } from 'src/app/_services/';
import { AuthenticationService } from 'src/app/_services/';
import { ContactsService, OrdersService, TextMessagingService, ThemesService } from 'src/app/_services';
import { LoggingInterceptor } from 'src/app/_http-interceptors/loggin.interceptor';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DefaultComponent } from './default.component';
import { CdkTableModule } from '@angular/cdk/table';
import { SitepurchasesComponent } from 'src/app/modules/profile/details/sitepurchases/sitepurchases.component';
import { SitepointsComponent } from 'src/app/modules/profile/details/sitepoints/sitepoints.component';
import { CategoriesComponent } from 'src/app/modules/menu/categories/categories.component';
import { ProducteditComponent } from 'src/app/modules/admin/products/productedit/productedit.component';
import { AppRoutingModule } from 'src/app/app-routing.module';
import { ItemsService } from 'src/app/_services/transactions/items.services';
import { UsermessagesComponent } from 'src/app/shared/widgets/usermessages/usermessages.component';
import { WishlistComponent } from 'src/app/modules/profile/wishlist/wishlist.component';
import { DndDirective, ScrollableDirective } from 'src/app/_directives/';
import { CategorieslistviewComponent } from 'src/app/modules/admin/products/categorieslistview/categoriestlistview.component';
import { MenuitemComponent } from 'src/app/modules/menu/menuitem/menuitem.component';
import { AdminbrandslistComponent } from 'src/app/modules/admin/products/adminbrandslist/adminbrandslist.component';
import { AdminbranditemComponent } from 'src/app/modules/admin/products/adminbrandslist/adminbranditem/adminbranditem.component';
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
import { AgGridModule } from 'ag-grid-angular';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { AgGridService } from 'src/app/_services/system/ag-grid-service';
import { ProductlistviewComponent } from 'src/app/modules/admin/products/productlistview/productlistview.component';
import { SiteEditComponent } from 'src/app/modules/admin/settings/site-edit/site-edit.component';
import { ButtonRendererComponent } from 'src/app/_components/btn-renderer.component';
import { ReviewsService } from 'src/app/_services/people/reviews.service';
import { InventoryLocationsService} from 'src/app/_services/inventory/inventory-locations.service';
import { ReviewEditComponent } from 'src/app/modules/reviews/review-edit/review-edit.component';
import { ReviewComponent } from 'src/app/modules/reviews/review/review.component';
import { ReviewsComponent } from 'src/app/modules/reviews/reviews.component';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { PosOrderListComponent } from 'src/app/modules/posorders/pos-order-list/pos-order-list.component';
import { TINYMCE_SCRIPT_SRC } from '@tinymce/tinymce-angular';
import { SimpleTinyComponent } from 'src/app/_components/tinymce/tinymce.component';
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
import { METRCProductsAddComponent } from '../modules/admin/metrc/packages/metrc-products-add/products-add.component';
import { StrainsAddComponent } from '../modules/admin/metrc/packages/strains-add/strains-add.component';
import { InventoryLocationsComponent } from '../modules/admin/inventory/inventory-locations/inventory-locations.component';
import { ItemCategoriesListComponent } from '../modules/admin/metrc/items/item-categories-list/item-categories-list.component';
import { ItemCategoriesEditComponent } from '../modules/admin/metrc/items/item-categories-edit/item-categories-edit.component';
import { MetrcFacilitiesService } from 'src/app/_services/metrc/metrc-facilities.service';
import { FacilitiesListComponent } from '../modules/admin/metrc/facilities/facilities-list/facilities-list.component';
import { InventoryAssignmentService } from '../_services/inventory/inventory-assignment.service';
import { InventoryListComponent } from '../modules/admin/inventory/inventory-list/inventory-list/inventory-list.component';
import { MetrcSalesListComponent } from '../modules/admin/metrc/metrc-sales-list/metrc-sales-list.component';
import { StrainProductEditComponent } from '../modules/admin/products/productedit/strain-product-edit/strain-product-edit.component';
import { ItemTypeService } from '../_services/menu/item-type.service';
import { ItemTypeComponent } from '../modules/admin/products/item-type/item-type.component';
import { FlatRateEditComponent } from '../modules/admin/products/flatRate/flat-rate-edit/flat-rate-edit.component';
import { ItemTypeEditorComponent } from '../modules/admin/products/item-type/item-type-editor/item-type-editor.component';
import { FlatRateListComponent } from '../modules/admin/products/flatRate/flat-rate-list/flat-rate-list.component';
import { FlatTaxRateListComponent } from '../modules/admin/products/item-type/flat-tax-rate-list/flat-tax-rate-list.component';
import { TaxRateListComponent } from '../modules/admin/products/item-type/tax-rate-list/tax-rate-list.component';
import { TaxEditComponent } from '../modules/admin/products/taxes/tax-edit/tax-edit.component';
import { TaxListComponent } from '../modules/admin/products/taxes/tax-list/tax-list.component';
import { DatabaseSchemaComponent } from '../modules/admin/settings/database/database-schema/database-schema.component';
import { CSVImportComponent } from '../modules/admin/settings/database/csv-import/csv-import.component';
import { InstalledPrintersComponent } from '../modules/admin/settings/printing/installed-printers/installed-printers.component';
import { MenuItemsInfiniteComponent } from '../modules/menu/menuitems/menu-items-infinite/menu-items-infinite.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { PrintingService } from '../_services/system/printing.service';
import { LabelaryService } from '../_services/labelary/labelary.service';
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
import { ItemTypeCategoryAssignmentComponent } from '../modules/admin/products/item-type/item-type-category-assignment/item-type-category-assignment.component';
import { ArrayFilterPipe, ArraySortPipe } from '../_pipes/array.pipe';
import { TypeResultsSelectorComponent } from '../modules/admin/products/price-schedule/item-selections/type-results-selector/type-results-selector.component';
import { EditSelectedItemsComponent } from '../modules/admin/products/productedit/edit-selected-items/edit-selected-items.component';
import { BrandTypeSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/brand-type-select/brand-type-select.component';
import { AddItemByTypeComponent } from '../modules/admin/products/productedit/add-item-by-type/add-item-by-type.component';
import { AgPaginationComponent } from '../shared/widgets/ag-pagination/ag-pagination.component';
import { RewardTypeFilterComponent } from '../modules/admin/products/price-schedule/rewards/reward-type-filter/reward-type-filter.component';
import { RewardTypeResultsSelectorComponent } from '../modules/admin/products/price-schedule/rewards/reward-type-results-selector/reward-type-results-selector.component';
import { PriceScheduleFieldsComponent } from '../modules/admin/products/price-schedule/price-schedule-info/price-schedule-fields/price-schedule-fields.component';
import { UnitTypeListComponent } from '../modules/admin/products/unit-type-list/unit-type-list.component';
import { UnitTypeEditComponent } from '../modules/admin/products/unit-type-list/unit-type-edit/unit-type-edit.component';
import { ProductInfoPanelComponent } from '../modules/admin/products/product-info-panel/product-info-panel.component';
import { ItemTypeDisplayAssignmentComponent } from '../modules/admin/products/item-type/item-type-display-assignment/item-type-display-assignment.component';
import { UseGroupTaxAssignmentComponent } from '../modules/admin/products/item-type/use-group-tax-assignment/use-group-tax-assignment.component';
import { PriceScheduleListComponent } from '../modules/admin/products/price-schedule/price-schedule-list/price-schedule-list.component';
import { AgGridToggleComponent } from '../_components/_aggrid/ag-grid-toggle/ag-grid-toggle.component';
import { ClientTypeListComponent } from '../modules/admin/clients/client-types/client-type-list/client-type-list.component';
import { ClientTypeEditComponent } from '../modules/admin/clients/client-types/client-type-edit/client-type-edit.component';
import { ServiceTypeEditComponent } from '../modules/admin/transactions/serviceTypes/service-type-edit/service-type-edit.component';
import { ServiceTypeListComponent } from '../modules/admin/transactions/serviceTypes/service-type-list/service-type-list.component';
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
import { PromptGroupsComponent } from '../modules/admin/menuPrompt/prompt-groups/prompt-groups.component';
import { PromptSubGroupEditComponent } from '../modules/admin/menuPrompt/prompt-sub-groups/prompt-sub-group-edit/prompt-sub-group-edit.component';
import { PromptSubGroupsComponent } from '../modules/admin/menuPrompt/prompt-sub-groups/prompt-sub-groups.component';
import { PromptGroupEditComponent } from '../modules/admin/menuPrompt/prompt-groups/prompt-group-edit/prompt-group-edit.component';
import { PromptInfoPanelComponent } from '../modules/admin/menuPrompt/prompt-groups/prompt-info-panel/prompt-info-panel.component';
import { PromptItemSelectionComponent } from '../modules/admin/menuPrompt/prompt-item-selection/prompt-item-selection.component';
import { PromptSelectedItemsComponent } from '../modules/admin/menuPrompt/prompt-item-selection/prompt-selected-items/prompt-selected-items.component';
import { PromptSubGroupAssociationComponent } from '../modules/admin/menuPrompt/prompt-sub-group-association/prompt-sub-group-association.component';
import { PromptKitsComponent } from '../modules/admin/menuPrompt/prompt-kits/prompt-kits.component';
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
import { SoftwareComponent } from '../modules/admin/settings/software/software.component';
import { UITransactionsComponent } from '../modules/admin/settings/software/UISettings/uitransactions/uitransactions.component';
import { CompanyEditComponent } from '../modules/admin/company-edit/company-edit.component';
import { ListPrintersElectronComponent } from '../modules/admin/settings/printing/list-printers-electron/list-printers-electron.component';
import { DefaultReceiptSelectorComponent } from '../modules/admin/settings/printing/default-receipt-selector/default-receipt-selector.component';
import { RequiresSerialComponent } from '../modules/posorders/requires-serial/requires-serial.component';
import { BalanceSheetCalculationsViewComponent } from '../modules/transactions/balanceSheets/balance-sheet-calculations-view/balance-sheet-calculations-view.component';
import { BalanceSheetHeaderViewComponent } from '../modules/transactions/balanceSheets/balance-sheet-header-view/balance-sheet-header-view.component';
import { BalanceSheetQuickViewComponent } from '../modules/transactions/balanceSheets/balance-sheet-quick-view/balance-sheet-quick-view.component';
import { PriceCategoryPriceFieldsComponent } from '../modules/admin/products/pricing/price-categories-edit/price-category-price-fields/price-category-price-fields.component';
import { PriceCategoryConversionsComponent } from '../modules/admin/products/pricing/price-categories-edit/price-category-conversions/price-category-conversions.component';
import { PriceCategoryTimeFiltersComponent } from '../modules/admin/products/pricing/price-categories-edit/price-category-time-filters/price-category-time-filters.component';
import { PriceOptionsComponent } from '../modules/posorders/price-options/price-options.component';
import { ProfileDemographicsComponent } from '../modules/admin/profiles/parts/demographics/demographics.component';
import { ProfileIDCardInfoComponent } from '../modules/admin/profiles/parts/profile-idcard-info/profile-idcard-info.component';
import { OrderCardsComponent } from '../modules/orders/order-cards/order-cards.component';
import { OrdersListComponent } from '../modules/orders/orders-list/orders-list.component';
import { PriceTierLineEditComponent } from '../modules/admin/products/price-tiers/price-tier-line-edit/price-tier-line-edit.component';
import { TVPriceTiersComponent } from '../modules/tv-menu/price-tiers/price-tiers.component';
import { PriceTierEditComponent } from '../modules/admin/products/price-tiers/price-tier-edit/price-tier-edit.component';
import { PriceTiersComponent } from '../modules/admin/products/price-tiers/price-tiers.component';
import { TiersWithPricesComponent } from '../modules/menu/tierMenu/tiers-with-prices/tiers-with-prices.component';
import { ItemSortComponent } from '../modules/admin/products/price-schedule/item-selections/item-sort/item-sort.component';
import { PSMenuGroupListComponent } from '../modules/admin/products/price-schedule-menu-groups/psmenu-group-list/psmenu-group-list.component';
import { PSMenuGroupEditComponent } from '../modules/admin/products/price-schedule-menu-groups/psmenu-group-edit/psmenu-group-edit.component';
import { MenuItemExtendedPricesComponent } from '../modules/menu/menuitem/menu-item-extended-prices/menu-item-extended-prices.component';
import { ScheduledMenuContainerComponent } from '../modules/menu/scheduleMenus/scheduled-menu-container/scheduled-menu-container.component';
import { ScheduledMenuItemsComponent } from '../modules/menu/scheduleMenus/scheduled-menu-items/scheduled-menu-items.component';
import { ScheduledMenuItemComponent } from '../modules/menu/scheduleMenus/scheduled-menu-items/scheduled-menu-item/scheduled-menu-item.component';
import { ScheduledMenuHeaderComponent } from '../modules/menu/scheduleMenus/scheduled-menu-container/scheduled-menu-header/scheduled-menu-header.component';
import { ScheduledMenuListComponent } from '../modules/menu/scheduleMenus/scheduled-menu-list/scheduled-menu-list.component';
import { UnitTypeSelectComponent } from '../modules/admin/products/productedit/_product-edit-parts/unit-type-select/unit-type-select.component';
import { UnitTypePromptComponent } from '../modules/admin/products/pricing/price-categories-edit/unit-type-prompt/unit-type-prompt.component';
import { ActivityTogglesComponent } from '../modules/admin/products/productedit/_product-edit-parts/activity-toggles/activity-toggles.component';
import { ItemTypeTogglesEditComponent } from '../modules/admin/products/item-type/item-type-editor/item-type-toggles-edit/item-type-toggles-edit.component';
import { SiteEditFormComponent } from '../modules/admin/settings/site-edit/site-edit-form/site-edit-form.component';
import { ActivityTogglesMetrcComponent } from '../modules/admin/metrc/packages/metrc-inventory-properties/activity-toggles-metrc/activity-toggles-metrc.component';
import { MetrcIntakeHeaderComponent } from '../modules/admin/metrc/packages/metrc-inventory-properties/metrc-intake-header/metrc-intake-header.component';
import { SearchInventoryInputComponent } from '../modules/admin/inventory/inventory-list/inventory-list/search-inventory-input/search-inventory-input.component';
import { POSOrderServiceTypeComponent } from '../modules/posorders/posorder-service-type/posorder-service-type.component';
import { POSOrderScheduleComponent } from '../modules/posorders/posorder-schedule/posorder-schedule.component';
import { POSOrderShippingAddressComponent } from '../modules/posorders/posorder-shipping-address/posorder-shipping-address.component';
import { POSOrderScheduleCardComponent } from '../modules/posorders/posorder-schedule/posorder-schedule-card/posorder-schedule-card.component';
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
import { NumericDirective } from '../_directives/numeric-directive.directive';
import { PosOrderBoardComponent } from '../modules/posorders/pos-order/pos-order-board/pos-order-board.component';
import { MenuItemCardDashboardComponent } from '../modules/menu/menu-item-card/menu-item-card.component';
import { DashBoardRoutingModule } from '../dash-board-routing.module';
import { OrderPrepComponent } from '../modules/orders/order-prep/order-prep.component';
import { MainfestEditorComponent } from '../modules/admin/inventory/manifests/mainfest-editor/mainfest-editor.component';
import { MainfestFilterComponent } from '../modules/admin/inventory/manifests/mainfest-filter/mainfest-filter.component';
import { ManifestsComponent } from '../modules/admin/inventory/manifests/manifests.component';
import { ManifestEditorHeaderComponent } from '../modules/admin/inventory/manifests/mainfest-editor/manifest-editor-header/manifest-editor-header.component';
import { AgGridImageFormatterComponent } from '../_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component';
import { AgIconFormatterComponent } from '../_components/_aggrid/ag-icon-formatter/ag-icon-formatter.component';
import { ManifestStatusComponent } from '../modules/admin/inventory/manifest-status/manifest-status.component';
import { ManifestTypeComponent } from '../modules/admin/inventory/manifest-type/manifest-type.component';
import { POSSplitItemsComponent } from '../modules/posorders/pos-payment/possplit-items/possplit-items.component';
import { NgxCsvParserModule } from 'ngx-csv-parser';
import { ExportDataComponent } from '../modules/admin/settings/database/export-data/export-data.component';
import { PosEditSettingsComponent } from '../modules/admin/settings/pos-list/pos-edit-settings/pos-edit-settings.component';
import { ReceiptViewComponent } from '../modules/admin/settings/printing/reciept-pop-up/receipt-view/receipt-view.component';
import { StoreCreditEditorComponent } from '../modules/admin/store-credit/store-credit-editor/store-credit-editor.component';
import { StoreCreditListComponent } from '../modules/admin/store-credit/store-credit-list/store-credit-list.component';
import { StoreCreditPopUpComponent } from '../modules/posorders/pos-payment/store-credit-pop-up/store-credit-pop-up.component';
import { StoreCreditIssueComponent } from '../modules/posorders/pos-order/store-credit-issue/store-credit-issue.component';
import { BalanceSheetViewComponent } from '../modules/admin/settings/printing/balance-sheet-view/balance-sheet-view.component';
import { CloseDayValidationComponent } from '../modules/transactions/operations/pos-operations/close-day-validation/close-day-validation.component';

const LOGGING_INTERCEPTOR_PROVIDER: ClassProvider = {
  provide: HTTP_INTERCEPTORS ,
  useClass: LoggingInterceptor,
  multi: true
};

@NgModule({
  declarations: [
    AccordionMenuItemEditComponent,
    ActivityTogglesComponent,
    ActivityTogglesMetrcComponent,
    AdjustItemComponent,
    AdminComponent,
    AdminbrandslistComponent,
    AdminbranditemComponent,
    AddInventoryItemComponent,
    AddItemByTypeComponent,
    AgPaginationComponent,
    ArrayFilterPipe,
    ArraySortPipe,
    BalanceSheetsComponent,
    BalanceSheetFilterComponent,
    BalanceSheetEditComponent,
    BalanceSheetCalculationsViewComponent,
    BalanceSheetHeaderViewComponent,
    BalanceSheetQuickViewComponent,
    BalanceSheetViewComponent,
    BrandslistComponent,
    BrandTypeSelectComponent,
    CacheSettingsComponent,
    CategoriesComponent,
    CategorieslistviewComponent,
    CheckInProfileComponent,
    ClientTypeSelectionComponent,
    ClientTypeListComponent,
    ClientTypeEditComponent,
    CloseDayValidationComponent,
    CSVImportComponent,
    CompanyEditComponent,
    DatabaseSchemaComponent,
    DateScheduleComponent,
    DefaultComponent,
    DiscountOptionsComponent,
    DefaultReceiptSelectorComponent,
    DemographicsComponent,
    DiscountTypeSelectionComponent,
    DndDirective,
    DSIEMVTransactionComponent,
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
    FacilitiesListComponent,
    FlatRateEditComponent,
    FlatRateListComponent,
    FlatTaxRateListComponent,
    FunctionGroupListComponent,
    FunctionGroupEditComponent,
    FunctionGroupButtonEditComponent,
    HTMLEditPrintingComponent,
    ItemTypeCategoryAssignmentComponent,
    ItemTypeDisplayAssignmentComponent,
    ItemTypeComponent,
    ItemTypeTogglesEditComponent,
    ItemTypeEditorComponent,
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
    ManifestsComponent,
    MainfestFilterComponent,
    MainfestEditorComponent,
    ManifestStatusComponent,
    ManifestTypeComponent,
    MenuGroupItemEditComponent,
    ManifestEditorHeaderComponent,
    MenuitemComponent,
    MenuItemCardComponent,
    MenuItemExtendedPricesComponent,
    MenuItemProductCountComponent,
    MenuManagerComponent,
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
    NumericDirective,
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
    PackageListComponent,
    PackageSearchSelectorComponent,
    PaymentMethodListComponent,
    PaymentMethodSettingsComponent,
    PaymentMethodEditComponent,
    POSSplitItemsComponent,
    PrepOrderComponent,
    PrepContainerComponent,
    PrepOrderFilterComponent,
    PrepOrderItemComponent,
    PriceTierLineEditComponent,
    PriceTierEditComponent,
    PriceTiersComponent,

    TVPriceTiersComponent,
    PosListComponent,
    PosEditSettingsComponent,
    PosOrderComponent,
    PosOrderItemEditComponent,
    PosOrderListComponent,
    PosOperationsComponent,
    PosPaymentsFilterComponent,
    PosPaymentComponent,
    POSPaymentsComponent,
    PosPaymentComponent,
    POSOrderScheduleComponent,
    POSOrderServiceTypeComponent,
    POSOrderShippingAddressComponent,
    POSOrderScheduleCardComponent,
    PosOrderNotesComponent,
    POSOrderScheduleFormComponent,
    PosOrderPriceScheduleInfoComponent,
    PosOrderScheduleDescriptionComponent,
    PosOrderBoardComponent,
    PriceCategoriesEditComponent,
    PriceCategoryPriceFieldsComponent,
    PriceCategoryConversionsComponent,
    PriceCategoryTimeFiltersComponent,
    PriceCategoriesComponent,
    PriceOptionsComponent,
    PriceScheduleComponent,
    PriceScheduleListComponent,
    PriceScheduleConstraintsComponent,
    PriceScheduleInfoComponent,
    PriceScheduleFieldsComponent,
    ProfileRolesComponent,
    ProfileListComponent,
    ProfileComponent,
    ProfileDemographicsComponent,
    ProfileEditorComponent,
    ProfileIDCardInfoComponent,
    ProfileLookupComponent,
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
    ServiceTypeListComponent,
    ServiceTypeEditComponent,
    SettingsComponent,
    SimpleTinyComponent,
    SitepointsComponent,
    SitepurchasesComponent,
    SiteEditComponent,
    SiteEditFormComponent,
    SitesComponent,
    SoftwareComponent,
    StrainsAddComponent,
    StrainPackagesComponent,
    StickyHeaderComponent,
    StrainProductEditComponent,
    StrainBoardComponent,
    StrainCardComponent,
    StoreCreditListComponent,
    StoreCreditEditorComponent,
    StoreCreditIssueComponent,
    StoreCreditPopUpComponent,
    ReceiptViewComponent,
    MenuItemCardDashboardComponent,
    StripeSettingsComponent,
    StripeCheckOutComponent,
    UITransactionsComponent,
    TaxEditComponent,
    TaxListComponent,
    TaxRateListComponent,
    TierMenuComponent,
    TierItemsComponent,
    TierPriceLineComponent,
    TierPricesComponent,
    TiersWithPricesComponent,
    TimeScheduleComponent,
    TypeFilterComponent,
    TypeResultsSelectorComponent,
    TypeBoardComponent,
    TypeBoardItemsComponent,
    UnitTypeListComponent,
    UnitTypeEditComponent,
    UnitTypePromptComponent,
    UnitTypeSelectComponent,
    UsermessagesComponent,
    UseGroupTaxAssignmentComponent,
    WeekDaySelectionComponent,
    WishlistComponent,
   ],

   imports: [
      AgGridModule.withComponents([ButtonRendererComponent,AgIconFormatterComponent, AgGridToggleComponent,AgGridImageFormatterComponent]),
      DashBoardRoutingModule,
      AppRoutingModule,
      AppMaterialModule,
      BrowserAnimationsModule,
      CommonModule,
      CdkTableModule,
      FlexLayoutModule,
      FormsModule,
      HammerModule,
      IonicModule.forRoot(),
      InfiniteScrollModule,
      NgPipesModule,
      ReactiveFormsModule,
      ReactiveFormsModule,
      RouterModule,
      SharedModule,
      NgxStripeModule.forRoot(),
      NgxCsvParserModule,
    ],

  exports: [
    AgGridModule,
    AdjustItemComponent,
    BrowserAnimationsModule,
    RouterModule,
    HammerModule,
    SimpleTinyComponent,
    NumericDirective,
  ],

  providers: [
    AgGridService,
    AnimationCountService,
    AuthenticationService,
    AWSBucketService,
    ClientTypeService,
    ContactsService,
    DashboardService,
    DatePipe,
    DevService,
    EmployeeService,
    InventoryLocationsService,
    ItemsService,
    LabelaryService,
    LoggingInterceptor,
    MenuService,
    MetrcFacilitiesService,
    OrdersService,
    PrintingService,
    ReportingService,
    ReviewsService,
    SettingsService,
    ServiceTypeService,
    InventoryAssignmentService,
    TextMessagingService,
    ThemesService,
    UserService,
    ItemTypeService,

   { provide: TINYMCE_SCRIPT_SRC, useValue: 'tinymce/tinymce.min.js' },
   {provide: RouteReuseStrategy , useClass: RouteReuseService},

  ],
})

export class DefaultModule { }

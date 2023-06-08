import { NgModule } from '@angular/core';
import { Routes, RouterModule, PreloadAllModules } from '@angular/router';
// import { QuicklinkStrategy, QuicklinkModule} from 'ngx-quicklink';
import { DefaultComponent  } from './dashboard/default.component';
import { SitesComponent } from './modules/sites/sites.component';
import { LoginComponent} from './modules/login/login.component';
import { ChangepasswordComponent } from './modules/login/changepassword/changepassword.component';
import { ResetpasswordComponent } from './modules/login/resetpassword/resetpassword.component';
import { ProducteditComponent } from './modules/admin/products/productedit/productedit.component';
import { CategoriesComponent } from './modules/menu/categories/categories.component';
import { WishlistComponent } from './modules/profile/wishlist/wishlist.component';
import { CustomReuseStrategy } from 'src/app/_routing/route-reuse-strategy';
import { CategorieslistviewComponent } from './modules/admin/products/categorieslistview/categoriestlistview.component';
import { MenuitemComponent } from './modules/menu/menuitem/menuitem.component';
import { AdminbrandslistComponent } from './modules/admin/products/adminbrandslist/adminbrandslist.component';
import { AdminbranditemComponent } from './modules/admin/products/adminbrandslist/adminbranditem/adminbranditem.component';
import { BrandslistComponent } from './modules/menu/brandslist/brandslist.component';
import { ImageCaptureComponent } from './shared/widgets/image-capture/image-capture.component';
import { ProfileEditorComponent } from './modules/admin/profiles/profile-editor/profile-editor.component';
import { ProfileLookupComponent } from './modules/admin/profiles/profile-lookup/profile-lookup.component';
import { PosOrderComponent } from './modules/posorders/pos-order/pos-order.component';
import { SearchResultsComponent } from './modules/menu/search-results/search-results.component';
import { AdminComponent } from './modules/admin/admin.component';
import { SettingsComponent } from './modules/admin/settings/settings.component';
import { ProductlistviewComponent } from './modules/admin/products/productlistview/productlistview.component';
import { PageNotFoundComponent } from './shared/widgets/page-not-found/page-not-found.component';
import { SiteEditComponent } from './modules/admin/settings/site-edit/site-edit.component';
import { ReviewEditComponent } from './modules/reviews/review-edit/review-edit.component';
import { ReportsComponent } from './modules/admin/reports/reports.component';
import { PosListComponent } from './modules/admin/settings/pos-list/pos-list.component';
import { DashboardComponent } from './modules/admin/reports/dashboard/dashboard.component';
import { OrderItemListComponent } from './modules/posorders/order-items-list/order-item-list/order-item-list.component';
import { OrderItemsListComponent } from './modules/posorders/order-items-list/order-items-list.component';
import { AppGateComponent } from './modules/app-gate/app-gate/app-gate.component';
import { AuthGuard } from './_http-interceptors/auth.guard';
import { AgeVerificationGuardService } from './_http-interceptors/age-verification-guard.service';
import { MainMenuComponent } from './modules/menu/mainMenu/main-menu/main-menu.component';
import { MenuItemModalComponent } from './modules/menu/menuitems/menu-item-card/menu-item-modal/menu-item-modal.component';
import { HammerCardComponent } from './shared/widgets/hammer-card/hammer-card.component';
import { TvPriceSpecialsComponent } from './modules/tv-menu/tv-price-specials/tv-price-specials.component';
import { TierMenuComponent } from './modules/menu/tierMenu/tier-menu/tier-menu.component';
import { PriceCategoriesComponent } from './modules/admin/products/pricing/price-categories/price-categories.component';
import { RegisterAccountExistingUserWithTokenComponent } from './modules/login/registration/register-account-existing-user-with-token/register-account-existing-user-with-token.component';
import { RegisterAccountMainComponent } from './modules/login/registration/register-account-main/register-account-main.component';
import { CategoriesAlternateComponent } from './modules/menu/categories/categories-alternate/categories-alternate.component';
import { BarcodeScannerComponent } from './shared/widgets/barcode-scanner/barcode-scanner.component';
import { PackageListComponent } from './modules/admin/metrc/packages/package-list.component';
import { ItemCategoriesListComponent } from './modules/admin/metrc/items/item-categories-list/item-categories-list.component';
import { ProductSearchSelectorComponent } from './shared/widgets/product-search-selector/product-search-selector.component'
import { InventoryLocationsComponent } from 'src/app/modules/admin/inventory/inventory-locations/inventory-locations.component';
import { FacilitiesListComponent } from 'src/app/modules/admin/metrc/facilities/facilities-list/facilities-list.component';
import { InventoryListComponent } from './modules/admin/inventory/inventory-list/inventory-list/inventory-list.component';
import { ProfileComponent } from './modules/profile/profile.component';
import { MetrcSalesListComponent } from './modules/admin/metrc/metrc-sales-list/metrc-sales-list.component';
import { CategoryScrollComponent } from './shared/widgets/test/category-scroll/category-scroll.component';
import { MenuManagerComponent } from './modules/admin/settings/menus-manager/menu-manager/menu-manager.component';
import { ItemTypeComponent } from './modules/admin/products/item-type/item-type.component';
import { FlatRateListComponent } from './modules/admin/products/flatRate/flat-rate-list/flat-rate-list.component';
import { TaxListComponent } from './modules/admin/products/taxes/tax-list/tax-list.component';
import { Label1by8Component } from './modules/admin/settings/printing/label1by8/label1by8.component';
import { IonicGeoLocationComponent } from './shared/widgets/ionic-geo-location/ionic-geo-location.component';
import { MenuItemsInfiniteComponent } from './modules/menu/menuitems/menu-items-infinite/menu-items-infinite.component';
import { InstalledPrintersComponent } from './modules/admin/settings/printing/installed-printers/installed-printers.component';
import { StrainsAddComponent } from './modules/admin/metrc/packages/strains-add/strains-add.component';
import { PriceScheduleComponent } from './modules/admin/products/price-schedule/price-schedule.component';
import { ItemTypeCategoryAssignmentComponent } from './modules/admin/products/item-type/item-type-category-assignment/item-type-category-assignment.component';
import { AgGridTestComponent } from './shared/widgets/ag-grid-test/ag-grid-test.component';
import { UnitTypeListComponent } from './modules/admin/products/unit-type-list/unit-type-list.component';
import { DsiEMVPaymentComponent } from './modules/admin/dsi-emvpayment/dsi-emvpayment.component';
import { PriceScheduleListComponent } from './modules/admin/products/price-schedule/price-schedule-list/price-schedule-list.component';
import { ClientTypeEditComponent } from './modules/admin/clients/client-types/client-type-edit/client-type-edit.component';
import { ClientTypeListComponent } from './modules/admin/clients/client-types/client-type-list/client-type-list.component';
import { ServiceTypeListComponent } from './modules/admin/transactions/serviceTypes/service-type-list/service-type-list.component';
import { ServiceTypeEditComponent } from './modules/admin/transactions/serviceTypes/service-type-edit/service-type-edit.component';
import { OrdersMainComponent } from './modules/orders/orders-main/orders-main.component';
import { ScaleReaderComponent } from './shared/widgets/scale-reader/scale-reader.component';
import { PrinterLocationsComponent } from './modules/admin/products/printer-locations/printer-locations.component';
import { PaymentMethodEditComponent } from './modules/admin/transactions/paymentMethods/payment-method-edit/payment-method-edit.component';
import { PaymentMethodListComponent } from './modules/admin/transactions/paymentMethods/payment-method-list/payment-method-list.component';
import { POSPaymentsComponent } from './modules/transactions/pos-payments-main/pospayments/pospayments.component';
import { KeyPadComponent } from './shared/widgets/key-pad/key-pad.component';
import { PosPaymentComponent } from './modules/posorders/pos-payment/pos-payment.component';
import { BalanceSheetsComponent } from './modules/transactions/balanceSheets/balance-sheets/balance-sheets.component';
import { BalanceSheetEditComponent } from './modules/transactions/balanceSheets/balance-sheet-edit/balance-sheet-edit.component';
import { PosPaymentEditComponent } from './modules/posorders/pos-payment/pos-payment-edit/pos-payment-edit.component';
import { IonicSwipeToDeleteComponent } from './shared/widgets/ionic-swipe-to-delete/ionic-swipe-to-delete.component';
import { PromptGroupsComponent } from './modules/admin/menuPrompt/prompt-groups/prompt-groups.component';
import { PromptGroupEditComponent } from './modules/admin/menuPrompt/prompt-groups/prompt-group-edit/prompt-group-edit.component';
import { PromptSubGroupsComponent } from './modules/admin/menuPrompt/prompt-sub-groups/prompt-sub-groups.component';
import { PromptItemSelectionComponent } from './modules/admin/menuPrompt/prompt-item-selection/prompt-item-selection.component';
import { PromptSelectedItemsComponent } from './modules/admin/menuPrompt/prompt-item-selection/prompt-selected-items/prompt-selected-items.component';
import { PromptSubGroupAssociationComponent } from './modules/admin/menuPrompt/prompt-sub-group-association/prompt-sub-group-association.component';
import { PromptKitsComponent } from './modules/admin/menuPrompt/prompt-kits/prompt-kits.component';
import { EmployeeListComponent } from './modules/admin/employees/employee-list/employee-list.component';
import { EmployeeEditComponent } from './modules/admin/employees/employee-edit/employee-edit.component';
import { PosOperationsComponent } from './modules/transactions/operations/pos-operations/pos-operations.component';
import { CompanyEditComponent } from './modules/admin/company-edit/company-edit.component';
import { CardComponent } from './modules/admin/reports/card/card.component';
import { APISettingComponent } from './modules/login/apisetting/apisetting.component';
import { PriceTiersComponent } from './modules/admin/products/price-tiers/price-tiers.component';
import { TierPricesComponent } from './modules/menu/tierMenu/tier-prices/tier-prices.component';
import { PSMenuGroupListComponent } from './modules/admin/products/price-schedule-menu-groups/psmenu-group-list/psmenu-group-list.component';
import { POSOrderScheduleComponent } from './modules/posorders/posorder-schedule/posorder-schedule.component';
import { BackgroundCoverComponent } from './shared/widgets/background-cover/background-cover.component';
import { DepartmentMenuComponent } from './modules/menu/department-menu/department-menu.component';
import { OverLayComponent } from './shared/widgets/over-lay/over-lay.component';
import { LogoComponent } from './shared/widgets/logo/logo.component';
import { FunctionGroupListComponent } from './modules/admin/settings/function-groups/function-group-list/function-group-list.component';
import { FunctionGroupEditComponent } from './modules/admin/settings/function-groups/function-group-edit/function-group-edit.component';
import { ManifestsComponent } from './modules/admin/inventory/manifests/manifests.component';
import { ManifestStatusComponent } from './modules/admin/inventory/manifest-status/manifest-status.component';
import { ManifestTypeComponent } from './modules/admin/inventory/manifest-type/manifest-type.component';
import { StoreCreditListComponent } from './modules/admin/store-credit/store-credit-list/store-credit-list.component';
import { FloorPlanComponent } from './modules/floor-plan/floor-plan/floor-plan.component';
import { QROrderComponent } from './modules/posorders/qrorder/qrorder.component';
import { MenuBoardComponent } from './modules/tv-menu/menu-board/menu-board.component';
import { GridMenuLayoutComponent } from './modules/admin/grid-menu-layout/grid-menu-layout.component';
import { GridManagerComponent } from './modules/admin/grid-menu-layout/grid-manager/grid-manager.component';
import { QRCodeTableComponent } from './modules/orders/qrcode-table/qrcode-table.component';
import { DisplayMenuListComponent } from './modules/display-menu/display-menu-list/display-menu-list.component';
import { ThreeCXFabComponent } from './shared/widgets/three-cxfab/three-cxfab.component';
import { AdminDisplayMenuListComponent } from './modules/admin/products/display-menu/display-menu-list/display-menu-list.component';
import { DisplayMenuMainComponent } from './modules/display-menu/display-menu/display-menu-main/display-menu-main.component';
import { PosPaymentsFilterComponent } from './modules/transactions/pos-payments-main/pos-payments-filter/pos-payments-filter.component';
import { PriceScheduleMenuItemsComponent } from './modules/priceSchedule/price-schedule-menu-items/price-schedule-menu-items.component';
import { PayPalTransactionComponent } from './modules/payment-processing/payPal/pay-pal-transaction/pay-pal-transaction.component';
import { BlogListEditComponent } from './modules/admin/blogEditor/blog-list-edit/blog-list-edit.component';
import { BlogPostListComponent } from './shared/widgets/blog-post-list/blog-post-list.component';
import { DevxReportDesignerComponent } from './modules/admin/devx-reporting/devx-report-designer/devx-report-designer.component';
import { ReportViewerComponent } from './modules/admin/devx-reporting/report-viewer/report-viewer.component';
import { JobTypesListComponent } from './modules/admin/clients/jobs/job-types-list/job-types-list.component';
import { EmployeeClockListComponent } from './modules/admin/employeeClockAdmin/employee-clock-list/employee-clock-list.component';
import { ClockBreaksTypesComponent } from './modules/admin/employeeClockAdmin/clock-breaks-types/clock-breaks-types.component';
import { PointlessMETRCSalesComponent } from './modules/admin/metrc/pointless-metrcsales/pointless-metrcsales.component';
import { DesignerListComponent } from './modules/admin/report-designer/designer/designer-list/designer-list.component';
import { DesignerEditorComponent } from './modules/admin/report-designer/designer/designer-editor/designer-editor.component';

const routes: Routes = [
    // { path: 'payPalTest',  component: PayPalTransactionComponent, data: { title: 'Pay Pal', animation: 'isLeft'} },

    { path: 'printerslist',  component: InstalledPrintersComponent, data: { title: 'Print Settings', animation: 'isLeft'} },
    { path: 'blog-post-list',  component: BlogPostListComponent, data: { title: 'BlogPosts', animation: 'isLeft'} },
    //  data : { title: 'Menu Board Layout', animation: 'isLeft'},
    //  { path:  'menu-board',   component: GridManagerComponent, data : { title: 'Menu Board Layout', animation: 'isLeft'}},
    { path: 'menu-board',  component: GridManagerComponent,
        children: [
          // { path: '', component: GridManagerComponent, data: {  title: 'Menu Board Layout', animation: 'isLeft'} },
          // { path: 'menu-board', component: GridManagerComponent, data: {  title: 'Menu Board Layout', animation: 'isLeft'} },
          { path: 'grid-menu-layout', component: GridMenuLayoutComponent, data: {  title: 'Menu Board Layout', animation: 'isLeft'} },
        ]
    },

    //'qr-order
    { path: 'qr-order-table',  component: QRCodeTableComponent, data: { title: 'Order Table', animation: 'isLeft'} },
    { path: 'qr-receipt',  component: QRCodeTableComponent, data: { title: 'Order', animation: 'isLeft'} },

    {path: '', component: DefaultComponent,
      children: [

        // { path:  'menu-board',   component: GridManagerComponent, data : { title: 'Menu Board Layout', animation: 'isLeft'}},
        // { path: '/menu-board',  component: GridManagerComponent, pathMatch: 'full', data : { title: 'Menu Board Layout', animation: 'isLeft'},
        //     children: [
        //       { path: '', component: GridManagerComponent, data: {animation: 'isLeft'} },
        //       { path: 'menu-board', component: GridManagerComponent, data: {animation: 'isLeft'} },
        //       { path: 'menu-board/grid-menu-layout', component: GridMenuLayoutComponent, data: {animation: 'isLeft'} },
        //     ]
        // },
        //
        { path: 'ps-designer-list', component: DesignerListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'ps-report-editor', component: DesignerEditorComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        //pointless reporting

        { path: 'report-designer', component: DevxReportDesignerComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'report-viewer'  , component: ReportViewerComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },


        { path: '', component: MainMenuComponent, canActivate: [AgeVerificationGuardService],  data: { animation: 'isLeft'} },
        { path: 'swipedelete', component: IonicSwipeToDeleteComponent,   data: { animation: 'isLeft'} },
        { path: 'app-main-menu', component: MainMenuComponent, canActivate: [AgeVerificationGuardService],  data: { title: 'Main Menu', animation: 'isLeft'} },
        { path: 'app-profile', component: ProfileComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'department-list', component: DepartmentMenuComponent,   data: {  title: 'Department Menu', animation: 'isLeft'}},
        { path: 'categories', component: CategoriesComponent,canActivate: [AgeVerificationGuardService],   data: { title: 'Categories',  animation: 'isLeft'} },
        { path: 'brandslist', component: BrandslistComponent,canActivate: [AgeVerificationGuardService],   data: { title: 'Brands',  animation: 'isLeft'} },
        { path: 'menuitems-infinite', component: MenuItemsInfiniteComponent ,canActivate: [AgeVerificationGuardService],   data: {  title: 'Menu Items',  animation:  'isLeft'} },
        { path: 'menuitem',     component: MenuitemComponent, canActivate: [AgeVerificationGuardService],  data: { title: 'Item',  animation:  'isLeft'} },
        { path: 'searchproducts', component: SearchResultsComponent, canActivate: [AgeVerificationGuardService],  data: { animation: 'isLeft'} },

        { path: 'dashboard',  component: DashboardComponent, canActivate: [AuthGuard], data: {  title: 'Dash Board',  animation: 'isLeft'} },
        { path: 'reports',    component: ReportsComponent, canActivate: [AuthGuard], data: { title: 'Reports', animation: 'isLeft'} },

        { path: 'admin',     component: AdminComponent, canActivate: [AuthGuard], data: {  title: 'Admin', animation:  'isLeft'} },
        { path: 'settings',  component: SettingsComponent, canActivate: [AuthGuard], data: {  title: 'Settings',  animation:  'isLeft'} },
        { path: 'sites',     component: SitesComponent,  canActivate: [AuthGuard], data: {  title: 'Sites',  animation:  'isLeft'} },
        { path: 'site-edit', component: SiteEditComponent,  canActivate: [AuthGuard], data: { animation:  'isLeft'} },

        { path: 'store-credit', component: StoreCreditListComponent, canActivate: [AuthGuard], data: {  title: 'Store Credit Search',  animation:  'isLeft'} },
        { path: 'pos-orders',   component: OrdersMainComponent, canActivate: [AuthGuard], data: {  title: 'Orders',  animation:  'isLeft'} },
        { path: 'currentorder', component: PosOrderComponent, canActivate: [AuthGuard], data: { title: 'Current Order', animation: 'isLeft'} },
        { path: 'pos-payment',  component: PosPaymentComponent, canActivate: [AuthGuard], data: { title: 'Payment', animation: 'isLeft'} },

        //content
        { path: 'content',  component: BlogListEditComponent, canActivate: [AuthGuard], data: { title: 'Content List', animation: 'isLeft'} },

        //employee-clock
        { path: 'employee-clock',  component: EmployeeClockListComponent, canActivate: [AuthGuard], data: { title: 'Employee Time Clock', animation: 'isLeft'} },
        { path: 'break-types',  component: ClockBreaksTypesComponent, canActivate: [AuthGuard], data: { title: 'Employee Time Clock', animation: 'isLeft'} },

        //PosOperationsComponent
        { path: 'operations', component: PosOperationsComponent, canActivate: [AuthGuard], data: {title: 'Operations', animation: 'isLeft'} },

        { path: 'pos-payments', component: POSPaymentsComponent, canActivate: [AuthGuard], data: {title: 'Payments Listing', animation: 'isLeft'} },
        { path: 'pos-payment-edit', component: PosPaymentEditComponent, canActivate: [AuthGuard], data: { title: 'Edit Payment', animation: 'isLeft'} },

        { path: 'balance-sheets', component: BalanceSheetsComponent, canActivate: [AuthGuard], data: {title: 'Balance Sheet', animation: 'isLeft'} },
        { path: 'balance-sheet-edit', component: BalanceSheetEditComponent, canActivate: [AuthGuard], data: { title: 'Balance Sheet Edit',animation: 'isLeft'} },

        //PromptGroupsComponent
        { path: 'prompt-groups', component: PromptGroupsComponent, canActivate: [AuthGuard], data: { title: 'Prompt Groups', animation: 'isLeft'} },
        { path: 'prompt-group-edit', component: PromptGroupEditComponent, canActivate: [AuthGuard], data: { title: 'Prompt Group Edit',  animation: 'isLeft'} },

        //PromptSubGroupsComponent
        { path: 'prompt-sub-groups',     component: PromptSubGroupsComponent, canActivate: [AuthGuard], data: { title: 'Prompt Sub Groups',  animation: 'isLeft'} },
        { path: 'prompt-item-selection', component: PromptItemSelectionComponent, canActivate: [AuthGuard], data: {title: 'Prompt Item Selection',  animation: 'isLeft'} },
        { path: 'prompt-items-selected', component: PromptSelectedItemsComponent, canActivate: [AuthGuard], data: { title: 'Prompt Items Selected',  animation: 'isLeft'} },
        //prompt-kits
        { path: 'prompt-kits', component: PromptKitsComponent, canActivate: [AuthGuard], data: { title: 'Prompt Kits', animation: 'isLeft'} },

        { path: 'prompt-associations', component: PromptSubGroupAssociationComponent, canActivate: [AuthGuard], data: { title: 'Prompt Assocation', animation: 'isLeft'} },

        //profile viewing
        { path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuard],data: { animation: 'isLeft'}},

        { path: 'productedit',       component: ProducteditComponent, canActivate: [AuthGuard], data: {title: 'Product Edit', animation: 'isLeft'}},
        { path: 'product-list-view', component: ProductlistviewComponent, canActivate: [AuthGuard], data: {title: 'Item  List', animation: 'isLeft'}},
        { path: 'price-categories',  component: PriceCategoriesComponent, canActivate: [AuthGuard],data: { title: 'Product Categories',animation: 'isLeft'}},

        { path: 'price-schedule',      component: PriceScheduleListComponent,canActivate: [AuthGuard], data: { title: 'Catalog Schedule', animation: 'isLeft'}},
        { path: 'price-schedule-edit', component: PriceScheduleComponent,canActivate: [AuthGuard], data: { title: 'Catalog Schedule Edit', animation: 'isLeft'}},

        { path: 'price-schedule-menu-items',      component: PriceScheduleMenuItemsComponent , data: { title: 'Menu Items', animation: 'isLeft'}},

        { path: 'display-menu-main',      component: DisplayMenuMainComponent , data: { title: 'Display Menu', animation: 'isLeft'}},
        { path: 'display-menu',      component: DisplayMenuListComponent ,   data: { title: 'Display Menu', animation: 'isLeft'}},
        { path: 'admin-display-menu',      component: AdminDisplayMenuListComponent ,canActivate: [AuthGuard], data: { title: 'Display Menu', animation: 'isLeft'}},
        //DisplayMenuListComponent

        ///price schedule layout menu
        {path: 'psmenu-group-list', component: PSMenuGroupListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        ///price schedule layout menu
        {path: 'table-layout', component: FloorPlanComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        // function-group-list
        { path: 'function-group-list', component: FunctionGroupListComponent,  canActivate: [AuthGuard], data: {  title: 'Function List', animation: 'isLeft'}},
        { path: 'function-group-edit', component: FunctionGroupEditComponent, canActivate: [AuthGuard], data: { title: 'Function Edit', animation: 'isLeft'}},

        //app-department-menu
        { path: 'categorylist', component: CategorieslistviewComponent,  canActivate: [AuthGuard], data: {  title: 'Category List', animation: 'isLeft'}},
        { path: 'categorieslistview', component: CategorieslistviewComponent, canActivate: [AuthGuard], data: { title: 'Category List', animation: 'isLeft'}},
        { path: 'adminbrandslist', component: AdminbrandslistComponent, canActivate: [AuthGuard], data: { title: 'Brand List', animation: 'isLeft'}},
        { path: 'adminbranditem', component: AdminbranditemComponent, canActivate: [AuthGuard], data: { title: 'Brand Edit', animation: 'isLeft'}},
        { path: 'pos-list', component: PosListComponent, canActivate: [AuthGuard], data: { title: 'POS List', animation: 'isLeft'}},
        { path: 'flatrate', component: FlatRateListComponent, canActivate: [AuthGuard], data: { title: 'Flat Rate List', animation: 'isLeft'}},
        { path: 'item-types', component: ItemTypeComponent, canActivate: [AuthGuard], data: { title: 'Item Type', animation: 'isLeft'}},
        { path: 'taxes', component: TaxListComponent, canActivate: [AuthGuard], data: {title: 'Tax List', animation: 'isLeft'}},
        { path: 'flat-rate-taxes', component: FlatRateListComponent, canActivate: [AuthGuard], data: {title: 'Flat Rate List', animation: 'isLeft'}},
        { path: 'price-categories', component: PriceCategoriesComponent, data: {title: 'Price Category List',  animation: 'isLeft'}},
        { path: 'unit-types', component: UnitTypeListComponent, data: { title: 'Unit Type List',  animation: 'isLeft'}},
        { path: 'printer-locations', component: PrinterLocationsComponent, data: { title: 'Printer Locations', animation: 'isLeft'}},

        { path: 'price-tier-list-edit', component: PriceTiersComponent, data: { title: 'Price Tier List', animation: 'isLeft'}},
        //PrinterLocationsComponent

        { path: 'app-order-items-list', component: OrderItemsListComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },
        { path: 'app-order-item-list', component: OrderItemListComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },

        // { name: 'Sales Report',minimized: false, method: '' , routerLink: '/metrc-sales-report', routerLinkActive: 'metrc-sales-report', icon: 'list', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},
        // { name: 'METRC Posted Sales',minimized: false, method: '' , routerLink: '/metrc-posted-sales', routerLinkActive: 'metrc-posted-sales', icon: 'list', onClick: '', id: 0, sortOrder: 1, submenuID:0, menuID: 0, submenus: this.submenu, userType: this.getManagers(), meunyType: 0},

        //app-metrc-sales
        { path: 'metrc-sales-report', component: PointlessMETRCSalesComponent, canActivate: [AuthGuard], data: {title: 'METRC Sales Report', animation:  'isLeft'} },
        { path: 'metrc-posted-sales', component: MetrcSalesListComponent, canActivate: [AuthGuard], data: {title: 'METRC Posted Sales', animation:  'isLeft'} },

        // app-package-list
        { path: 'package-list', component: PackageListComponent, canActivate: [AuthGuard], data: {title: 'Package List',  animation:  'isLeft'} },
        // 'ItemCategoriesListComponent
        { path: 'metrc-categories-list', component: ItemCategoriesListComponent, canActivate: [AuthGuard], data: {title: 'METRC Categories List', animation:  'isLeft'}},

        { path: 'metrc-facilities-list', component: FacilitiesListComponent, canActivate: [AuthGuard], data: {title: 'METRC Facilities List', animation:  'isLeft'} },

        //inventory InventoryListComponent
        { path: 'manifests', component: ManifestsComponent, canActivate: [AuthGuard], data: {  title: 'Manifests',  animation: 'isLeft'} },
        { path: 'inventory-list', component: InventoryListComponent, canActivate: [AuthGuard], data: {  title: 'Inventory',  animation: 'isLeft'} },
        { path: 'inventory-locations', component: InventoryLocationsComponent,  canActivate: [AuthGuard], data: { title: 'Inventory Locations', animation: 'isLeft'}},
        { path: 'manifest-status', component: ManifestStatusComponent,  canActivate: [AuthGuard], data: { title: 'Manifest Status List', animation: 'isLeft'}},
        { path: 'manifest-types', component: ManifestTypeComponent,  canActivate: [AuthGuard], data: { title: 'Manifest Type List', animation: 'isLeft'}},

        //profile look up editing
        { path: 'profileEditor', component: ProfileEditorComponent, canActivate: [AuthGuard], data: { title: 'Profile',  animation: 'isLeft'}},
        { path: 'profileListing', component: ProfileLookupComponent, canActivate: [AuthGuard], data: {  title: 'Profiles',  animation: 'isLeft'}},

        { path: 'employee-list', component: EmployeeListComponent, canActivate: [AuthGuard], data: {  title: 'Employees', animation: 'isLeft'}},
        { path: 'employee-edit', component: EmployeeEditComponent, canActivate: [AuthGuard], data: {  title: 'Employee', animation: 'isLeft'}},

        //ClientSettings;
        { path: 'client-type-list', component: ClientTypeListComponent, canActivate: [AuthGuard], data: {  title: 'Client Types',  animation: 'isLeft'} },
        { path: 'client-type-edit', component: ClientTypeEditComponent, canActivate: [AuthGuard], data: {  title: 'Client Type Edit',  animation: 'isLeft'} },

        { path: 'job-type-list', component: JobTypesListComponent, canActivate: [AuthGuard], data: {  title: 'Job Types',  animation: 'isLeft'} },

        //transaction settings
        { path: 'service-type-list', component: ServiceTypeListComponent, canActivate: [AuthGuard], data: { title: 'Service Type List',  animation: 'isLeft'} },
        { path: 'service-type-edit', component: ServiceTypeEditComponent, canActivate: [AuthGuard], data: {  title: 'Service Type Edit', animation: 'isLeft'} },

        //edit payment settings
        { path: 'edit-payment-method', component: PaymentMethodEditComponent, canActivate: [AuthGuard], data: { title: 'Edit Payment Methods', animation: 'isLeft'} },
        { path: 'edit-payment-method-list', component: PaymentMethodListComponent, canActivate: [AuthGuard], data: {  title: 'Edit Payment Methods List', animation: 'isLeft'} },

        { path: 'imagecapture', component: ImageCaptureComponent,data: { title: 'Image Capture',animation: 'isLeft'}},
        { path: 'review-edit', component: ReviewEditComponent, canActivate: [AuthGuard],data: { title: 'Review Edit', animation: 'isLeft'}},

        { path: 'cat-alternate', component: CategoriesAlternateComponent},

        //settings
        { path: 'side-menu-layout', component: MenuManagerComponent , canActivate: [AuthGuard], data: {  title: 'Side Menu Edit', animation: 'isLeft'}},
        { path: 'app-settings', component: SettingsComponent , canActivate: [AuthGuard], data: {  title: 'App Settings', animation: 'isLeft'}},
        { path: 'item-type-category-assignment', component: ItemTypeCategoryAssignmentComponent , canActivate: [AuthGuard], data: { title: 'Item Type Category', animation: 'isLeft'}},

        //printing
        { path: 'label1by8', component: Label1by8Component, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        //geo-location
        { path: 'location', component: IonicGeoLocationComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        { path: 'strains', component: StrainsAddComponent, canActivate: [AuthGuard], data: {  title: 'Strains', animation: 'isLeft'}},

        { path: 'keypad', component: KeyPadComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        { path: 'hammerjs', component: HammerCardComponent ,data: { animation: 'isLeft'}},
        { path: 'company-edit', component: CompanyEditComponent,   canActivate: [AuthGuard], data: {  title: 'Company Edit',  animation: 'isLeft'} },

        { path: 'view-tier-menu', component: TierMenuComponent, canActivate: [AuthGuard],data: {  title: 'Tier Menu',  animation: 'isLeft'}},

        { path: 'pos-order-schedule', component: POSOrderScheduleComponent, canActivate: [AuthGuard], data: {title: 'Schedule Order', animation: 'isLeft'}},

      ]
    },

    { path: 'view-tvpricetiers', component: TvPriceSpecialsComponent ,data: {  title: 'Tiers',  animation: 'isLeft'}},
    { path: 'view-price-tiers', component: TierPricesComponent ,data: {  title: 'Price Tiers', animation: 'isLeft'}},
    { path: 'scale-reader', component: ScaleReaderComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

    { path: 'barcodescanner', component: BarcodeScannerComponent , canActivate: [AuthGuard], data: { animation: 'isLeft'}},
    { path: 'login', component: LoginComponent, data: { title: 'Pointless Login', animation: 'isLeft'}},
    { path: 'resetpassword', component: ResetpasswordComponent,data: {  title: 'Reset Password',  animation: 'isLeft'}},
    { path: 'changepassword', component: ChangepasswordComponent,data: {  title: 'Change Password',  animation: 'isLeft'}},
    { path: 'api-setting', component: APISettingComponent , data: { title: 'API Setting',  animation: 'isLeft'}},
    { path: 'apisetting',  component: APISettingComponent , data: { title: 'API Setting', animation: 'isLeft'}},
    { path: 'register-token', component: RegisterAccountExistingUserWithTokenComponent, data: { animation: 'isLeft'}},
    { path: 'register-user', component: RegisterAccountMainComponent, data: { animation: 'isLeft'}},
    { path: 'appgate', component: AppGateComponent, data: { animation: 'isLeft'}},

    { path: 'menu-modal', component: MenuItemModalComponent, data: { animation: 'isLeft'}},
    { path: 'app-widget-card', component: CardComponent, data: { animation: 'isLeft'}},
    { path: 'overLay', component: OverLayComponent, data: { animation: 'isLeft'}},
    { path: 'logo',       component: LogoComponent, data: { animation: 'isLeft'}},
    { path: 'background', component: BackgroundCoverComponent, data: { animation: 'isLeft'}},
    { path: 'chat-app', component: ThreeCXFabComponent, data: { animation: 'isLeft'}},

    { path: '**', component: PageNotFoundComponent},


    // { path: 'menu-board', component: MenuBoardComponent,      data : { title: 'Strain Board', animation: 'isLeft'}},
    // { path: 'client-type-list', component: ClientTypeListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
    // { path: 'payments', component: DsiEMVPaymentComponent, data: { animation: 'isLeft'}},
    // { path: 'agtest', component: AgGridTestComponent, data: { animation: 'isLeft'}},
    // { path: 'printerSettings', component: InstalledPrintersComponent,canActivate: [AgeVerificationGuardService],   data: { animation: 'isLeft'} },
    // { path: 'brandslist2', component: BrandslistComponent,canActivate: [AgeVerificationGuardService],   data: { animation: 'isLeft'} },
    // { path: 'catscroll', component: CategoryScrollComponent, data: { animation: 'isLeft'}},
    // { path: 'product-search-selector', component: ProductSearchSelectorComponent , canActivate: [AuthGuard], data: { title: 'Item Search',  animation: 'isLeft'}},
  ];

@NgModule({
  imports:[
    // RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    // RouterModule.forRoot(routes, { preloadingStrategy: QuicklinkStrategy })
    RouterModule.forRoot(routes, { enableTracing: true })
  ],
  // imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: [
    {
      provide: CustomReuseStrategy,
      useClass: CustomReuseStrategy
    }],
})
export class AppRoutingModule { }

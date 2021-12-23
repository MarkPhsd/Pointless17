import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { QuicklinkStrategy, QuicklinkModule} from 'ngx-quicklink';
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
import { TVPriceTiersComponent } from './modules/tv-menu/price-tiers/price-tiers.component';
import { RegisterAccountExistingUserComponent } from './modules/login/registration/register-account-existing-user/register-account-existing-user.component';
import { RegisterAccountExistingUserWithTokenComponent } from './modules/login/registration/register-account-existing-user-with-token/register-account-existing-user-with-token.component';
import { RegisterAccountMainComponent } from './modules/login/registration/register-account-main/register-account-main.component';
import { CategoriesAlternateComponent } from './modules/menu/categories/categories-alternate/categories-alternate.component';
import { BarcodeScannerComponent } from './shared/widgets/barcode-scanner/barcode-scanner.component';
import { PackageListComponent } from './modules/admin/metrc/packages/package-list.component';
import { ItemCategoriesListComponent } from './modules/admin/metrc/items/item-categories-list/item-categories-list.component';
import { ProductSearchSelectorComponent } from './shared/widgets/product-search-selector/product-search-selector.component'
import { PreloadAllModules } from '@angular/router';
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


const routes: Routes = [

   {path: '', component: DefaultComponent,
      children: [

        { path: 'swipedelete', component: IonicSwipeToDeleteComponent,   data: { animation: 'isLeft'} },

        { path: '', component: MainMenuComponent, canActivate: [AgeVerificationGuardService],  data: { animation: 'isLeft'} },
        { path: 'app-main-menu', component: MainMenuComponent, canActivate: [AgeVerificationGuardService],  data: { animation: 'isLeft'} },

        { path: 'app-profile', component: ProfileComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'categories', component: CategoriesComponent,canActivate: [AgeVerificationGuardService],   data: { animation: 'isLeft'} },
        { path: 'brandslist', component: BrandslistComponent,canActivate: [AgeVerificationGuardService],   data: { animation: 'isLeft'} },
        { path: 'menuitems-infinite', component: MenuItemsInfiniteComponent ,canActivate: [AgeVerificationGuardService],   data: { animation:  'isLeft'} },

        { path: 'menuitem',     component: MenuitemComponent, canActivate: [AgeVerificationGuardService],  data: { animation:  'isLeft'} },
        { path: 'searchproducts', component: SearchResultsComponent, canActivate: [AgeVerificationGuardService],  data: { animation: 'isLeft'} },

        { path: 'dashboard',  component: DashboardComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'reports',    component: ReportsComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },
        { path: 'settings', component: SettingsComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },
        { path: 'sites',      component: SitesComponent,  canActivate: [AuthGuard], data: { animation:  'isLeft'} },
        { path: 'site-edit', component: SiteEditComponent,  canActivate: [AuthGuard], data: { animation:  'isLeft'} },

        { path: 'pos-orders', component: OrdersMainComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },
        { path: 'currentorder', component: PosOrderComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'pos-payment', component: PosPaymentComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        //PosOperationsComponent
        { path: 'operations', component: PosOperationsComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'pos-payments', component: POSPaymentsComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'pos-payment-edit', component: PosPaymentEditComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'balance-sheets', component: BalanceSheetsComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'balance-sheet-edit', component: BalanceSheetEditComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        //PromptGroupsComponent
        { path: 'prompt-groups', component: PromptGroupsComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'prompt-group-edit', component: PromptGroupEditComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        //PromptSubGroupsComponent
        { path: 'prompt-sub-groups', component: PromptSubGroupsComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'prompt-item-selection', component: PromptItemSelectionComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'prompt-items-selected', component: PromptSelectedItemsComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        //prompt-kits
        { path: 'prompt-kits', component: PromptKitsComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'prompt-associations', component: PromptSubGroupAssociationComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        //profile viewing
        { path: 'wishlist', component: WishlistComponent, canActivate: [AuthGuard],data: { animation: 'isLeft'}},

        { path: 'productedit', component: ProducteditComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'product-list-view', component: ProductlistviewComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'price-categories', component: PriceCategoriesComponent, canActivate: [AuthGuard],data: { animation: 'isLeft'}},

        { path: 'price-schedule', component: PriceScheduleListComponent,canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'price-schedule-edit', component: PriceScheduleComponent,canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        ///price schedule layout menu
        {path: 'psmenu-group-list', component: PSMenuGroupListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        { path: 'categorylist', component: CategorieslistviewComponent,  canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'categorieslistview', component: CategorieslistviewComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'adminbrandslist', component: AdminbrandslistComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'adminbranditem', component: AdminbranditemComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'pos-list', component: PosListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'flatrate', component: FlatRateListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'item-types', component: ItemTypeComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'taxes', component: TaxListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'flat-rate-taxes', component: FlatRateListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'price-categories', component: PriceCategoriesComponent, data: { animation: 'isLeft'}},
        { path: 'unit-types', component: UnitTypeListComponent, data: { animation: 'isLeft'}},
        { path: 'printer-locations', component: PrinterLocationsComponent, data: { animation: 'isLeft'}},

        { path: 'price-tier-list-edit', component: PriceTiersComponent, data: {animation: 'isLeft'}},
        //PrinterLocationsComponent

        { path: 'app-order-items-list', component: OrderItemsListComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },
        { path: 'app-order-item-list', component: OrderItemListComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },

        //app-metrc-sales
        { path: 'metrc-sales', component: MetrcSalesListComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },

        // app-package-list
        { path: 'package-list', component: PackageListComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },
        // 'ItemCategoriesListComponent
        { path: 'metrc-categories-list', component: ItemCategoriesListComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'}},

        { path: 'metrc-facilities-list', component: FacilitiesListComponent, canActivate: [AuthGuard], data: { animation:  'isLeft'} },

        //inventory InventoryListComponent
        { path: 'inventory-list', component: InventoryListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'inventory-locations', component: InventoryLocationsComponent,  canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        //profile look up editing
        { path: 'profileEditor', component: ProfileEditorComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'profileListing', component: ProfileLookupComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        { path: 'employee-list', component: EmployeeListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'employee-edit', component: EmployeeEditComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        //ClientSettings;
        { path: 'client-type-list', component: ClientTypeListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'client-type-edit', component: ClientTypeEditComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        //transaction settings
        { path: 'service-type-list', component: ServiceTypeListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'service-type-edit', component: ServiceTypeEditComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        //edit payment settings
        { path: 'edit-payment-method', component: PaymentMethodEditComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
        { path: 'edit-payment-method-list', component: PaymentMethodListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'imagecapture', component: ImageCaptureComponent,data: { animation: 'isLeft'}},
        { path: 'review-edit', component: ReviewEditComponent, canActivate: [AuthGuard],data: { animation: 'isLeft'}},

        { path: 'cat-alternate', component: CategoriesAlternateComponent},

        //settings
        { path: 'side-menu-layout', component: MenuManagerComponent , canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'app-settings', component: SettingsComponent , canActivate: [AuthGuard], data: { animation: 'isLeft'}},
        { path: 'item-type-category-assignment', component: ItemTypeCategoryAssignmentComponent , canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        //printing
        { path: 'label1by8', component: Label1by8Component, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        //geo-location
        { path: 'location', component: IonicGeoLocationComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        { path: 'strains', component: StrainsAddComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        { path: 'keypad', component: KeyPadComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'}},

        { path: 'hammerjs', component: HammerCardComponent ,data: { animation: 'isLeft'}},
        // { path: 'pos-order-item', component: PosOrderItemComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'company-edit', component: CompanyEditComponent,   canActivate: [AuthGuard], data: { animation: 'isLeft'} },

        { path: 'view-tier-menu', component: TierMenuComponent, canActivate: [AuthGuard],data: { animation: 'isLeft'}},
      ]
    },

    { path: 'view-tvpricetiers', component: TvPriceSpecialsComponent ,data: { animation: 'isLeft'}},

    { path: 'view-price-tiers', component: TierPricesComponent ,data: { animation: 'isLeft'}},

    { path: 'scale-reader', component: ScaleReaderComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },
    { path: 'client-type-list', component: ClientTypeListComponent, canActivate: [AuthGuard], data: { animation: 'isLeft'} },

    { path: 'payments', component: DsiEMVPaymentComponent, data: { animation: 'isLeft'}},

    { path: 'agtest', component: AgGridTestComponent, data: { animation: 'isLeft'}},

    { path: 'printerSettings', component: InstalledPrintersComponent,canActivate: [AgeVerificationGuardService],   data: { animation: 'isLeft'} },
    { path: 'brandslist2', component: BrandslistComponent,canActivate: [AgeVerificationGuardService],   data: { animation: 'isLeft'} },
    { path: 'catscroll', component: CategoryScrollComponent, data: { animation: 'isLeft'}},

    { path: 'product-search-selector', component: ProductSearchSelectorComponent , canActivate: [AuthGuard], data: { animation: 'isLeft'}},
    { path: 'barcodescanner', component: BarcodeScannerComponent , canActivate: [AuthGuard], data: { animation: 'isLeft'}},

     { path: 'login', component: LoginComponent, data: { animation: 'isLeft'}},
    { path: 'resetpassword', component: ResetpasswordComponent,data: { animation: 'isLeft'}},
    { path: 'changepassword', component: ChangepasswordComponent,data: { animation: 'isLeft'}},

    { path: 'api-setting', component: APISettingComponent , data: { animation: 'isLeft'}},
    { path: 'apisetting',  component: APISettingComponent , data: { animation: 'isLeft'}},

    { path: 'register-existing-user', component: RegisterAccountExistingUserComponent, data: { animation: 'isLeft'}},
    { path: 'register-token', component: RegisterAccountExistingUserWithTokenComponent, data: { animation: 'isLeft'}},
    { path: 'register-user', component: RegisterAccountMainComponent, data: { animation: 'isLeft'}},

    { path: 'appgate', component: AppGateComponent, data: { animation: 'isLeft'}},

    { path: 'menu-modal', component: MenuItemModalComponent, data: { animation: 'isLeft'}},

    { path: 'app-widget-card', component: CardComponent, data: { animation: 'isLeft'}},
    { path: '**', component: PageNotFoundComponent},
  ];

@NgModule({
  imports:[
    // RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    RouterModule.forRoot(routes, { preloadingStrategy: QuicklinkStrategy })
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

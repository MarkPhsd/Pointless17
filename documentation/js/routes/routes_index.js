var ROUTES_INDEX = {"name":"<root>","kind":"module","className":"AppModule","children":[{"name":"routes","filename":"src/app/app-routing.module.ts","module":"AppRoutingModule","children":[{"path":"","component":"DefaultComponent","children":[{"path":"","component":"MainMenuComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"app-main-menu","component":"MainMenuComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"app-profile","component":"ProfileComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"categories","component":"CategoriesComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"brandslist","component":"BrandslistComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"menuitems","component":"MenuitemsComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"menuitems-infinite","component":"MenuItemsInfiniteComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"menuitem","component":"MenuitemComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"searchproducts","component":"SearchResultsComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"dashboard","component":"DashboardComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"reports","component":"ReportsComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"admin","component":"AdminComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"settings","component":"SettingsComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"sites","component":"SitesComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"site-edit","component":"SiteEditComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"pos-orders","component":"OrdersMainComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"pos-order-search","component":"PosOrdersComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"currentorder","component":"PosOrderComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"wishlist","component":"WishlistComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"productedit","component":"ProducteditComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"product-list-view","component":"ProductlistviewComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"price-schedule","component":"PriceScheduleListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"price-schedule-edit","component":"PriceScheduleComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"price-categories","component":"PriceCategoriesComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"categorylist","component":"CategorieslistviewComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"categorieslistview","component":"CategorieslistviewComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"adminbrandslist","component":"AdminbrandslistComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"adminbranditem","component":"AdminbranditemComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"pos-list","component":"PosListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"flatrate","component":"FlatRateListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"item-types","component":"ItemTypeComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"taxes","component":"TaxListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"flat-rate-taxes","component":"FlatRateListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"price-categories","component":"PriceCategoriesComponent","data":{"animation":"isLeft"}},{"path":"unit-types","component":"UnitTypeListComponent","data":{"animation":"isLeft"}},{"path":"app-order-items-list","component":"OrderItemsListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"app-order-item-list","component":"OrderItemListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"metrc-sales","component":"MetrcSalesListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"package-list","component":"PackageListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"metrc-categories-list","component":"ItemCategoriesListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"metrc-facilities-list","component":"FacilitiesListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"inventory-list","component":"InventoryListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"inventory-locations","component":"InventoryLocationsComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"profileEditor","component":"ProfileEditorComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"profileListing","component":"ProfileLookupComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"client-type-list","component":"ClientTypeListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"client-type-edit","component":"ClientTypeEditComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"service-type-list","component":"ServiceTypeListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"service-type-edit","component":"ServiceTypeEditComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"imagecapture","component":"ImageCaptureComponent","data":{"animation":"isLeft"}},{"path":"review-edit","component":"ReviewEditComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"tier-menu","component":"TierMenuComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"cat-alternate","component":"CategoriesAlternateComponent"},{"path":"drag","component":"MenuManagerComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"app-settings","component":"SettingsComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"item-type-category-assignment","component":"ItemTypeCategoryAssignmentComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"label1by8","component":"Label1by8Component","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"location","component":"IonicGeoLocationComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"strains","component":"StrainsAddComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"hammerjs","component":"HammerCardComponent","data":{"animation":"isLeft"}}]},{"path":"scale-reader","component":"ScaleReaderComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"client-type-list","component":"ClientTypeListComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"payments","component":"DsiEMVPaymentComponent","data":{"animation":"isLeft"}},{"path":"agtest","component":"AgGridTestComponent","data":{"animation":"isLeft"}},{"path":"printerSettings","component":"InstalledPrintersComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"brandslist2","component":"BrandslistComponent","canActivate":["AgeVerificationGuardService"],"data":{"animation":"isLeft"}},{"path":"menu-accordion","component":"AccordionComponent","data":{"animation":"isLeft"}},{"path":"menu-minimal","component":"MenuMinimalComponent","data":{"animation":"isLeft"}},{"path":"menu-tiny","component":"MenuTinyComponent","data":{"animation":"isLeft"}},{"path":"catscroll","component":"CategoryScrollComponent","data":{"animation":"isLeft"}},{"path":"product-search-selector","component":"ProductSearchSelectorComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"barcodescanner","component":"BarcodeScannerComponent","canActivate":["AuthGuard"],"data":{"animation":"isLeft"}},{"path":"login","component":"LoginComponent","data":{"animation":"isLeft"}},{"path":"resetpassword","component":"ResetpasswordComponent","data":{"animation":"isLeft"}},{"path":"changepassword","component":"ChangepasswordComponent","data":{"animation":"isLeft"}},{"path":"register-existing-user","component":"RegisterAccountExistingUserComponent","data":{"animation":"isLeft"}},{"path":"register-token","component":"RegisterAccountExistingUserWithTokenComponent","data":{"animation":"isLeft"}},{"path":"register-user","component":"RegisterAccountMainComponent","data":{"animation":"isLeft"}},{"path":"app-app-gate","component":"AppGateComponent","data":{"animation":"isLeft"}},{"path":"price-tier","component":"PriceTiersComponent"},{"path":"tvpricetiers","component":"TvPriceSpecialsComponent","data":{"animation":"isLeft"}},{"path":"menu-modal","component":"MenuItemModalComponent","data":{"animation":"isLeft"}},{"path":"**","component":"PageNotFoundComponent"}],"kind":"module"}]}

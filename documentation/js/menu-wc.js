'use strict';

customElements.define('compodoc-menu', class extends HTMLElement {
    constructor() {
        super();
        this.isNormalMode = this.getAttribute('mode') === 'normal';
    }

    connectedCallback() {
        this.render(this.isNormalMode);
    }

    render(isNormalMode) {
        let tp = lithtml.html(`
        <nav>
            <ul class="list">
                <li class="title">
                    <a href="index.html" data-type="index-link">pointless documentation</a>
                </li>

                <li class="divider"></li>
                ${ isNormalMode ? `<div id="book-search-input" role="search"><input type="text" placeholder="Type to search"></div>` : '' }
                <li class="chapter">
                    <a data-type="chapter-link" href="index.html"><span class="icon ion-ios-home"></span>Getting started</a>
                    <ul class="links">
                        <li class="link">
                            <a href="overview.html" data-type="chapter-link">
                                <span class="icon ion-ios-keypad"></span>Overview
                            </a>
                        </li>
                        <li class="link">
                            <a href="index.html" data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>README
                            </a>
                        </li>
                        <li class="link">
                            <a href="changelog.html"  data-type="chapter-link">
                                <span class="icon ion-ios-paper"></span>CHANGELOG
                            </a>
                        </li>
                                <li class="link">
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                                <li class="link">
                                    <a href="properties.html" data-type="chapter-link">
                                        <span class="icon ion-ios-apps"></span>Properties
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-bs-toggle="collapse" ${ isNormalMode ?
                                'data-bs-target="#modules-links"' : 'data-bs-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AdminModule.html" data-type="entity-link" >AdminModule</a>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AdminModule-032882f5e0d30bb3a85663dd259a6da1719eedb6ff69600354ebb1029bf664d0e2ae633313f3da8f6032e630e5385dc23d96bc3a8dcf6262f2ae75b631ee37d1"' : 'data-bs-target="#xs-injectables-links-module-AdminModule-032882f5e0d30bb3a85663dd259a6da1719eedb6ff69600354ebb1029bf664d0e2ae633313f3da8f6032e630e5385dc23d96bc3a8dcf6262f2ae75b631ee37d1"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AdminModule-032882f5e0d30bb3a85663dd259a6da1719eedb6ff69600354ebb1029bf664d0e2ae633313f3da8f6032e630e5385dc23d96bc3a8dcf6262f2ae75b631ee37d1"' :
                                        'id="xs-injectables-links-module-AdminModule-032882f5e0d30bb3a85663dd259a6da1719eedb6ff69600354ebb1029bf664d0e2ae633313f3da8f6032e630e5385dc23d96bc3a8dcf6262f2ae75b631ee37d1"' }>
                                        <li class="link">
                                            <a href="injectables/AgGridService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgGridService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppMaterialModule.html" data-type="entity-link" >AppMaterialModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' : 'data-bs-target="#xs-components-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' :
                                            'id="xs-components-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' }>
                                            <li class="link">
                                                <a href="components/AgGridImageFormatterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgGridImageFormatterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AgGridTestComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgGridTestComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AgGridToggleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgGridToggleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppGateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppGateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BarcodeScannerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BarcodeScannerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoriesAlternateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesAlternateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoryItemsBoardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryItemsBoardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoryItemsBoardItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryItemsBoardItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChangepasswordComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChangepasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridComponentPropertiesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridComponentPropertiesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridDesignerInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridDesignerInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridManagerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridManagerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridManagerEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridManagerEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridMenuLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridMenuLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GridcomponentPropertiesDesignComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GridcomponentPropertiesDesignComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LimitValuesCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LimitValuesCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderHeaderDemographicsBoardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderHeaderDemographicsBoardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderTotalBoardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderTotalBoardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterAccountExistingUserWithTokenComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterAccountExistingUserWithTokenComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterAccountMainComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterAccountMainComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ResetpasswordComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResetpasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SplashLoadingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SplashLoadingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TvPriceSpecialsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TvPriceSpecialsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TvPriceTierMenuItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TvPriceTierMenuItemsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' : 'data-bs-target="#xs-directives-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' :
                                        'id="xs-directives-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' }>
                                        <li class="link">
                                            <a href="directives/CurrencyFormatterDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CurrencyFormatterDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/ResizeDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ResizeDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' : 'data-bs-target="#xs-injectables-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' :
                                        'id="xs-injectables-links-module-AppModule-bc2d597141c7c8286fce227803445fb32578b5d6da754f9cb05df990f0cc523a04eab3543bbe9b02064780ecb52e05089d77d94aff6b2c6d7a44bdf380516fcf"' }>
                                        <li class="link">
                                            <a href="injectables/AppInitService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppInitService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/CacheClientService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CacheClientService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/HttpClientCacheService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HttpClientCacheService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PagerService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PagerService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/RenderingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RenderingService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DashboardModule.html" data-type="entity-link" >DashboardModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DashBoardRoutingModule.html" data-type="entity-link" >DashBoardRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DefaultModule.html" data-type="entity-link" >DefaultModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' : 'data-bs-target="#xs-components-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' :
                                            'id="xs-components-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' }>
                                            <li class="link">
                                                <a href="components/AccordionMenuItemEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccordionMenuItemEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ActivityTogglesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ActivityTogglesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ActivityTogglesMetrcComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ActivityTogglesMetrcComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddInventoryItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddInventoryItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AddItemByTypeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AddItemByTypeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdjustItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdjustItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminDisplayMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminDisplayMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminDisplayMenuListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminDisplayMenuListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminDisplayMenuSelctorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminDisplayMenuSelctorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminbranditemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminbranditemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminbrandslistComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminbrandslistComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AgPaginationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgPaginationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppWizardStatusComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppWizardStatusComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetCalculationsViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetCalculationsViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetEmployeeSalesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetEmployeeSalesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetHeaderViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetHeaderViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetQuickViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetQuickViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BlogListEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BlogListEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BlogPostEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BlogPostEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BlogPostSortComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BlogPostSortComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BrandslistComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandslistComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CSVImportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CSVImportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CacheSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CacheSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CardPointIDTECHAndroidComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CardPointIDTECHAndroidComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CardPointSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CardPointSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CardPointeCardPayBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CardPointeCardPayBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CardpointeTransactionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CardpointeTransactionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CashPaymentButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CashPaymentButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoriesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategorieslistviewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategorieslistviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategorySelectListFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategorySelectListFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CheckInProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CheckInProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClientInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClientTypeEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientTypeEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClientTypeListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientTypeListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClientTypeSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientTypeSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClockBreaksTypesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClockBreaksTypesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CloseDayValidationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CloseDayValidationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompanyEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompanyEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CpVIVO3300Component.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CpVIVO3300Component</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CreditCardPaymentsPrintListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CreditCardPaymentsPrintListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DSIAndroidSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DSIAndroidSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DSIEMVAndroidPayBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DSIEMVAndroidPayBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DSIEMVTransactionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DSIEMVTransactionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DailyReportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DailyReportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DatabaseSchemaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatabaseSchemaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DateScheduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DateScheduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DefaultComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DefaultComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DefaultReceiptSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DefaultReceiptSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DemographicsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DemographicsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DevxReportDesignerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DevxReportDesignerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DiscountOptionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DiscountOptionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DiscountTypeSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DiscountTypeSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DisplayMenuListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisplayMenuListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DisplayMenuMainComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisplayMenuMainComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DisplayMenuSortComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisplayMenuSortComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DisplayMenuTitleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisplayMenuTitleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DsiAndroidResultsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DsiAndroidResultsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DsiEMVAndroidComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DsiEMVAndroidComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DsiEMVCardPayBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DsiEMVCardPayBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditCSSStylesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditCSSStylesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditSelectedItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditSelectedItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeClockEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeClockEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeClockFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeClockFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeClockListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeClockListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeDetailsPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeDetailsPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeFilterPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeFilterPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeLookupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeLookupComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmployeeMetrcKeyEntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeMetrcKeyEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ExportDataComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExportDataComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FacilitiesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FacilitiesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FlatRateEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FlatRateEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FlatRateListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FlatRateListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FlatTaxRateListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FlatTaxRateListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FloorPlanComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FloorPlanComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FunctionGroupButtonEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FunctionGroupButtonEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FunctionGroupEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FunctionGroupEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FunctionGroupListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FunctionGroupListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GiftCardPayBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GiftCardPayBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HTMLEditPrintingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HTMLEditPrintingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImageCaptureComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImageCaptureComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InstalledPrintersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InstalledPrintersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryCountsViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryCountsViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryHeaderValuesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryHeaderValuesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryHistoryItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryHistoryItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryHistoryListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryHistoryListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryLocationsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryLocationsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemCategoriesEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemCategoriesEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemCategoriesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemCategoriesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemSortComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemSortComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemTypeCategoryAssignmentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemTypeCategoryAssignmentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemTypeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemTypeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemTypeDisplayAssignmentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemTypeDisplayAssignmentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemTypeEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemTypeEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemTypeTogglesEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemTypeTogglesEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/JobTypesEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobTypesEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/JobTypesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >JobTypesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LabelViewSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LabelViewSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LinkedPriceSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LinkedPriceSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ListPrintersElectronComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListPrintersElectronComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/METRCProductsAddComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >METRCProductsAddComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MainMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainfestEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MainfestEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MainfestFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MainfestFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManifestEditorHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManifestEditorHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManifestStatusComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManifestStatusComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManifestTypeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManifestTypeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ManifestsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ManifestsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuBoardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuBoardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuGroupItemEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuGroupItemEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemCardDashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemCardDashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemExtendedPricesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemExtendedPricesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemModalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemProductCountComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemProductCountComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemsInfiniteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemsInfiniteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuManagerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuManagerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuitemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuitemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MessagesToUserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessagesToUserComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcIndividualPackageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcIndividualPackageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcIntakeHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcIntakeHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcInventoryPropertiesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcInventoryPropertiesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcSalesFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcSalesFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcSalesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcSalesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NewInventoryItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NewInventoryItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OptionsSelectFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OptionsSelectFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderCardsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderCardsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderFilterPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderFilterPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderItemListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderItemListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderItemsListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderItemsListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderPrepComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderPrepComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderTypeSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderTypeSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrdersListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrdersMainComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersMainComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/POSOrderScheduleCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >POSOrderScheduleCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/POSOrderScheduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >POSOrderScheduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/POSOrderScheduleFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >POSOrderScheduleFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/POSOrderServiceTypeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >POSOrderServiceTypeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/POSOrderShippingAddressComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >POSOrderShippingAddressComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/POSPaymentsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >POSPaymentsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/POSSplitItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >POSSplitItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PSMenuGroupEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PSMenuGroupEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PSMenuGroupListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PSMenuGroupListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PackageListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PackageListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PackageSearchSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PackageSearchSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PasswordValidationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PasswordValidationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PayPalTransactionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PayPalTransactionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentMethodEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentMethodEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentMethodListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentMethodListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentMethodSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentMethodSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaypalCardPayBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaypalCardPayBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PointlessMETRCSalesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PointlessMETRCSalesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosEditSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosEditSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOperationsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOperationsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderBoardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderBoardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderItemEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderItemEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderItemListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderItemListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderNotesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderNotesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderPriceScheduleInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderPriceScheduleInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderScheduleDescriptionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderScheduleDescriptionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosPaymentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosPaymentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosPaymentsFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosPaymentsFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosSplitGroupsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosSplitGroupsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrepContainerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrepContainerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrepOrderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrepOrderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrepOrderFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrepOrderFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrepOrderItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrepOrderItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategoriesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategoriesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategoriesEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategoriesEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategoryConversionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategoryConversionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategoryMultiplePricesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategoryMultiplePricesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategoryPriceFieldsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategoryPriceFieldsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategoryTimeFiltersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategoryTimeFiltersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceOptionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceOptionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleConstraintsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleConstraintsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleFieldsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleFieldsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleMenuItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleMenuItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleMenuOptionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleMenuOptionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleSortComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleSortComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceTierEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceTierEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceTierLineEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceTierLineEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceTiersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceTiersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrintGroupReceiptComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrintGroupReceiptComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrintTemplateComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrintTemplateComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrintTemplatePopUpComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrintTemplatePopUpComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductInfoPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductInfoPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductListByBarcodeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductListByBarcodeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProducteditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProducteditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductlistviewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductlistviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileDemographicsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileDemographicsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileIDCardInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileIDCardInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileLookupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileLookupComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileRolesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileRolesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptGroupEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptGroupEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptGroupSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptGroupSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptGroupsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptGroupsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptInfoPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptInfoPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptItemSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptItemSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptItemsSelectedComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptItemsSelectedComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptKitsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptKitsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptPanelMenuItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptPanelMenuItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptPanelMenuItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptPanelMenuItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptSelectedItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptSelectedItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptSubGroupAssociationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptSubGroupAssociationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptSubGroupEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptSubGroupEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptSubGroupPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptSubGroupPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptSubGroupsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptSubGroupsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PromptWalkThroughComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PromptWalkThroughComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PurchaseItemCostHistoryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PurchaseItemCostHistoryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PurchaseItemSalesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PurchaseItemSalesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/QuickPayButtonsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >QuickPayButtonsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReceiptLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReceiptLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReceiptViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReceiptViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RecieptPopUpComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RecieptPopUpComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportViewerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportViewerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RequiresSerialComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RequiresSerialComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReviewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReviewEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReviewEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReviewsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReviewsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RewardTypeFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RewardTypeFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RewardTypeResultsSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RewardTypeResultsSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScheduledMenuContainerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScheduledMenuContainerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScheduledMenuHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScheduledMenuHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScheduledMenuImageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScheduledMenuImageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScheduledMenuItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScheduledMenuItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScheduledMenuItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScheduledMenuItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScheduledMenuListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScheduledMenuListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchInventoryInputComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchInventoryInputComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchPanelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchResultsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchResultsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ServiceTypeEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ServiceTypeEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ServiceTypeListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ServiceTypeListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SiteEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SiteEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SiteEditFormComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SiteEditFormComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SiteFooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SiteFooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SitepointsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SitepointsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SitepurchasesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SitepurchasesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SitesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SitesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SoftwareComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SoftwareComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StickyHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StickyHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StoreCreditEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StoreCreditEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StoreCreditIssueComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StoreCreditIssueComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StoreCreditListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StoreCreditListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StoreCreditPopUpComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StoreCreditPopUpComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StrainBoardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StrainBoardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StrainCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StrainCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StrainPackagesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StrainPackagesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StrainProductEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StrainProductEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StrainsAddComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StrainsAddComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StripeCardPayBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StripeCardPayBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StripeCheckOutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StripeCheckOutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StripeSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StripeSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TVPriceTiersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TVPriceTiersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TaxEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TaxEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TaxListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TaxListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TaxRateListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TaxRateListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TierItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TierItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TierMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TierMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TierPriceLineComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TierPriceLineComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TierPricesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TierPricesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TiersWithPricesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TiersWithPricesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TimeScheduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TimeScheduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TriPOSCardPayBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TriPOSCardPayBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TriPosTransactionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TriPosTransactionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TriposSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TriposSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypeBoardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypeBoardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypeBoardItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypeBoardItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypeFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypeFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypeResultsSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypeResultsSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UITransactionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UITransactionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnitTypeEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnitTypeEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnitTypeListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnitTypeListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnitTypePromptComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnitTypePromptComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnitTypeSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnitTypeSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UseGroupTaxAssignmentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UseGroupTaxAssignmentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UsermessagesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UsermessagesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WeekDaySelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WeekDaySelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WicEBTCardPayBtnComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WicEBTCardPayBtnComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WishlistComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WishlistComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ZoomFloorPlanComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ZoomFloorPlanComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' : 'data-bs-target="#xs-directives-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' :
                                        'id="xs-directives-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' }>
                                        <li class="link">
                                            <a href="directives/DndDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DndDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/ScrollableDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScrollableDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#injectables-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' : 'data-bs-target="#xs-injectables-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' :
                                        'id="xs-injectables-links-module-DefaultModule-3a99286b4fd9326f035b0cb2694b80af02976a868e1ef61573058885745963bb4de9ad118fafdf1af4d56098964c6777e865a5442bd8a980aa3efa28a7f89d60"' }>
                                        <li class="link">
                                            <a href="injectables/AgGridService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgGridService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AnimationCountService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnimationCountService</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                            <li class="link">
                                <a href="modules/NGXMaterialModule.html" data-type="entity-link" >NGXMaterialModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#components-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' : 'data-bs-target="#xs-components-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' :
                                            'id="xs-components-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' }>
                                            <li class="link">
                                                <a href="components/APISettingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >APISettingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AccordionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccordionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdjustPaymentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdjustPaymentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdjustmentReasonsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdjustmentReasonsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AgIconFormatterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgIconFormatterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AggregateSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AggregateSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AndOrSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AndOrSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ApiStatusDisplayComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiStatusDisplayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ApiStoredValueComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ApiStoredValueComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AppWizardProgressButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AppWizardProgressButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AreaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AreaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BackgroundCoverComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BackgroundCoverComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BalanceSheetReportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BalanceSheetReportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BlogPostComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BlogPostComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BlogPostListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BlogPostListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BrandTypeSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandTypeSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BtBlueToothScannerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BtBlueToothScannerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BtPOSPrinterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BtPOSPrinterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ButtonRendererComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ButtonRendererComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CallUsSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CallUsSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CannabisItemEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CannabisItemEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CardDashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CardDashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CartButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CartButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CashDrawerSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CashDrawerSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CashValueCalcComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CashValueCalcComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoryScrollComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryScrollComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategorySelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategorySelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChangeDueComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChangeDueComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChartTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChartTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChemicalSpinnersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChemicalSpinnersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChemicalValuesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChemicalValuesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ChipsDisplayComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChipsDisplayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClientSearchSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientSearchSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClientTypesLookupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientTypesLookupComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ClockInOutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClockInOutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CompanyInfoHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CompanyInfoHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DSIEMVElectronComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DSIEMVElectronComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DepartmentMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DepartmentMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DepartmentSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DepartmentSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DesignerEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DesignerEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DesignerListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DesignerListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DeviceInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DeviceInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DisplayMenuMenuComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisplayMenuMenuComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DsiEMVPaymentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DsiEMVPaymentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DynamicAgGridComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DynamicAgGridComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditButtonsStandardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditButtonsStandardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ElectronZoomControlComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ElectronZoomControlComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmailEntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EmailSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmailSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ExitLabelSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ExitLabelSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FacilitySearchSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FacilitySearchSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FastUserSwitchComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FastUserSwitchComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FieldListTypeAssignerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FieldListTypeAssignerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FieldSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FieldSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FieldTypeSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FieldTypeSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FieldValueSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FieldValueSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FilterBuilderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterBuilderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FooterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FooterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FormSelectListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FormSelectListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GenericIdSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GenericIdSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GenericNameSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GenericNameSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/GroupByTypesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >GroupByTypesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HammerCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HammerCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IFrameComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IFrameComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImageContainerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImageContainerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ImageSwiperComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ImageSwiperComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryAdjustmentNoteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryAdjustmentNoteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IonicGeoLocationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IonicGeoLocationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IonicSwipeToDeleteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IonicSwipeToDeleteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemSalesCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemSalesCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemTypeSortComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemTypeSortComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/KeyPadComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >KeyPadComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/KeyboardButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >KeyboardButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/KeyboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >KeyboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/KeyboardViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >KeyboardViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/Label1by8Component.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >Label1by8Component</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LastImageDisplayComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LastImageDisplayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LimitValuesProgressBarsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LimitValuesProgressBarsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LiquorProductEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LiquorProductEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ListProductSearchInputComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListProductSearchInputComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LogoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LogoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/M22ResizableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >M22ResizableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatDateRangeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatDateRangeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatMenuBasicComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatMenuBasicComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatSelectNGModelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatSelectNGModelComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatSpinnerOverlayComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatSpinnerOverlayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MatToggleSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MatToggleSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuCompactComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuCompactComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemGalleryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemGalleryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuMinimalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuMinimalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuPriceSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuPriceSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuSearchBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuSearchBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuTinyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuTinyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetaTagChipsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetaTagChipsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcSummaryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcSummaryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MoveInventoryLocationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MoveInventoryLocationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MyThingComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MyThingComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NewOrderTypeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NewOrderTypeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderHeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderHeaderDemoGraphicsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderHeaderDemoGraphicsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderTotalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderTotalComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OverLayComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OverLayComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PageNotFoundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PageNotFoundComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PagerBlobComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PagerBlobComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PagingInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PagingInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentBalanceComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentBalanceComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentReportCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentReportCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentReportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentReportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PaymentReportDataComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PaymentReportDataComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PieComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PieComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosCheckOutButtonsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosCheckOutButtonsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderFunctionButtonsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderFunctionButtonsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderItemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderTransactionDataComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderTransactionDataComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosPaymentEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosPaymentEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategorySearchComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategorySearchComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategorySelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategorySelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceScheduleMenuListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceScheduleMenuListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceTierScheduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceTierScheduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrinterLocationSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrinterLocationSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PrinterLocationsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrinterLocationsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductSearchSelector2Component.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductSearchSelector2Component</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductSearchSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductSearchSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductTypeSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductTypeSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileBillingAddressComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileBillingAddressComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileMedInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileMedInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileShippingAddressComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileShippingAddressComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProgressBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProgressBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProgressUploaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProgressUploaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/QRCodeTableComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >QRCodeTableComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/QROrderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >QROrderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/QuantiySelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >QuantiySelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportGroupSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportGroupSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportTypesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportTypesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RequestMessageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RequestMessageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RequestMessagesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RequestMessagesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RetailProductEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RetailProductEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RewardsAvailibleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RewardsAvailibleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SalesTaxReportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SalesTaxReportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SaveChangesButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SaveChangesButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScaleReaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScaleReaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScaleSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScaleSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScaleValueViewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScaleValueViewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SearchDebounceInputComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SearchDebounceInputComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SidebarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SimpleTinyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SimpleTinyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SiteSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SiteSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SortSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SortSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SpeciesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SpeciesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SplitEntrySelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SplitEntrySelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatusLookupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StatusLookupComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StoreCreditInfoComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StoreCreditInfoComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StoreCreditSearchComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StoreCreditSearchComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StrainIndicatorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StrainIndicatorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SummarycardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SummarycardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TagChipsProductsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TagChipsProductsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TaxFieldsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TaxFieldsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ThreeCXFabComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ThreeCXFabComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TiersCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TiersCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TipEntryComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TipEntryComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ToggleThemeComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ToggleThemeComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UIHomePageSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UIHomePageSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnitTypeFieldsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnitTypeFieldsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UploaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UploaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ValueFieldsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ValueFieldsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ValueFromListSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ValueFromListSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ValueSpinnerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ValueSpinnerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WebEnabledComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WebEnabledComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/YoutubePlayerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >YoutubePlayerComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                        'data-bs-target="#directives-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' : 'data-bs-target="#xs-directives-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' :
                                        'id="xs-directives-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' }>
                                        <li class="link">
                                            <a href="directives/AutofocusDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutofocusDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/DisableControlDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DisableControlDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/FreeDraggingDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FreeDraggingDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/FreeDraggingHandleDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FreeDraggingHandleDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/InstructionDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InstructionDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/NgControlAttributeDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NgControlAttributeDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/NumericDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NumericDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/UserAuthorizedDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserAuthorizedDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ?
                                            'data-bs-target="#pipes-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' : 'data-bs-target="#xs-pipes-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' :
                                            'id="xs-pipes-links-module-SharedModule-6cb7307930e2e14ec80f64e9c2beb645c7ce8f6c6a31c05ee78022eff7bcfcfe4dc3caf5309489bb8b37ad1cc512c504194ce5a723cdb63d5400159801833d78"' }>
                                            <li class="link">
                                                <a href="pipes/ArrayFilterPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArrayFilterPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/ArraySortPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArraySortPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/BackgroundUrlPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BackgroundUrlPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/FilterPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FilterPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/SafeHtmlPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SafeHtmlPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TruncateRightPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TruncateRightPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TruncateTextPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TruncateTextPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#components-links"' :
                            'data-bs-target="#xs-components-links"' }>
                            <span class="icon ion-md-cog"></span>
                            <span>Components</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="components-links"' : 'id="xs-components-links"' }>
                            <li class="link">
                                <a href="components/AdjustItemNoteComponent.html" data-type="entity-link" >AdjustItemNoteComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdjustItemPriceChangeComponent.html" data-type="entity-link" >AdjustItemPriceChangeComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AdjustItemVoidReasonsComponent.html" data-type="entity-link" >AdjustItemVoidReasonsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/AuditPanelComponent.html" data-type="entity-link" >AuditPanelComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ButtonComponent.html" data-type="entity-link" >ButtonComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ButtonRendererComponent-1.html" data-type="entity-link" >ButtonRendererComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/DashboardClientTypeSelectionComponent.html" data-type="entity-link" >DashboardClientTypeSelectionComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FoodProductEditComponent.html" data-type="entity-link" >FoodProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GoogleMapsComponent.html" data-type="entity-link" >GoogleMapsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent-1.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HouseAccountPayBtnComponent.html" data-type="entity-link" >HouseAccountPayBtnComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InventoryListToolTipComponent.html" data-type="entity-link" >InventoryListToolTipComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MenuCardCategoriesComponent.html" data-type="entity-link" >MenuCardCategoriesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrderPercentageDiscountProductEditComponent.html" data-type="entity-link" >OrderPercentageDiscountProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PageComponent.html" data-type="entity-link" >PageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PriceLinesComponent.html" data-type="entity-link" >PriceLinesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ReportSelectorComponent.html" data-type="entity-link" >ReportSelectorComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RouteDispatchComponent.html" data-type="entity-link" >RouteDispatchComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RouteDispatchDetailsComponent.html" data-type="entity-link" >RouteDispatchDetailsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RouteDispatchDetailsEditComponent.html" data-type="entity-link" >RouteDispatchDetailsEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RouteDispatchEditComponent.html" data-type="entity-link" >RouteDispatchEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/RouteDispatchesComponent.html" data-type="entity-link" >RouteDispatchesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UploaderComponent.html" data-type="entity-link" >UploaderComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#directives-links"' :
                                'data-bs-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
                                <li class="link">
                                    <a href="directives/AppPasswordMaskDirective.html" data-type="entity-link" >AppPasswordMaskDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/DefaultImageDirective.html" data-type="entity-link" >DefaultImageDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/DndDirective.html" data-type="entity-link" >DndDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/Events.html" data-type="entity-link" >Events</a>
                                </li>
                                <li class="link">
                                    <a href="directives/HammertimeDirective.html" data-type="entity-link" >HammertimeDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/HammertimeDirective-1.html" data-type="entity-link" >HammertimeDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/ScrollableDirective.html" data-type="entity-link" >ScrollableDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/ScrollbarThemeDirectiveDirective.html" data-type="entity-link" >ScrollbarThemeDirectiveDirective</a>
                                </li>
                                <li class="link">
                                    <a href="directives/StickyHeaderDirective.html" data-type="entity-link" >StickyHeaderDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#classes-links"' :
                            'data-bs-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CustomReuseStrategy.html" data-type="entity-link" >CustomReuseStrategy</a>
                            </li>
                            <li class="link">
                                <a href="classes/DateValidators.html" data-type="entity-link" >DateValidators</a>
                            </li>
                            <li class="link">
                                <a href="classes/HttpOptions.html" data-type="entity-link" >HttpOptions</a>
                            </li>
                            <li class="link">
                                <a href="classes/LocalStorageSaveOptions.html" data-type="entity-link" >LocalStorageSaveOptions</a>
                            </li>
                            <li class="link">
                                <a href="classes/MyErrorStateMatcher.html" data-type="entity-link" >MyErrorStateMatcher</a>
                            </li>
                            <li class="link">
                                <a href="classes/RouterAnimations.html" data-type="entity-link" >RouterAnimations</a>
                            </li>
                            <li class="link">
                                <a href="classes/RouteReuseService.html" data-type="entity-link" >RouteReuseService</a>
                            </li>
                            <li class="link">
                                <a href="classes/SortOptions.html" data-type="entity-link" >SortOptions</a>
                            </li>
                            <li class="link">
                                <a href="classes/TabsOverviewExample.html" data-type="entity-link" >TabsOverviewExample</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#injectables-links"' :
                                'data-bs-target="#xs-injectables-links"' }>
                                <span class="icon ion-md-arrow-round-down"></span>
                                <span>Injectables</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="injectables-links"' : 'id="xs-injectables-links"' }>
                                <li class="link">
                                    <a href="injectables/AdjustmentReasonsService.html" data-type="entity-link" >AdjustmentReasonsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AgeVerificationGuardService.html" data-type="entity-link" >AgeVerificationGuardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AgGridFormatingService.html" data-type="entity-link" >AgGridFormatingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AgGridService.html" data-type="entity-link" >AgGridService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AnimationCountService.html" data-type="entity-link" >AnimationCountService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AnimationCountService-1.html" data-type="entity-link" >AnimationCountService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AppInitService.html" data-type="entity-link" >AppInitService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AuthenticationService.html" data-type="entity-link" >AuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AWSBucketService.html" data-type="entity-link" >AWSBucketService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BalanceSheetMethodsService.html" data-type="entity-link" >BalanceSheetMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BalanceSheetService.html" data-type="entity-link" >BalanceSheetService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BlogService.html" data-type="entity-link" >BlogService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BtPrintingService.html" data-type="entity-link" >BtPrintingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CacheClientService.html" data-type="entity-link" >CacheClientService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CardPointBoltService.html" data-type="entity-link" >CardPointBoltService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CardPointMethodsService.html" data-type="entity-link" >CardPointMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CardPointService.html" data-type="entity-link" >CardPointService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ClientTableService.html" data-type="entity-link" >ClientTableService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ClientTypeService.html" data-type="entity-link" >ClientTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CompanyService.html" data-type="entity-link" >CompanyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConsoleService.html" data-type="entity-link" >ConsoleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ContactsService.html" data-type="entity-link" >ContactsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConversionsService.html" data-type="entity-link" >ConversionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardService.html" data-type="entity-link" >DashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DateHelperService.html" data-type="entity-link" >DateHelperService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DeviceInfoService.html" data-type="entity-link" >DeviceInfoService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DevService.html" data-type="entity-link" >DevService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DisplayMenuService.html" data-type="entity-link" >DisplayMenuService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DlParserService.html" data-type="entity-link" >DlParserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DsiEmvPaymentsService.html" data-type="entity-link" >DsiEmvPaymentsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DSIEMVTransactionsService.html" data-type="entity-link" >DSIEMVTransactionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DSIProcessService.html" data-type="entity-link" >DSIProcessService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ElectronMenuService.html" data-type="entity-link" >ElectronMenuService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmailSMTPService.html" data-type="entity-link" >EmailSMTPService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmployeeClockMethodsService.html" data-type="entity-link" >EmployeeClockMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmployeeClockService.html" data-type="entity-link" >EmployeeClockService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmployeeService.html" data-type="entity-link" >EmployeeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EncryptionService.html" data-type="entity-link" >EncryptionService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Events.html" data-type="entity-link" >Events</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ExportDataService.html" data-type="entity-link" >ExportDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FakeContactsService.html" data-type="entity-link" >FakeContactsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FakeDataService.html" data-type="entity-link" >FakeDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FakeInventoryService.html" data-type="entity-link" >FakeInventoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FakeProductsService.html" data-type="entity-link" >FakeProductsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbClientTypesService.html" data-type="entity-link" >FbClientTypesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbCompanyService.html" data-type="entity-link" >FbCompanyService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbContactsService.html" data-type="entity-link" >FbContactsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FBFlatRateService.html" data-type="entity-link" >FBFlatRateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbInventoryService.html" data-type="entity-link" >FbInventoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbItemTypeService.html" data-type="entity-link" >FbItemTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbNavMenuService.html" data-type="entity-link" >FbNavMenuService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbPriceCategoriesService.html" data-type="entity-link" >FbPriceCategoriesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbPriceScheduleService.html" data-type="entity-link" >FbPriceScheduleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbPriceTierService.html" data-type="entity-link" >FbPriceTierService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbProductsService.html" data-type="entity-link" >FbProductsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbServiceTypeService.html" data-type="entity-link" >FbServiceTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbSettingsService.html" data-type="entity-link" >FbSettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FBTaxesService.html" data-type="entity-link" >FBTaxesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbUnitTypeService.html" data-type="entity-link" >FbUnitTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileSystemService.html" data-type="entity-link" >FileSystemService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FileUploadServiceService.html" data-type="entity-link" >FileUploadServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FilterPipe.html" data-type="entity-link" >FilterPipe</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FlatRateService.html" data-type="entity-link" >FlatRateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FloorPlanService.html" data-type="entity-link" >FloorPlanService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GoogleMAPService.html" data-type="entity-link" >GoogleMAPService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridsterDataService.html" data-type="entity-link" >GridsterDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GridsterLayoutService.html" data-type="entity-link" >GridsterLayoutService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HttpClientCacheService.html" data-type="entity-link" >HttpClientCacheService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IHeartJaneService.html" data-type="entity-link" >IHeartJaneService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InputTrackerService.html" data-type="entity-link" >InputTrackerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InventoryAssignmentService.html" data-type="entity-link" >InventoryAssignmentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InventoryEditButtonService.html" data-type="entity-link" >InventoryEditButtonService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/InventoryLocationsService.html" data-type="entity-link" >InventoryLocationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/IPCService.html" data-type="entity-link" >IPCService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ItemsRoutingService.html" data-type="entity-link" >ItemsRoutingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ItemsService.html" data-type="entity-link" >ItemsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ItemTypeDisplayAssignmentService.html" data-type="entity-link" >ItemTypeDisplayAssignmentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ItemTypeMethodsService.html" data-type="entity-link" >ItemTypeMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ItemTypeService.html" data-type="entity-link" >ItemTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/JobTypesService.html" data-type="entity-link" >JobTypesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LabelaryService.html" data-type="entity-link" >LabelaryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LabelingService.html" data-type="entity-link" >LabelingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ManifestInventoryService.html" data-type="entity-link" >ManifestInventoryService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ManifestMethodsService.html" data-type="entity-link" >ManifestMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ManifestStatusService.html" data-type="entity-link" >ManifestStatusService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ManifestTypesService.html" data-type="entity-link" >ManifestTypesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MBMenuButtonsService.html" data-type="entity-link" >MBMenuButtonsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MenuProductPriceService.html" data-type="entity-link" >MenuProductPriceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MenuProductPriceTierService.html" data-type="entity-link" >MenuProductPriceTierService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MenuService.html" data-type="entity-link" >MenuService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MenuServiceMethodsService.html" data-type="entity-link" >MenuServiceMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MenusService.html" data-type="entity-link" >MenusService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MenuUnitTypesService.html" data-type="entity-link" >MenuUnitTypesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MessageService.html" data-type="entity-link" >MessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetaTagsService.html" data-type="entity-link" >MetaTagsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcEmployeesService.html" data-type="entity-link" >MetrcEmployeesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcFacilitiesService.html" data-type="entity-link" >MetrcFacilitiesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcHarvestsService.html" data-type="entity-link" >MetrcHarvestsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcItemsCategoriesService.html" data-type="entity-link" >MetrcItemsCategoriesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcItemsService.html" data-type="entity-link" >MetrcItemsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcLabTestsService.html" data-type="entity-link" >MetrcLabTestsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcLocationsService.html" data-type="entity-link" >MetrcLocationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcPackagesService.html" data-type="entity-link" >MetrcPackagesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcPatientsService.html" data-type="entity-link" >MetrcPatientsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcPlantsBatchesService.html" data-type="entity-link" >MetrcPlantsBatchesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcPlantsService.html" data-type="entity-link" >MetrcPlantsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcSalesService.html" data-type="entity-link" >MetrcSalesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcStrainsService.html" data-type="entity-link" >MetrcStrainsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcTransfersService.html" data-type="entity-link" >MetrcTransfersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/MetrcUOMService.html" data-type="entity-link" >MetrcUOMService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ModalService.html" data-type="entity-link" >ModalService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/NavigationService.html" data-type="entity-link" >NavigationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrderMethodsService.html" data-type="entity-link" >OrderMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/OrdersService.html" data-type="entity-link" >OrdersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PagerService.html" data-type="entity-link" >PagerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PagingService.html" data-type="entity-link" >PagingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymentMethodsService.html" data-type="entity-link" >PaymentMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PaymentsMethodsProcessService.html" data-type="entity-link" >PaymentsMethodsProcessService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PlatformService.html" data-type="entity-link" >PlatformService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PointlessCCDsiAngularService.html" data-type="entity-link" >PointlessCCDsiAngularService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PointlessCCDSIEMVAndroidService.html" data-type="entity-link" >PointlessCCDSIEMVAndroidService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PointlessMETRCSalesService.html" data-type="entity-link" >PointlessMETRCSalesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PollingService.html" data-type="entity-link" >PollingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PosOrderItemMethodsService.html" data-type="entity-link" >PosOrderItemMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/POSOrderItemService.html" data-type="entity-link" >POSOrderItemService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/POSPaymentService.html" data-type="entity-link" >POSPaymentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrepOrdersService.html" data-type="entity-link" >PrepOrdersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrepPrintingServiceService.html" data-type="entity-link" >PrepPrintingServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceCategoriesService.html" data-type="entity-link" >PriceCategoriesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceCategoryItemService.html" data-type="entity-link" >PriceCategoryItemService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceScheduleDataService.html" data-type="entity-link" >PriceScheduleDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceScheduleMenuGroupItemsService.html" data-type="entity-link" >PriceScheduleMenuGroupItemsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceScheduleMenuGroupService.html" data-type="entity-link" >PriceScheduleMenuGroupService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceScheduleMenuMethodsService.html" data-type="entity-link" >PriceScheduleMenuMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceScheduleService.html" data-type="entity-link" >PriceScheduleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceTierMethodsService.html" data-type="entity-link" >PriceTierMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceTierPriceService.html" data-type="entity-link" >PriceTierPriceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PriceTierService.html" data-type="entity-link" >PriceTierService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrinterLocationsService.html" data-type="entity-link" >PrinterLocationsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrintingAndroidService.html" data-type="entity-link" >PrintingAndroidService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PrintingService.html" data-type="entity-link" >PrintingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ProductEditButtonService.html" data-type="entity-link" >ProductEditButtonService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PromptGroupService.html" data-type="entity-link" >PromptGroupService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PromptMenuItemsService.html" data-type="entity-link" >PromptMenuItemsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PromptSubGroupsService.html" data-type="entity-link" >PromptSubGroupsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PromptWalkThroughService.html" data-type="entity-link" >PromptWalkThroughService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RenderingService.html" data-type="entity-link" >RenderingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportDateHelpersService.html" data-type="entity-link" >ReportDateHelpersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportDesignerService.html" data-type="entity-link" >ReportDesignerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportingItemsSalesService.html" data-type="entity-link" >ReportingItemsSalesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportingService.html" data-type="entity-link" >ReportingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportViewerService.html" data-type="entity-link" >ReportViewerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RequestMessageMethodsService.html" data-type="entity-link" >RequestMessageMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RequestMessageService.html" data-type="entity-link" >RequestMessageService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReviewsService.html" data-type="entity-link" >ReviewsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RewardsAvailableService.html" data-type="entity-link" >RewardsAvailableService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RouteDispatchingService.html" data-type="entity-link" >RouteDispatchingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RouteInterceptorService.html" data-type="entity-link" >RouteInterceptorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SalesPaymentsService.html" data-type="entity-link" >SalesPaymentsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ScaleService.html" data-type="entity-link" >ScaleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SendGridService.html" data-type="entity-link" >SendGridService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ServiceTypeService.html" data-type="entity-link" >ServiceTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SettingsService.html" data-type="entity-link" >SettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SiteLoginsService.html" data-type="entity-link" >SiteLoginsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SitesService.html" data-type="entity-link" >SitesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SplashScreenStateService.html" data-type="entity-link" >SplashScreenStateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SqlliteService.html" data-type="entity-link" >SqlliteService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StatusTypeService.html" data-type="entity-link" >StatusTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StorageServiceService.html" data-type="entity-link" >StorageServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StoreCreditMethodsService.html" data-type="entity-link" >StoreCreditMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StoreCreditService.html" data-type="entity-link" >StoreCreditService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StripePaymentService.html" data-type="entity-link" >StripePaymentService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SystemInitializationService.html" data-type="entity-link" >SystemInitializationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SystemManagerService.html" data-type="entity-link" >SystemManagerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SystemService.html" data-type="entity-link" >SystemService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TaxesService.html" data-type="entity-link" >TaxesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TesseractService.html" data-type="entity-link" >TesseractService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TextMessagingService.html" data-type="entity-link" >TextMessagingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TextractService.html" data-type="entity-link" >TextractService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ThemesService.html" data-type="entity-link" >ThemesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ToolBarUIService.html" data-type="entity-link" >ToolBarUIService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TransferDataService.html" data-type="entity-link" >TransferDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TriPOSMethodService.html" data-type="entity-link" >TriPOSMethodService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TStream.html" data-type="entity-link" >TStream</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/TvMenuPriceTierService.html" data-type="entity-link" >TvMenuPriceTierService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UISettingsService.html" data-type="entity-link" >UISettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UnitTypeMethodsService.html" data-type="entity-link" >UnitTypeMethodsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UnitTypesService.html" data-type="entity-link" >UnitTypesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UseGroupsService.html" data-type="entity-link" >UseGroupsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UseGroupTaxesService.html" data-type="entity-link" >UseGroupTaxesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserAuthorizationService.html" data-type="entity-link" >UserAuthorizationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserService.html" data-type="entity-link" >UserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserSwitchingService.html" data-type="entity-link" >UserSwitchingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UserTypeAuthService.html" data-type="entity-link" >UserTypeAuthService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/UtilityMethodsService.html" data-type="entity-link" >UtilityMethodsService</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interceptors-links"' :
                            'data-bs-target="#xs-interceptors-links"' }>
                            <span class="icon ion-ios-swap"></span>
                            <span>Interceptors</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="interceptors-links"' : 'id="xs-interceptors-links"' }>
                            <li class="link">
                                <a href="interceptors/BasicAuthInterceptor.html" data-type="entity-link" >BasicAuthInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/ErrorInterceptor.html" data-type="entity-link" >ErrorInterceptor</a>
                            </li>
                            <li class="link">
                                <a href="interceptors/LoggingInterceptor.html" data-type="entity-link" >LoggingInterceptor</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#guards-links"' :
                            'data-bs-target="#xs-guards-links"' }>
                            <span class="icon ion-ios-lock"></span>
                            <span>Guards</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="guards-links"' : 'id="xs-guards-links"' }>
                            <li class="link">
                                <a href="guards/AuthGuard.html" data-type="entity-link" >AuthGuard</a>
                            </li>
                        </ul>
                    </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#interfaces-links"' :
                            'data-bs-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AccordionMenu.html" data-type="entity-link" >AccordionMenu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Account.html" data-type="entity-link" >Account</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActiveIngredient.html" data-type="entity-link" >ActiveIngredient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActiveIngredient-1.html" data-type="entity-link" >ActiveIngredient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ActiveIngredient-2.html" data-type="entity-link" >ActiveIngredient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AdjustmentReason.html" data-type="entity-link" >AdjustmentReason</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Admin.html" data-type="entity-link" >Admin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Amount.html" data-type="entity-link" >Amount</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Amount-1.html" data-type="entity-link" >Amount</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AnimationItem.html" data-type="entity-link" >AnimationItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/API.html" data-type="entity-link" >API</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ApplySerialAction.html" data-type="entity-link" >ApplySerialAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AppStatus.html" data-type="entity-link" >AppStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/authorizationPOST.html" data-type="entity-link" >authorizationPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/AvalibleInventoryResults.html" data-type="entity-link" >AvalibleInventoryResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Avs.html" data-type="entity-link" >Avs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BalanceSheetEmployee.html" data-type="entity-link" >BalanceSheetEmployee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BalanceSheetOptimized.html" data-type="entity-link" >BalanceSheetOptimized</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BalanceSheetSearchModel.html" data-type="entity-link" >BalanceSheetSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BatchClose.html" data-type="entity-link" >BatchClose</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BatchSummary.html" data-type="entity-link" >BatchSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BoltConnectResponse.html" data-type="entity-link" >BoltConnectResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BoltInfo.html" data-type="entity-link" >BoltInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BoltTerminal.html" data-type="entity-link" >BoltTerminal</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BrandItemCount.html" data-type="entity-link" >BrandItemCount</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CardPointGateWay.html" data-type="entity-link" >CardPointGateWay</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CashbackOptions.html" data-type="entity-link" >CashbackOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CashDrop.html" data-type="entity-link" >CashDrop</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Category.html" data-type="entity-link" >Category</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CityStateZip.html" data-type="entity-link" >CityStateZip</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientSearchModel.html" data-type="entity-link" >ClientSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientSearchResults.html" data-type="entity-link" >ClientSearchResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientsPOSOrders.html" data-type="entity-link" >ClientsPOSOrders</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientType.html" data-type="entity-link" >ClientType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/clientType.html" data-type="entity-link" >clientType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientType-1.html" data-type="entity-link" >ClientType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ClientType-2.html" data-type="entity-link" >ClientType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CmdResponse.html" data-type="entity-link" >CmdResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CmdResponse-1.html" data-type="entity-link" >CmdResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ContactFieldOptions.html" data-type="entity-link" >ContactFieldOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashBoardComponentProperties.html" data-type="entity-link" >DashBoardComponentProperties</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardContentModel.html" data-type="entity-link" >DashboardContentModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashboardModel.html" data-type="entity-link" >DashboardModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DashBoardProperties.html" data-type="entity-link" >DashBoardProperties</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/data.html" data-type="entity-link" >data</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DateFrame.html" data-type="entity-link" >DateFrame</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Destination.html" data-type="entity-link" >Destination</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Destination-1.html" data-type="entity-link" >Destination</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Destination-2.html" data-type="entity-link" >Destination</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Destinations.html" data-type="entity-link" >Destinations</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DialogData.html" data-type="entity-link" >DialogData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DiscountInfo.html" data-type="entity-link" >DiscountInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DisplayMenuResults.html" data-type="entity-link" >DisplayMenuResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DLScanResults.html" data-type="entity-link" >DLScanResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DriverData.html" data-type="entity-link" >DriverData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DSIEMVAndroidSettings.html" data-type="entity-link" >DSIEMVAndroidSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/DSIEMVSettings.html" data-type="entity-link" >DSIEMVSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/editWindowState.html" data-type="entity-link" >editWindowState</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ElectronDimensions.html" data-type="entity-link" >ElectronDimensions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailContent.html" data-type="entity-link" >EmailContent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailModel.html" data-type="entity-link" >EmailModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailModel-1.html" data-type="entity-link" >EmailModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmailSMTP.html" data-type="entity-link" >EmailSMTP</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/emailSMTP.html" data-type="entity-link" >emailSMTP</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/employee.html" data-type="entity-link" >employee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/employeeBreak.html" data-type="entity-link" >employeeBreak</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeClock.html" data-type="entity-link" >EmployeeClock</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeClockResults.html" data-type="entity-link" >EmployeeClockResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeClockSearchModel.html" data-type="entity-link" >EmployeeClockSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/employeeJobs.html" data-type="entity-link" >employeeJobs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeePinResults.html" data-type="entity-link" >EmployeePinResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeSearchModel.html" data-type="entity-link" >EmployeeSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EmployeeSearchResults.html" data-type="entity-link" >EmployeeSearchResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EndOfDayProcedures.html" data-type="entity-link" >EndOfDayProcedures</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/EventObj.html" data-type="entity-link" >EventObj</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FacilityType.html" data-type="entity-link" >FacilityType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlatRateTax.html" data-type="entity-link" >FlatRateTax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlatRateTaxValue.html" data-type="entity-link" >FlatRateTaxValue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlowInventory.html" data-type="entity-link" >FlowInventory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlowPrice.html" data-type="entity-link" >FlowPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlowProducts.html" data-type="entity-link" >FlowProducts</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlowStrain.html" data-type="entity-link" >FlowStrain</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlowVendor.html" data-type="entity-link" >FlowVendor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/GridsterSettings.html" data-type="entity-link" >GridsterSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/HistoricalSalesPurchaseOrderMetrcs.html" data-type="entity-link" >HistoricalSalesPurchaseOrderMetrcs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAppConfig.html" data-type="entity-link" >IAppConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAppWizardStatus.html" data-type="entity-link" >IAppWizardStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAWS_Temp_Key.html" data-type="entity-link" >IAWS_Temp_Key</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBalanceDuePayload.html" data-type="entity-link" >IBalanceDuePayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBalanceEmployeeSummary.html" data-type="entity-link" >IBalanceEmployeeSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBalanceSheet.html" data-type="entity-link" >IBalanceSheet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBalanceSheetPagedResults.html" data-type="entity-link" >IBalanceSheetPagedResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBlog.html" data-type="entity-link" >IBlog</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBlogResults.html" data-type="entity-link" >IBlogResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IBoltInfo.html" data-type="entity-link" >IBoltInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICanCloseOrder.html" data-type="entity-link" >ICanCloseOrder</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IClientTable.html" data-type="entity-link" >IClientTable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICompany.html" data-type="entity-link" >ICompany</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IComponent.html" data-type="entity-link" >IComponent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDatePicker.html" data-type="entity-link" >IDatePicker</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDateRange.html" data-type="entity-link" >IDateRange</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDaterange.html" data-type="entity-link" >IDaterange</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDepartmentList.html" data-type="entity-link" >IDepartmentList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDeviceInfo.html" data-type="entity-link" >IDeviceInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDisplayAssignment.html" data-type="entity-link" >IDisplayAssignment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDisplayMenu.html" data-type="entity-link" >IDisplayMenu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDisplayMenuSearchModel.html" data-type="entity-link" >IDisplayMenuSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDisplayMenuSearchResults.html" data-type="entity-link" >IDisplayMenuSearchResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDriverLicenseResults.html" data-type="entity-link" >IDriverLicenseResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDriversLicense.html" data-type="entity-link" >IDriversLicense</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEighthMenu.html" data-type="entity-link" >IEighthMenu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmployeeClient.html" data-type="entity-link" >IEmployeeClient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFloorPlan.html" data-type="entity-link" >IFloorPlan</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFlowerMenu.html" data-type="entity-link" >IFlowerMenu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IHeartJane.html" data-type="entity-link" >IHeartJane</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInfinitePageInfo.html" data-type="entity-link" >IInfinitePageInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInventoryAssignment.html" data-type="entity-link" >IInventoryAssignment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IInventoryLocation.html" data-type="entity-link" >IInventoryLocation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IIsOnline.html" data-type="entity-link" >IIsOnline</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IIsOnline-1.html" data-type="entity-link" >IIsOnline</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemBasic.html" data-type="entity-link" >IItemBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemBasic-1.html" data-type="entity-link" >IItemBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemBasic-2.html" data-type="entity-link" >IItemBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemBasic-3.html" data-type="entity-link" >IItemBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemBasic-4.html" data-type="entity-link" >IItemBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemBasic-5.html" data-type="entity-link" >IItemBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemBasicB.html" data-type="entity-link" >IItemBasicB</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemFacilitiyBasic.html" data-type="entity-link" >IItemFacilitiyBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemsMovedEvent.html" data-type="entity-link" >IItemsMovedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemsMovedEvent-1.html" data-type="entity-link" >IItemsMovedEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemType.html" data-type="entity-link" >IItemType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemTypesList.html" data-type="entity-link" >IItemTypesList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IKey.html" data-type="entity-link" >IKey</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IListBoxItem.html" data-type="entity-link" >IListBoxItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IListBoxItem-1.html" data-type="entity-link" >IListBoxItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IListBoxItemB.html" data-type="entity-link" >IListBoxItemB</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IListBoxItemB-1.html" data-type="entity-link" >IListBoxItemB</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IListBoxItemC.html" data-type="entity-link" >IListBoxItemC</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMenuButtonGroups.html" data-type="entity-link" >IMenuButtonGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMenuButtonProperties.html" data-type="entity-link" >IMenuButtonProperties</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMenuItem.html" data-type="entity-link" >IMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMenuItemsResultsPaged.html" data-type="entity-link" >IMenuItemsResultsPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMetaTag.html" data-type="entity-link" >IMetaTag</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IMETRCSales.html" data-type="entity-link" >IMETRCSales</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImportFlowInventoryResults.html" data-type="entity-link" >ImportFlowInventoryResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImportFlowPriceResults.html" data-type="entity-link" >ImportFlowPriceResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImportFlowProductResults.html" data-type="entity-link" >ImportFlowProductResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImportFlowStainsResults.html" data-type="entity-link" >ImportFlowStainsResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImportFlowVendorResults.html" data-type="entity-link" >ImportFlowVendorResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ImportProductResults.html" data-type="entity-link" >ImportProductResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/importPuchase.html" data-type="entity-link" >importPuchase</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Ingredient.html" data-type="entity-link" >Ingredient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Ingredient-1.html" data-type="entity-link" >Ingredient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Ingredient-2.html" data-type="entity-link" >Ingredient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Ingredient-3.html" data-type="entity-link" >Ingredient</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InstalledAppSettings.html" data-type="entity-link" >InstalledAppSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryFilter.html" data-type="entity-link" >InventoryFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryManifest.html" data-type="entity-link" >InventoryManifest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryResults.html" data-type="entity-link" >InventoryResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventorySearchResultsPaged.html" data-type="entity-link" >InventorySearchResultsPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryStatusList.html" data-type="entity-link" >InventoryStatusList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryStatusList-1.html" data-type="entity-link" >InventoryStatusList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IOrderItem.html" data-type="entity-link" >IOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IOrdersPaged.html" data-type="entity-link" >IOrdersPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPagedList.html" data-type="entity-link" >IPagedList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPaymentMethod.html" data-type="entity-link" >IPaymentMethod</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPaymentResponse.html" data-type="entity-link" >IPaymentResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPaymentSalesSearchModel.html" data-type="entity-link" >IPaymentSalesSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPaymentSalesSummary.html" data-type="entity-link" >IPaymentSalesSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPaymentSearchModel.html" data-type="entity-link" >IPaymentSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPOSOrder.html" data-type="entity-link" >IPOSOrder</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPOSOrderItem.html" data-type="entity-link" >IPOSOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPOSOrderSearchModel.html" data-type="entity-link" >IPOSOrderSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPOSPayment.html" data-type="entity-link" >IPOSPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPOSPaymentsOptimzed.html" data-type="entity-link" >IPOSPaymentsOptimzed</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPriceCategory2.html" data-type="entity-link" >IPriceCategory2</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPriceCategoryPaged.html" data-type="entity-link" >IPriceCategoryPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPriceSchedule.html" data-type="entity-link" >IPriceSchedule</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPriceSearchModel.html" data-type="entity-link" >IPriceSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPriceTierPaged.html" data-type="entity-link" >IPriceTierPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPrinterLocation.html" data-type="entity-link" >IPrinterLocation</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPrinterLocationRO.html" data-type="entity-link" >IPrinterLocationRO</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPrintOrders.html" data-type="entity-link" >IPrintOrders</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProduct.html" data-type="entity-link" >IProduct</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProductCategory.html" data-type="entity-link" >IProductCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProductPostOrderItem.html" data-type="entity-link" >IProductPostOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProductSearchResults.html" data-type="entity-link" >IProductSearchResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IProductSearchResultsPaged.html" data-type="entity-link" >IProductSearchResultsPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPromptGroup.html" data-type="entity-link" >IPromptGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPromptResults.html" data-type="entity-link" >IPromptResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPromptSubResults.html" data-type="entity-link" >IPromptSubResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPurchaseOrderItem.html" data-type="entity-link" >IPurchaseOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportingSearchModel.html" data-type="entity-link" >IReportingSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportItemSales.html" data-type="entity-link" >IReportItemSales</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportItemSaleSummary.html" data-type="entity-link" >IReportItemSaleSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRequestMessage.html" data-type="entity-link" >IRequestMessage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRequestMessageSearchModel.html" data-type="entity-link" >IRequestMessageSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRequestResponse.html" data-type="entity-link" >IRequestResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReviewsFilter.html" data-type="entity-link" >IReviewsFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRouteDispatch.html" data-type="entity-link" >IRouteDispatch</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IRouteDispatchingFilter.html" data-type="entity-link" >IRouteDispatchingFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISalesDate.html" data-type="entity-link" >ISalesDate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISalesDates.html" data-type="entity-link" >ISalesDates</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISalesPayments.html" data-type="entity-link" >ISalesPayments</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISalesReportingFilter.html" data-type="entity-link" >ISalesReportingFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISalesReportingOrdersSummary.html" data-type="entity-link" >ISalesReportingOrdersSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISalesValues.html" data-type="entity-link" >ISalesValues</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISearchBlogs.html" data-type="entity-link" >ISearchBlogs</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISelectedItems.html" data-type="entity-link" >ISelectedItems</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISelectedMenu.html" data-type="entity-link" >ISelectedMenu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IServiceType.html" data-type="entity-link" >IServiceType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IServiceTypePOSPut.html" data-type="entity-link" >IServiceTypePOSPut</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISetting.html" data-type="entity-link" >ISetting</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISettings.html" data-type="entity-link" >ISettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISite.html" data-type="entity-link" >ISite</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStatus.html" data-type="entity-link" >IStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStatuses.html" data-type="entity-link" >IStatuses</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStoreCreditSearchModel.html" data-type="entity-link" >IStoreCreditSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IStripePaymentIntent.html" data-type="entity-link" >IStripePaymentIntent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITaxReport.html" data-type="entity-link" >ITaxReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITaxReportOptimized.html" data-type="entity-link" >ITaxReportOptimized</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Item.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Item-1.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Item-2.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemBasic.html" data-type="entity-link" >ItemBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemBasic-1.html" data-type="entity-link" >ItemBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemCounts.html" data-type="entity-link" >ItemCounts</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemCounts-1.html" data-type="entity-link" >ItemCounts</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemCounts-2.html" data-type="entity-link" >ItemCounts</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/itemOption.html" data-type="entity-link" >itemOption</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemPOMetrics.html" data-type="entity-link" >ItemPOMetrics</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemPostResults.html" data-type="entity-link" >ItemPostResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemPricing.html" data-type="entity-link" >ItemPricing</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemType.html" data-type="entity-link" >ItemType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemType-1.html" data-type="entity-link" >ItemType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/itemType_Categories.html" data-type="entity-link" >itemType_Categories</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/itemType_Categories_List.html" data-type="entity-link" >itemType_Categories_List</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemType_Categories_Reference.html" data-type="entity-link" >ItemType_Categories_Reference</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemTypeCategory.html" data-type="entity-link" >ItemTypeCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemTypeCategory-1.html" data-type="entity-link" >ItemTypeCategory</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemValue.html" data-type="entity-link" >ItemValue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemWithAction.html" data-type="entity-link" >ItemWithAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITerminalSettings.html" data-type="entity-link" >ITerminalSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITheme.html" data-type="entity-link" >ITheme</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IToolTips.html" data-type="entity-link" >IToolTips</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITriPOSPatch.html" data-type="entity-link" >ITriPOSPatch</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITVMenuPriceTiers.html" data-type="entity-link" >ITVMenuPriceTiers</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUnitConversion.html" data-type="entity-link" >IUnitConversion</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUnitsConverted.html" data-type="entity-link" >IUnitsConverted</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUnitTypePaged.html" data-type="entity-link" >IUnitTypePaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUser.html" data-type="entity-link" >IUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUser-1.html" data-type="entity-link" >IUser</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserAuth_Properties.html" data-type="entity-link" >IUserAuth_Properties</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserExists.html" data-type="entity-link" >IUserExists</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserProfile.html" data-type="entity-link" >IUserProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IVoidOrder.html" data-type="entity-link" >IVoidOrder</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/jobTypes.html" data-type="entity-link" >jobTypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Last30DaysSales.html" data-type="entity-link" >Last30DaysSales</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/License.html" data-type="entity-link" >License</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Link.html" data-type="entity-link" >Link</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ManifestSearchModel.html" data-type="entity-link" >ManifestSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ManifestSearchResults.html" data-type="entity-link" >ManifestSearchResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ManifestStatus.html" data-type="entity-link" >ManifestStatus</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ManifestType.html" data-type="entity-link" >ManifestType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ManualEntry.html" data-type="entity-link" >ManualEntry</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/mb_MenuButton.html" data-type="entity-link" >mb_MenuButton</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/menuButtonJSON.html" data-type="entity-link" >menuButtonJSON</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuGroup.html" data-type="entity-link" >MenuGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItem.html" data-type="entity-link" >MenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItemsSelected.html" data-type="entity-link" >MenuItemsSelected</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuPromptSearchModel.html" data-type="entity-link" >MenuPromptSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuSubPromptSearchModel.html" data-type="entity-link" >MenuSubPromptSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCCustomerTypeGet.html" data-type="entity-link" >METRCCustomerTypeGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCEmployees.html" data-type="entity-link" >METRCEmployees</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCFacilities.html" data-type="entity-link" >METRCFacilities</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCHarvest.html" data-type="entity-link" >METRCHarvest</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCHarvestCreatePackagesTesting.html" data-type="entity-link" >METRCHarvestCreatePackagesTesting</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCHarvestFinish.html" data-type="entity-link" >METRCHarvestFinish</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCHarvestPackageMove.html" data-type="entity-link" >METRCHarvestPackageMove</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCHarvestPackagePOST.html" data-type="entity-link" >METRCHarvestPackagePOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCHarvestPackageRemoveWaste.html" data-type="entity-link" >METRCHarvestPackageRemoveWaste</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCHarvestUnfinish.html" data-type="entity-link" >METRCHarvestUnfinish</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCHarvestWasteTypes.html" data-type="entity-link" >METRCHarvestWasteTypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCItems.html" data-type="entity-link" >METRCItems</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MetrcItemsBrands.html" data-type="entity-link" >MetrcItemsBrands</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCItemsCategories.html" data-type="entity-link" >METRCItemsCategories</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCItemsCreate.html" data-type="entity-link" >METRCItemsCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCItemsUpdate.html" data-type="entity-link" >METRCItemsUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLabTestResultsRelease.html" data-type="entity-link" >METRCLabTestResultsRelease</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLabTEstsLabeTestDocument.html" data-type="entity-link" >METRCLabTEstsLabeTestDocument</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLabTestsRecordPOST.html" data-type="entity-link" >METRCLabTestsRecordPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLabTestsResults.html" data-type="entity-link" >METRCLabTestsResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLabTestsStates.html" data-type="entity-link" >METRCLabTestsStates</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLabTestTypes.html" data-type="entity-link" >METRCLabTestTypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLocations.html" data-type="entity-link" >METRCLocations</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLocationsPOST.html" data-type="entity-link" >METRCLocationsPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLocationsPUT.html" data-type="entity-link" >METRCLocationsPUT</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCLocationTypes.html" data-type="entity-link" >METRCLocationTypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPacakgesAdjust.html" data-type="entity-link" >METRCPacakgesAdjust</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPacakgesChangeItem.html" data-type="entity-link" >METRCPacakgesChangeItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackage.html" data-type="entity-link" >METRCPackage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesAdjustReasonsGet.html" data-type="entity-link" >METRCPackagesAdjustReasonsGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesChangeLocations.html" data-type="entity-link" >METRCPackagesChangeLocations</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesChangeNote.html" data-type="entity-link" >METRCPackagesChangeNote</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesCreatePlantings.html" data-type="entity-link" >METRCPackagesCreatePlantings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesCreatePOST.html" data-type="entity-link" >METRCPackagesCreatePOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesCreateTesting.html" data-type="entity-link" >METRCPackagesCreateTesting</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesFinish.html" data-type="entity-link" >METRCPackagesFinish</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesRemediate.html" data-type="entity-link" >METRCPackagesRemediate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackagesUnfinish.html" data-type="entity-link" >METRCPackagesUnfinish</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPackageTypes.html" data-type="entity-link" >METRCPackageTypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPatientsAdd.html" data-type="entity-link" >METRCPatientsAdd</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPatientsGet.html" data-type="entity-link" >METRCPatientsGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPatientsUpdate.html" data-type="entity-link" >METRCPatientsUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPLantBatchesAdditivesPOST.html" data-type="entity-link" >METRCPLantBatchesAdditivesPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchesChangeGrowthPhasePOST.html" data-type="entity-link" >METRCPlantBatchesChangeGrowthPhasePOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchesCreatePackagesPOST.html" data-type="entity-link" >METRCPlantBatchesCreatePackagesPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchesCreatePlantingsPOST.html" data-type="entity-link" >METRCPlantBatchesCreatePlantingsPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchesDestroyPOST.html" data-type="entity-link" >METRCPlantBatchesDestroyPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchesGET.html" data-type="entity-link" >METRCPlantBatchesGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchesMovePlanBatchesPUT.html" data-type="entity-link" >METRCPlantBatchesMovePlanBatchesPUT</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchesSplitPOST.html" data-type="entity-link" >METRCPlantBatchesSplitPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchesTypesGET.html" data-type="entity-link" >METRCPlantBatchesTypesGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantBatchsCreatePackagesFromMOtherPlantPOST.html" data-type="entity-link" >METRCPlantBatchsCreatePackagesFromMOtherPlantPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsAdditivesByLocationPOST.html" data-type="entity-link" >METRCPlantsAdditivesByLocationPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsAdditivesGet.html" data-type="entity-link" >METRCPlantsAdditivesGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsAdditivesPOST.html" data-type="entity-link" >METRCPlantsAdditivesPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsAdditivesTypesGET.html" data-type="entity-link" >METRCPlantsAdditivesTypesGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsChangeGrowthPhasesPOST.html" data-type="entity-link" >METRCPlantsChangeGrowthPhasesPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsCreatePlantBatchPackagePOST.html" data-type="entity-link" >METRCPlantsCreatePlantBatchPackagePOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsCreatePlantingsPOST.html" data-type="entity-link" >METRCPlantsCreatePlantingsPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsGet.html" data-type="entity-link" >METRCPlantsGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsGrowthPhasesGET.html" data-type="entity-link" >METRCPlantsGrowthPhasesGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsHarvestPlantsPOST.html" data-type="entity-link" >METRCPlantsHarvestPlantsPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsManicurePlantPOST.html" data-type="entity-link" >METRCPlantsManicurePlantPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsMovePlantsPOST.html" data-type="entity-link" >METRCPlantsMovePlantsPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsWasteMethodsGET.html" data-type="entity-link" >METRCPlantsWasteMethodsGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPlantsWasteReasonsGet.html" data-type="entity-link" >METRCPlantsWasteReasonsGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCPOSTPlantsDestroyPlantsPOST.html" data-type="entity-link" >METRCPOSTPlantsDestroyPlantsPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesDeliveries.html" data-type="entity-link" >METRCSalesDeliveries</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesDeliveriesCompletePUT.html" data-type="entity-link" >METRCSalesDeliveriesCompletePUT</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesDeliveriesPOST.html" data-type="entity-link" >METRCSalesDeliveriesPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesDeliveriesPUT.html" data-type="entity-link" >METRCSalesDeliveriesPUT</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesDeliveryReturnReasonsGET.html" data-type="entity-link" >METRCSalesDeliveryReturnReasonsGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesReceipts.html" data-type="entity-link" >METRCSalesReceipts</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesReceiptsPOSTPUT.html" data-type="entity-link" >METRCSalesReceiptsPOSTPUT</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/metrcSalesReport.html" data-type="entity-link" >metrcSalesReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesReportPaged.html" data-type="entity-link" >METRCSalesReportPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesTransactionsGET.html" data-type="entity-link" >METRCSalesTransactionsGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesTransactionsGET-1.html" data-type="entity-link" >METRCSalesTransactionsGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesTransactionsPOST.html" data-type="entity-link" >METRCSalesTransactionsPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCSalesTransactionsPUT.html" data-type="entity-link" >METRCSalesTransactionsPUT</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MetrcSettings.html" data-type="entity-link" >MetrcSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MetrcStrainsCreate.html" data-type="entity-link" >MetrcStrainsCreate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCStrainsGet.html" data-type="entity-link" >METRCStrainsGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCStrainsUpdate.html" data-type="entity-link" >METRCStrainsUpdate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTansfersTemplatesDeliveriesGet.html" data-type="entity-link" >METRCTansfersTemplatesDeliveriesGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransactions.html" data-type="entity-link" >METRCTransactions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransactionsGet.html" data-type="entity-link" >METRCTransactionsGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersDeliveriesGET.html" data-type="entity-link" >METRCTransfersDeliveriesGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersDeliveryPackagesGET.html" data-type="entity-link" >METRCTransfersDeliveryPackagesGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersDeliveryPackagesRequiredLabTestBatchesGET.html" data-type="entity-link" >METRCTransfersDeliveryPackagesRequiredLabTestBatchesGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersDeliveryPackagesStatesGet.html" data-type="entity-link" >METRCTransfersDeliveryPackagesStatesGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersDeliveryPackagesWholeSaleGET.html" data-type="entity-link" >METRCTransfersDeliveryPackagesWholeSaleGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersExternalIncomingPOST.html" data-type="entity-link" >METRCTransfersExternalIncomingPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersExternalIncomingPUT.html" data-type="entity-link" >METRCTransfersExternalIncomingPUT</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersIncomingGET.html" data-type="entity-link" >METRCTransfersIncomingGET</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersOutgoingGet.html" data-type="entity-link" >METRCTransfersOutgoingGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersRejectedGet.html" data-type="entity-link" >METRCTransfersRejectedGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MetrcTransfersTemplatesDeliveryPackagesGet.html" data-type="entity-link" >MetrcTransfersTemplatesDeliveryPackagesGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersTemplatesGet.html" data-type="entity-link" >METRCTransfersTemplatesGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersTemplatesPOST.html" data-type="entity-link" >METRCTransfersTemplatesPOST</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersTemplatesPUT.html" data-type="entity-link" >METRCTransfersTemplatesPUT</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCTransfersTypesGet.html" data-type="entity-link" >METRCTransfersTypesGet</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/METRCUOM.html" data-type="entity-link" >METRCUOM</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ModalEvent.html" data-type="entity-link" >ModalEvent</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NamesCities.html" data-type="entity-link" >NamesCities</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NamesCities-1.html" data-type="entity-link" >NamesCities</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NewInventoryItem.html" data-type="entity-link" >NewInventoryItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NewItem.html" data-type="entity-link" >NewItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/NewSerializedItem.html" data-type="entity-link" >NewSerializedItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OperationWithAction.html" data-type="entity-link" >OperationWithAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Option.html" data-type="entity-link" >Option</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderActionResult.html" data-type="entity-link" >OrderActionResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderPayload.html" data-type="entity-link" >OrderPayload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/OrderType.html" data-type="entity-link" >OrderType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Package.html" data-type="entity-link" >Package</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Package-1.html" data-type="entity-link" >Package</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Package-2.html" data-type="entity-link" >Package</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Package-3.html" data-type="entity-link" >Package</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PackageFilter.html" data-type="entity-link" >PackageFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PackageSearchResultsPaged.html" data-type="entity-link" >PackageSearchResultsPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/paginationInfo.html" data-type="entity-link" >paginationInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Paging.html" data-type="entity-link" >Paging</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Paging-1.html" data-type="entity-link" >Paging</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Paging-2.html" data-type="entity-link" >Paging</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Paging-3.html" data-type="entity-link" >Paging</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/payload.html" data-type="entity-link" >payload</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentMethod.html" data-type="entity-link" >PaymentMethod</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PaymentSummary.html" data-type="entity-link" >PaymentSummary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/platFormInfo.html" data-type="entity-link" >platFormInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/playerConfig.html" data-type="entity-link" >playerConfig</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PointlessMetrcSales.html" data-type="entity-link" >PointlessMetrcSales</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PointlessMetrcSearchModel.html" data-type="entity-link" >PointlessMetrcSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/POOrderImport.html" data-type="entity-link" >POOrderImport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/POSItemSearchModel.html" data-type="entity-link" >POSItemSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PosOrderItem.html" data-type="entity-link" >PosOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PosOrderMenuItem.html" data-type="entity-link" >PosOrderMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/POSOrdersPaged.html" data-type="entity-link" >POSOrdersPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PosPayment.html" data-type="entity-link" >PosPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PosPayment-1.html" data-type="entity-link" >PosPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/postedNewItem.html" data-type="entity-link" >postedNewItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Price.html" data-type="entity-link" >Price</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceAdjustScheduleTypes.html" data-type="entity-link" >PriceAdjustScheduleTypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceCategories.html" data-type="entity-link" >PriceCategories</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceMenuGroup.html" data-type="entity-link" >PriceMenuGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceMenuGroupItem.html" data-type="entity-link" >PriceMenuGroupItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceTierPrice.html" data-type="entity-link" >PriceTierPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceTierPrice-1.html" data-type="entity-link" >PriceTierPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceTiers.html" data-type="entity-link" >PriceTiers</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PrintData.html" data-type="entity-link" >PrintData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PrinterLocations.html" data-type="entity-link" >PrinterLocations</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/printOptions.html" data-type="entity-link" >printOptions</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProcessItem.html" data-type="entity-link" >ProcessItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Processor.html" data-type="entity-link" >Processor</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductPrice.html" data-type="entity-link" >ProductPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductPrice-1.html" data-type="entity-link" >ProductPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductPrice-2.html" data-type="entity-link" >ProductPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductPrice2.html" data-type="entity-link" >ProductPrice2</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductSale.html" data-type="entity-link" >ProductSale</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ProductSearchModel.html" data-type="entity-link" >ProductSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PromptMenuItem.html" data-type="entity-link" >PromptMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PromptProducts.html" data-type="entity-link" >PromptProducts</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PromptSubGroups.html" data-type="entity-link" >PromptSubGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PS_SearchResultsPaged.html" data-type="entity-link" >PS_SearchResultsPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PSMenuGroupPaged.html" data-type="entity-link" >PSMenuGroupPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PSSearchModel.html" data-type="entity-link" >PSSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReportItemSalesOptimized.html" data-type="entity-link" >ReportItemSalesOptimized</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Result.html" data-type="entity-link" >Result</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Result-1.html" data-type="entity-link" >Result</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ResultCheck.html" data-type="entity-link" >ResultCheck</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturnedPackage.html" data-type="entity-link" >ReturnedPackage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Review.html" data-type="entity-link" >Review</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RewardItem.html" data-type="entity-link" >RewardItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RewardsAvailable.html" data-type="entity-link" >RewardsAvailable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RouteDetail.html" data-type="entity-link" >RouteDetail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/rowItem.html" data-type="entity-link" >rowItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/rowItem-1.html" data-type="entity-link" >rowItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/rowValue.html" data-type="entity-link" >rowValue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RStream.html" data-type="entity-link" >RStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RStream-1.html" data-type="entity-link" >RStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScaleInfo.html" data-type="entity-link" >ScaleInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScaleSetup.html" data-type="entity-link" >ScaleSetup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchemaUpdateResults.html" data-type="entity-link" >SchemaUpdateResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchModel.html" data-type="entity-link" >SearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SearchRewardsModel.html" data-type="entity-link" >SearchRewardsModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SelectedPromptSubGroup.html" data-type="entity-link" >SelectedPromptSubGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Serial.html" data-type="entity-link" >Serial</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Signature.html" data-type="entity-link" >Signature</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SiteLogin.html" data-type="entity-link" >SiteLogin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StoreCredit.html" data-type="entity-link" >StoreCredit</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StoreCreditResultsPaged.html" data-type="entity-link" >StoreCreditResultsPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/StripeAPISettings.html" data-type="entity-link" >StripeAPISettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubMenu.html" data-type="entity-link" >SubMenu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Summary.html" data-type="entity-link" >Summary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Summary-1.html" data-type="entity-link" >Summary</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tax.html" data-type="entity-link" >Tax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Taxes.html" data-type="entity-link" >Taxes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Taxes-1.html" data-type="entity-link" >Taxes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Taxes-2.html" data-type="entity-link" >Taxes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaxRate.html" data-type="entity-link" >TaxRate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaxRatesGroups.html" data-type="entity-link" >TaxRatesGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimeFrame.html" data-type="entity-link" >TimeFrame</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/topLevel.html" data-type="entity-link" >topLevel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TranInfo.html" data-type="entity-link" >TranInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TranResponse.html" data-type="entity-link" >TranResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TranResponse-1.html" data-type="entity-link" >TranResponse</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transaction.html" data-type="entity-link" >Transaction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transaction-1.html" data-type="entity-link" >Transaction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transaction-2.html" data-type="entity-link" >Transaction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transaction-3.html" data-type="entity-link" >Transaction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transaction-4.html" data-type="entity-link" >Transaction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransactionUISettings.html" data-type="entity-link" >TransactionUISettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransferItem.html" data-type="entity-link" >TransferItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransferOrder.html" data-type="entity-link" >TransferOrder</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TransferPayment.html" data-type="entity-link" >TransferPayment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transporter.html" data-type="entity-link" >Transporter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transporter-1.html" data-type="entity-link" >Transporter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transporter-2.html" data-type="entity-link" >Transporter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Transporter-3.html" data-type="entity-link" >Transporter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TriposResult.html" data-type="entity-link" >TriposResult</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TStream.html" data-type="entity-link" >TStream</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TVMenuPriceTierItem.html" data-type="entity-link" >TVMenuPriceTierItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UIHomePageSettings.html" data-type="entity-link" >UIHomePageSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UnitType.html" data-type="entity-link" >UnitType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UnitType-1.html" data-type="entity-link" >UnitType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UnitType-2.html" data-type="entity-link" >UnitType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupAssigned.html" data-type="entity-link" >UseGroupAssigned</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroups.html" data-type="entity-link" >UseGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroups-1.html" data-type="entity-link" >UseGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroups-2.html" data-type="entity-link" >UseGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupTax.html" data-type="entity-link" >UseGroupTax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupTax-1.html" data-type="entity-link" >UseGroupTax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupTax-2.html" data-type="entity-link" >UseGroupTax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupTaxAssigned.html" data-type="entity-link" >UseGroupTaxAssigned</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupTaxAssignedList.html" data-type="entity-link" >UseGroupTaxAssignedList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/userLogin.html" data-type="entity-link" >userLogin</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UserPreferences.html" data-type="entity-link" >UserPreferences</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/uuidList.html" data-type="entity-link" >uuidList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Values.html" data-type="entity-link" >Values</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ValueTypeList.html" data-type="entity-link" >ValueTypeList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_AggregateFunction.html" data-type="entity-link" >viewBuilder_AggregateFunction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_Groups.html" data-type="entity-link" >viewBuilder_Groups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_Report.html" data-type="entity-link" >viewBuilder_Report</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_ReportJSON.html" data-type="entity-link" >viewBuilder_ReportJSON</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_ReportTypes.html" data-type="entity-link" >viewBuilder_ReportTypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_View_Builder_GroupBy.html" data-type="entity-link" >viewBuilder_View_Builder_GroupBy</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_View_Field_Values.html" data-type="entity-link" >viewBuilder_View_Field_Values</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_ViewList.html" data-type="entity-link" >viewBuilder_ViewList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/viewBuilder_Where_Selector.html" data-type="entity-link" >viewBuilder_Where_Selector</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WebAppSettings.html" data-type="entity-link" >WebAppSettings</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WeekDay.html" data-type="entity-link" >WeekDay</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WeightProfile.html" data-type="entity-link" >WeightProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/whereType.html" data-type="entity-link" >whereType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WidgetModel.html" data-type="entity-link" >WidgetModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/widgetRoles.html" data-type="entity-link" >widgetRoles</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/zplLabel.html" data-type="entity-link" >zplLabel</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#pipes-links"' :
                                'data-bs-target="#xs-pipes-links"' }>
                                <span class="icon ion-md-add"></span>
                                <span>Pipes</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="pipes-links"' : 'id="xs-pipes-links"' }>
                                <li class="link">
                                    <a href="pipes/NumeralPipe.html" data-type="entity-link" >NumeralPipe</a>
                                </li>
                                <li class="link">
                                    <a href="pipes/PhotoPipe.html" data-type="entity-link" >PhotoPipe</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-bs-toggle="collapse" ${ isNormalMode ? 'data-bs-target="#miscellaneous-links"'
                            : 'data-bs-target="#xs-miscellaneous-links"' }>
                            <span class="icon ion-ios-cube"></span>
                            <span>Miscellaneous</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="miscellaneous-links"' : 'id="xs-miscellaneous-links"' }>
                            <li class="link">
                                <a href="miscellaneous/enumerations.html" data-type="entity-link">Enums</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/functions.html" data-type="entity-link">Functions</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/typealiases.html" data-type="entity-link">Type aliases</a>
                            </li>
                            <li class="link">
                                <a href="miscellaneous/variables.html" data-type="entity-link">Variables</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <a data-type="chapter-link" href="routes.html"><span class="icon ion-ios-git-branch"></span>Routes</a>
                        </li>
                    <li class="chapter">
                        <a data-type="chapter-link" href="coverage.html"><span class="icon ion-ios-stats"></span>Documentation coverage</a>
                    </li>
                    <li class="divider"></li>
                    <li class="copyright">
                        Documentation generated using <a href="https://compodoc.app/" target="_blank" rel="noopener noreferrer">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
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
                                    <a href="dependencies.html" data-type="chapter-link">
                                        <span class="icon ion-ios-list"></span>Dependencies
                                    </a>
                                </li>
                    </ul>
                </li>
                    <li class="chapter modules">
                        <a data-type="chapter-link" href="modules.html">
                            <div class="menu-toggler linked" data-toggle="collapse" ${ isNormalMode ?
                                'data-target="#modules-links"' : 'data-target="#xs-modules-links"' }>
                                <span class="icon ion-ios-archive"></span>
                                <span class="link-name">Modules</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                        </a>
                        <ul class="links collapse " ${ isNormalMode ? 'id="modules-links"' : 'id="xs-modules-links"' }>
                            <li class="link">
                                <a href="modules/AppMaterialModule.html" data-type="entity-link" >AppMaterialModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/AppModule.html" data-type="entity-link" >AppModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' : 'data-target="#xs-components-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' :
                                            'id="xs-components-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' }>
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
                                                <a href="components/ChangepasswordComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ChangepasswordComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DsiEMVPaymentComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DsiEMVPaymentComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LoginComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LoginComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceTiersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceTiersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/RegisterAccountExistingUserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >RegisterAccountExistingUserComponent</a>
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
                                                <a href="components/TvPriceSpecialsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TvPriceSpecialsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TvPriceTierMenuItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TvPriceTierMenuItemsComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' : 'data-target="#xs-directives-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' :
                                        'id="xs-directives-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' }>
                                        <li class="link">
                                            <a href="directives/CurrencyFormatterDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CurrencyFormatterDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' : 'data-target="#xs-injectables-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' :
                                        'id="xs-injectables-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' }>
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
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#pipes-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' : 'data-target="#xs-pipes-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' :
                                            'id="xs-pipes-links-module-AppModule-f4242746f664e13ccf22d03492925c30"' }>
                                            <li class="link">
                                                <a href="pipes/SafeHtmlPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SafeHtmlPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/TruncateTextPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TruncateTextPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/AppRoutingModule.html" data-type="entity-link" >AppRoutingModule</a>
                            </li>
                            <li class="link">
                                <a href="modules/DefaultModule.html" data-type="entity-link" >DefaultModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' : 'data-target="#xs-components-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' :
                                            'id="xs-components-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' }>
                                            <li class="link">
                                                <a href="components/AccordionMenuItemEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccordionMenuItemEditComponent</a>
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
                                                <a href="components/AdminbranditemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminbranditemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdminbrandslistComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdminbrandslistComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AgPaginationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgPaginationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BrandTypeSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandTypeSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/BrandslistComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >BrandslistComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CacheSettingsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CacheSettingsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoriesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoriesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategorieslistviewComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategorieslistviewComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CheckInProfileComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CheckInProfileComponent</a>
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
                                                <a href="components/DatabaseSchemaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DatabaseSchemaComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DateScheduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DateScheduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DefaultComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DefaultComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DemographicsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DemographicsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DiscountOptionsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DiscountOptionsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DiscountTypeSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DiscountTypeSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditSelectedItemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditSelectedItemsComponent</a>
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
                                                <a href="components/LabelViewSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LabelViewSelectorComponent</a>
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
                                                <a href="components/MenuGroupItemEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuGroupItemEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuItemModalComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuItemModalComponent</a>
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
                                                <a href="components/MenuitemsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuitemsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MessagesToUserComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MessagesToUserComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcIndividualPackageComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcIndividualPackageComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcInventoryPropertiesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcInventoryPropertiesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetrcSalesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcSalesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/NewInventoryItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >NewInventoryItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrderCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderCardComponent</a>
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
                                                <a href="components/OrderTypeSelectionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrderTypeSelectionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/OrdersMainComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersMainComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PackageListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PackageListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PackageSearchSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PackageSearchSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderItemComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderItemComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrderListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrderListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PosOrdersComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PosOrdersComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategoriesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategoriesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategoriesEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategoriesEditComponent</a>
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
                                                <a href="components/ProductInfoPanelComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductInfoPanelComponent</a>
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
                                                <a href="components/ProfileEditorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileEditorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProfileLookupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProfileLookupComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReceiptLayoutComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReceiptLayoutComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ReportsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportsComponent</a>
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
                                                <a href="components/SimpleTinyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SimpleTinyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SiteEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SiteEditComponent</a>
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
                                                <a href="components/StickyHeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StickyHeaderComponent</a>
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
                                                <a href="components/TierPricesComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TierPricesComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TimeScheduleComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TimeScheduleComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypeFilterComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypeFilterComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TypeResultsSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TypeResultsSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnitTypeEditComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnitTypeEditComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnitTypeListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnitTypeListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UploaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UploaderComponent</a>
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
                                                <a href="components/WishlistComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WishlistComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' : 'data-target="#xs-directives-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' :
                                        'id="xs-directives-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' }>
                                        <li class="link">
                                            <a href="directives/DndDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DndDirective</a>
                                        </li>
                                        <li class="link">
                                            <a href="directives/ScrollableDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScrollableDirective</a>
                                        </li>
                                    </ul>
                                </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#injectables-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' : 'data-target="#xs-injectables-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' }>
                                        <span class="icon ion-md-arrow-round-down"></span>
                                        <span>Injectables</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="injectables-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' :
                                        'id="xs-injectables-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' }>
                                        <li class="link">
                                            <a href="injectables/AWSBucketService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AWSBucketService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AgGridService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AgGridService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AnimationCountService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AnimationCountService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/AuthenticationService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AuthenticationService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ClientTypeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ClientTypeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ContactsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ContactsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DashboardService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/DevService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DevService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/EmployeeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EmployeeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/InventoryAssignmentService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryAssignmentService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/InventoryLocationsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryLocationsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ItemTypeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemTypeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ItemsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/LabelaryService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LabelaryService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MenuService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/MetrcFacilitiesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetrcFacilitiesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/OrdersService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >OrdersService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/PrintingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PrintingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ReportingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReportingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ReviewsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ReviewsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ServiceTypeService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ServiceTypeService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/SettingsService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SettingsService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/TextMessagingService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TextMessagingService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/ThemesService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ThemesService</a>
                                        </li>
                                        <li class="link">
                                            <a href="injectables/UserService.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UserService</a>
                                        </li>
                                    </ul>
                                </li>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#pipes-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' : 'data-target="#xs-pipes-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' }>
                                            <span class="icon ion-md-add"></span>
                                            <span>Pipes</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="pipes-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' :
                                            'id="xs-pipes-links-module-DefaultModule-353884fd3801710305fcbadffc62e630"' }>
                                            <li class="link">
                                                <a href="pipes/ArrayFilterPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArrayFilterPipe</a>
                                            </li>
                                            <li class="link">
                                                <a href="pipes/ArraySortPipe.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ArraySortPipe</a>
                                            </li>
                                        </ul>
                                    </li>
                            </li>
                            <li class="link">
                                <a href="modules/SharedModule.html" data-type="entity-link" >SharedModule</a>
                                    <li class="chapter inner">
                                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                            'data-target="#components-links-module-SharedModule-ee67cbdfa2613a0db928f2dd49bd66a4"' : 'data-target="#xs-components-links-module-SharedModule-ee67cbdfa2613a0db928f2dd49bd66a4"' }>
                                            <span class="icon ion-md-cog"></span>
                                            <span>Components</span>
                                            <span class="icon ion-ios-arrow-down"></span>
                                        </div>
                                        <ul class="links collapse" ${ isNormalMode ? 'id="components-links-module-SharedModule-ee67cbdfa2613a0db928f2dd49bd66a4"' :
                                            'id="xs-components-links-module-SharedModule-ee67cbdfa2613a0db928f2dd49bd66a4"' }>
                                            <li class="link">
                                                <a href="components/AccordionComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AccordionComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AdjustmentReasonsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AdjustmentReasonsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/AreaComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AreaComponent</a>
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
                                                <a href="components/CardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CartButtonComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CartButtonComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategoryScrollComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategoryScrollComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/CategorySelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >CategorySelectComponent</a>
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
                                                <a href="components/DashboardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DashboardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/DepartmentSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >DepartmentSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/EditButtonsStandardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >EditButtonsStandardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/FacilitySearchSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >FacilitySearchSelectorComponent</a>
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
                                                <a href="components/HammerCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HammerCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/HeaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >HeaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/InventoryAdjustmentNoteComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >InventoryAdjustmentNoteComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/IonicGeoLocationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >IonicGeoLocationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ItemTypeSortComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ItemTypeSortComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/Label1by8Component.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >Label1by8Component</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/LimitValuesProgressBarsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >LimitValuesProgressBarsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ListProductSearchInputComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ListProductSearchInputComponent</a>
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
                                                <a href="components/MenuSearchBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuSearchBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MenuTinyComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MenuTinyComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MetaTagChipsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MetaTagChipsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/MoveInventoryLocationComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >MoveInventoryLocationComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PageNotFoundComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PageNotFoundComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PagerBlobComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PagerBlobComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PieComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PieComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategorySearchComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategorySearchComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/PriceCategorySelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >PriceCategorySelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductSearchSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductSearchSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProductTypeSelectComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProductTypeSelectComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProgressBarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProgressBarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ProgressUploaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ProgressUploaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SalesTaxReportComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SalesTaxReportComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ScaleReaderComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ScaleReaderComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SidebarComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SidebarComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SiteSelectorComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SiteSelectorComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SpeciesListComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SpeciesListComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/StatusLookupComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >StatusLookupComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/SummarycardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >SummarycardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TaxFieldsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TaxFieldsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/TiersCardComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >TiersCardComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/UnitTypeFieldsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >UnitTypeFieldsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ValueFieldsComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ValueFieldsComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/ValueSpinnerComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >ValueSpinnerComponent</a>
                                            </li>
                                            <li class="link">
                                                <a href="components/WebEnabledComponent.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >WebEnabledComponent</a>
                                            </li>
                                        </ul>
                                    </li>
                                <li class="chapter inner">
                                    <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ?
                                        'data-target="#directives-links-module-SharedModule-ee67cbdfa2613a0db928f2dd49bd66a4"' : 'data-target="#xs-directives-links-module-SharedModule-ee67cbdfa2613a0db928f2dd49bd66a4"' }>
                                        <span class="icon ion-md-code-working"></span>
                                        <span>Directives</span>
                                        <span class="icon ion-ios-arrow-down"></span>
                                    </div>
                                    <ul class="links collapse" ${ isNormalMode ? 'id="directives-links-module-SharedModule-ee67cbdfa2613a0db928f2dd49bd66a4"' :
                                        'id="xs-directives-links-module-SharedModule-ee67cbdfa2613a0db928f2dd49bd66a4"' }>
                                        <li class="link">
                                            <a href="directives/AutofocusDirective.html" data-type="entity-link" data-context="sub-entity" data-context-id="modules" >AutofocusDirective</a>
                                        </li>
                                    </ul>
                                </li>
                            </li>
                </ul>
                </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#components-links"' :
                            'data-target="#xs-components-links"' }>
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
                                <a href="components/CannabisItemEditComponent.html" data-type="entity-link" >CannabisItemEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CashDiscountItemProductEditComponent.html" data-type="entity-link" >CashDiscountItemProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/CashDiscountOrderProductEditComponent.html" data-type="entity-link" >CashDiscountOrderProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/EachProductEditComponent.html" data-type="entity-link" >EachProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/FoodProductEditComponent.html" data-type="entity-link" >FoodProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GiftCardProductEditComponent.html" data-type="entity-link" >GiftCardProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/GoogleMapsComponent.html" data-type="entity-link" >GoogleMapsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/HeaderComponent-1.html" data-type="entity-link" >HeaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/InventoryListToolTipComponent.html" data-type="entity-link" >InventoryListToolTipComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ItemPercentageDiscountProductEditComponent.html" data-type="entity-link" >ItemPercentageDiscountProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/LiquorProductEditComponent.html" data-type="entity-link" >LiquorProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/MenuCardCategoriesComponent.html" data-type="entity-link" >MenuCardCategoriesComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/ModifierProductEditComponent.html" data-type="entity-link" >ModifierProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrderPercentageDiscountProductEditComponent.html" data-type="entity-link" >OrderPercentageDiscountProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/OrdersFilterComponent.html" data-type="entity-link" >OrdersFilterComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PackageActionsComponent.html" data-type="entity-link" >PackageActionsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PageComponent.html" data-type="entity-link" >PageComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PosPaymentComponent.html" data-type="entity-link" >PosPaymentComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PosPaymentsComponent.html" data-type="entity-link" >PosPaymentsComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/PriceLinesComponent.html" data-type="entity-link" >PriceLinesComponent</a>
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
                                <a href="components/SmokeProductEditComponent.html" data-type="entity-link" >SmokeProductEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SoftwareComponent.html" data-type="entity-link" >SoftwareComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/SubMenuItemEditComponent.html" data-type="entity-link" >SubMenuItemEditComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TvHappyHoursComponent.html" data-type="entity-link" >TvHappyHoursComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/TvPriceTiersComponent.html" data-type="entity-link" >TvPriceTiersComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/UploaderComponent.html" data-type="entity-link" >UploaderComponent</a>
                            </li>
                            <li class="link">
                                <a href="components/WeightedFoodProductEditComponent.html" data-type="entity-link" >WeightedFoodProductEditComponent</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#directives-links"' :
                                'data-target="#xs-directives-links"' }>
                                <span class="icon ion-md-code-working"></span>
                                <span>Directives</span>
                                <span class="icon ion-ios-arrow-down"></span>
                            </div>
                            <ul class="links collapse " ${ isNormalMode ? 'id="directives-links"' : 'id="xs-directives-links"' }>
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
                                    <a href="directives/StickyHeaderDirective.html" data-type="entity-link" >StickyHeaderDirective</a>
                                </li>
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#classes-links"' :
                            'data-target="#xs-classes-links"' }>
                            <span class="icon ion-ios-paper"></span>
                            <span>Classes</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? 'id="classes-links"' : 'id="xs-classes-links"' }>
                            <li class="link">
                                <a href="classes/CustomReuseStrategy.html" data-type="entity-link" >CustomReuseStrategy</a>
                            </li>
                            <li class="link">
                                <a href="classes/HttpOptions.html" data-type="entity-link" >HttpOptions</a>
                            </li>
                            <li class="link">
                                <a href="classes/LocalStorageSaveOptions.html" data-type="entity-link" >LocalStorageSaveOptions</a>
                            </li>
                            <li class="link">
                                <a href="classes/MyHammerConfig.html" data-type="entity-link" >MyHammerConfig</a>
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
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#injectables-links"' :
                                'data-target="#xs-injectables-links"' }>
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
                                    <a href="injectables/AuthenticationService.html" data-type="entity-link" >AuthenticationService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/AWSBucketService.html" data-type="entity-link" >AWSBucketService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/BtPrintingService.html" data-type="entity-link" >BtPrintingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/CacheClientService.html" data-type="entity-link" >CacheClientService</a>
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
                                    <a href="injectables/ContactsService.html" data-type="entity-link" >ContactsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ConversionsService.html" data-type="entity-link" >ConversionsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DashboardService.html" data-type="entity-link" >DashboardService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DevService.html" data-type="entity-link" >DevService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DlParserService.html" data-type="entity-link" >DlParserService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/DsiEmvPaymentsService.html" data-type="entity-link" >DsiEmvPaymentsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ElectronMenuService.html" data-type="entity-link" >ElectronMenuService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/EmployeeService.html" data-type="entity-link" >EmployeeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/Events.html" data-type="entity-link" >Events</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FakeDataService.html" data-type="entity-link" >FakeDataService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FbClientTypesService.html" data-type="entity-link" >FbClientTypesService</a>
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
                                    <a href="injectables/FileUploadServiceService.html" data-type="entity-link" >FileUploadServiceService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/FlatRateService.html" data-type="entity-link" >FlatRateService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/GoogleMAPService.html" data-type="entity-link" >GoogleMAPService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/HttpClientCacheService.html" data-type="entity-link" >HttpClientCacheService</a>
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
                                    <a href="injectables/IpcElectronService.html" data-type="entity-link" >IpcElectronService</a>
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
                                    <a href="injectables/ItemTypeService.html" data-type="entity-link" >ItemTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/LabelaryService.html" data-type="entity-link" >LabelaryService</a>
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
                                    <a href="injectables/OrdersService.html" data-type="entity-link" >OrdersService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PagerService.html" data-type="entity-link" >PagerService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/PagingService.html" data-type="entity-link" >PagingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/POSOrderItemServiceService.html" data-type="entity-link" >POSOrderItemServiceService</a>
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
                                    <a href="injectables/PriceScheduleService.html" data-type="entity-link" >PriceScheduleService</a>
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
                                    <a href="injectables/RenderingService.html" data-type="entity-link" >RenderingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportingItemsSalesService.html" data-type="entity-link" >ReportingItemsSalesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReportingService.html" data-type="entity-link" >ReportingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ReviewsService.html" data-type="entity-link" >ReviewsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RouteDispatchingService.html" data-type="entity-link" >RouteDispatchingService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/RouteInterceptorService.html" data-type="entity-link" >RouteInterceptorService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ScaleService.html" data-type="entity-link" >ScaleService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/ServiceTypeService.html" data-type="entity-link" >ServiceTypeService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SettingsService.html" data-type="entity-link" >SettingsService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SitesService.html" data-type="entity-link" >SitesService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/SqlliteService.html" data-type="entity-link" >SqlliteService</a>
                                </li>
                                <li class="link">
                                    <a href="injectables/StatusTypeService.html" data-type="entity-link" >StatusTypeService</a>
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
                                    <a href="injectables/TvMenuPriceTierService.html" data-type="entity-link" >TvMenuPriceTierService</a>
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
                            </ul>
                        </li>
                    <li class="chapter">
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interceptors-links"' :
                            'data-target="#xs-interceptors-links"' }>
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
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#guards-links"' :
                            'data-target="#xs-guards-links"' }>
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
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#interfaces-links"' :
                            'data-target="#xs-interfaces-links"' }>
                            <span class="icon ion-md-information-circle-outline"></span>
                            <span>Interfaces</span>
                            <span class="icon ion-ios-arrow-down"></span>
                        </div>
                        <ul class="links collapse " ${ isNormalMode ? ' id="interfaces-links"' : 'id="xs-interfaces-links"' }>
                            <li class="link">
                                <a href="interfaces/AccordionMenu.html" data-type="entity-link" >AccordionMenu</a>
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
                                <a href="interfaces/AnimationItem.html" data-type="entity-link" >AnimationItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BarcodeScanResults.html" data-type="entity-link" >BarcodeScanResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/BrandItemCount.html" data-type="entity-link" >BrandItemCount</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/CityStateZip.html" data-type="entity-link" >CityStateZip</a>
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
                                <a href="interfaces/DriverData.html" data-type="entity-link" >DriverData</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/employee.html" data-type="entity-link" >employee</a>
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
                                <a href="interfaces/FlatRateTax-1.html" data-type="entity-link" >FlatRateTax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlatRateTaxValue.html" data-type="entity-link" >FlatRateTaxValue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/FlatRateTaxValue-1.html" data-type="entity-link" >FlatRateTaxValue</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IAWS_Temp_Key.html" data-type="entity-link" >IAWS_Temp_Key</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IClientTable.html" data-type="entity-link" >IClientTable</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IClientTypeResultsPaged.html" data-type="entity-link" >IClientTypeResultsPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ICompany.html" data-type="entity-link" >ICompany</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDatePicker.html" data-type="entity-link" >IDatePicker</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDaterange.html" data-type="entity-link" >IDaterange</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDisplayAssignment.html" data-type="entity-link" >IDisplayAssignment</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDriverLicenseResults.html" data-type="entity-link" >IDriverLicenseResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IDriversLicense.html" data-type="entity-link" >IDriversLicense</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IEmployee.html" data-type="entity-link" >IEmployee</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IFlowerMenu.html" data-type="entity-link" >IFlowerMenu</a>
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
                                <a href="interfaces/IItemBasicB.html" data-type="entity-link" >IItemBasicB</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemFacilitiyBasic.html" data-type="entity-link" >IItemFacilitiyBasic</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IItemsMovedEvent.html" data-type="entity-link" >IItemsMovedEvent</a>
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
                                <a href="interfaces/InventoryFilter.html" data-type="entity-link" >InventoryFilter</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/InventoryStatusList.html" data-type="entity-link" >InventoryStatusList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IOrderItem.html" data-type="entity-link" >IOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPagedList.html" data-type="entity-link" >IPagedList</a>
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
                                <a href="interfaces/IPOSOrderSearchModel-1.html" data-type="entity-link" >IPOSOrderSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IPriceCategories.html" data-type="entity-link" >IPriceCategories</a>
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
                                <a href="interfaces/IPurchaseOrderItem.html" data-type="entity-link" >IPurchaseOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportingSearchModel.html" data-type="entity-link" >IReportingSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IReportItemSales.html" data-type="entity-link" >IReportItemSales</a>
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
                                <a href="interfaces/IServiceType.html" data-type="entity-link" >IServiceType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ISetting.html" data-type="entity-link" >ISetting</a>
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
                                <a href="interfaces/ITaxReport.html" data-type="entity-link" >ITaxReport</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Item.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Item-1.html" data-type="entity-link" >Item</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ItemCounts.html" data-type="entity-link" >ItemCounts</a>
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
                                <a href="interfaces/ItemWithAction.html" data-type="entity-link" >ItemWithAction</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ITheme.html" data-type="entity-link" >ITheme</a>
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
                                <a href="interfaces/IUserExists.html" data-type="entity-link" >IUserExists</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/IUserProfile.html" data-type="entity-link" >IUserProfile</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/JobType.html" data-type="entity-link" >JobType</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/jobTypes.html" data-type="entity-link" >jobTypes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/License.html" data-type="entity-link" >License</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuGroup.html" data-type="entity-link" >MenuGroup</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/MenuItem.html" data-type="entity-link" >MenuItem</a>
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
                                <a href="interfaces/newInventoryItem.html" data-type="entity-link" >newInventoryItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/newItem.html" data-type="entity-link" >newItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/newSerializedItem.html" data-type="entity-link" >newSerializedItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Option.html" data-type="entity-link" >Option</a>
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
                                <a href="interfaces/paginationInfo.html" data-type="entity-link" >paginationInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PosOrderItem.html" data-type="entity-link" >PosOrderItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PosOrderMenuItem.html" data-type="entity-link" >PosOrderMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PosOrderMenuItem-1.html" data-type="entity-link" >PosOrderMenuItem</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/POSOrdersPaged.html" data-type="entity-link" >POSOrdersPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PosPayment.html" data-type="entity-link" >PosPayment</a>
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
                                <a href="interfaces/PriceCategorySearchModel.html" data-type="entity-link" >PriceCategorySearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceTierPrice.html" data-type="entity-link" >PriceTierPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceTierPrice-1.html" data-type="entity-link" >PriceTierPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceTierPrice-2.html" data-type="entity-link" >PriceTierPrice</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceTiers.html" data-type="entity-link" >PriceTiers</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PriceTiers-1.html" data-type="entity-link" >PriceTiers</a>
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
                                <a href="interfaces/ProductSearchModel.html" data-type="entity-link" >ProductSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/PS_SearchResultsPaged.html" data-type="entity-link" >PS_SearchResultsPaged</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Result.html" data-type="entity-link" >Result</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ReturnedPackage.html" data-type="entity-link" >ReturnedPackage</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Review.html" data-type="entity-link" >Review</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/RouteDetail.html" data-type="entity-link" >RouteDetail</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/ScaleInfo.html" data-type="entity-link" >ScaleInfo</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SchemaUpdateResults.html" data-type="entity-link" >SchemaUpdateResults</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Serial.html" data-type="entity-link" >Serial</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/SubMenu.html" data-type="entity-link" >SubMenu</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tax.html" data-type="entity-link" >Tax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Tax-1.html" data-type="entity-link" >Tax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Taxes.html" data-type="entity-link" >Taxes</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaxRate.html" data-type="entity-link" >TaxRate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaxRate-1.html" data-type="entity-link" >TaxRate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaxRate-2.html" data-type="entity-link" >TaxRate</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TaxRatesGroups.html" data-type="entity-link" >TaxRatesGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/TimeFrame.html" data-type="entity-link" >TimeFrame</a>
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
                                <a href="interfaces/TVMenuPriceTierItem.html" data-type="entity-link" >TVMenuPriceTierItem</a>
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
                                <a href="interfaces/UnitTypeSearchModel.html" data-type="entity-link" >UnitTypeSearchModel</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupAssigned.html" data-type="entity-link" >UseGroupAssigned</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroups.html" data-type="entity-link" >UseGroups</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupTax.html" data-type="entity-link" >UseGroupTax</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupTaxAssigned.html" data-type="entity-link" >UseGroupTaxAssigned</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/UseGroupTaxAssignedList.html" data-type="entity-link" >UseGroupTaxAssignedList</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Values.html" data-type="entity-link" >Values</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/WeekDay.html" data-type="entity-link" >WeekDay</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/Window.html" data-type="entity-link" >Window</a>
                            </li>
                            <li class="link">
                                <a href="interfaces/zplLabel.html" data-type="entity-link" >zplLabel</a>
                            </li>
                        </ul>
                    </li>
                        <li class="chapter">
                            <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#pipes-links"' :
                                'data-target="#xs-pipes-links"' }>
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
                        <div class="simple menu-toggler" data-toggle="collapse" ${ isNormalMode ? 'data-target="#miscellaneous-links"'
                            : 'data-target="#xs-miscellaneous-links"' }>
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
                        Documentation generated using <a href="https://compodoc.app/" target="_blank">
                            <img data-src="images/compodoc-vectorise.png" class="img-responsive" data-type="compodoc-logo">
                        </a>
                    </li>
            </ul>
        </nav>
        `);
        this.innerHTML = tp.strings;
    }
});
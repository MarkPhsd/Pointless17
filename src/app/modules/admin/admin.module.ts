import { CdkTableModule } from "@angular/cdk/table";
import { CommonModule, DatePipe } from "@angular/common";
import { HTTP_INTERCEPTORS } from "@angular/common/http";
import { ClassProvider, CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HammerModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouteReuseStrategy, RouterModule } from "@angular/router";
import { IonicModule } from "@ionic/angular";
import { TINYMCE_SCRIPT_SRC } from "@tinymce/tinymce-angular";
import { AgGridModule } from "ag-grid-angular";
import { AngularResizeEventModule } from "angular-resize-event";
import { NgxCsvParserModule } from "ngx-csv-parser";
import { InfiniteScrollModule } from "ngx-infinite-scroll";
import { NgPipesModule } from "ngx-pipes";
import { NgxStripeModule } from "ngx-stripe";
import { AppMaterialModule } from "src/app/app-material.module";
import { AppRoutingModule } from "src/app/app-routing.module";
import { SharedModule } from "src/app/shared/shared.module";
import { ButtonRendererComponent } from "src/app/_components/btn-renderer.component";
// import { SimpleTinyComponent } from "src/app/_components/tinymce/tinymce.component";
import { AgGridImageFormatterComponent } from "src/app/_components/_aggrid/ag-grid-image-formatter/ag-grid-image-formatter.component";
import { AgGridToggleComponent } from "src/app/_components/_aggrid/ag-grid-toggle/ag-grid-toggle.component";
import { AgIconFormatterComponent } from "src/app/_components/_aggrid/ag-icon-formatter/ag-icon-formatter.component";
// import { NumericDirective } from "src/app/_directives/numeric-directive.directive";
import { LoggingInterceptor } from "src/app/_http-interceptors/loggin.interceptor";
import { AgGridService } from "src/app/_services/system/ag-grid-service";
import { RouteReuseService } from "src/app/_services/system/route-reuse.service";

// import { BlogListEditComponent } from "./blogEditor/blog-list-edit/blog-list-edit.component";
// import { BlogPostEditComponent } from "./blogEditor/blog-post-edit/blog-post-edit.component";
// import { BlogPostSortComponent } from "./blogEditor/blog-post-sort/blog-post-sort.component";

import { ClientTypeEditComponent } from "./clients/client-types/client-type-edit/client-type-edit.component";
import { ClientTypeListComponent } from "./clients/client-types/client-type-list/client-type-list.component";
import { CompanyEditComponent } from "./company-edit/company-edit.component";
// import { MetrcSummaryComponent } from './reports/metrc-summary/metrc-summary.component';
// import { ManifestStatusComponent } from "./inventory/manifest-status/manifest-status.component";
// import { ManifestTypeComponent } from "./inventory/manifest-type/manifest-type.component";
// import { MainfestEditorComponent } from "./inventory/manifests/mainfest-editor/mainfest-editor.component";
// import { ManifestEditorHeaderComponent } from "./inventory/manifests/mainfest-editor/manifest-editor-header/manifest-editor-header.component";
// import { MainfestFilterComponent } from "./inventory/manifests/mainfest-filter/mainfest-filter.component";
// import { ManifestsComponent } from "./inventory/manifests/manifests.component";
// import { FacilitiesListComponent } from "./metrc/facilities/facilities-list/facilities-list.component";
// import { StrainPackagesComponent } from "./metrc/packages/strains-add/strain-packages/strain-packages.component";
// import { StrainsAddComponent } from "./metrc/packages/strains-add/strains-add.component";
// import { AdminbranditemComponent } from "./products/adminbrandslist/adminbranditem/adminbranditem.component";
// import { AdminbrandslistComponent } from "./products/adminbrandslist/adminbrandslist.component";
// import { FlatRateEditComponent } from "./products/flatRate/flat-rate-edit/flat-rate-edit.component";
// import { FlatRateListComponent } from "./products/flatRate/flat-rate-list/flat-rate-list.component";
// import { FlatTaxRateListComponent } from "./products/item-type/flat-tax-rate-list/flat-tax-rate-list.component";

// import { ItemTypeCategoryAssignmentComponent } from "./products/item-type/item-type-category-assignment/item-type-category-assignment.component";
// import { ItemTypeDisplayAssignmentComponent } from "./products/item-type/item-type-display-assignment/item-type-display-assignment.component";
// import { ItemTypeEditorComponent } from "./products/item-type/item-type-editor/item-type-editor.component";
// import { ItemTypeTogglesEditComponent } from "./products/item-type/item-type-editor/item-type-toggles-edit/item-type-toggles-edit.component";
// import { ItemTypeComponent } from "./products/item-type/item-type.component";

// import { PriceTierEditComponent } from "./products/price-tiers/price-tier-edit/price-tier-edit.component";
// import { PriceTiersComponent } from "./products/price-tiers/price-tiers.component";
// import { PriceCategoriesEditComponent } from "./products/pricing/price-categories-edit/price-categories-edit.component";
// import { PriceCategoryConversionsComponent } from "./products/pricing/price-categories-edit/price-category-conversions/price-category-conversions.component";
// import { PriceCategoryPriceFieldsComponent } from "./products/pricing/price-categories-edit/price-category-price-fields/price-category-price-fields.component";
// import { PriceCategoryTimeFiltersComponent } from "./products/pricing/price-categories-edit/price-category-time-filters/price-category-time-filters.component";
// import { UnitTypePromptComponent } from "./products/pricing/price-categories-edit/unit-type-prompt/unit-type-prompt.component";
// import { PriceCategoriesComponent } from "./products/pricing/price-categories/price-categories.component";
// import { StrainProductEditComponent } from "./products/productedit/strain-product-edit/strain-product-edit.component";
// import { UnitTypeSelectComponent } from "./products/productedit/_product-edit-parts/unit-type-select/unit-type-select.component";
// import { UnitTypeEditComponent } from "./products/unit-type-list/unit-type-edit/unit-type-edit.component";
// import { UnitTypeListComponent } from "./products/unit-type-list/unit-type-list.component";
// import { CSVImportComponent } from "./settings/database/csv-import/csv-import.component";
// import { DatabaseSchemaComponent } from "./settings/database/database-schema/database-schema.component";
// // import { ExportDataComponent } from "./settings/database/export-data/export-data.component";
// import { SiteEditFormComponent } from "./settings/site-edit/site-edit-form/site-edit-form.component";
// import { SiteEditComponent } from "./settings/site-edit/site-edit.component";
// import { StoreCreditEditorComponent } from "./store-credit/store-credit-editor/store-credit-editor.component";
// import { StoreCreditListComponent } from "./store-credit/store-credit-list/store-credit-list.component";
// import { ServiceTypeEditComponent } from "./transactions/serviceTypes/service-type-edit/service-type-edit.component";
// import { ServiceTypeListComponent } from "./transactions/serviceTypes/service-type-list/service-type-list.component";

const LOGGING_INTERCEPTOR_PROVIDER: ClassProvider = {
  provide: HTTP_INTERCEPTORS ,
  useClass: LoggingInterceptor,
  multi: true
};

@NgModule({
  declarations: [
    // AdminbranditemComponent,
    // AdminbrandslistComponent,
    // ClientTypeListComponent,
    // ClientTypeEditComponent,
    // CompanyEditComponent,
    // CSVImportComponent,
    // DatabaseSchemaComponent,

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

    // PriceCategoriesEditComponent,
    // PriceCategoryPriceFieldsComponent,
    // PriceCategoryConversionsComponent,
    // PriceCategoryTimeFiltersComponent,
    // PriceCategoriesComponent,

    // PriceTierEditComponent,
    // PriceTiersComponent,
    // UnitTypeListComponent,
    // UnitTypeEditComponent,
    // UnitTypePromptComponent,
    // UnitTypeSelectComponent,
    // ServiceTypeEditComponent,
    // ServiceTypeListComponent,
    // StrainsAddComponent,
    // StrainPackagesComponent,
    // StrainProductEditComponent,

    // SiteEditComponent,
    // SiteEditFormComponent,

    // StoreCreditEditorComponent,
    // StoreCreditListComponent,


  ],

  //.withComponents([ButtonRendererComponent,AgIconFormatterComponent, AgGridToggleComponent,AgGridImageFormatterComponent]),
  imports: [
    AgGridModule,
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
  ],

  exports: [
    AgGridModule,
    BrowserAnimationsModule,
    RouterModule,
    HammerModule,
    // SimpleTinyComponent,
  ],

  providers: [
    AgGridService,
    DatePipe,
    LoggingInterceptor,
    {provide: RouteReuseStrategy , useClass: RouteReuseService},

  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  })
export class AdminModule { }

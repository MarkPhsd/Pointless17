import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';

import {MatLegacyCardModule as MatCardModule} from '@angular/material/legacy-card';
// import { MatCardModule } from '@angular/material/card';

@NgModule({
  declarations: [


    // GridManagerComponent,
    // GridMenuLayoutComponent,
    // GridManagerEditComponent,
    // GridComponentPropertiesComponent,
    // GridDesignerInfoComponent,
    // DisplayToggleAndroidComponent,
    // DashboardMenuComponent,
    // GridcomponentPropertiesDesignComponent,

    // TestGridComponent

  ],
  imports: [
    // CommonModule,
    // GridRoutingModule,
    // ReactiveFormsModule,
    // SharedUiModule

    CommonModule,


    MatCardModule,
    // AgGridModule,
    // GridsterModule, // Add this line
    // GridRoutingModule,
    // ReactiveFormsModule,
    // FormsModule,
    // AppMaterialModule,
    // SharedUiModule,
    // SharedUtilsModule,
    // SharedPipesModule,
    // SharedModule,
    // DynamicModule,
    // DefaultModule,
  ], 
  exports: [
    // TestGridComponent
  ],
  // schemas: [NO_ERRORS_SCHEMA],
  // schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class GridModule { }

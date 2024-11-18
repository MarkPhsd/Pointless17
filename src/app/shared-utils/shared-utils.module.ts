import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateHelperService } from '../_services/reporting/date-helper.service';
import { ColorPickerModule } from 'ngx-color-picker';
import { AgGridModule } from 'ag-grid-angular';
import { GridsterModule } from 'angular-gridster2';
import { EditorModule } from '@tinymce/tinymce-angular';
import { FormsModule } from '@angular/forms';
import { TruncateTextPipe } from '../_pipes/truncate-text.pipe';

@NgModule({
 
  imports: [
    CommonModule,
    ColorPickerModule,
    AgGridModule,
    GridsterModule,
    EditorModule,
    FormsModule,
  ],
  providers: [
    DateHelperService,
  ]
})
export class SharedUtilsModule { }

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateHelperService } from '../_services/reporting/date-helper.service';

@NgModule({
  declarations: [],
  imports: [
    CommonModule
  ],
  providers: [
    DateHelperService,
  ]
})
export class SharedUtilsModule { }

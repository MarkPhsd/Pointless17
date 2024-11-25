import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncateTextPipe } from '../_pipes/truncate-text.pipe';
import { DerpPipe } from '../_pipes/derp.pipe';
import { AutofocusDirective } from '../_directives/auto-focus-input.directive';

@NgModule({
  declarations: [
    TruncateTextPipe,
    DerpPipe,

  ],
  imports: [
    CommonModule

  ],
  exports : [
    TruncateTextPipe,
    DerpPipe,

  ]
})
export class SharedPipesModule { }

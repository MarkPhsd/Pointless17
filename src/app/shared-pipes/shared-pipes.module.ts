import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruncateTextPipe } from '../_pipes/truncate-text.pipe';
import { DerpPipe } from '../_pipes/derp.pipe';
import { AutofocusDirective } from '../_directives/auto-focus-input.directive';
import { ArrayFilterPipe, ArraySortPipe } from '../_pipes/array.pipe';
import { BackgroundUrlPipe } from '../_pipes/background-url.pipe';
import { SafeHtmlPipe } from '../_pipes/safe-html.pipe';
import { TruncateRightPipe } from '../_pipes/truncate-right.pipe';
import { FilterPipe } from '../_pipes/filter.pipe';

@NgModule({
  declarations: [
    TruncateTextPipe,
    DerpPipe,
    SafeHtmlPipe,
    ArrayFilterPipe,
    ArraySortPipe,
    BackgroundUrlPipe,
    TruncateRightPipe,
    FilterPipe,

  ],
  imports: [
    CommonModule

  ],
  exports : [
    TruncateTextPipe,
    DerpPipe,
    SafeHtmlPipe,
    ArrayFilterPipe,
    ArraySortPipe,
    BackgroundUrlPipe,
    TruncateRightPipe,
    FilterPipe,
  ]
})
export class SharedPipesModule { }

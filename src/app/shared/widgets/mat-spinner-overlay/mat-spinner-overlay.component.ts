import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-mat-spinner-overlay',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './mat-spinner-overlay.component.html',
  styleUrls: ['./mat-spinner-overlay.component.scss']
})
export class MatSpinnerOverlayComponent   {

  @Input() value       :  100;
  @Input() diameter    :  100;
  @Input() mode        : "indeterminate";
  @Input() strokeWidth :  10;
  @Input() overlay     :  true;
  @Input() color       : "primary";


}

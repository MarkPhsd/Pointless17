import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-mat-spinner-overlay',
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

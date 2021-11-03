import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-mat-spinner-overlay',
  templateUrl: './mat-spinner-overlay.component.html',
  styleUrls: ['./mat-spinner-overlay.component.scss']
})
export class MatSpinnerOverlayComponent   {

  @Input() value       : number = 100;
  @Input() diameter    : number = 100;
  @Input() mode        : string ="indeterminate";
  @Input() strokeWidth : number = 10;
  @Input() overlay     : boolean = true;
  @Input() color       : string = "primary";


}

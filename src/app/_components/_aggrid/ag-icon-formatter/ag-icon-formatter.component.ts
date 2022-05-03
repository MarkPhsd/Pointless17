import { Component, Input, OnInit } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

@Component({
  selector: 'app-ag-icon-formatter',
  template:     `<div>
                  <!-- <button mat-button (click)="openManifest(event)"> -->
                    <mat-icon *ngIf="icon"> {{icon}} </mat-icon>
                    {{label}}
                  <!-- </button> -->
                </div>
                `,
  styleUrls: ['./ag-icon-formatter.component.scss']
})
export class AgIconFormatterComponent  implements ICellRendererAngularComp {

  params: any;
  getLabelFunction: any;
  getIconFunction:  any;
  btnClass: string;
  @Input() label= '';
  @Input() icon = 'warehouse';
  showHide = ''

  agInit(params: any): void {

    if (!params.value) {
      this.showHide ='display:none;'
    }

    this.params = params;
    this.label = this.params.label || null;
    this.btnClass = this.params.btnClass || 'btn btn-primary';
    this.getLabelFunction = this.params.getLabelFunction;

    if (params.value == 0) {
      this.label = ''
      this.icon  = 'retail'
      return
    }

    if(this.getLabelFunction && this.getLabelFunction instanceof Function)
    {
      this.label = this.getLabelFunction(params.data);
      this.icon = this.label
      return

    }
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick($event) {
    if (this.params.onClick instanceof Function) {
      // put anything into params u want pass into parents component
      const params = {
        event: $event,
        rowData: this.params.node.data
        // ...something
      }
      this.params.onClick(params);

    }
  }
}

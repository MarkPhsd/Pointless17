import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

//https://stackoverflow.com/questions/50778659/ag-grid-cellrender-with-button-click
//https://stackblitz.com/edit/angular-ag-grid-button-renderer?file=src%2Fapp%2Fapp.component.ts
// <button mat-raised-button  class="agGridButton" color="primary"  type="button" (click)="onClick($event)">{{label}}</button>

@Component({
  selector: 'app-button-renderer',
  template:     `<div [style]="showHide"  >
                  <button   [style]="buttonStyle"
                            class="mat-raised-button"
                            type="button"
                            (click)="onClick($event)">
                    <mat-icon *ngIf="icon"> {{icon}} </mat-icon>
                    {{label}}
                  </button>
                </div>
                `
})
// i class="material-icons"
export class ButtonRendererComponent implements ICellRendererAngularComp {

  params: any;
  @Input() getLabelFunction: any;
  getIconFunction:  any;
  btnClass: string;
  @Input() label= 'Edit';
  @Input() icon = 'edit';
  showHide = ''
  buttonStyle: string;

  agInit(params: any): void {

    if (!params.value) {
      this.showHide ='display:none;'
    }

      this.params = params;
      this.label = this.params.label || null;
      this.btnClass = this.params.btnClass || 'btn btn-primary';
      this.getLabelFunction = this.params.getLabelFunction;
      this.getIconFunction = this.params.getIconFunction;

      if (!this.label || this.label === 'null') {
        this.icon = ''
        return
      }

      if (this.label && (this.label === 'delete' || this.label === 'Delete')) {
        this.icon = 'delete'
        return
      }

      if (this.label && (this.label === 'warehouse' || this.label === 'Warehouse')) {
        this.icon = 'warehouse'
        return
      }

      if (this.label === 'null') {
        this.icon = ''
        return
      }
      if (this.label ==='Intake' || this.label ==='intake') {
        this.icon = 'inventory'
        return
      }
      if ( this.getLabelFunction == 'open' || this.label?.toLowerCase() === 'open') {
        this.icon = 'expand'
        return
      }

      if (this.label?.toLowerCase() ===  'inv' || this.label === 'inv') {
        this.icon = 'inventory'
        return
      }

      if (this.label === 'delete' || this.label?.toLowerCase() === 'delete' || this.getLabelFunction == 'delete') {
        this.icon = 'delete'
        this.icon = 'file_copy'
        this.showHide = "width:55px;"
        this.label = ''
        this.buttonStyle = 'width:55px;'
        return
      }

      if (this.label?.substring(0,4).toLowerCase() ===  'view') {
        this.icon = 'open_in_new'
        return
      }

      if (this.label?.toLowerCase() ===  'edit' || this.label === 'Edit') {
        this.icon = 'edit'
        return
      }


      if (this.label?.toLowerCase() ===   'add') {
        this.icon = 'add'
        return
      }

      if (this.label?.toLowerCase() ===   'copy') {
        this.icon = 'file_copy'
        this.showHide = "width:55px;"
        this.label = ''
        this.buttonStyle = 'width:55px;'
        return
      }

      if (this.label?.toLowerCase() ===   'view') {
        this.icon = 'view'
        return
      }
      if (this.label?.toLowerCase() ===   'check Iin') {
        // this.icon = 'add'
        return
      }
      if (this.label === 'METRC') {
        this.icon = 'qr_code'
        return
      }

    // }
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

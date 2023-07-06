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

    if(this.getIconFunction && this.getIconFunction instanceof Function)
    {
      this.icon = this.getIconFunction(params.data);
    }

    if(this.getLabelFunction && this.getLabelFunction instanceof Function)
    {

      // console.log(this.label, this.getLabelFunction)
      this.label = this.getLabelFunction(params.data);

      if (this.label === 'null') {
        this.icon = ''
        return
      }
      if (this.label ==='Intake') {
        this.icon = 'inventory'
        return
      }
      if ( this.getLabelFunction == 'open' || this.label?.toLowerCase() === 'open') {
        this.icon = 'expand'
        return
      }

      if (this.label?.toLowerCase() === 'delete' || this.getLabelFunction == 'delete') {
        this.icon = 'delete'
        return
      }
      if (this.label?.toLowerCase() ===  'edit') {
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
        this.buttonStyle = 'width:45px;'
        console.log('icon', this.icon)
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

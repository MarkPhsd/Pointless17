import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';

//https://stackoverflow.com/questions/50778659/ag-grid-cellrender-with-button-click
//https://stackblitz.com/edit/angular-ag-grid-button-renderer?file=src%2Fapp%2Fapp.component.ts
// <button mat-raised-button  class="agGridButton" color="primary"  type="button" (click)="onClick($event)">{{label}}</button>

@Component({
  selector: 'app-button-renderer',
  template:     `<div [style]="showHide" >
                  <button
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
  getLabelFunction: any;
  getIconFunction:  any;
  btnClass: string;
  @Input() label= 'Edit';
  @Input() icon = 'edit';
  showHide = ''

  agInit(params: any): void {

    if (!params.value) {
      this.showHide ='display:none;'
    }

    this.params = params;
    this.label = this.params.label || null;
    this.btnClass = this.params.btnClass || 'btn btn-primary';
    this.getLabelFunction = this.params.getLabelFunction;

    if(this.getLabelFunction && this.getLabelFunction instanceof Function)
    {

      this.label = this.getLabelFunction(params.data);

      console.log(this.label)
      if (this.label ==='Intake') {
        this.icon = 'inventory'
        return
      }
      if (this.label === 'Delete') {
        this.icon = 'delete'
        return
      }
      if (this.label === 'Edit') {
        this.icon = 'edit'
        return
      }
      if (this.label === 'Add') {
        this.icon = 'add'
        return
      }
      if (this.label === 'view') {
        this.icon = 'view'
        return
      }
      if (this.label === 'Check In') {
        // this.icon = 'add'
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

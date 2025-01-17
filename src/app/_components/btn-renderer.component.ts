import { CommonModule } from '@angular/common';
import { Component, OnInit, AfterContentInit, Input } from '@angular/core';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { AppMaterialModule } from '../app-material.module';
import { SharedPipesModule } from '../shared-pipes/shared-pipes.module';

//https://stackoverflow.com/questions/50778659/ag-grid-cellrender-with-button-click
//https://stackblitz.com/edit/angular-ag-grid-button-renderer?file=src%2Fapp%2Fapp.component.ts
// <button mat-raised-button  class="agGridButton" color="primary"  type="button" (click)="onClick($event)">{{label}}</button>

@Component({
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  selector: 'app-button-renderer',
  template:     `<div [style]="showHide"  >
                  <button   mat-button
                            [style]="buttonStyle"
                            class="mat-raised-button"
                            type="button"
                            [color]="color"
                            (click)="onClick($event)">
                    <mat-icon *ngIf="icon"> {{icon}} </mat-icon>
                    {{label}}
                  </button>
                </div>
                `
})

//
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
  color="primary"
   warn    = 'back-color:red;';
   accent  = 'back-color:blue;';
   primary = 'back-color:dark-blue;';

  colorTheme   = 'primary'
  themeWarn    = 'warn'
  themeAccent  = 'accent'
  themePrimary = 'primary'
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

      if (this.label && (this.label === 'receive' || this.label === 'Receive')) {
        this.icon = 'download'
        this.color = this.themeWarn
        this.label = "receive"
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label && (this.label === 'delete' || this.label === 'Delete')) {
        this.icon = 'delete'
        this.color = this.themeWarn
        this.label = "Del."
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label && (this.label === 'warehouse' || this.label === 'Warehouse')) {
        this.icon = 'warehouse'
        this.color = this.themeAccent
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label === 'null') {
        this.icon = ''
        this.color = this.themeAccent
        this.buttonStyle = `${this.buttonStyle}`
        return
      }
      if (this.label ==='Intake' || this.label ==='intake') {
        this.icon = 'inventory'
        this.color = this.themeAccent
        this.buttonStyle = `${this.buttonStyle}`
        return
      }
      if ( this.getLabelFunction == 'open' || this.label?.toLowerCase() === 'open') {
        this.icon = 'expand'
        this.color = this.themeAccent
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label?.toLowerCase() ===  'inv' || this.label === 'inv') {
        this.icon = 'inventory'
        this.color = this.themeAccent
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label === 'delete' || this.label?.toLowerCase() === 'delete' || this.getLabelFunction == 'delete') {
        this.icon = 'delete'
        this.icon = 'file_copy'
        this.showHide = "width:55px;"
        this.label = ''
        this.buttonStyle = 'width:55px;'
        this.color = this.themeAccent
        this.buttonStyle = `${this.buttonStyle}`
        this.color = 'warn'
        return
      }

      if (this.label?.substring(0,4).toLowerCase() ===  'view') {
        this.icon = 'open_in_new'
        this.color = this.themeAccent
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label?.toLowerCase() ===  'edit' || this.label === 'Edit') {
        this.icon = 'edit'
        this.color = this.themePrimary
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label?.toLowerCase() ===   'add') {
        this.icon = 'add'
        this.color = this.themePrimary
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label?.toLowerCase() ===   'copy') {
        this.icon = 'file_copy'
        this.showHide = "width:55px;"
        this.label = ''
        this.buttonStyle = 'width:55px;'
        this.color = this.themePrimary
        this.buttonStyle = `${this.buttonStyle}`
        return
      }

      if (this.label?.toLowerCase() ===   'view') {
        this.icon = 'view'
        this.color = this.themePrimary
        this.buttonStyle = `${this.buttonStyle}`
        return
      }
      if (this.label?.toLowerCase() ===   'check Iin') {
        // this.icon = 'add'
        return
      }
      if (this.label === 'METRC') {
        this.icon = 'qr_code'
        this.color = this.themePrimary
        this.buttonStyle = `${this.buttonStyle}`
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

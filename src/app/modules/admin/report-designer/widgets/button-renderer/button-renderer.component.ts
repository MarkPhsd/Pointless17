import { CommonModule } from '@angular/common';
import { Component,  Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ICellRendererAngularComp } from 'ag-grid-angular';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

//https://stackoverflow.com/questions/50778659/ag-grid-cellrender-with-button-click
//https://stackblitz.com/edit/angular-ag-grid-button-renderer?file=src%2Fapp%2Fapp.component.ts
// <button mat-raised-button  class="agGridButton" color="primary"  type="button" (click)="onClick($event)">{{label}}</button>

@Component({
  selector: 'btn-cell-renderer',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  template: `
    <button
            class="mat-raised-button"
            (click)="onClick($event)">
            Edit
    </button>
  `,
})
export class ButtonRendererComponent implements ICellRendererAngularComp {
  params: any;
  getLabelFunction: any;
  getIconFunction:  any;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  btnClass: string = '';
  @Input() label= 'Edit';
  @Input() icon = 'edit';
  showHide = ''

  agInit(params: any): void {
    this.params = params;
  }

  btnClickedHandler() {
    this.params.clicked(this.params.value);
  }

  refresh(params?: any): boolean {
    return true;
  }

  onClick(event: any) {
    if (this.params.onClick instanceof Function) {
      // put anything into params u want pass into parents component
      const params = {
        event: event,
        rowData: this.params.node.data
        // ...something
      }
      this.params.onClick(params);

    }
  }

}

// @Component({
//   selector: 'app-button-renderer',
//   template:     `<div  >
//                   <button
//                               class="mat-raised-button"
//                               type="button"
//                               (click)="onClick($event)">
//                     <mat-icon *ngIf="icon"> {{icon}} </mat-icon>
//                     {{label}}
//                   </button>
//                 </div>
//                 `
// })
// // i class="material-icons"

// export class ButtonRendererComponent implements ICellRendererAngularComp {
//   private params: any;

//   agInit(params: any): void {
//     this.params = params;
//   }

//   btnClickedHandler() {
//     this.params.clicked(this.params.value);
//   }
// }

// export class ButtonRendererComponent implements ICellRendererAngularComp {

//   params: any;
//   getLabelFunction: any;
//   getIconFunction:  any;
//   btnClass: string = '';
//   @Input() label= 'Edit';
//   @Input() icon = 'edit';
//   showHide = ''

//   agInit(params: any): void {

//     // console.log('button param value', params, params.value)
//     // if (!params.value) {
//     //   this.showHide ='display:none;'
//     // }

//     this.params = params;
//     this.label = this.params.label || null;
//     this.btnClass = this.params.btnClass || 'btn btn-primary';
//     this.getLabelFunction = this.params.getLabelFunction;
//     this.getIconFunction = this.params.getIconFunction;

//     if(this.getIconFunction && this.getIconFunction instanceof Function)
//     {
//       this.icon = this.getIconFunction(params.data);
//     }

//     if(this.getLabelFunction && this.getLabelFunction instanceof Function)
//     {

//       this.label = this.getLabelFunction(params.data);

//       if (this.label === 'null') {
//         this.icon = ''
//         return
//       }
//       if (this.label ==='Intake') {
//         this.icon = 'inventory'
//         return
//       }
//       if (this.label === 'Delete') {
//         this.icon = 'delete'
//         return
//       }
//       if (this.label === 'Edit') {
//         this.icon = 'edit'
//         return
//       }
//       if (this.label === 'Add') {
//         this.icon = 'add'
//         return
//       }
//       if (this.label === 'view') {
//         this.icon = 'view'
//         return
//       }
//       if (this.label === 'Check In') {
//         // this.icon = 'add'
//         return
//       }
//       if (this.label === 'METRC') {
//         this.icon = 'qr_code'
//         return
//       }

//     }
//   }

//   refresh(params?: any): boolean {
//     return true;
//   }

//   onClick(event: any) {
//     if (this.params.onClick instanceof Function) {
//       // put anything into params u want pass into parents component
//       const params = {
//         event: event,
//         rowData: this.params.node.data
//         // ...something
//       }
//       this.params.onClick(params);

//     }
//   }
// }

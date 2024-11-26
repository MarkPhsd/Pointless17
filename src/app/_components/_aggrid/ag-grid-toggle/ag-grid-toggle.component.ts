import { CommonModule } from '@angular/common';
import { Component, OnInit,Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AgGridModule, ICellRendererAngularComp } from 'ag-grid-angular';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-ag-grid-toggle',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
    AgGridModule,
  SharedPipesModule],
  templateUrl: './ag-grid-toggle.component.html',
  styleUrls: ['./ag-grid-toggle.component.scss']
})
export class AgGridToggleComponent implements ICellRendererAngularComp  {

  params: any;

  getLabelFunction: any;
  btnClass: string;
  @Input() label: string;

  value: any;
  name  = 'name'

  agInit(params: any): void {
    console.log(params)
    if (params) {

      this.params = params;
      this.label = this.params.label || null;
      this.btnClass = this.params.btnClass || 'btn btn-primary';
      this.getLabelFunction = this.params.getLabelFunction;
      this.value = this.params.value;

      if(this.getLabelFunction && this.getLabelFunction instanceof Function)
      {
        // console.log(params.data)
        this.label = this.getLabelFunction(params.data);
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

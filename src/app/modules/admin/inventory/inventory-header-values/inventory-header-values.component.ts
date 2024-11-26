import { CommonModule, DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-inventory-header-values',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './inventory-header-values.component.html',
  styleUrls: ['./inventory-header-values.component.scss']
})
export class InventoryHeaderValuesComponent  {

  @Input() item: IInventoryAssignment;

  constructor(private date: DatePipe) { }

}

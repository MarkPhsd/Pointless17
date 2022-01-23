import { DatePipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';

@Component({
  selector: 'app-inventory-header-values',
  templateUrl: './inventory-header-values.component.html',
  styleUrls: ['./inventory-header-values.component.scss']
})
export class InventoryHeaderValuesComponent  {

  @Input() item: IInventoryAssignment;

  constructor(private date: DatePipe) { }

}

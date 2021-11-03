import { Component, Input, OnInit } from '@angular/core';
import { ITooltipAngularComp } from 'ag-grid-angular';
import { MenuItem } from 'src/app/_interfaces';
import { MenuService } from 'src/app/_services';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { Observable } from 'rxjs'

@Component({
  selector: 'app-inventory-list-tool-tip',
  templateUrl: './inventory-list-tool-tip.component.html',
  styleUrls: ['./inventory-list-tool-tip.component.scss']
})
export class InventoryListToolTipComponent implements OnInit, ITooltipAngularComp {

  params:               any;
  data:                 any;
  inventoryAssignment:  IInventoryAssignment;
  menuItem$:            Observable<MenuItem>;
  @Input() item: any;

  constructor(private inventoryAssignmentService: InventoryAssignmentService,
              private menuService: MenuService,
              ) { }

  ngOnInit() {
    console.log('error')
  }

  agInit(params): void {
    this.params = params;

    console.log(params)

    const data = params.api.getDisplayedRowAtIndex(params.rowIndex).data;

    const id = data.id

    if (id) {
      console.log('id ', id)
    } else {
      console.log('id not fouund ', id)
    }

    this.data.color = this.params.color || 'white';


  }

}

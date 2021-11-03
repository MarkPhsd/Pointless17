import { Component, OnInit , Input} from '@angular/core';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';

@Component({
  selector: 'app-inventory-history-item',
  templateUrl: './inventory-history-item.component.html',
  styleUrls: ['./inventory-history-item.component.scss']
})
export class InventoryHistoryItemComponent implements OnInit {

  @Input() item:    IInventoryAssignment;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}

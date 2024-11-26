import { CommonModule } from '@angular/common';
import { Component, OnInit , Input} from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-inventory-history-item',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './inventory-history-item.component.html',
  styleUrls: ['./inventory-history-item.component.scss']
})
export class InventoryHistoryItemComponent implements OnInit {

  @Input() item:    IInventoryAssignment;
  quantityChange: number;
  constructor() { }

  ngOnInit(): void {
    console.log('')
    this.getChangeCost(this.item )
  }

  getChangeCost(item) {
    if (this.item && this.item.adjustmentNote) {
      const note =  this.item.adjustmentNote.split(';')
      if (note[1]) {
        this.quantityChange = this.item.packageCountRemaining - +note[1]
        // console.log('quantitychange', this.quantityChange)
        return this.quantityChange
      }
    }
    return 0;
  }

}

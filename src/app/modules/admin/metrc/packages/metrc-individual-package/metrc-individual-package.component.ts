import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';

@Component({
  selector: 'app-metrc-individual-package',
  templateUrl: './metrc-individual-package.component.html',
  styleUrls: ['./metrc-individual-package.component.scss']
})
export class MetrcIndividualPackageComponent implements OnInit {

  @Output() outputEditAssignment   = new EventEmitter<any>();
  @Output() outputdeleteAssignment = new EventEmitter<any>();
  @Input() i:    any;
  @Input() item: IInventoryAssignment;

  constructor() { }

  ngOnInit() {
    console.log('')
  }

  deleteAssignment(i: any) {
    this.outputdeleteAssignment.emit(i)
  }

  editAssignment(i: any) {
    this.outputEditAssignment.emit(i)
  }


}

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IInventoryAssignment } from 'src/app/_services/inventory/inventory-assignment.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-metrc-individual-package',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
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

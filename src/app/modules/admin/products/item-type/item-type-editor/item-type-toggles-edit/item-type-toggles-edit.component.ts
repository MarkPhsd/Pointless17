import { CommonModule } from '@angular/common';
import { Component, OnInit,Input } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { IItemType } from 'src/app/_services/menu/item-type.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'item-type-toggles-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './item-type-toggles-edit.component.html',
  styleUrls: ['./item-type-toggles-edit.component.scss']
})
export class ItemTypeTogglesEditComponent implements OnInit {

  @Input() inputForm: UntypedFormGroup;
  @Input() itemType: IItemType;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}

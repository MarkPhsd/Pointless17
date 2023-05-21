import { Component, OnInit,Input } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { IItemType } from 'src/app/_services/menu/item-type.service';

@Component({
  selector: 'item-type-toggles-edit',
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

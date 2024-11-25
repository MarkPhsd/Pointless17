import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'psReporting-and-or-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    AndOrSelectorComponent
  ],
  templateUrl: './and-or-selector.component.html',
  styleUrls: ['./and-or-selector.component.scss']
})
export class AndOrSelectorComponent implements OnInit {
  @Input() inputForm: UntypedFormGroup | undefined;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() fieldName: string = 'andOr'
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() hideClear: boolean  = false;

  andOrList = [
    {id: 1, name: 'and'},
    {id: 2, name: 'or'},
  ]

  @ViewChild('formView')      formView: TemplateRef<any> | undefined;

   @Output() outputItem = new EventEmitter<any>();
  constructor() { }

  ngOnInit(): void {
  }

  get isFormView() {
    if (this.inputForm) {
      return this.formView
    }
    return null;
  }

  setItem(item:any) {
    console.log('item output', item)
    this.outputItem.emit(item)
  }
}

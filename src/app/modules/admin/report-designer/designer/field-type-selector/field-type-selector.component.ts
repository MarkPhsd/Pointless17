import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ItemBasic } from '../../interfaces/reports';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatSelectorComponent } from '../../widgets/mat-selector/mat-selector.component';

@Component({
  selector: 'psReporting-field-type-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    MatSelectorComponent
  ],
  templateUrl: './field-type-selector.component.html',
  styleUrls: ['./field-type-selector.component.scss']
})
export class FieldTypeSelectorComponent implements OnInit {

  @Input() list: any | undefined;
  @Output() selectItem = new EventEmitter<any>();
  @Input() inputForm:  UntypedFormGroup | undefined;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() fieldName: string = '' ;
  //list of fields type is the type of field, number, text etc.
  selected = {} as ItemBasic[] | unknown;
  @ViewChild('formView')      formView: TemplateRef<any> | undefined;

  constructor() {}

  ngOnInit(): void {
      const i = 0;
  }

  setItem(item:any) {
    this.selectItem.emit(item)
  }
}

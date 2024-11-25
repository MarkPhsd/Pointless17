import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { aggregateFunctions } from '../../interfaces/reports';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatSelectorComponent } from '../../widgets/mat-selector/mat-selector.component';

@Component({
  selector: 'psReporting-aggregate-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    MatSelectorComponent
  ],
  templateUrl: './aggregate-selector.component.html',
  styleUrls: ['./aggregate-selector.component.scss']
})
export class AggregateSelectorComponent implements OnInit {

  @Output() outputItem = new EventEmitter<any>();
  @Input() inputForm: UntypedFormGroup | undefined;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() fieldName: string = 'groupBy'
  @ViewChild('formView')      formView: TemplateRef<any> | undefined;

  list = aggregateFunctions
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

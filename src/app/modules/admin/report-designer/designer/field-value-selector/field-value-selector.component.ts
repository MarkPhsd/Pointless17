import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { ItemBasic } from '../../interfaces/reports';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { MatSelectorComponent } from '../../widgets/mat-selector/mat-selector.component';

@Component({
  selector: 'pgReporting-field-value-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    MatSelectorComponent
  ],
  templateUrl: './field-value-selector.component.html',
  styleUrls: ['./field-value-selector.component.scss']
})
export class FieldValueSelectorComponent implements OnInit {

  @Output() outputItem = new EventEmitter<any>();
  @Input() inputForm: UntypedFormGroup;
  // eslint-disable-next-line @typescript-eslint/no-inferrable-types
  @Input() fieldName: string = '';
  @Input() placeHolder  = ''
  @Input() list: ItemBasic[] | unknown;

  constructor() { }

  ngOnInit(): void {
  }

  setItem(item:any) {
    console.log('item output', item)
    this.outputItem.emit(item)
  }
}

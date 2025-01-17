import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'pgReporting-mat-selector',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule
    ,FormsModule,ReactiveFormsModule,
  ],
  templateUrl: './mat-selector.component.html',
  styleUrls: ['./mat-selector.component.scss']
})
export class MatSelectorComponent implements OnInit {

    @Output() selectItem = new EventEmitter();
    @Input() inputForm: UntypedFormGroup;
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() fieldName: string = ''
    @Input() placeHolder = ''
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() hideClear: boolean  = false;
    @Input() list: any;
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    @Input() defaultValue: string = ''
    @ViewChild('formView')      formView: TemplateRef<any> | undefined;

    emptyItem = { id: 0, name: ''}

    constructor() { }

    ngOnInit(): void {
      if (this.defaultValue) {
        // let item : any;
        // item.name = this.defaultValue;
        // if (this.inputForm && !this.inputForm.controls[this.fieldName].value) {
        //   this.inputForm.controls[this.fieldName].setValue(this.defaultValue)
        // }
      }
    }

    get isFormView() {
      if (this.inputForm) {
        return this.formView
      }
      return ;
    }

    setItem(item:any) {
      // console.log('setItem', item)
      this.selectItem.emit(item)
    }

    clearInput() {
      this.selectItem.emit({})
    }

    get searchValueAssigned() {

      if (this.inputForm.controls[this.fieldName].value) {
        return true
      }
      return false;
    }

  }

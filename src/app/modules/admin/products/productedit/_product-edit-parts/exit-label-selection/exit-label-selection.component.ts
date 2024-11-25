import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'exit-label-selection',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './exit-label-selection.component.html',
  styleUrls: ['./exit-label-selection.component.scss']
})
export class ExitLabelSelectionComponent  {

  @Input()  inputForm: UntypedFormGroup;
  @Input()  fieldName: string;
  @Input()  list$    : Observable<any>;
  @Output() outputItem = new EventEmitter<any>();

  constructor() { }


}

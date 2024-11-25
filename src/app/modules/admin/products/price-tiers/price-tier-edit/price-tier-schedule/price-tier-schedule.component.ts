import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup, FormGroupDirective, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'price-tier-schedule',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

    SharedPipesModule],
  templateUrl: './price-tier-schedule.component.html',
  styleUrls: ['./price-tier-schedule.component.scss']
})
export class PriceTierScheduleComponent implements OnInit {

  @Input() showTime = false;
  @Input() inputForm: UntypedFormGroup;
  @Input() formGroupName: any;

  childForm: UntypedFormGroup;

  constructor(
    private _fb: UntypedFormBuilder,
    private parentF: FormGroupDirective) { }

  ngOnInit() {

    this.childForm = this.parentF.form;
    this.childForm = this._fb.group({
      startTime:      [],
      endTime:        [],
      specialPrice:   [],
      weekDays:       []
    })
    console.log('')
  }

}

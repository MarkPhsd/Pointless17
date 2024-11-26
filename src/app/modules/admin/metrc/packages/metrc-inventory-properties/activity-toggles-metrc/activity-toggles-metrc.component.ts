import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'activity-toggles-metrc',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './activity-toggles-metrc.component.html',
  styleUrls: ['./activity-toggles-metrc.component.scss']
})
export class ActivityTogglesMetrcComponent  {
  @Input()  inputForm:      UntypedFormGroup;
  constructor() { }


}

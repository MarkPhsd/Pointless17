import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { ValueFieldsComponent } from '../../productedit/_product-edit-parts/value-fields/value-fields.component';

@Component({
  selector: 'price-schedule-menu-options',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,
  ValueFieldsComponent,
  SharedPipesModule],
  templateUrl: './price-schedule-menu-options.component.html',
  styleUrls: ['./price-schedule-menu-options.component.scss']
})
export class PriceScheduleMenuOptionsComponent implements OnInit {

  @Input() inputForm: UntypedFormGroup;
  constructor() { }

  ngOnInit(): void {
    const  i = 0
  }

}

import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-chemical-values',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,
  SharedPipesModule],

  templateUrl: './chemical-values.component.html',
  styleUrls: ['./chemical-values.component.scss']
})
export class ChemicalValuesComponent implements OnInit {

  @Input() inputForm: UntypedFormGroup
  @Input() inventoryItem: boolean;

  // thc:   any;
  // thc2:  any;
  // thca:  any;
  // thca2: any;
  // cbd:   any;
  // cbd2:  any;
  // cbn:   any;
  // cbn2:  any;

  // cbda:   any;
  // cbda2:  any;

  constructor() { }

  ngOnInit(): void {
    // console.log('')
  }

}

import { Component, Input, OnInit } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-chemical-values',
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

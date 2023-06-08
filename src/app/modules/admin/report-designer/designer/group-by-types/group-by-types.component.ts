import { Component, Input, OnInit } from '@angular/core';
import { viewBuilder_AggregateFunction, aggregateFunctions } from '../../interfaces/reports';

@Component({
  selector: 'psReporting-group-by-types',
  templateUrl: './group-by-types.component.html',
  styleUrls: ['./group-by-types.component.scss']
})
export class GroupByTypesComponent implements OnInit {

  @Input()  selected = {} as viewBuilder_AggregateFunction | undefined ;

  fieldTypes = aggregateFunctions;

  constructor() {
  }

  ngOnInit(): void {
      const i = 0;
  }

}

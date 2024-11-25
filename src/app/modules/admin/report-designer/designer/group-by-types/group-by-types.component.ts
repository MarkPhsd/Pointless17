import { Component, Input, OnInit } from '@angular/core';
import { viewBuilder_AggregateFunction, aggregateFunctions } from '../../interfaces/reports';
import { CommonModule } from '@angular/common';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'psReporting-group-by-types',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule],
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

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-resale-classes-filter',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './resale-classes-filter.component.html',
  styleUrls: ['./resale-classes-filter.component.scss']
})
export class ResaleClassesFilterComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

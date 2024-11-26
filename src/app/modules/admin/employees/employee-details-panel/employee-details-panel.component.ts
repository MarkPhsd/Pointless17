import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-employee-details-panel',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './employee-details-panel.component.html',
  styleUrls: ['./employee-details-panel.component.scss']
})
export class EmployeeDetailsPanelComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

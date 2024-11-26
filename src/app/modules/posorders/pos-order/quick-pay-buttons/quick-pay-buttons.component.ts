import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'quick-pay-buttons',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './quick-pay-buttons.component.html',
  styleUrls: ['./quick-pay-buttons.component.scss']
})
export class QuickPayButtonsComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const i =0
  }

}

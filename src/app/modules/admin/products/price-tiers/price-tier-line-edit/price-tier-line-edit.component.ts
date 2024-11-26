import { CommonModule } from '@angular/common';
import { Component,  Inject,  Input, Output, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-price-tier-line-edit',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './price-tier-line-edit.component.html',
  styleUrls: ['./price-tier-line-edit.component.scss']
})
export class PriceTierLineEditComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}

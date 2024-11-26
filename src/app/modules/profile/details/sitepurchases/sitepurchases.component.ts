import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-sitepurchases',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],

  templateUrl: './sitepurchases.component.html',
  styleUrls: ['./sitepurchases.component.scss']
})
export class SitepurchasesComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}

import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-prep-order-item',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './prep-order-item.component.html',
  styleUrls: ['./prep-order-item.component.scss']
})
export class PrepOrderItemComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    const i = 0
  }

}

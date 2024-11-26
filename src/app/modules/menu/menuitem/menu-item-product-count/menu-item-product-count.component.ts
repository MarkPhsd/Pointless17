import { CommonModule } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'menu-item-product-count',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,

  ],
  templateUrl: './menu-item-product-count.component.html',
  styleUrls: ['./menu-item-product-count.component.scss']
})
export class MenuItemProductCountComponent {

  @Input() productCount = 0;
  @Input() isUserStaff = false;
  constructor() { }


}

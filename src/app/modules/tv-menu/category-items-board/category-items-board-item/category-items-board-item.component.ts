import { CommonModule } from '@angular/common';
import { Component,  OnInit, Input } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { StrainIndicatorComponent } from '../../strain-indicator/strain-indicator.component';

@Component({
  selector: 'category-items-board-item',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    StrainIndicatorComponent,
  ],

  templateUrl: './category-items-board-item.component.html',
  styleUrls: ['./category-items-board-item.component.scss']
})
export class CategoryItemsBoardItemComponent  implements OnInit {

  @Input() item: IMenuItem
  @Input() MMJMenu: boolean;

  gridClass = 'grid-flow prices border';
  constructor(
    ) {}

  ngOnInit(): void {
    this.initCSSClass();
  }
  initCSSClass() {
    if (this.MMJMenu) {  this.gridClass = 'grid-flow-cannabis prices border' }
  }

}

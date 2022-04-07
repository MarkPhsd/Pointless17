import { Component,  OnInit, Input } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector: 'category-items-board-item',
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

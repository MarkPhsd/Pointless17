import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'menu-item-product-count',
  templateUrl: './menu-item-product-count.component.html',
  styleUrls: ['./menu-item-product-count.component.scss']
})
export class MenuItemProductCountComponent {

  @Input() productCount = 0;
  @Input() isUserStaff = false;
  constructor() { }


}

import { Component, Input, OnInit } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';

@Component({
  selector: 'menu-item-extended-prices',
  templateUrl: './menu-item-extended-prices.component.html',
  styleUrls: ['./menu-item-extended-prices.component.scss']
})
export class MenuItemExtendedPricesComponent implements OnInit {

  @Input() menuItem: IMenuItem;
  @Input() isUserStaff: boolean;

  constructor() { }

  ngOnInit(): void {
    console.log('')
  }

}

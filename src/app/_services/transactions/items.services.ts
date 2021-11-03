import { Injectable } from '@angular/core';
import { Item } from 'src/app/_interfaces';

@Injectable()
export class ItemsService {
  private items: Item[] = [
    {name: 'menu'},
    {name: 'orders'},
    {name: 'wishilist'},
    {name: 'reports'},
    {name: 'dashboard'},
    {name: 'profile'},
    {name: 'categories'},
    {name: 'productlist'},
    {name: 'sites'},
  ];

  getItems(): Item[] {
    return [...this.items];
  }

  getItemByIndex(index: number): Item {
    return this.items[index];
  }
}

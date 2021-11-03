
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IProductCategory,IUserProfile} from 'src/app/_interfaces';
import { IMenuItem } from '../../_interfaces/menu/menu-products';

@Injectable()

export class AnimationCountService {

  private _users: IUserProfile[] = [];
  private _categoryItems: IProductCategory[] = [];
  private _menuItem : IMenuItem;
  private _menuItems: IMenuItem[] = [];

  get categoryTotal() { return this._categoryItems;}

  get userTotal() { return this._users.length; }

  get menuItemsTotal() { return this._menuItems.length;}

  get menuItemWithItemPricesTotal() { return this._menuItems.length; }

  specifyProfileAnimations(users: IUserProfile[]) { this._users = users }

  specifyCategoryAnimations(categories:IProductCategory[]) {this._categoryItems = categories}

  specifyMenuItemAnimations(menuItem: IMenuItem) {this._menuItem = menuItem}

  specifyMenuItemsAnimations(menuItems: IMenuItem[]) {this._menuItems = this.menuItems  }

  specifyMenuItem(menuItem: IMenuItem) {  this._menuItem = menuItem}

  get menuItem() { return this._menuItem }

  get menuItems() { return this._menuItems;  }

  get menuCategories() {return this._categoryItems;}

  get users() { return this._categoryItems;}


}

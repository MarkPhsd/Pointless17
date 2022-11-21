import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'menu-item-card-dashboard',
  templateUrl: './menu-item-card.component.html',
  styleUrls: ['./menu-item-card.component.scss']
})
export class MenuItemCardDashboardComponent implements OnInit {

  @Input() chartHeight: any;
  @Input() listItemID : any;
  @Input() MMJMenu: boolean;
  menu$: Observable<IMenuItem>;

  constructor(
    private siteService       : SitesService,
    private menuService       : MenuService,) { }

  ngOnInit(): void {
    if (this.listItemID) {
      const site = this.siteService.getAssignedSite();
      this.menu$ = this.menuService.getMenuItemByID(site, this.listItemID)
    }
  }

}

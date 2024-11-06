import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { IFlowerMenu, TvMenuPriceTierService } from 'src/app/_services/menu/tv-menu-price-tier.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MenuService } from 'src/app/_services/menu/menu.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-tier-items',
  templateUrl: './tier-items.component.html',
  styleUrls: ['./tier-items.component.scss'],
})
export class TierItemsComponent implements OnInit {
  @Input() isStaff: boolean;
  @Input() priceTier: string;
  headers: any;
  flowers$: Observable<IFlowerMenu[]>;
  filteredFlowers: Observable<IFlowerMenu[]>;
  sortField: string = 'name'; // Default sort field
  sortOrder: 'asc' | 'desc' = 'asc';

  constructor(
    private tvMenuPriceTierService: TvMenuPriceTierService,
    private siteService: SitesService,
    private menuService: MenuService,
    private orderMethodsService: OrderMethodsService
  ) {}

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();
    this.flowers$ = this.tvMenuPriceTierService.getFlowers(site);
    this.refreshFlowers();
  }

  refreshFlowers() {
    if (this.priceTier) {
      this.headers = [this.priceTier];
    } else {
      this.flowers$.subscribe((data) => {
        this.headers = [...new Set(data.map((item) => item.priceTier))];
        this.applySorting(data);
      });
    }
  }

  setSort(field: string) {
    this.sortField = field;
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.applySorting();
  }

  applySorting(data: IFlowerMenu[] = this.flowers$.getValue()) {
    this.filteredFlowers = this.flowers$.pipe(
      map((flowers) =>
        flowers.sort((a, b) => {
          const aValue = a[this.sortField];
          const bValue = b[this.sortField];
          const comparison = aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
          return this.sortOrder === 'asc' ? comparison : -comparison;
        })
      )
    );
  }

  navMenuItem(flower: IFlowerMenu) {
    if (flower) {
      this.tvMenuPriceTierService.updateTierFlowerMenu(flower);
      if (!flower.id) return;

      const site = this.siteService.getAssignedSite();
      this.menuService.getMenuItemByID(site, flower.id).subscribe((data) => {
        if (!data) return;
        this.menuService.updateCurrentMenuItem(data);
        this.orderMethodsService.menuItemActionPopUp(null, data, false);
      });
    }
  }
}

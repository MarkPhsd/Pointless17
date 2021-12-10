import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { MenuService } from 'src/app/_services';
import { FormGroup } from '@angular/forms';
import { IItemType } from 'src/app/_services/menu/item-type.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { IPriceCategories, IPriceCategoryPaged } from 'src/app/_interfaces/menu/price-categories';

@Component({
  selector: 'app-price-category-select',
  templateUrl: './price-category-select.component.html',
  styleUrls: ['./price-category-select.component.scss']
})

export class PriceCategorySelectComponent implements OnInit {
  hidecheckbox = true;
  isOpenPrice: boolean;
  @Output() itemSelect  = new EventEmitter();
  @Input() inputForm:      FormGroup;
  @Input() priceCategoryID: number;
  @Input() itemType    = {} as IItemType;
  priceCategory        :   IPriceCategories;
  priceCategoriesPaged$:   Observable<IPriceCategoryPaged>;

  constructor(private menuService: MenuService,
               private sitesService: SitesService,
               private priceCategoryService: PriceCategoriesService,
               private menuPricingService: PriceCategoriesService,) {
          }

  ngOnInit(): void {
    if (this.inputForm) {

    }
    const site = this.sitesService.getAssignedSite();
    this.priceCategoriesPaged$ = this.menuPricingService.getPriceCategoriesNoChildrenByPage(site);
  }

  getPriceCategory(event) {
    const item = event
    if (item) {
      if (item.id) {
        const site = this.sitesService.getAssignedSite();
        this.priceCategoryService.getPriceCategory(site, item.id).subscribe(data => {
          this.priceCategory = data

          }
        )
      }
    }
  }

}

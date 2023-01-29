import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable } from 'rxjs';
import { FormGroup } from '@angular/forms';
import { IItemType } from 'src/app/_services/menu/item-type.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { PriceCategories, IPriceCategoryPaged } from 'src/app/_interfaces/menu/price-categories';

@Component({
  selector: 'app-price-category-select',
  templateUrl: './price-category-select.component.html',
  styleUrls: ['./price-category-select.component.scss']
})

export class PriceCategorySelectComponent implements OnInit {
  hidecheckbox = true;
  isOpenPrice: boolean;
  showMorePrices: boolean;
  @Output() itemSelect  = new EventEmitter();
  @Input() inputForm:      FormGroup;
  @Input() priceCategoryID: number;
  @Input() itemType     = {} as IItemType;
  priceCategory         :   PriceCategories;
  @Input()  isInventory : boolean;
  priceCategoriesPaged$ :   Observable<IPriceCategoryPaged>;

  constructor(
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

  openPriceCategory() {
    if (this.priceCategoryID == 0) { return }
    this.priceCategoryService.openPriceCategoryEditor(this.priceCategoryID)
  }

  clearPriceCategory() {
    this.priceCategoryID = 0;
    if (!this.isInventory) {
      const  price = { priceCategory : 0 }
      this.inputForm.patchValue(price)
    }
    if (!this.isInventory) {
      this.inputForm.patchValue({priceCategoryID: 0})
    }
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

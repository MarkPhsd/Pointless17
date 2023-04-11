import { Component, OnInit, Input , EventEmitter, Output} from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, of, switchMap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';
import { IItemType } from 'src/app/_services/menu/item-type.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { PriceCategories, IPriceCategoryPaged } from 'src/app/_interfaces/menu/price-categories';

@Component({
  selector: 'app-price-category-select',
  templateUrl: './price-category-select.component.html',
  styleUrls: ['./price-category-select.component.scss']
})

export class PriceCategorySelectComponent implements OnInit {

  action$: Observable<any>;
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
  searchForm: FormGroup;
  constructor(
               private sitesService: SitesService,
               private fb: FormBuilder,
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
    const site = this.sitesService.getAssignedSite();
    let id = this.priceCategoryID;
    if (!id) { id = 0}
    this.action$ = this.priceCategoryService.openPriceCategoryEditorOBS(id).pipe(switchMap(data => {
      return  this.priceCategoryService.getPriceCategory(site, this.priceCategoryID);
    })).pipe(switchMap(data => {

      if (!data) {
        this.priceCategory = data
        this.searchForm = this.fb.group({
          priceCategoryLookup: [''],
        })
        this.inputForm.patchValue({priceCategoryID: 0})
        return of(null)
      }
      this.priceCategory = data
      this.searchForm = this.fb.group({
        priceCategoryLookup: [data.name],
      })
      this.inputForm.patchValue({priceCategoryID: data.id})
      return of(data)
    }))
  }

  clearPriceCategory() {
    this.priceCategoryID = 0;

    if (!this.isInventory) {
      this.searchForm = this.fb.group({
        priceCategoryLookup: '',
      })
      const  price = { priceCategory : 0 }
      this.inputForm.patchValue(price)

    }
    if (this.isInventory) {
      const item = {priceCategoryLookup: ''}
      this.searchForm = this.fb.group({
        priceCategoryLookup: '',
      })
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

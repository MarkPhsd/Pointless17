import { Component, OnInit, Input , EventEmitter, Output, ChangeDetectorRef, ViewChild, TemplateRef} from '@angular/core';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { Observable, of, switchMap } from 'rxjs';
import { FormGroup, UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { IItemType } from 'src/app/_services/menu/item-type.service';
import { PriceCategoriesService } from 'src/app/_services/menu/price-categories.service';
import { PriceCategories, IPriceCategoryPaged } from 'src/app/_interfaces/menu/price-categories';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';

@Component({
  selector: 'app-price-category-select',
  templateUrl: './price-category-select.component.html',
  styleUrls: ['./price-category-select.component.scss']
})

export class PriceCategorySelectComponent implements OnInit {

  @ViewChild('additionalPricesView') additionalPricesView: TemplateRef<any>;
  action$: Observable<any>;
  hidecheckbox = true;
  isOpenPrice: boolean;
  showMorePrices: boolean;
  @Output() itemSelect  = new EventEmitter();
  @Input() inputForm    : FormGroup;
  @Input() priceCategoryID: number;
  @Input() itemType     = {} as IItemType;
  priceCategory         :   PriceCategories;
  @Input()  isInventory : boolean;
  priceCategoriesPaged$ :   Observable<IPriceCategoryPaged>;
  searchForm: FormGroup;

  @Input()  showAdditionalCost: boolean;

  constructor(
               private sitesService: SitesService,
               private fb: UntypedFormBuilder,
               public cd: ChangeDetectorRef,
               public fbProductsService: FbProductsService,
               private priceCategoryService: PriceCategoriesService,
               private menuPricingService: PriceCategoriesService,) {
          }

  ngOnInit(): void {
    this.initSearchForm('')
    const site = this.sitesService.getAssignedSite();
    this.priceCategoriesPaged$ = this.menuPricingService.getPriceCategoriesNoChildrenByPage(site);
  }

  get additionalPricesTemplate() {
    if (this.showMorePrices){
      return this.additionalPricesView
    }
    return null
  }
  get showAdditionalButton() {
    if (this.fbProductsService.isTobacco(this.itemType) &&  this.fbProductsService.isRetail(this.itemType) &&
        this.fbProductsService.isLiquor(this.itemType) &&  this.fbProductsService.isProduct(this.itemType)) {
      return true;
    }
  return false

  }

  get showMorePricesView() {
    const itemType = this.itemType;
    if( !this.isInventory
        && ( this.fbProductsService.isTobacco(itemType) ||
             this.fbProductsService.isRetail(itemType)  ||
             this.fbProductsService.isLiquor(itemType)  ||
             this.fbProductsService.isProduct(itemType)
            )
        || this.showAdditionalCost
        || this.showMorePrices
        ) {
      return true
    }
    return false
  }

  initSearchForm(value: string) {
     this.searchForm = this.fb.group({
          priceCategoryLookup: [value],
      })
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
        this.initSearchForm('')
        this.inputForm.patchValue({priceCategoryID: 0})
        return of(null)
      }
      this.priceCategory = data
      this.initSearchForm(data?.name)
      this.inputForm.patchValue({priceCategoryID: data.id})
      return of(data)
    }))
  }

  clearPriceCategory() {
    this.priceCategoryID = 0;

    if (!this.isInventory) {
      this.initSearchForm('')
      const  price = { priceCategory : 0 }
      this.inputForm.patchValue(price)

    }
    if (this.isInventory) {
      const item = {priceCategoryLookup: ''}
      this.initSearchForm('')
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

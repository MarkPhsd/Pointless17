import { Component, Input, OnInit,OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable, switchMap, of, debounceTime, Subscription } from 'rxjs';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { IProduct, ISite } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { MenuService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { TransactionUISettings } from 'src/app/_services/system/settings/uisettings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'pos-order-item-calc-values',
  templateUrl: './pos-order-item-calc-values.component.html',
  styleUrls: ['./pos-order-item-calc-values.component.scss']
})
export class PosOrderItemCalcValuesComponent implements OnInit, OnDestroy {

  @Input() uiTransactionSetting: TransactionUISettings;
  @Input() product: IProduct
  productForm: FormGroup;
  menuItem$: Observable<IMenuItem>
  product$ : Observable<IProduct>;
  _lastItem: Subscription;
  saveaction$: Observable<any>;

  constructor(    private fbProductsService: FbProductsService,
                  private menuService   : MenuService,
                  private siteService   : SitesService,
                  private orderMethodsService: OrderMethodsService,
                  ) { }

  ngOnInit(): void {
      this.initLastSelectedItem();
  }
  ngOnDestroy() {
    if (this._lastItem) { this._lastItem.unsubscribe()}
  }

  initLastSelectedItem() {
    this._lastItem = this.orderMethodsService.lastSelectedItem$.subscribe(data => {
      if (data && data.productID) {
        const site = this.siteService.getAssignedSite()
        // this.menuItem$ = this.menuService.getMenuItemByID(site, data.productID);
        this.product$ = this.menuService.getProduct(site, data.productID).pipe(switchMap(data => {
          this.initProductForm(data);
          return of(data)
        }))
      }
    })
  }

  initProductForm(item: IProduct) {
    if (item) {
      this.initFormFields();
      if (this.productForm && item) {
        this.productForm.patchValue(item)
      }

      this.productForm.valueChanges
          .pipe(debounceTime(500)) // Adjust the debounce time as needed (in milliseconds)
          .subscribe(data => {
            this.saveProduct();
      });
    }
  }

  initFormFields() {
    this.productForm  = this.fbProductsService.initForm(this.productForm)
  }

  saveProduct() {
    const site = this.siteService.getAssignedSite();
    this.saveaction$ = this._saveProduct(site).pipe(
      switchMap(data => {
          this.siteService.notify('Updated.', 'Success', 5000, 'green' );
        return of(data)
    }));
  }

  _saveProduct(site: ISite) {
    const product = this.productForm.value;
    return this.menuService.putProduct(site, product.id, product)
  }

  getPreferredMargin(item: IProduct) {
    // <!-- Cost / (1 - Margin Percentage) -->
    if (item.wholesale && (this.uiTransactionSetting && this.uiTransactionSetting.preferredMargin != 0)) {
      return  item.wholesale / (1 -  this.uiTransactionSetting.preferredMargin)
    }
    return 0
  }

  getPreferredCaseMargin(item: IProduct) {
    // <!-- Cost / (1 - Margin Percentage) -->
    if (item.caseWholeSale && (this.uiTransactionSetting && this.uiTransactionSetting.preferredMargin != 0)) {
      return  item.caseWholeSale / (1 -  this.uiTransactionSetting.preferredMargin)
    }
    return 0
  }


}

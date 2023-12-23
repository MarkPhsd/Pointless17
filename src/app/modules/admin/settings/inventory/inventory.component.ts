import { Component, Input, OnInit } from '@angular/core';
import { IItemType,  } from 'src/app/_services/menu/item-type.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ItemTypeMethodsService } from 'src/app/_services/menu/item-type-methods.service';
import { AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
import { NavigationService } from 'src/app/_services/system/navigation.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'app-inventory-settings',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})

export class InventoryComponent  {

  action$: Observable<any>;
  @Input() role: string;
  showInitializer: boolean;
  itemTypes : IItemType[];
  itemTypes$: Observable<IItemType[]>;
  loading_initTypes: boolean;

  constructor(
    private router                 : Router,
    private navigationService      : NavigationService,
    private itemTypeMethodsService : ItemTypeMethodsService,
    private adustmentReasonsService: AdjustmentReasonsService,
    public  productButtonsService   : ProductEditButtonService,
    private siteService: SitesService,
    private settingsService: SettingsService,
  ) { }

  openAdjustmentReasonsDialog() {
    this.adustmentReasonsService.openAdjustmentReasonEdit();
  }

  initalizeTypes() {
    this.loading_initTypes = true;
    const result = window.confirm('Please confirm. This function will delete all item type settings and re-initialize all options for item types.');

    if (!result) { this.loading_initTypes = false;}

    if (result) {
      this.loading_initTypes = true ;
      this.itemTypeMethodsService.initalizeTypes().subscribe( {
        next: data => {
          this.itemTypes = data;
          this.itemTypeMethodsService.notify(`Items initialized.`, 'Success', 2000)
          this.loading_initTypes = false;
        },
        error: err => {
          this.itemTypeMethodsService.notify(`Error. ${err}`, 'Failure', 2000)
          this.loading_initTypes = false;
        }
      })
    }
  }

  cleanData(){
    const site = this.siteService.getAssignedSite()
    this.action$ = this.settingsService.cleanData(site)
  }

  routerNavigation(url: string) {
    this.router.navigate([url]);
  }

  blogListEdit() {
    this.routerNavigation('content')
  }

  clientTypesList() {
    this.routerNavigation('client-type-list')
  }

  serviceTypeList() {
    this.routerNavigation('service-type-list')
  }

  companyEdit() {
    this.routerNavigation('company-edit')
  }

  togglePaymentMethodsList() {
    // this.showPaymentMethods = !this.showPaymentMethods
    this.router.navigate(['/edit-payment-method-list'])
  }

  navTableService() {
    // this.smallDeviceLimiter();
    this.navigationService.navTableService()
  }
}

import { Component, Input, OnInit } from '@angular/core';
import { IItemType,  } from 'src/app/_services/menu/item-type.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ItemTypeMethodsService } from 'src/app/_services/menu/item-type-methods.service';
import { AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';

@Component({
  selector: 'app-inventory-settings',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})

export class InventoryComponent  {

  @Input() role: string;

  itemTypes : IItemType[];
  itemTypes$: Observable<IItemType[]>;
  loading_initTypes: boolean;

  constructor(
    private router                 : Router,
    private itemTypeMethodsService : ItemTypeMethodsService,
    private adustmentReasonsService: AdjustmentReasonsService,
    public productButtonsService   : ProductEditButtonService,
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

  routerNavigation(url: string) {
    this.router.navigate([url]);
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
    // this.showPaymentMethods= !this.showPaymentMethods
    this.router.navigate(['/edit-payment-method-list'])
  }



}

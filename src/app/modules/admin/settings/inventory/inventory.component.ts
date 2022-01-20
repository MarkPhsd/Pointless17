import { Component, Input, OnInit } from '@angular/core';
import { IItemType,  } from 'src/app/_services/menu/item-type.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ItemTypeMethodsService } from 'src/app/_services/menu/item-type-methods.service';
import { AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';

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
    private adustmentReasonsService: AdjustmentReasonsService
) { }


  openAdjustmentReasonsDialog() {
    this.adustmentReasonsService.openAdjustmentReasonEdit();
  }

  async initTypes(){
    this.loading_initTypes = true;
    const result = window.confirm('Please confirm. This function will delete all item type settings and re-initialize all options for item types.');
    if (result) {
      this.loading_initTypes = true ;
      this.itemTypeMethodsService.initalizeTypes().subscribe( data => {
        this.itemTypeMethodsService.notify(`Items re-initialized.`, 'Success', 2000)
        this.loading_initTypes = false;
      }, err => {
        console.log('error initializing types', err)
        this.itemTypeMethodsService.notify(`Error. ${err}`, 'Failure', 2000)
        this.loading_initTypes = false;
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

}

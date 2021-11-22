import { Component, Input, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { AdjustmentReasonsComponent } from 'src/app/shared/widgets/adjustment-reasons/adjustment-reasons.component';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { Observable } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UseGroupsService } from 'src/app/_services/menu/use-groups.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-inventory-settings',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})

export class InventoryComponent implements OnInit {

  @Input() role: string;

  itemTypes : IItemType[];
  itemTypes$: Observable<IItemType[]>;

  constructor(
    private dialog        :  MatDialog,
    private siteService   :  SitesService,
    private snackBar      :  MatSnackBar,
    private router        :  Router,
    private groupTypesService: UseGroupsService,
    private itemTypeService: ItemTypeService) { }

  ngOnInit(): void {
    console.log('')
  }

  openAdjustmentReasonsDialog() {
    const dialogConfig = [
    ]
    const dialogRef = this.dialog.open(AdjustmentReasonsComponent ,
      { width:      '700px',
        minWidth:   '700px',
        height:     '700px',
        minHeight:  '700px',
      },
    )
  }

 async initTypes(){

    const answer = window.confirm('Please confirm. This function will delete all item type settings and re-initialize all options for item types.');

    if (answer) {
      const site = this.siteService.getAssignedSite()

      const groups   = await this.groupTypesService.initGroups(site);

      this.itemTypes = this.itemTypeService.getDefaultItemTypes();
      this.itemTypes$ = this.itemTypeService.initItemTypes(site, this.itemTypes);

      this.itemTypes$.subscribe(data=>{
        console.log('items initialized')
        this.snackBar.open('Items re-initialized.', 'Success', {
          duration: 2000,
        })
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

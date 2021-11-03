import { Injectable } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { IItemType, ItemTypeService } from 'src/app/_services/menu/item-type.service';
import { ProducteditComponent} from 'src/app/modules/admin/products/productedit/productedit.component';
// import { ItemPercentageDiscountProductEditComponent } from 'src/app/modules/admin/productedit/item-percentage-discount-product-edit/item-percentage-discount-product-edit.component';
import { MatDialog } from '@angular/material/dialog';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { StrainProductEditComponent } from 'src/app/modules/admin/products/productedit/strain-product-edit/strain-product-edit.component';
import { NewInventoryItemComponent } from 'src/app/modules/admin/inventory/new-inventory-item/new-inventory-item.component';
import { IInventoryAssignment } from './inventory-assignment.service';
import { MoveInventoryLocationComponent } from 'src/app/modules/admin/inventory/move-inventory-location/move-inventory-location.component';
import { InventoryAdjustmentNoteComponent } from 'src/app/shared/widgets/adjustment-notes/adjustment-note/adjustment-note.component';
import { AddInventoryItemComponent } from 'src/app/modules/admin/inventory/add-inventory-item/add-inventory-item.component';


@Injectable({
  providedIn: 'root'
})
export class InventoryEditButtonService {

  constructor
            (private dialog: MatDialog,
            private siteService: SitesService,
            private menuService: MenuService,
            ) { }

  openInventoryDialog(item: IInventoryAssignment) {

    let dialogRef: any;
    const site = this.siteService.getAssignedSite();

    this.menuService.getProduct( site, item.productID ).subscribe( data=> {
      const productTypeID = data.prodModifierType

      this.openInventoryEditor(item.id, productTypeID)
    })

  }

  addInventoryDialog(id: number) {

    try {
      const site = this.siteService.getAssignedSite();

      const dialogRef = this.dialog.open(AddInventoryItemComponent,
         {  width:      '850px',
            minWidth:   '850px',
            height:     '750px',
            minHeight:  '750px',
            data :      {id: id}
          },
        )
        dialogRef.afterClosed().subscribe(result => {
          // return result
        });
    } catch (error) {
      console.log(error)
    }

  }


  openNoteDialog(id: any) {
      const dialogRef = this.dialog.open(InventoryAdjustmentNoteComponent,
        { width:      '300px',
          minWidth:   '300px',
          height:     '500px',
          minHeight:  '500px',
          data : {id: id}
        },
      )

      dialogRef.afterClosed().subscribe(result => {
        return result
      }
    );
  }

  openMoveInventoryDialog(id: any) {

    const dialogRef = this.dialog.open(MoveInventoryLocationComponent,
      { width:      '400px',
        minWidth:   '400px',
        height:     '450px',
        minHeight:  '450px',
        data : {id: id}
      },
    )

    dialogRef.afterClosed().subscribe(result => {
      return result
    });
  }

  openProductDialog(id: any) {

    const dialogRef = this.dialog.open(ProducteditComponent,
      { width: '90vw',
        height: '90vh',
        data : {id: id},
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      return result
    });
  }


  openInventoryEditor(id: number,
                    productTypeID: number) {

    let dialogRef: any;

    if (productTypeID == undefined) { productTypeID = 1 }

    switch (productTypeID) {
      case 0:
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
        {

          dialogRef = this.dialog.open(NewInventoryItemComponent,
            { width:        '800px',
              minWidth:     '800px',
              height:       '725px',
              minHeight:    '725px',
              data : {id: id}
            },
          )
        }
        break;

      case 15:
        {
          dialogRef = this.dialog.open(NewInventoryItemComponent,
            { width:        '800px',
              minWidth:     '800px',
              height:       '725px',
              minHeight:    '725px',
              data : {id: id}
            },
          )
        }
        break;

      case 30:
      case 37:
      case 38:
      case 45:
        {
          dialogRef = this.dialog.open(NewInventoryItemComponent,
            { width:       '800px',
              minWidth:    '800px',
              height:      '650px',
              minHeight:   '650px',
              data : {id: id}
            },
          )
        }
        break;


      default:
        {
          dialogRef = this.dialog.open(NewInventoryItemComponent,
            { width:        '800px',
              minWidth:     '800px',
              height:       '750px',
              minHeight:    '750px',
              data : {id: id}
            },
          )
        }
        break;
    }

    if (dialogRef) {
      dialogRef.afterClosed().subscribe(result => {
        //then we can emit back up to the component.

        });
      }

  }


}

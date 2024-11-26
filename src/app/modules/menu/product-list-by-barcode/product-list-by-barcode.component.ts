import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { IPOSOrder } from 'src/app/_interfaces';
import { IMenuItem } from 'src/app/_interfaces/menu/menu-products';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';
import { KeyPadComponent } from 'src/app/shared/widgets/key-pad/key-pad.component';
@Component({
  selector: 'app-product-list-by-barcode',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,SharedPipesModule,
    KeyPadComponent,
  ],

  templateUrl: './product-list-by-barcode.component.html',
  styleUrls: ['./product-list-by-barcode.component.scss']
})
export class ProductListByBarcodeComponent implements OnInit {

  menuItems : IMenuItem[];
  order     : IPOSOrder;
  quantity = 1;
  constructor(
    private orderMethodService: OrderMethodsService,
    private dialogRef: MatDialogRef<ProductListByBarcodeComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,) {

    console.log(data)
    this.menuItems = data.item;
    this.order     = data.order
  }

  ngOnInit(): void {
    const i = 0
  }

  async addItem(item: IMenuItem) {

    console.log('this.quantity', this.quantity)
    await this.orderMethodService.processAddItem(this.order, '',  item, this.quantity, '')
    this.dialogRef.close();
  }

  updateQuantity(event) {
    this.quantity = event;
  }

  closeWindow() {
    this.dialogRef.close();
  }
}

import { Component, Input, OnInit, OnDestroy} from '@angular/core';
import { IMenuItem }  from 'src/app/_interfaces/menu/menu-products';
import { AWSBucketService, OrdersService } from 'src/app/_services';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MenuItemModalComponent } from './menu-item-modal/menu-item-modal.component';
import * as _  from "lodash";
import { TruncateTextPipe } from 'src/app/_pipes/truncate-text.pipe';
import { Subscription } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Capacitor } from '@capacitor/core';
import { ElectronService } from 'ngx-electron';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

// https://stackoverflow.com/questions/54687522/best-practice-in-angular-material-to-reuse-component-in-dialog
export interface DialogData {
  id: string;
}

@Component({
  selector: 'app-menu-item-card',
  templateUrl: './menu-item-card.component.html',
  styleUrls: ['./menu-item-card.component.scss'],
  providers: [ TruncateTextPipe ]
})
export class MenuItemCardComponent implements OnInit, OnDestroy {

  @Input() id        : number;
  @Input() retail    : number;
  @Input() name      : string;
  @Input() imageUrl  : string;
  @Input() menuItem  : IMenuItem;
  bucketName         : string;
  placeHolderImage   : String = 'productPlaceHolder.jpg';
  _order             : Subscription;
  order              : IPOSOrder;

  platForm =  this.getPlatForm()
  appName = ''
  isApp   = false;
  getPlatForm() {  return Capacitor.getPlatform(); }

  constructor(
    private awsBucket: AWSBucketService,
    private router: Router,
    public route: ActivatedRoute,
    private dialog: MatDialog,
    private orderService: OrdersService,
    private _snackBar: MatSnackBar,
    private electronService: ElectronService,
    private orderMethodService: OrderMethodsService,
    )
  {
    if (this.electronService) {
      if (this.electronService.remote != null)
      {
        this.appName = 'electron '
        this.isApp = true
      } else
      {
        this.isApp = false
        this.platForm =  this.getPlatForm();
        if (this.platForm == 'android') {
          this.isApp = true;
        }
      }
    }
  }

  async ngOnInit() {
    this.bucketName =   await this.awsBucket.awsBucket();
    // console.log("")
    this.initSubscriptions();
  };

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    this._order.unsubscribe();
  }

  initSubscriptions() {
    try {
      this._order = this.orderService.currentOrder$.subscribe( data => {
        this.order = data
      })
    } catch (error) {
    }
  }

  getItem(item) {
    if (!item) {return ''}
    item = item.substr(0, 20);
    return item;
  }

  getItemSrc(item:IMenuItem) {
    if (!item.urlImageMain) {
      return this.awsBucket.getImageURLPath(this.bucketName, "placeholderproduct.jpg")
    } else {
      return this.awsBucket.getImageURLPath(this.bucketName, item.urlImageMain)
    }
  }

  menuItemAction(add: boolean) {
   this.orderMethodService.menuItemAction(this.order,this.menuItem, add)
  }


  openDialog() {
    const dialogConfig = [
      { data: { id: this.id } }
    ]
    const dialogRef = this.dialog.open(MenuItemModalComponent,
      {
        width:     '90vw',
        maxWidth:  '1000px',
        height:    '90vh',
        maxHeight: '90vh',
        data : {id: this.id}
      },
    )
    dialogRef.afterClosed().subscribe(result => {
      return result;
    });
  }


  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

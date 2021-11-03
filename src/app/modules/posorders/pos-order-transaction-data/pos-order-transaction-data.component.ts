import { Component,  Input} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'pos-order-transaction-data',
  templateUrl: './pos-order-transaction-data.component.html',
  styleUrls: ['./pos-order-transaction-data.component.scss']
})
export class PosOrderTransactionDataComponent{

  @Input() order: IPOSOrder;

  isAuthorized: boolean;
  isUserStaff: boolean;

  constructor(
    private userAuthorization   : UserAuthorizationService,
    private orderService        : OrdersService,
    private sitesService        : SitesService,
    private matSnackBar   : MatSnackBar,
    private router        : Router,
  ) {
    // this.roles = localStorage.getItem(`roles`)
    this.isUserStaff = this.userAuthorization.isCurrentUserStaff()
    this.isAuthorized = this.userAuthorization.isUserAuthorized('admin');
    console.log('roles', this.userAuthorization.isUserAuthorized('admin'));
   }

   notify(message: string, title: string, duration: number) {
    if (duration == 0 ) {duration = 3000}
    this.matSnackBar.open(message, title, {duration: duration, verticalPosition: 'top'})
  }

}

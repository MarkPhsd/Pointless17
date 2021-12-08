import { Component,  Input} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { IPOSOrder } from 'src/app/_interfaces';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'pos-order-transaction-data',
  templateUrl: './pos-order-transaction-data.component.html',
  styleUrls: ['./pos-order-transaction-data.component.scss']
})
export class PosOrderTransactionDataComponent{

  @Input() order    : IPOSOrder;
  @Input() mainPanel: boolean;
  isAuthorized      : boolean;
  isUserStaff       : boolean;

  constructor(
    private userAuthorization   : UserAuthorizationService,
    private matSnackBar   : MatSnackBar,
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

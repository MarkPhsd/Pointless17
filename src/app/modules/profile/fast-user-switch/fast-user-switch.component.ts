import { Component, EventEmitter, Inject, OnInit, Optional, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';

@Component({
  selector: 'app-fast-user-switch',
  templateUrl: './fast-user-switch.component.html',
  styleUrls: ['./fast-user-switch.component.scss']
})
export class FastUserSwitchComponent implements OnInit {

  inputForm: FormGroup;
  request  : string;
  requestData: any;

  @Output() outPutLogin = new EventEmitter();
  
  constructor(
    private dialog   : MatDialog,
    private userSwitchingService   : UserSwitchingService,
    // @Optional()  dialogRef: MatDialogRef<FastUserSwitchComponent>,
    // @Inject(MAT_DIALOG_DATA) public data: any
    ) {

    // if (data) {
    //   this.request = data.request
    //   this.requestData = data
    // }
  }

  ngOnInit(): void {
    console.log('')
  }

  entry(event) {

    // this.userSwitchingService.pinEntryResults(event).subscribe();

    // switch (this.request) {
    //   case 'switchUser':
    //     this.userSwitchingService.pinEntryResults(event)
    //       break;
    //   case 'voidRequest':
    //     break;
    //   default:
    //     break;
    // }
    // this.dialogRef.close();
  }

  enterPIN(event) {
    const user = localStorage.getItem('posToken')
    const login = {user: user, password: event }
    this.outPutLogin.emit(login)
  }

  onCancel() {
    this.dialog.closeAll();
  }



}

import { NgSwitchCase } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AuthenticationService } from 'src/app/_services';
import { ProductEditButtonService } from 'src/app/_services/menu/product-edit-button.service';
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

  constructor(
    private dialog             : MatDialog,
    private userSwitchingService   : UserSwitchingService,
    private dialogRef: MatDialogRef<FastUserSwitchComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {

    if (data) {
      this.request = data.request
      this.requestData = data
    }
    console.log('data', data)
  }

  ngOnInit(): void {
    console.log('')
  }

  entry(event) {
    switch (this.request) {
      case 'switchUser':
        this.userSwitchingService.pinEntryResults(event)
          break;
      case 'voidRequest':

          break;
      default:
        break;
    }

    this.dialogRef.close();

  }

  enterPIN(event) {
    this.userSwitchingService.openPIN(event)
  }

  onCancel() {
    this.dialog.closeAll();
  }



}

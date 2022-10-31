import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { CallUsSelectorComponent } from '../call-us-selector/call-us-selector.component';

@Component({
  selector: 'app-three-cxfab',
  templateUrl: './three-cxfab.component.html',
  styleUrls: ['./three-cxfab.component.scss']
})
export class ThreeCXFabComponent implements OnInit {

  dialogRef: any;

  constructor(private dialog: MatDialog) { }

  ngOnInit() {
    console.log('')
 }

 toggleChatDisplay() {
    let dialogRef: any;
    dialogRef = this.dialog.open(CallUsSelectorComponent,
      { width:        '500px',
        minWidth:     '500px',
        height:       '650px',
        minHeight:    '650px',
      },
    )
    return dialogRef
  }


}

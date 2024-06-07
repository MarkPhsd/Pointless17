import { Component, Inject, Optional } from '@angular/core';
import { UntypedFormBuilder } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { FbProductsService } from 'src/app/_form-builder/fb-products.service';
import { MenuService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'employee-select-pop-up',
  templateUrl: './employee-select-pop-up.component.html',
  styleUrls: ['./employee-select-pop-up.component.scss']
})
export class EmployeeSelectPopUpComponent {

  dataDialog:any;
  employeeID: number;
  list:any;

  constructor(private menuService: MenuService,
              public  fb: UntypedFormBuilder,
              private siteService: SitesService,
              public  fbProductsService: FbProductsService,
              @Optional() private dialogRef: MatDialogRef<EmployeeSelectPopUpComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any
  )
  {
    if (data) {
      this.data = data;
      this.list = data;
    }
  }

  setEmployee(event) {
    const employeeID = event;
    if (!event) { 
      const item = {employeeID:0, employeeName: ''}
      this.dialogRef.close(item)
      return;
    }
    this.dialogRef.close(employeeID)
  }

  clearSetting() {
    const item = {employeeID:0, employeeName: ''}
    this.dialogRef.close(item)
    return;
  }

  close() {
    this.dialogRef.close(0)
  }
}

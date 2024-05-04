import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable} from 'rxjs';
import { UntypedFormBuilder,  UntypedFormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSort } from '@angular/material/sort';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { AdjustmentReason, AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';

@Component({
  selector: 'app-adjustment-note',
  templateUrl: './adjustment-note.component.html',
  styleUrls: ['./adjustment-note.component.scss']
})

export class InventoryAdjustmentNoteComponent implements OnInit {

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource:               any;
  adjustmentReasons$:       Observable<AdjustmentReason[]>;
  adjustmentReason:         AdjustmentReason;
  adjustmentType:           string;
  inventoryAssignment:      IInventoryAssignment;
  inputForm:                UntypedFormGroup;
  get f():                  UntypedFormGroup  { return this.inputForm as UntypedFormGroup};
  id: any;
  user = this.authenticationService._user.value;

  constructor(
                private _snackBar: MatSnackBar,
                private fb: UntypedFormBuilder,
                public route: ActivatedRoute,
                private adjustmentReasonsService: AdjustmentReasonsService,
                private siteService: SitesService,
                private authenticationService: AuthenticationService,
                private inventoryAssignmentService: InventoryAssignmentService,
                private dialogRef: MatDialogRef<InventoryAdjustmentNoteComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private currencyPipe : CurrencyPipe,
  )
  {
    if (data) {
      this.id = data.id
    } else {
      this.id = this.route.snapshot.paramMap.get('id');
    }
   }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite()
    this.adjustmentReasons$ = this.adjustmentReasonsService.getReasons(site)
    this.initForm();
    this.initFormData(this.id)
  }

  update() {
    this.applyChanges()
  }

  getAdjustmentType(event) {
    this.adjustmentType = event.value

  }

  applyChanges() {
    const site = this.siteService.getAssignedSite()
    const inv = this.inventoryAssignment
    if (inv) {
      'get the item then update the item'

      const note =  `${this.f.get('adjustmentNotes').value}. Previous value;${inv.packageCountRemaining}`
      inv.adjustmentNote        =  note 
      inv.adjustmentType        =  this.adjustmentType
      // console.log('user', this.user)
      if (this.user) { 
        inv.employeeName  = this.user.username
        inv.employeeID    = this.user.id;
      } 
      
      inv.packageCountRemaining =  this.f.get('packageCountRemaining').value
      if (inv.unitMulitplier == 0) { inv.unitMulitplier = 1}
      inv.baseQuantityRemaining = inv.packageCountRemaining * inv.unitMulitplier;
      // inv.packageQuantity = inv.packageCountRemaining;
      const d = new Date();
      inv.adjustmentDate = d.toISOString()

      if (this.inventoryAssignment) {
        this.inventoryAssignmentService.reconcileInventory(site, this.id, inv).subscribe(data => {
          this.notifyEvent(`updated`, `Success` )
          this.onCancel();
        }, error => {
          this.notifyEvent(`Update failed ${error}`, `Failure` )
          this.inventoryAssignment = inv
        })

      }
      this.initForm()
    }
  }

  initForm() {
    this.inputForm = this.fb.group({
      adjustmentType:         ['', Validators.required],
      adjustmentNotes:        [''],
      adjustmentDate:         [''],
      packageCountRemaining:  [''],
      price:                  [''],
      id:                     [''],
    })
  }

  initFormData(id: number) {
    const site = this.siteService.getAssignedSite()
    this.inventoryAssignmentService.getInventoryAssignment(site, id).subscribe(
      data=> {
        this.inputForm.patchValue(data)
        this.inventoryAssignment = data
      }, err => {
        console.log(err)
      }
    )
  }

  onCancel() {
    this.dialogRef.close();
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

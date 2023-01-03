import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable} from 'rxjs';
import { FormBuilder,  FormGroup, Validators } from '@angular/forms';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSort } from '@angular/material/sort';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AdjustmentReason, AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

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
  inputForm:                FormGroup;
  get f():                  FormGroup  { return this.inputForm as FormGroup};
  id: any;

  constructor(
                private _snackBar: MatSnackBar,
                private fb: FormBuilder,
                public route: ActivatedRoute,
                private adjustmentReasonsService: AdjustmentReasonsService,
                private siteService: SitesService,
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
    console.log('adjustment', this.adjustmentType )
  }

  applyChanges() {
    const site = this.siteService.getAssignedSite()
    const inv = this.inventoryAssignment
    if (inv) {
      'get the item then update the item'
      inv.adjustmentNote        =  this.f.get('adjustmentNotes').value
      inv.adjustmentType        =  this.adjustmentType //f.get('adjustmentType').value
      inv.employeeName          =  localStorage.getItem('username')
      inv.packageCountRemaining =  this.f.get('packageCountRemaining').value
      if (inv.unitMulitplier == 0) { inv.unitMulitplier = 1}
      inv.baseQuantityRemaining = inv.packageCountRemaining * inv.unitMulitplier;
      inv.packageQuantity = inv.packageCountRemaining;
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

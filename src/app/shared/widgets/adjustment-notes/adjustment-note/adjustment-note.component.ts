import { Component, OnInit, SimpleChange, ViewChild, AfterViewInit , OnChanges, Inject} from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable} from 'rxjs';
import { FormBuilder,  FormGroup, Validators } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { InventoryLocationsService , IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { MatTableDataSource } from '@angular/material/table';
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

    'get the item then update the item'
    this.inventoryAssignment.adjustmentNote =         this.f.get('adjustmentNotes').value
    this.inventoryAssignment.adjustmentType =         this.adjustmentType //f.get('adjustmentType').value
    this.inventoryAssignment.employeeName  =          localStorage.getItem('username')
    this.inventoryAssignment.packageCountRemaining =  this.f.get('packageCountRemaining').value

    const d = new Date();
    this.inventoryAssignment.adjustmentDate = d.toISOString()

    console.log(this.inventoryAssignment)
    if (this.inventoryAssignment) {
      this.inventoryAssignmentService.editInventory(site, this.id, this.inventoryAssignment).subscribe(data => {
        this.notifyEvent(`updated`, `Success` )
        this.onCancel();
      }, error => {
        this.notifyEvent(`Update failed ${error}`, `Failure` )
      })
    }
    this.initForm()
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

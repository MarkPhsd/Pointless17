import { Component, OnInit, ViewChild, Inject} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, switchMap} from 'rxjs';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder,  UntypedFormGroup, Validators } from '@angular/forms';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSort } from '@angular/material/sort';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { AdjustmentReason, AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';
import { IInventoryAssignment, InventoryAssignmentService } from 'src/app/_services/inventory/inventory-assignment.service';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from 'src/app/_services';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'app-adjustment-note',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
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
  action$:Observable<any>;
  constructor(
                private _snackBar: MatSnackBar,
                private fb: UntypedFormBuilder,
                public route: ActivatedRoute,
                private adjustmentReasonsService: AdjustmentReasonsService,
                private siteService: SitesService,
                public authenticationService: AuthenticationService,
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

      const formNote = this.f.controls['adjustmentNotes'].value;
      const adjustMent = this.f.controls['adjustmentType'].value;
      const pacakgeCount = this.f.controls['packageCountRemaining'].value
      const note =  `${formNote}. Previous value: ${inv?.packageCountRemaining}`
      inv.adjustmentNote        =  note ;
      inv.adjustmentType        =  adjustMent;

      if (this.user) {
        inv.employeeName  = this.user.username
        inv.employeeID    = this.user.id;
      }

      inv.packageCountRemaining =  pacakgeCount
      if (inv.unitMulitplier == 0) { inv.unitMulitplier = 1}
      inv.baseQuantityRemaining = inv.packageCountRemaining * inv.unitMulitplier;

      const d = new Date();
      inv.adjustmentDate = d.toISOString()

      if (this.inventoryAssignment) {
        this.action$ =  this.inventoryAssignmentService.reconcileInventory(site, this.id, inv).pipe(
          switchMap(data => {
              this.onCancel();
              return of(data)
          })
        )

        // , error => {
        //   this.notifyEvent(`Update failed ${error}`, `Failure` )
        //   this.inventoryAssignment = inv
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

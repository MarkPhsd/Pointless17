import { Component, OnInit, SimpleChange, ViewChild, AfterViewInit , OnChanges, Inject} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, switchMap , of} from 'rxjs';
import { UntypedFormBuilder,  UntypedFormGroup, Validators } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { InventoryLocationsService , IInventoryLocation } from 'src/app/_services/inventory/inventory-locations.service';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSort } from '@angular/material/sort';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { AdjustmentReason, AdjustmentReasonsService } from 'src/app/_services/system/adjustment-reasons.service';

@Component({
  selector: 'app-adjustment-reasons',
  templateUrl: './adjustment-reasons.component.html',
  styleUrls: ['./adjustment-reasons.component.scss']
})
export class AdjustmentReasonsComponent implements OnInit {

  filter = 1;
  filterDescription = 'Items'

  inputForm: UntypedFormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any;

  metrcEnabled: boolean;
  length: number;
  pageSize: number;
  pageSizeOptions: any;
  action$: Observable<any>;
  ccsSite: ISite;
  ccsSites$: Observable<ISite[]>
  ccsSites: ISite[]
  ccsSite$: Observable<ISite>
  imgName: string;
  adjustmentReason: AdjustmentReason;
  dataSource$: Observable<any>;

  columnsToDisplay = ['id', 'name',  'edit'];

  constructor(
            private _snackBar: MatSnackBar,
            private fb: UntypedFormBuilder,
            private adjustmentReasonsService: AdjustmentReasonsService,
            private siteService: SitesService,
            private dialogRef: MatDialogRef<AdjustmentReasonsComponent>,
            @Inject(MAT_DIALOG_DATA) public data: any,

  )
  {  }

  ngOnInit(): void {
    this.metrcEnabled = true
    this.pageSize = 10
    this.initForm()
    this.dataSource$  =  this.refreshTable(1);
  }

  // ngAfterViewInit(){
  //   this.refreshTable()
  // }

  // ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
  //   this.refreshTable();
  // }

  changeFilter(filter: number) {
    if (filter == 1) {
      this.filterDescription = 'Items'
      this.filter = 1
    }
    if (filter == 2) {
      this.filterDescription = 'Payments'
      this.filter = 2
    }
    if (filter == 3) {
      this.filterDescription = 'Orders'
      this.filter = 3
    }
    if (filter == 4) {
      this.filterDescription = 'Manifest Rejections'
      this.filter = 4
    }
    if (filter == 10) {
      this.filterDescription = 'Refund Order'
      this.filter = 10
    }
    if (filter == 11) {
      this.filterDescription = 'Refund Item'
      this.filter = 11
    }
    this.dataSource$  = this.refreshTable(filter)
  }

  refreshTable(filter: number) {

    const site = this.siteService.getAssignedSite();
    this.ccsSite = {} as ISite;

    return this.adjustmentReasonsService.getReasonsByFilter(site, filter).pipe(
      switchMap(
        data => {
          this.pageSize = 10
          this.length = data.length
          this.pageSizeOptions = [5, 10]
          this.dataSource = new MatTableDataSource(data)
          if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
            return of(data)
          }
        }
      ))
  };

  editItem(id:number) {
    this.initFormData(id)
  }

  initForm() {
    this.inputForm = this.fb.group({
      name:   ['', Validators.required],
      filter: [this.filter],
      id:     [''],
    })
    // this.imgName = ""
  }

  initFormData(id: number) {
    const site = this.siteService.getAssignedSite()
    this.adjustmentReasonsService.getReason(site, id).subscribe(
      data=> {
        this.inputForm.patchValue(data)
        this.adjustmentReason = data
      }, err => {
        console.log(err)
      }
    )
  }

  update() {
    if (this.inputForm.valid) {
      this.applyChanges(this.inputForm.value)
    };
  }

  applyChanges(data) {
    const site = this.siteService.getAssignedSite()
    if (data.id) {
      data.imgName = this.imgName
      data.filter= this.filter
      this.action$ = this.adjustmentReasonsService.editReason(site, data).pipe(
        switchMap(data => {
        this.notifyEvent(`updated`, `Success` )
        return  this.refreshTable(this.filter)
      }))

    } else {
      data.filter = this.filter
      data.id = 0
      this.action$ =  this.adjustmentReasonsService.addReason(site, data).pipe(
        switchMap(data => {
          this.notifyEvent(`${data.name} Added`, `Success` )
          return  this.refreshTable(this.filter)
        }
      )).pipe(switchMap( data => {
        return of('null')
      }))
    }

    this.adjustmentReason = {}  as AdjustmentReason;
    this.initForm();

  }

  async delete() {
    const site = this.siteService.getAssignedSite()
    if (this.adjustmentReason) {

      let site$ =  this.adjustmentReasonsService.deleteReason(site, this.adjustmentReason.id)

      site$.subscribe(
      data => {
          this.refreshTable(this.filter);
          this.notifyEvent("Deleted", "Deleted")
         }
      )

      this.adjustmentReason = {}  as AdjustmentReason;
      this.initForm();
    }


  }

  onCancel() {
    this.dialogRef.close();
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 5000,
      verticalPosition: 'top'
    });
  }

}

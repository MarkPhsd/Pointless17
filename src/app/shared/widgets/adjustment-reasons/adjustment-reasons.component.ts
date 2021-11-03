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

@Component({
  selector: 'app-adjustment-reasons',
  templateUrl: './adjustment-reasons.component.html',
  styleUrls: ['./adjustment-reasons.component.scss']
})
export class AdjustmentReasonsComponent implements OnInit {

  filter = 1;
  filterDescription = 'Items'

  inputForm: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any;

  metrcEnabled: boolean;
  length: number;
  pageSize: number;
  pageSizeOptions: any;

  ccsSite: ISite;
  ccsSites$: Observable<ISite[]>
  ccsSites: ISite[]
  ccsSite$: Observable<ISite>
  imgName: string;
  adjustmentReason: AdjustmentReason;

  columnsToDisplay = ['id', 'name',  'edit'];

  constructor(
            private _snackBar: MatSnackBar,
            private fb: FormBuilder,
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
    this.refreshTable(1);
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
    this.refreshTable(filter)
  }

  refreshTable(filter: number): void {

    const site = this.siteService.getAssignedSite();

    this.adjustmentReasonsService.getReasonsByFilter(site,filter).subscribe(
      data => {
          this.pageSize = 10
          this.length = data.length
          this.pageSizeOptions = [5, 10]
          this.dataSource = new MatTableDataSource(data)
          if (this.dataSource) {
            this.dataSource.paginator = this.paginator;
            this.dataSource.sort = this.sort;
          }
        },
        error => {
          this.notifyEvent("Error, see console for details.", "Error")
          console.log("refreshTable", error)
        }
      );
      this.ccsSite = {} as ISite;
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
      this.adjustmentReasonsService.editReason(site, data).subscribe(data => {
        this.notifyEvent(`updated`, `Success` )
        this.refreshTable(this.filter);
      }, error => {
        // this.notifyEvent(`update ${error} and id: ${data.id}`, `failure` )
      })

    } else {
      data.filter = this.filter
      data.id = 0
      this.adjustmentReasonsService.addReason(site, data).subscribe(data => {
        this.notifyEvent(`${data.name} Added`, `Success` )
        this.refreshTable(this.filter);
       }, error => {
        this.notifyEvent(`error ${error}`, `failure` )
      })
    }

    this.adjustmentReason = {}  as AdjustmentReason;
    this.initForm();

  }

  async delete() {
    const site = this.siteService.getAssignedSite()
    if (this.adjustmentReason) {

      let site$ =  this.adjustmentReasonsService.deleteReason(site, this.adjustmentReason.id)
      site$.subscribe(data=>{
        this.refreshTable(this.filter);
        this.notifyEvent("Deleted", "Deleted")
      }, err => {
        this.notifyEvent("Error deleting: " + err, "Error")
      })

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

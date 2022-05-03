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
import { ManifestStatus, ManifestStatusService } from 'src/app/_services/inventory/manifest-status.service';

@Component({
  selector: 'app-manifest-status',
  templateUrl: './manifest-status.component.html',
  styleUrls: ['./manifest-status.component.scss']
})
export class ManifestStatusComponent implements OnInit {

  locationForm: FormGroup;

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
  location: ManifestStatus  ;

  columnsToDisplay = ['id', 'name', 'activeLocation', 'edit'];

  constructor(
            private _snackBar: MatSnackBar,
            private fb: FormBuilder,
            private inventoryLocationsService: ManifestStatusService,
            private siteService: SitesService,

  )
  {  }

  ngOnInit(): void {
    this.metrcEnabled = true
    this.pageSize = 10
    this.initForm()
    this.refreshTable();
  }

  ngAfterViewInit(){
    this.refreshTable()
  }

  ngOnChanges(changes: { [propKey: string]: SimpleChange }) {
    this.refreshTable();
  }

  refreshTable(): void {
    this.inventoryLocationsService.listAll().subscribe(
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
    this.locationForm = this.fb.group({
      name: ['', Validators.required],
      activeLocation: [false],
      id: [''],
    })
    this.imgName = ""
  }

  initFormData(id: number) {

    this.inventoryLocationsService.get(id).subscribe(
      {next:
      data=> {
        this.locationForm.patchValue(data)
        this.location = data
      },
      error: err => {
        console.log(err)
      }
    }
    )
  }

  update() {
    if (this.locationForm.valid) {
      this.applyChanges(this.locationForm.value)
    };
  }

  applyChanges(data) {
    if (data.id) {
      this.notifyEvent(`Data ${data}`, ` Data` )
      data.imgName = this.imgName
      this.inventoryLocationsService.update( data.id, data).subscribe(
        {
            next: data=>{
            this.refreshTable();
            // this.notifyEvent("site deleted", "Deleted")
          },
          error: err => {
            this.notifyEvent("Error deleting: " + err, "Error")
          }
        }
      )

    } else {

      this.inventoryLocationsService.add(data).subscribe(
        {
            next: data=>{
            this.refreshTable();
            // this.notifyEvent("site deleted", "Deleted")
          },
          error: err => {
            this.notifyEvent("Error deleting: " + err, "Error")
          }
        }
      )
    }

    this.initForm()
  }

  async delete() {

    const result = window.confirm('Are you sure you want to delete this item?')
    if (!result) { return }

    if (this.location) {
      this.initForm()
      let site$ =  await this.inventoryLocationsService.delete(this.location.id)
      site$.subscribe(
        {
            next: data=>{
            this.refreshTable();
            // this.notifyEvent("site deleted", "Deleted")
          },
          error: err => {
            this.notifyEvent("Error deleting: " + err, "Error")
          }
        }
      )
    }

  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

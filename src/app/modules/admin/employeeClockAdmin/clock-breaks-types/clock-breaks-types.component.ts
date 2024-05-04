import { Component, OnInit, SimpleChange, ViewChild, AfterViewInit , OnChanges, Inject, TemplateRef, ComponentFactoryResolver} from '@angular/core';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { Observable, of, switchMap} from 'rxjs';
import { UntypedFormBuilder,  UntypedFormGroup, Validators } from '@angular/forms';
import { ISite } from 'src/app/_interfaces';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { MatSort } from '@angular/material/sort';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { IItemBasic } from 'src/app/_services';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { EmployeeClockService } from 'src/app/_services/employeeClock/employee-clock.service';

@Component({
  selector: 'clock-breaks-types',
  templateUrl: './clock-breaks-types.component.html',
  styleUrls: ['./clock-breaks-types.component.scss']
})
export class ClockBreaksTypesComponent implements OnInit {
  // <!-- { "name": "15 Minute Break", "id": 303, "type": null, "optionBoolean": false } -->

  columnsToDisplay = ['id', 'name', 'optionBoolean', 'edit'];
  inputForm: UntypedFormGroup;
  action$: Observable<any>;
  locationTable$ : Observable<any>;
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSource: any;
  length: number;
  pageSize: number;
  pageSizeOptions: any;
  break: any;
  itemBreaks$ : Observable<IItemBasic[]>;

  constructor(
    private _snackBar: MatSnackBar,
    private fb: UntypedFormBuilder,
    private settingService: SettingsService,
    private employeeClockService: EmployeeClockService,
    private siteService: SitesService,
  )
  {  }

  ngOnInit(): void {

    this.refresh()
  }

  refresh() {
    this.initForm();
    this.getBreakList();
  }

  initForm() {
    this.inputForm = this.fb.group({
      name: ['', Validators.required],
      optionBoolean: ['', Validators.required],
      id: [''],
    })

  }

  getBreakList(): Observable<IItemBasic[]> {
    const site         = this.siteService.getAssignedSite();
    const items$ = this.employeeClockService.getBreakList(site);

    this.itemBreaks$ = items$.pipe(
    switchMap(data => {
        this.pageSize = 10
        this.length = data.length
        this.pageSizeOptions = [5, 10]
        this.dataSource = new MatTableDataSource(data)
        if (this.dataSource) {
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        }
      return of(data)
      }
    ));

    return this.itemBreaks$;
  }

  addItem() {
    const site         = this.siteService.getAssignedSite();
    const item = this.inputForm.value
    let setting = {name: item.name, id: item.id, boolean: item.optionBoolean} as any;
    const item$ = this.settingService.postSetting(site, setting)
    this.action$ = this.saveUpdate(item$)
  }

  updateItem(id:number) {
    const site         = this.siteService.getAssignedSite();
    const item = this.inputForm.value
    // console.log(item)
    let setting = {name: item.name, id: item.id, boolean: item.optionBoolean, filter: 1000} as any;

    const item$ = this.settingService.putSetting(site, id, setting)
    this.action$ = this.saveUpdate(item$)
  }

  saveUpdate(item$) {
    item$.pipe(
      switchMap(data => {
        this.inputForm.patchValue(data)
        this.refresh();
        return of(data)

      })
    )
    return item$
  }

  clear() {
    this.break = null
  }

  editItem(item) {
    this.inputForm.patchValue(item)
    this.break = item;
  }

  deleteItem(id: number) {
    const site         = this.siteService.getAssignedSite();
    this.action$ = this.settingService.deleteSetting(site, id).pipe(switchMap(data => {
      this.break = null
      return of(data)
    }))
  }

}

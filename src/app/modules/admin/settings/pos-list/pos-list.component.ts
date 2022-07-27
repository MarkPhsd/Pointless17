import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ISetting, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { PosEditSettingsComponent } from './pos-edit-settings/pos-edit-settings.component';

@Component({
  selector: 'app-pos-list',
  templateUrl: './pos-list.component.html',
  styleUrls: ['./pos-list.component.scss']
})
export class PosListComponent implements OnInit, OnDestroy {

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  role: string;

  dataSource$: Observable<ISetting[]>
  dataSource: MatTableDataSource<ISetting>;

  posName: string  = this.orderService.posName;
  columnsToDisplay = ['name', 'assign', 'edit'];

  @Input() user: IUser;
  constructor( private AuthenticationService : AuthenticationService,
               private setingsServerice      : SettingsService,
               private orderService          : OrdersService,
               private siteService           : SitesService,
               public  platForm              : PlatformService,
               private dialog                : MatDialog,
               private _snackBar             : MatSnackBar,)
  { }

  ngOnInit(): void {
    this.getListOfPOSComptuers()
  }

  ngOnDestroy() {
    this.dataSource$.subscribe().unsubscribe();
  }

  getListOfPOSComptuers() {
    this.dataSource$ =  this.setingsServerice.getPOSNames(this.siteService.getAssignedSite());
    this.dataSource$.subscribe(data => {
      this.dataSource = new MatTableDataSource<ISetting>(data)
      this.dataSource.paginator = this.paginator
    });
  }

  refresh() {
    this.getListOfPOSComptuers();
  }

  addDevice() {
    const site  = this.siteService.getAssignedSite()
    const terminal = {} as ISetting;
    terminal.filter = 421;
    terminal.name = 'New Terminal'
    const item$ = this.setingsServerice.postSetting(site, terminal)
    item$.subscribe(data => {
      this.editItem(data)
    })
  }

  editTerminal(event) {
    const id = event;
    if (id) {
      const site  = this.siteService.getAssignedSite()
      const item$ = this.setingsServerice.getSetting(site, id)
      item$.subscribe(data => {
        this.editItem(data)
      })
    }
  }

  editItem(data): Observable<typeof dialogRef> {
    let dialogRef: any;
    dialogRef = this.dialog.open(PosEditSettingsComponent,
      { width:        '800px',
        minWidth:     '800px',
        height:       '650px',
        minHeight:    '650px',
        data   : data
      },
    )
    return dialogRef;
  }

  setPOSName(name: string) {
    if (this.platForm.isApp()) {
      this.notifyEvent(`${this.posName} has not been assigned!`, "Failure")
      return
    }

    if (this.orderService.setPOSName(name)) {
      this.posName = this.orderService.posName;
      this.notifyEvent(`${this.posName} has been assigned.`, "success")
    } else {
      this.notifyEvent(`${this.posName} has not been assigned!`, "Failure")
    }
  }

  clearPOS() {
    this.orderService.setPOSName('');
    this.notifyEvent(`POS name as been cleared.`, "Success")
    this.posName = '';
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

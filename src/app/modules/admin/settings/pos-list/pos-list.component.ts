import { Component, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Observable } from 'rxjs';
import { ISetting, IUser } from 'src/app/_interfaces';
import { AuthenticationService,  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

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

  posName: string  = localStorage.getItem('devicename')
  columnsToDisplay = ['name', 'assign', 'edit'];

  @Input() user: IUser;
  constructor( private AuthenticationService : AuthenticationService,
               private setingsServerice      : SettingsService,
               public orderMethodsService: OrderMethodsService,
               private siteService           : SitesService,
               public  platForm              : PlatformService,
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
      const dialog = this.setingsServerice.editPOSDevice(data)
    })
  }

  editTerminal(event) {
    const id = event;
    if (id) {
      const site  = this.siteService.getAssignedSite()
      const item$ = this.setingsServerice.getSetting(site, id)
      item$.subscribe(data => {
        const dialog = this.setingsServerice.editPOSDevice(data)
        // dialog.afterClosed(data => {
        // })
      })
    }
  }


  setPOSName(event) {
    // if (this.platForm.isApp()) {
    //   this.notifyEvent(`${this.posName} has not been assigned!: Is App: ${this.platForm.isApp()}`, "Failure")
    // }

    // console.log(event)
    // return;
    if (this.orderMethodsService.setPOSName(event?.name)) {
      this.posName = event?.name;
      this.notifyEvent(`${this.posName} has been assigned.`, "success")
    } else {
      this.notifyEvent(`${this.posName} has not been assigned. Please assign names less than 5 characters.`, "Failure")
    }

  }

  clearPOS() {
    this.orderMethodsService.setPOSName('');
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

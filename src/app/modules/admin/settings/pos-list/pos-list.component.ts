import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatTableDataSource } from '@angular/material/table';
import { Settings } from 'http2';
import { Observable } from 'rxjs';
import { ISetting, IUser } from 'src/app/_interfaces';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { SettingsService } from 'src/app/_services/system/settings.service';

@Component({
  selector: 'app-pos-list',
  templateUrl: './pos-list.component.html',
  styleUrls: ['./pos-list.component.scss']
})
export class PosListComponent implements OnInit {


  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  role: string;

  dataSource$: Observable<ISetting[]>
  dataSource: MatTableDataSource<ISetting>;

  posName: string = this.orderService.posName


  columnsToDisplay = ['name', 'edit'];

  @Input() user: IUser;
  constructor( private AuthenticationService: AuthenticationService,
               private setingsServerice: SettingsService,
               private orderService: OrdersService,
               private siteService: SitesService,
              private _snackBar: MatSnackBar,)
                { }

  ngOnInit(): void {

    this.getListOfPOSComptuers()

  }

  getListOfPOSComptuers() {

    this.dataSource$ =  this.setingsServerice.getPOSNames(this.siteService.getAssignedSite());

    this.dataSource$.subscribe(data => {

      this.dataSource = new MatTableDataSource<ISetting>(data)
      this.dataSource.paginator = this.paginator
      console.log(data);

    });

  }

  setPOSName(name: string) {

    // this.notifyEvent(`${name}.`, "Set POS Name")


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

  ngOnDestroy() {
    this.dataSource$.subscribe().unsubscribe();
  }

  notifyEvent(message: string, action: string) {
    this._snackBar.open(message, action, {
      duration: 2000,
      verticalPosition: 'top'
    });
  }

}

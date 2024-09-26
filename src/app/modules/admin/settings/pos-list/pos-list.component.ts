import { Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatLegacyPaginator as MatPaginator } from '@angular/material/legacy-paginator';
import { MatLegacySnackBar as MatSnackBar } from '@angular/material/legacy-snack-bar';
import { MatLegacyTableDataSource as MatTableDataSource } from '@angular/material/legacy-table';
import { Observable, of, switchMap } from 'rxjs';
import { ISetting, IUser } from 'src/app/_interfaces';
import { AuthenticationService,  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { ITerminalSettings, SettingsService } from 'src/app/_services/system/settings.service';
import { UISettingsService } from 'src/app/_services/system/settings/uisettings.service';
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
  posDevice$ : Observable<ITerminalSettings>
  @Input() user: IUser;
  constructor( private AuthenticationService : AuthenticationService,
               private setingsServerice      : SettingsService,
               
               private uiSettings: UISettingsService,
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

  @HostListener("window", [])
  editTerminal(event) { 
    if (window.innerWidth < 768) {
      this.editTerminalInNew(event)
      return
     }
    this.editTerminalPop(event)
  }

  editTerminalPop(event) {
    const id = event;
    if (id) {
      const site  = this.siteService.getAssignedSite()
      const item$ = this.setingsServerice.getSetting(site, id)
      item$.subscribe(data => {
        const dialog = this.setingsServerice.editPOSDevice(data)
      })
    }
  }

  editTerminalInNew(event) { 
    const id = event;
    if (id) {
      this.setingsServerice.editPOSDeviceInNew(id)
    }
  }


  setPOSName(event) {
    if (this.orderMethodsService.setPOSName(event?.name)) {
      this.posName = event?.name;
      this.notifyEvent(`${this.posName} has been assigned.`, "success")
    } else {
      this.notifyEvent(`${this.posName} has not been assigned. Please assign names less than 5 characters.`, "Failure")
    }

    
  }

  getDeviceInfo() {
    const devicename = localStorage.getItem('devicename')
    if (!devicename) { return of(null)}

    this.posDevice$ = this.uiSettings.getPOSDeviceSettings(devicename).pipe(
      switchMap(data => {
        if (data && data.text) {
          try {
            const posDevice = JSON.parse(data?.text) as ITerminalSettings;
            this.uiSettings.updatePOSDevice(posDevice)
            this.zoom(posDevice)
            return of(posDevice)
          } catch (error) {
            this.siteService.notify(`Error setting device info, for device: ${devicename}` + JSON.stringify(error), 'Close', 10000, 'yellow')
          }
        }
        return of(null)
      }
    ))
  }

  zoom(posDevice: ITerminalSettings)  {
    if (posDevice && posDevice?.electronZoom && posDevice?.electronZoom != '0') {
      this.uiSettings.electronZoom(posDevice.electronZoom)
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

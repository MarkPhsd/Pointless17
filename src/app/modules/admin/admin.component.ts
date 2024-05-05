import { Component, Input, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import {  IUserProfile } from 'src/app/_interfaces';
import {  OrdersService, UserService } from 'src/app/_services';
import { SettingsService } from 'src/app/_services/system/settings.service';
import { MatLegacyDialog as MatDialog } from '@angular/material/legacy-dialog'
import { InventoryLocationsComponent } from './inventory/inventory-locations/inventory-locations.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  user$: Observable<IUserProfile>;
  role: string;
  currentPOS: string

  @Input() UserID: number;

  constructor(
      private userService: UserService,
      private settingService: SettingsService,
      private orderService: OrdersService,
      private orderMethodsService: OrderMethodsService,
      private siteService: SitesService,
      private dialog: MatDialog)
       { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();
    this.currentPOS = localStorage.getItem('devicename')
    this.getCurrentUser();
    this.settingService.initAppCache();
  }

  getCurrentUser() {
    this.user$ = this.userService.getProfile()
   }

  openLocations() {
    const dialogRef = this.dialog.open(InventoryLocationsComponent,
      { width: '75vw',
        height: '75vh',
      },
    )
    dialogRef.afterClosed().subscribe(result => {
    });
  }

}

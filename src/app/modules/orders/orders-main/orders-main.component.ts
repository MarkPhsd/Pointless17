import {Component,  OnInit, OnDestroy, AfterViewInit, HostListener,
  }  from '@angular/core';
import { ActivatedRoute} from '@angular/router';
import { OrderFilterPanelComponent } from '../order-filter-panel/order-filter-panel.component';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { NewOrderTypeComponent } from '../../posorders/components/new-order-type/new-order-type.component';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { AuthenticationService, OrdersService } from 'src/app/_services';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { Observable, Subscription } from 'rxjs';
import { ISite, IUser } from 'src/app/_interfaces';
import { IPrinterLocation, PrinterLocationsService } from 'src/app/_services/menu/printer-locations.service';

@Component({
  selector: 'app-orders-main',
  templateUrl: './orders-main.component.html',
  styleUrls: ['./orders-main.component.scss'],
})

export class OrdersMainComponent implements OnInit, OnDestroy {

  smallDevice  : boolean;
  site         : ISite;
  isAuthorized : boolean;
  isStaff      : boolean;
  isUser       : boolean;
  listHeight   = '84vh'
  hidePanel    : boolean;

  isMenuOpen = false;
  _user: Subscription;
  user: IUser;
  gridcontainer = 'grid-container'
  viewType     = 1;
  _viewType: Subscription;

  printLocation       = 0;
  prepStatus         = false;
  printerLocations$   : Observable<IPrinterLocation[]>;
  _prepStatus         : Subscription;
  _printLocation      : Subscription;

  initStatusSubscriber() { 
    this._prepStatus = this.orderService.printStatus$.subscribe( data => { 
      if (!data) { 
        this.prepStatus = false
      }
      this.prepStatus = data;
    })
  }

  initPrintLocationSubscriber() {
    this._printLocation = this.orderService.printerLocation$.subscribe( data => { 
      if (!data) { 
        this.printLocation = 0
      }
      this.printLocation = data;
    })
  }

  initSubscriptions(){ 
    this.initStatusSubscriber();
    this.initPrintLocationSubscriber();

    this._viewType = this.orderService.viewOrderType$.subscribe(data => { 
      this.viewType = data;
    })
    this._viewType = this.orderService.viewOrderType$.subscribe(data => { 
      this.viewType = data;
    })

  }
  constructor (
    public route             : ActivatedRoute,
    private _bottomSheet     : MatBottomSheet,
    private siteService      : SitesService,
    public userAuthorization : UserAuthorizationService,
    private authenticationService: AuthenticationService,
    private printerService  : PrinterLocationsService,
    private orderService     : OrdersService)
  {
    this.initAuthorization();
    this.orderService.updateViewOrderType(1)
  }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this._user = this.authenticationService.user$.subscribe(data => {
      this.user = data;
    })
    this.site = this.siteService.getAssignedSite();
    this.displayPanel(null)
    this.initSubscriptions();
    this.printerLocations$ = this.printerService.getLocations()
  }

  updatePrinterLocation(event) { 
    if (event) { 
      this.orderService.updateOrderPrinterLocation(event.id)
    }
  }

  updatePrintStatus(value:boolean) { 
    if (value) { 
      this.orderService.updatePrintStatus(value)
    }
  }

  togglePrintStatus() {
    this.updatePrintStatus(!this.prepStatus)
  }

  displayPanel(event)  { 
    const show =  localStorage.getItem('OrderFilterPanelVisible')
    if (show === 'false') {
      this.hidePanel = true
      this.gridcontainer = 'grid-container-full'
      return 
    }
    this.hidePanel = false
    this.gridcontainer = 'grid-container'
  }

  hideFilterPanel(event) { 
    this.hidePanel = event
    console.log(this.hidePanel, event)
    if (event) {
      localStorage.setItem('OrderFilterPanelVisible', 'true')
    }
    if (!event) {
      localStorage.setItem('OrderFilterPanelVisible', 'false')
    }
    this.displayPanel(event)
  }

  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if (this._user) {this._user.unsubscribe()}
  }

  initAuthorization() {
    this.isAuthorized = this.userAuthorization.isManagement;
    this.isStaff      = this.userAuthorization.isStaff;
    this.isUser       = this.userAuthorization.isUser;
    if (!this.isStaff) { this.viewType = 2; }
  }

  @HostListener("window:resize", [])
  adjustWindow(){
    this.smallDevice = false
    this.listHeight = '84vh'
    if (window.innerWidth < 768) {
      this.smallDevice = true
      this.listHeight = '79vh'
    }
  }

  filterBottomSheet() {
    this._bottomSheet.open(OrderFilterPanelComponent);
  }

  async newOrder(){
    const site = this.siteService.getAssignedSite();
    this.orderService.newDefaultOrder(site);
  }

  newOrderOptions() {
    this._bottomSheet.open(NewOrderTypeComponent)
  }

  changeView() {
    if (this.viewType == 1) {
      this.viewType = 0
      this.orderService.updateViewOrderType(this.viewType)
      return
    }
    if (this.viewType == 0) {
      this.viewType = 1
      this.orderService.updateViewOrderType(this.viewType)
      return
    }
    if (this.viewType == 3) {
      this.viewType = 0
      this.orderService.updateViewOrderType(this.viewType)
      return
    }
  }

  setViewType(value) { 
    this.viewType = value;
    this.orderService.updateViewOrderType(value)
  }

}

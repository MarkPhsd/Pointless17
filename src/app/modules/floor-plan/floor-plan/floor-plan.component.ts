import { Component, OnInit } from '@angular/core';
import { Observable,  of,  Subject, switchMap } from 'rxjs';
import { FloorPlanService, IFloorPlan } from 'src/app/_services/floor-plan.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrdersService } from 'src/app/_services';
import { IPOSOrder, IUser } from 'src/app/_interfaces';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
// import { compress, decompress } from 'compress-json'

export interface uuidList {
  uuID: string;
  color: string;
}
@Component({
  selector: 'app-floor-plan',
  templateUrl: './floor-plan.component.html',
  styleUrls: ['./floor-plan.component.scss']
})
export class FloorPlanComponent implements OnInit {

  floorPlanRefresh$ : Observable<IPOSOrder[]>;

  displayImage: boolean;

  isUserStaff         =   false;
  isAdmin             =   false;
  isUser              =   false;
  refresh: boolean;
  editMode = false;
  userMode = false;
  user: IUser;

  floorPlans$: Observable<IFloorPlan[]>;
  floorPlan: IFloorPlan;

  _zoom     : Subject<number> = new Subject();
  _userMode : Subject<boolean> = new Subject();
  _floorPlan: Subject<IFloorPlan> = new Subject();
  _performOperations: Subject<any> = new Subject();
  changeObjectColor: Subject<any> = new Subject();
  tableInfo: any;
  orderInfo: any;
  _setTableInfo: Subject<any> = new Subject();
  _newOrder    : Subject<any> = new Subject();
  interval: any;
  backupRestore$: Observable<any>;
  loading: boolean;
  saving: boolean;
  zoomDefault: number
  constructor(private siteService       : SitesService,
              private orderService      : OrdersService,
              public orderMethodsService: OrderMethodsService,
              public  userAuth : UserAuthorizationService,
              private floorPlanSevice   : FloorPlanService,
         ) { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();
    this.getUserInfo();
    this.initPlansList(site);
    this.userMode = false
    this.toggleUserMode()
    this.zoomDefault = 100;
    this._zoom.next(this.zoomDefault);
  }



  initPlansList(site) {
    this.floorPlans$ = this.floorPlanSevice.listFloorPlansNames(site).pipe(
      switchMap(data => {
        if (data) {
          this._getFloorPlan(data[0])
        }
        return of(data)
      })
    )
  }

  refreshPlans() {
    const site = this.siteService.getAssignedSite();
    this.initPlansList(site);
  }

  saveTableSettings() {
    this._setTableInfo.next(data => {
      // console.log('saveTableSettings', data?.name)
    })
  }

  deleteFloorPlan() {
    const confirm = window.confirm('Are you sure you want to delete this item?')
    if (this.floorPlan && confirm) {
      const site = this.siteService.getAssignedSite()
      this.floorPlanSevice.delete(site,this.floorPlan.id).subscribe(data => {
        this.floorPlans$ = this.floorPlanSevice.listFloorPlansNames(site);
      })
    }
  }

  newFloorPlan() {
    const site = this.siteService.getAssignedSite()
    const plan = {} as IFloorPlan;
    plan.name     = 'new plan';
    plan.template = this.templateBasic;
    plan.sort     = 1;
    plan.height   = 500;
    plan.width    = 900;
    plan.enabled  = true;
    this.floorPlanSevice.saveFloorPlan(site, plan).subscribe(data => {
        this._floorPlan.next(data)
        this.floorPlan = data;
        this.initPlansList(site);
      }
    )
  }

  refresher() {
    setInterval(function () {
      if (this.userMode) {
        if ( this.floorPlan ) {
          this._getFloorPlan(this.floorPlan)
        }
      }
    }, 60000);
  }

  saveFloorPlan(event) {
    if (!event) { return }

    if (event.template) {
      event.template = this.floorPlanSevice.replaceJSONText(event.template)
    }

    const site = this.siteService.getAssignedSite();
    const plan = event as IFloorPlan;
    this.floorPlanSevice.saveFloorPlan(site, plan).subscribe(data => {
        this.floorPlans$ = this.floorPlanSevice.listFloorPlansNames(site);
        this.floorPlan  = data;
      }
    )
  }

  saveFloorPlanfromOrder(event) {
    if (!event) { return }
    this.saving = true;

    if (event.template) {
      event.template = this.floorPlanSevice.replaceJSONText(event.template)
    }

    const site = this.siteService.getAssignedSite();
    const plan = event as IFloorPlan;
    this.backupRestore$ = this.floorPlanSevice.saveFloorPlan(site, plan).pipe(
      switchMap(data => {
        this.saving = false;
        this.floorPlan  = data;
        return this.floorPlanSevice.listFloorPlansNames(site);
      }
    ))
  }

  outPutJSONFull() {
    this._performOperations.next('saveFullJson')
  }

  outPutJSON(event) {
    console.log('outPutJSON', event)
  }

  clearPlan() {
    const confirm = window.confirm("If you you confirm you will clear this layout of any items.")
    if (!confirm) { return }
    this.floorPlan.template = this.templateBasic;
    this.setFloorPlan(this.floorPlan);
    this.saveFloorPlan(this.floorPlan);
  }

  initUserInfo() {
    this.isAdmin          = false;
    this.isUserStaff      = false;
  }

  getUserInfo() {
    this.initUserInfo();
    // const user =   JSON.parse(localStorage.getItem('user')) as IUser;
    this.isAdmin  = this.userAuth.isAdmin;
    this.isUser   = this.userAuth.isUser;
    this.userMode = true;
    this.editMode = false;

    if (this.isAdmin) {
      this.isAdmin          = true
      this.isUser           = true;
      this.isUserStaff      = true
    }

    if (!this.isAdmin) {
      this.isUserStaff      = true
      this.isUser = true;
      this.userMode = true;
      this.editMode = false;
    }
  }

  setFloorPlan(item: IFloorPlan) {
    this.floorPlan = item;
    this.floorPlan.template  = JSON.parse(this.floorPlan.template)
    this._floorPlan.next(item);
    if (this.userMode) {
      this._userMode.next(true)
    }
  }

  backup() {
    const site = this.siteService.getAssignedSite()
    this.backupRestore$ = this.floorPlanSevice.saveBackup(site, this.floorPlan)
  }

  restore() {
    this.loading = true;
    const site = this.siteService.getAssignedSite()
    const item$ = this.floorPlanSevice.restoreBackup(site, this.floorPlan.id)
    this.backupRestore$ = item$.pipe(
      switchMap( data => {
        this._floorPlan.next(data)
        this.floorPlan = data;
        this.loading = false;
        return of(data)
    }))

  }

  setTable(event) {
    if (event) {
      const value = event?.name.split(';')
      if (value) {
        const item = {uuid: value[0], orderID: value[1],  name: value[2], status: value[3] };
        if (item) {
          if (this.userMode) {
            this.orderInfo = item;
            this.tableInfo = event;
            this.setActiveOrder(this.orderInfo.orderID, item.uuid, this.floorPlan.id, item.name )
          }
        }
      }
    }
  }

  setActiveOrder(id: string, uuID: string, floorPlanID: number, name: string) {
    const site   = this.siteService.getAssignedSite();
    const order$ =  this.orderService.getOrderByTableUUID(site, uuID )
    order$.pipe(
      switchMap(data => {
        this.refresh = false;
        if (!data || !data.id || data.id == 0) {
          this.refresh = true;
          return this.orderMethodsService.newOrderFromTable(site, null, uuID, floorPlanID, name);
        }
        if (data) {return of(data)}
      }
    )).pipe(
      switchMap(data => {
      this.orderMethodsService.setActiveOrder(site, data)
      if (this.orderInfo) {
        const item = {orderID: data.id, status: 'active'};
      }
      if (data && this.floorPlan && this.refresh) {
        return this.orderService.getActiveTableOrders(site, this.floorPlan.id);
      }
      const orders = [] as IPOSOrder[]
      return of(orders)
    })).subscribe( orders => {

      if (this.refresh) {
        if (orders && orders.length>0) {
          try {
            this.floorPlan.template  = JSON.parse(this.floorPlan.template);
            this.floorPlan.template  = JSON.parse(this.floorPlan.template);
          } catch (error) {
          }
          this.processActiveItems(orders);
        }
      }

    })
  }

  getOrderIDFromTable(item: any) {
    const id = item?.orderID;
    if (id == undefined || id === 'undefined' || !id || id === '' ||
        id === 'orderid' || id === '0') {
      return null
    }
    return id;
  }

  setOrder(event) {
    if (this.orderInfo) {
      const item = this.orderInfo
      this._newOrder.next(this.orderInfo)
    }
  }

  getFloorPlan(event) {

  }

  _getFloorPlan(event) {
    const site = this.siteService.getAssignedSite();
    if (!event) { return }
    let floorPlan$ : Observable<IFloorPlan>;

    if (this.userMode) {
      floorPlan$ = this.floorPlanSevice.getFloorPlanNoBackupCached(site, event.id);
    }
    if (!this.userMode) {
      floorPlan$ = this.floorPlanSevice.getFloorPlan(site, event.id);
    }

    this.floorPlanRefresh$ = floorPlan$.pipe(
      switchMap(data => {

        data.template  = JSON.stringify(data.template)
        try {
          data.template  = JSON.parse(data.template)
          data.template  = JSON.parse(data.template)
        } catch (error) {
          console.log('error', error)
        }
        this.floorPlan = data;

        if (data) {
          return this.orderService.getActiveTableOrders(site, data.id)
        }

        this._floorPlan.next(this.floorPlan);
        const orders = [] as IPOSOrder[]
        return of(orders)

    })).pipe(
      switchMap( orders => {
        if (orders && orders.length>0) {
          this.processActiveItems(orders);
          return of(orders)
        }
        this._floorPlan.next(this.floorPlan);
        this.setZoomOnTimer();
        return of(orders)
    }))

  }

  setZoomDefault() {
    this.zoomDefault = +localStorage.getItem('zoomDefault');
    if (this.zoomDefault == 0 || !this.zoomDefault) {
      this.zoomDefault = 100;
    }
  }

  onZoom(event) {
    localStorage.setItem('zoomDefault', event)
    this.zoomDefault = event;
    this._zoom.next(this.zoomDefault)
  }

  processActiveItems(orders: IPOSOrder[]) {
    if (orders && orders.length >0 ) {
      // console.log('active orders', orders)
      orders.forEach(order => {
        const item = {uuID: order.tableUUID, color: 'red'};
        this.floorPlan.template = this.floorPlanSevice.alterObjectColor(item.uuID,item.color, this.floorPlan.template)
      })
      this.floorPlan.template = JSON.stringify(this.floorPlan.template)
    }

    this._floorPlan.next(this.floorPlan);
    this.setZoomOnTimer()

  }

  setZoomOnTimer() {
    this.setZoomDefault()
    this._zoom.next(this.zoomDefault)
    // setTimeout (() => {
    //   this.setZoomDefault()
    //   this._zoom.next(this.zoomDefault)
    // }, 1000);
  }

  toggleUserMode() {
    this.userMode = !this.userMode
    this._userMode.next(this.userMode)
  }

  disableAdmin(option: boolean) {
    this.userMode  = option;
    this._userMode.next(option)
  }

  isJsonStructure(str) {
    if (typeof str !== 'string') return false;
    try {
      const result = JSON.parse(str);
      const type = Object.prototype.toString.call(result);
      return type === '[object Object]'
             || type === '[object Array]';
    } catch (err) {
        return false;
    }
  }

  exampleFloor() {
    this.floorPlan = {} as IFloorPlan;
    this.floorPlan.name = 'hello there';
    this.floorPlan.enabled = true;
    this.floorPlan.template = this.templateBasic;
  }

  get templateBasic() {
    return  '{"version":"5.2.4","objects":[{"type":"line","version":"5.2.4","originX":"center","originY":"center","left":48,"top":288,"width":0,"height":480,"fill":"rgb(0,0,0)","stroke":"#000","strokeWidth":4,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"name":"WALL:3","hasControls":false,"selectable":false,"hasBorders":false,"evented":true,"hoverCursor":"default","moveCursor":null,"x1":0,"x2":0,"y1":240,"y2":-240},{"type":"line","version":"5.2.4","originX":"center","originY":"center","left":528,"top":528,"width":960,"height":0,"fill":"rgb(0,0,0)","stroke":"#000","strokeWidth":4,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"name":"WALL:2","hasControls":false,"selectable":false,"hasBorders":false,"evented":true,"hoverCursor":"default","moveCursor":null,"x1":480,"x2":-480,"y1":0,"y2":0},{"type":"line","version":"5.2.4","originX":"center","originY":"center","left":1008,"top":288,"width":0,"height":480,"fill":"rgb(0,0,0)","stroke":"#000","strokeWidth":4,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"name":"WALL:1","hasControls":false,"selectable":false,"hasBorders":false,"evented":true,"hoverCursor":"default","moveCursor":null,"x1":0,"x2":0,"y1":-240,"y2":240},{"type":"line","version":"5.2.4","originX":"center","originY":"center","left":528,"top":48,"width":960,"height":0,"fill":"rgb(0,0,0)","stroke":"#000","strokeWidth":4,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"name":"WALL:0","hasControls":false,"selectable":false,"hasBorders":false,"evented":true,"hoverCursor":"default","moveCursor":null,"x1":-480,"x2":480,"y1":0,"y2":0},{"type":"rect","version":"5.2.4","originX":"center","originY":"center","left":48,"top":48,"width":4,"height":4,"fill":"#000","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0,"name":"CORNER","hasControls":false,"selectable":false,"hasBorders":true,"evented":true,"hoverCursor":"crosshair","moveCursor":"crosshair"},{"type":"rect","version":"5.2.4","originX":"center","originY":"center","left":1008,"top":48,"width":4,"height":4,"fill":"#000","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0,"name":"CORNER","hasControls":false,"selectable":false,"hasBorders":true,"evented":true,"hoverCursor":"crosshair","moveCursor":"crosshair"},{"type":"rect","version":"5.2.4","originX":"center","originY":"center","left":1008,"top":528,"width":4,"height":4,"fill":"#000","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0,"name":"CORNER","hasControls":false,"selectable":false,"hasBorders":true,"evented":true,"hoverCursor":"crosshair","moveCursor":"crosshair"},{"type":"rect","version":"5.2.4","originX":"center","originY":"center","left":48,"top":528,"width":4,"height":4,"fill":"#000","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"rx":0,"ry":0,"name":"CORNER","hasControls":false,"selectable":false,"hasBorders":true,"evented":true,"hoverCursor":"crosshair","moveCursor":"crosshair"}],"backgroundImage":{"type":"image","version":"5.2.4","originX":"left","originY":"top","left":0,"top":0,"width":1246,"height":600,"fill":"rgb(0,0,0)","stroke":null,"strokeWidth":0,"strokeDashArray":null,"strokeLineCap":"butt","strokeDashOffset":0,"strokeLineJoin":"miter","strokeUniform":false,"strokeMiterLimit":4,"scaleX":1,"scaleY":1,"angle":0,"flipX":false,"flipY":false,"opacity":1,"shadow":null,"visible":true,"backgroundColor":"","fillRule":"nonzero","paintFirst":"fill","globalCompositeOperation":"source-over","skewX":0,"skewY":0,"cropX":0,"cropY":0,"hasControls":true,"selectable":true,"hasBorders":true,"evented":true,"hoverCursor":null,"moveCursor":null,"src":"https://pointlesspos.com/img/cement.png","crossOrigin":null,"filters":[]},"hoverCursor":"move","moveCursor":"move"}'
  }

   //image data
  backgroudImage(event) {
    let data = event
    this.floorPlan.image = data
    this.saveFloorPlan(event)
  };

}

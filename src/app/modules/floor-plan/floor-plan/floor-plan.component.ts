import { Component, OnInit } from '@angular/core';
import { Observable,  of,  Subject, switchMap } from 'rxjs';
import { FloorPlanService, IFloorPlan } from 'src/app/_services/floor-plan.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { CompanyService, AuthenticationService, OrdersService, MessageService, } from 'src/app/_services';
import { IUser } from 'src/app/_interfaces';
import { UserSwitchingService } from 'src/app/_services/system/user-switching.service';

@Component({
  selector: 'app-floor-plan',
  templateUrl: './floor-plan.component.html',
  styleUrls: ['./floor-plan.component.scss']
})
export class FloorPlanComponent implements OnInit {

  displayImage: boolean;

  isUserStaff         =   false;
  isAdmin             =   false;
  isUser              =   false;

  editMode = false;
  userMode = false;
  user: IUser;

  floorPlans$: Observable<IFloorPlan[]>;
  floorPlan: IFloorPlan;
  _userMode: Subject<boolean> = new Subject();
  _floorPlan: Subject<IFloorPlan> = new Subject();
  _performOperations: Subject<any> = new Subject();
  tableInfo: any;
  orderInfo: any;
  _setTableInfo: Subject<any> = new Subject();
  _newOrder    : Subject<any> = new Subject();
  interval: any;

  constructor(private siteService       : SitesService,
              private orderService      : OrdersService,
              private floorPlanSevice   : FloorPlanService,
         ) { }

  ngOnInit(): void {
    const site = this.siteService.getAssignedSite();
    this.getUserInfo();
    this.initPlansList(site);
    this.userMode = false
    this.toggleUserMode()
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

  initPlansList(site) {
    this.floorPlans$ = this.floorPlanSevice.listFloorPlansNames(site);
    this.floorPlans$.subscribe(data => {
      console.log('initPlansList', data)
      if (data) {
        this._getFloorPlan(data[0])
      }
    })
  }

  refreshPlans() {
    const site = this.siteService.getAssignedSite();
    this.initPlansList(site);
  }

  saveTableSettings() {
    this._setTableInfo.next(data => {
      console.log(data)
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

  saveFloorPlan(event) {
    if (!event) { return }

    if (event.template) {
      event.template = JSON.stringify(event.template)
      event.template = event.template.replace(/(^"|"$)/g, '');
      event.template = event.template.replaceAll('\\', '');
    }
    const site = this.siteService.getAssignedSite();
    const plan = event as IFloorPlan;
     this.floorPlanSevice.saveFloorPlan(site, plan).subscribe(data => {
        this.floorPlans$ = this.floorPlanSevice.listFloorPlansNames(site);
        this.floorPlan  = data;
      }
    )
  }

  outPutJSONFull() {
    this._performOperations.next('saveFullJson')
  }

  outPutJSON(event) {
    // console.log(event)
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
    const user =JSON.parse(localStorage.getItem('user')) as IUser;
    this.isAdmin  = false;
    this.isUser   = false;
    this.userMode = true;
    this.editMode = false;

    if (!user) {  return null }

    if (!user.roles) { return }

    if (user.roles === 'admin') {
      this.isAdmin          = true
      this.isUser           = true;
      this.isUserStaff      = true
    }

    if (user.roles == 'employee') {
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

  setTable(event) {
    if (event) {
      const value = event?.name.split(';')
      const item = {uuid: value[0], orderID: value[1],  name: value[2], status: value[3] };

      if (item) {
        if (this.userMode) {
          this.orderInfo = item;
          this.tableInfo = event;
          const id = this.getOrderIDFromTable(item);

          if (!id) {
            this.newOrder(event, item)
          }

          if (id) {
            this.setActiveOrder(this.orderInfo.orderID)
          }

        }

      }
    }
  }

  getOrderIDFromTable(item: any) {
    const id = item?.orderID;
    console.log('getOrderIDFromTable', item?.orderID);
    if (id == undefined || id === 'undefined' || !id || id === '' ||
        id === 'orderid' || id === '0') {
      return null
    }
    return id;
  }

  newOrder(event, item) {
    const site = this.siteService.getAssignedSite();
    const order$ = this.orderService.newOrderWithPayloadMethod(site, null);
    order$.pipe(
      switchMap(data => {
        data.customerName = item?.name;
        data.tableName = item?.name;
        data.tableUUID = item?.uuid;
        data.floorPlanID = this.floorPlan?.id;
        console.log('new order data', data)
        return this.orderService.putOrder(site, data);
    })).subscribe(data => {
      this.orderService.setActiveOrder(site, data);
      const item = {orderID: data.id, status: 'active'};
      console.log(item)
      this._newOrder.next(item);
    })
  }

  setActiveOrder(id: string) {
    const site   = this.siteService.getAssignedSite();
    const order$ =  this.orderService.getOrder(site, id, false )
    order$.pipe(
      switchMap(data => {
        console.log('order data', data.id)

        if (!data || !data.id || data.id == 0) {
          console.log('new data');
          return this.orderService.newOrderWithPayloadMethod(site, null);
        }

        if (data) {
           console.log('current data', data.id)
          return of(data)
        }

      }
    )).subscribe(data => {
      this.orderService.setActiveOrder(site, data)
      if (this.orderInfo) {
        const item = {orderID: data.id, status: 'active'};
        this._newOrder.next({orderID: data.id, status: 'active'});
      }
    })
  }

  setOrder(event) {
    if (this.orderInfo) {
      const item = this.orderInfo// = ;
      // console.log(this.orderInfo)
      // console.log(this)
      this._newOrder.next(this.orderInfo)
    }
  }

  getFloorPlan(event) {
    this._getFloorPlan(event);
    if (this.editMode)  { return }
  }

  _getFloorPlan(event) {
    const site = this.siteService.getAssignedSite();
    if (!event) { return }
    this.floorPlanSevice.getFloorPlan(site, event.id).subscribe( data => {
      data.template  = JSON.stringify(data.template)
      try {
        data.template  = JSON.parse(data.template)
        console.log(JSON.parse(data.template));
      } catch (error) {
        console.log('error', error)
      }
      this.floorPlan = data;
      this._floorPlan.next(data);
    })
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

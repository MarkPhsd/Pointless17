import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { Router } from '@angular/router';
import { Observable, of, switchMap } from 'rxjs';
import { IPOSOrder, OrderToFrom } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { EmployeeService } from 'src/app/_services/people/employee-service.service';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
@Component({
  selector: 'app-pos-order-editor',
  templateUrl: './pos-order-editor.component.html',
  styleUrls: ['./pos-order-editor.component.scss']
})
export class PosOrderEditorComponent implements OnInit {
  saving: boolean;
  action$: Observable<any>;
  order$: Observable<OrderToFrom>;
  posOrder: IPOSOrder;
  order:  OrderToFrom;
  history: boolean;
  inputForm              : UntypedFormGroup;
  dateTimeFormat = 'y-MM-dd h:mm:ss a';

  employees$ = this.employeeService.getEmployees(this.siteService.getAssignedSite())

  constructor(
    private orderService: OrdersService,
    private employeeService: EmployeeService,
    private orderMethodsService: OrderMethodsService,
    private fb: FormBuilder,
    public userAuthService          : UserAuthorizationService,
    private siteService             : SitesService,
    private dataHelper: DateHelperService,
    private router: Router,
    private dialogRef: MatDialogRef<PosOrderEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
   {
    this.initForm()
    if (data) {
      const site = this.siteService.getAssignedSite();
      this.history = data?.history;
      this.order$ = orderService.getT_Order(site, data?.id, data?.history).pipe(switchMap(data => {
        this.fillForm(data)
        return this.orderMethodsService.currentOrder$
      })).pipe(switchMap(data => {
        this.posOrder = data
        return of(this.order)
      }))
    }
  }

  fillForm(data) {
    this.order = data;
    this.inputForm.patchValue(data)
    console.log('orderDate', this.order?.orderDate)
    this.patchDates(this.order)
  }

  assignClientID(id: number) {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.clientID = id
      this.action$ =   this.orderService.putOrder(site, this.posOrder).pipe(switchMap(data => {
        this.orderMethodsService.updateOrderSubscription(data)
        this.posOrder = data;
        return this.orderService.getT_Order(site, data?.id, data?.history)
      })).pipe(switchMap(data => {
        return of(data)
      }))
    }
    return of(this.order)
  }

  assignCustomer(event) {
    if (event) {
      this.assignClientID(event.id)
    }
  }

  removeClient() {
    if (this.order) {
      this.assignClientID(0);
    }
  }

  openClient() {
    if (this.order && this.posOrder.clients_POSOrders) {
      this.router.navigate(["/profileEditor/", {id: this.order.clientID}]);
    }
  }

  patchDates(data: OrderToFrom) {
    let  orderDate : Date = null;
    let  completion : Date = null;
    let scheduleDate: Date = null;
    let scheduleTo: Date = null;

    let shipOutOrderDate: Date = null;
    let eTA: Date = null;
    let arrivalDate: Date = null;

    let termsDueDate: Date = null;
    let beginDate: Date = null;

    let orderPrepared: Date = null;

    if (data.orderDate) {
      orderDate = new Date(this.dataHelper.format( data.orderDate,  this.dateTimeFormat))
    }
    if (data.completionDate) {
      completion = new Date(this.dataHelper.format( data.completionDate,  this.dateTimeFormat))
    }
    if (data.scheduleDate) {
      scheduleDate = new Date(this.dataHelper.format( data.scheduleDate,  this.dateTimeFormat))
    }
    if (data.scheduleDate) {
      scheduleDate = new Date(this.dataHelper.format( data.scheduleDate,  this.dateTimeFormat))
    }
    if (data.shipOutOrderDate) {
      shipOutOrderDate = new Date(this.dataHelper.format( data.shipOutOrderDate,  this.dateTimeFormat))
    }
    if (data.eTA) {
      eTA = new Date(this.dataHelper.format( data.eTA,  this.dateTimeFormat))
    }
    if (data.arrivalDate) {
      arrivalDate = new Date(this.dataHelper.format( data.arrivalDate,  this.dateTimeFormat))
    }
    if (data.termsDueDate) {
      termsDueDate = new Date(this.dataHelper.format( data.termsDueDate,  this.dateTimeFormat))
    }
    if (data.beginDate) {
      beginDate = new Date(this.dataHelper.format( data.beginDate,  this.dateTimeFormat))
    }
    if (data.orderPrepared) {
      orderPrepared = new Date(this.dataHelper.format( data.orderPrepared,  this.dateTimeFormat))
    }

    console.log('orderDate Format', orderDate)
    console.log('orderDate object', this.order?.orderDate)
    this.inputForm.patchValue({ orderDate: orderDate, completionDate: completion, scheduleDate: scheduleDate, scheduleTo:scheduleTo,shipOutOrderDate:shipOutOrderDate,
                                eTA: eTA,arrivalDate: arrivalDate,termsDueDate: termsDueDate,beginDate:beginDate,orderPrepared:orderPrepared })


  }

  ngOnInit(): void {
    this.initForm();
  }

  initForm() {
    this.inputForm = this.fb.group({
      id: [],
      orderTime: [], // Date;
      orderDate: [], // Date;
      shipTime: [], // Date;
      shipDate: [], // Date;
      completionDate: [], // Date;
      completionTime: [], // Date;
      scheduleDate: [], // Date;
      scheduleTime: [], // Date;
      scheduleTo: [], // Date;
      alarmDate: [], // Date;
      eTA: [], // Date; // Note: Acronyms might typically remain uppercase, adjusted to eTA for consistency
      arrivalDate: [], // Date;
      timeIn: [], // Date;
      shipOutOrderDate: [], // Date;
      termsDueDate: [], // Date;
      employeeID: [], // number | null;
      shift: [], // number | null;
      clientID: [], // number | null;

      serviceTypeID: [], // number | null;
      tenderTypeID: [], // number | null;
      deliveryEmployee: [], // number | null;
      operationsEmployee: [], // number | null;
      purchaseOrderNumber: [], // string;
      serialNumber: [], // string;
      supplierID: [], // number | null;
      productOrderMemo: [], // string;
      fieldRepMemo: [], // string;
      compName: [], // string;
      shippingNumber: [], // string;
      tableNumber: [], // number | null;
      activePO: [], // boolean | null;
      tableNumberStore: [], // number | null;
      zrun: [], // string;
      taxInfo: [], // number | null;
      splitter: [], // number | null;
      voidComp: [], // number | null;
      serviceArea: [], // string;
      registerName: [], // string;
      cupounCode: [], // string;
      discountType: [], // number | null;
      discountAmount: [], // number | null;
      discountCash: [], // number | null;
      discountName: [], // number | null;
      orderID_Temp: [], // number | null;
      orderPrepared: [], // string;
      quote: [], // string;
      stockIdentifier: [], // string;
      seatCount: [], // number | null;
      shipName: [], // string;
      shipAddress: [], // string;
      shipAddress2: [], // string;
      shipCity: [], // string;
      shipPostal: [], // string;
      shipState: [], // string;
      shipPostalCode: [], // string;
      shipSuite: [], // string;
      shipZip: [], // string;
      employeeDisc: [], // number | null;
      couponID: [], // number | null;
      serviceAreaID: [], // number | null;
      reportRunID: [], // number | null;
      couponAdvertiser: [], // number | null;
      displayTotal: [], // number | null;
      voidReason: [], // string;
      registerTransaction: [], // boolean | null;
      serviceType: [], // string;
      positiveNegative: [], // number | null;
      employeeName: [], // string;
      destAddress: [], // string;
      destAddress2: [], // string;
      destCity: [], // string;
      destZip: [], // string;
      destState: [], // string;
      mileage: [], // number | null;
      driveTime: [], // number | null;
      orderPhone: [], // string;
      sortOrder: [], // number | null;
      vehicle: [], // string;
      driverID: [], // number | null;
      scheduleManagementID: [], // number | null;
      statusID: [], // number | null;
      progress: [], // string;
      letterID: [], // number | null;
      siteID: [], // number | null;
      eventSubject: [], // string;
      insuranceGrp: [], // string;
      insurancePhone: [], // string;
      insuranceID: [], // number | null;
      statusName: [], // string;
      taxTotal: [], // number | null;
      gSTTaxTotal: [], // number | null; // Adjusted to gSTTaxTotal for consistency
      managerID: [], // number | null;
      costTotal: [], // number | null;
      shipVia: [], // number | null;
      resolutionDescription: [], // string;
      location: [], // string;
      sHIFTClosed: [], // number | null; // Adjusted to sHIFTClosed for consistency
      cRVTotal: [], // number | null;
      productOrderREf: [], // number | null;
      holdOrder: [], // Date;
      drawerAB: [], // number | null;
      couponUsed: [], // number | null;
      orderlocked: [], // string;
      alarmOn: [], // boolean | null;
      taxTotal2: [], // number | null;
      taxTotal3: [], // number | null;
      qBImport: [], // number | null; // Adjusted to qBImport for consistency
      checkInRepName: [], // string;
      checkinRepID: [], // number | null;
      onlineOrderID: [], // number | null;
      clientTypeID: [], // number | null;
      routeDetailID: [], // number | null;
      routeID: [], // number | null;
      beginDate: [],//Date;
      endDate: [],//Date;
      orderPercentDiscountID: [], // number | null;
      gratuity: [], // number | null;
      specialFee: [], // number | null;
      gratuityID: [], // number | null;
      tableUUID: [], // string;
      floorPlanID: [], // number | null;
      tableName: [], // string;
      orderCode: [], // string;
      addedPercentageFee: [], // number | null;
      priceColumn: [], // number | null;
      defaultPercentageDiscount: [], // number | null;
      cashDiscountPercent: [], // number | null;
      cashDiscountValue: [], // number | null;
    })
  }

  updateItem(event, boolean) {
    console.log('event', event, boolean)
    this.action$ = this._updateItem()
  }

  _updateItem() {
    const site = this.siteService.getAssignedSite()
    this.saving = true

    const items = [... this.order.items]
    const payments = [... this.order.payments];
    this.order = this.inputForm.value;
    this.order.items = items;
    this.order.payments = payments;
    this.order = this.saveDates(this.order)
    return this.orderService.putT_Order(site, this.order, this.history).pipe(switchMap(data => {
      const order$ = this.orderService.getOrder(site, data?.id.toString(), this.history);
      this.initForm()
      this.fillForm(data)
      return order$
    })).pipe(switchMap(data => {
      this.saving = false
      return of(data)
    }))
  }


  updateItemExit(event) {
    this.action$ = this._updateItem().pipe(switchMap(data => {
      setTimeout(() => {
        this.dialogRef.close(true);
      }, 100);
      return of(data)
    }))
  }

  saveDates(data: OrderToFrom) {
    if (data.orderDate) {
      data.orderDate =  this.dataHelper.format( data.orderDate,  this.dateTimeFormat)
    }
    if (data.completionDate) {
      data.completionDate = this.dataHelper.format( data.completionDate,  this.dateTimeFormat)
    }
    if (data.scheduleDate) {
      data.scheduleDate = this.dataHelper.format( data.scheduleDate,  this.dateTimeFormat)
    }
    if (data.scheduleDate) {
      data.scheduleDate =  this.dataHelper.format( data.scheduleDate,  this.dateTimeFormat)
    }
    if (data.shipOutOrderDate) {
      data.shipOutOrderDate =  this.dataHelper.format( data.shipOutOrderDate,  this.dateTimeFormat)
    }
    if (data.eTA) {
      data.eTA         =  this.dataHelper.format( data.eTA,  this.dateTimeFormat)
    }
    if (data.arrivalDate) {
      data.arrivalDate = this.dataHelper.format( data.arrivalDate,  this.dateTimeFormat)
    }
    if (data.termsDueDate) {
      data.termsDueDate = this.dataHelper.format( data.termsDueDate,  this.dateTimeFormat)
    }

    return data;
  }

  assignEmployeeID(id: number) {
    const site = this.siteService.getAssignedSite()
    this.action$ =  this.employeeService.getEmployee(site, id).pipe(switchMap(data => {
      this.order.serverName = data?.name;
      return this.orderService.putT_Order(site, this.order, this.history)
    }))
  }

  deleteItem(event) {

    const currentUser = this.userAuthService.currentUser();
    const pref = currentUser?.userPreferences
    let acceptDelete : boolean
    let warn: boolean;

    if (pref?.disableWarnOrderDelete) {
      acceptDelete = true;
      warn = true
    } else {
      if (!pref?.disableWarnOrderDelete) {
        acceptDelete =  window.confirm("Are you sure you want to delete this? This can not be undone.");
        currentUser.userPreferences.disableWarnOrderDelete = true;
        this.userAuthService.setUser(currentUser)
        warn = false
      }
    }

    if (warn) {
      warn =  window.confirm("Are you sure you want to delete this? This can not be undone.")
    }

    if (!acceptDelete) { return}
    const site = this.siteService.getAssignedSite()
    this.action$ = this.orderService.deleteTOrder(site, this.order.id, this.history ).pipe(switchMap(data => {
      if (data === 'Deleted') {
        this.orderMethodsService.updateOrder(null)
        this.siteService.notify(data.toString(), 'close', 3000)
        this.order = null;
        this.posOrder = null;

        // setTimeout(() => {
        //   this.dialogRef.close(true);
        // }, 200);
      } else {
        this.siteService.notify(data.toString(), 'close', 3000)
      }
      return of(data)
    }))
  }

  onCancel(event){
    this.dialogRef.close(true)
   }

}



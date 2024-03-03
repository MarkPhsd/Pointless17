import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, UntypedFormGroup } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Observable, of, switchMap } from 'rxjs';
import { OrderToFrom } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-pos-order-editor',
  templateUrl: './pos-order-editor.component.html',
  styleUrls: ['./pos-order-editor.component.scss']
})
export class PosOrderEditorComponent implements OnInit {
  saving: boolean;
  action$: Observable<any>;
  order$: Observable<OrderToFrom>;
  order: OrderToFrom;
  history: boolean;
  inputForm              : UntypedFormGroup;
  constructor(
    private orderService: OrdersService,
    private fb: FormBuilder,
    public userAuthService          : UserAuthorizationService,
    private siteService             : SitesService,
    private dialogRef: MatDialogRef<PosOrderEditorComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
   {
    this.initForm()
    if (data) {
      const site = this.siteService.getAssignedSite();
      this.history = data?.history;
      this.order$ = orderService.getT_Order(site, data?.id, data?.history).pipe(switchMap(data => {
        this.order = data;
        this.inputForm.patchValue(data)
        return of(data)
      }))
    }
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
    return this.orderService.putT_Order(site, this.order, this.history).pipe(switchMap(data => {
      const order$ = this.orderService.getOrder(site, data?.id.toString(), this.history);
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

  deleteItem(event) {
    this.dialogRef.close(true)
    const warn =  window.confirm("Are you sure you want to delete this? This can not be undone.")
    if (!warn) { return}
    const site = this.siteService.getAssignedSite()
    this.action$ = this.orderService.deleteTOrder(site, this.order.id, this.history ).pipe(switchMap(data => {
      setTimeout(() => {
        this.dialogRef.close(true);
      }, 100);
      return of(data)
    }))
  }

  onCancel(event){
    this.dialogRef.close(true)
   }

}



import { Injectable } from '@angular/core';
import { UntypedFormBuilder, UntypedFormGroup } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { ClientTypeService } from 'src/app/_services/people/client-type.service';
import { SitesService } from '../_services/reporting/sites.service';

@Injectable({
  providedIn: 'root'
})
export class FbClientTypesService {

  constructor(private _fb: UntypedFormBuilder,
    private siteService: SitesService,
    private clientTypeService: ClientTypeService,
  ) { }


  initUserAuthForm(fb: UntypedFormGroup): UntypedFormGroup {
    fb = this._fb.group({

      //notifications
      voidNotification: [],
      balanceSheetStartNotification: [],
      discountNotification: [],

      allowBuy             : [],
      allowTransferOrder   : [],
      voidOrder            : [],
      voidItem             : [],
      voidPayment          : [],
      allowCashPaymentForOtherServer: [],
      deleteOrder          : [],
      houseAccountPayment  : [],
      changeItemPrice      : [],
      changeInventoryValue : [],
      blindClose           : [],
      buysSalesReports     : [],
      enablebuyAgain: [],
      editEmail:    [],
      itemSalesGroupByQuantity: [],
      itemSalesGroupBySize: [],
      disableBalanceEndOfDay   : [],
      disableItemSales         : [],
      disableDeviceSales       : [],
      disableGiftCards         : [],
      disableLabor              : [],
      disableDepartmentSales    : [],
      disableHourlySales        : [],
      // 'admin section
      closeDay             : [],
      sendTextBlast        : [],
      sendEmailBlast       : [],
      deleteClientType     : [],

      accessHistoryReports : [],
      accessDailyReport    : [],

      // 'metrc work
      importMETRCPackages : [],

    // 'inventory work
      adjustInventory     : [],

    // 'product work
      adjustInventoryCount: [],
      adjustProductCount  : [],

      // 'add non customer types
      addEmployee         : [],
      changeClientType    : [],

      changeAuths         : [],
      accessAdmins        : [],

      refundItem      : [],
      refundOrder     : [],
      refundPayment   : [],

      disableSplitByItems    : [],
      disableMultiplePayments: [],

      userAssignedBalanceSheet : [],
      searchBalanceSheets      : [],
      deleteInventory: [],
      deleteProduct: [],
      deleteEmployee: [],
      uploadPictures: [],
      priceColumnOption: [],

      allowChangeOrderType: [],
      allowNegativeTransaction: [],
      allowZeroTransaction: [],
      allowSuspendTransaction:[],

      editProduct: [],
      intakeInventory: [],

      disableVoidClosedItem: [],
      disableEditOtherUsersOrders: [],
      allowReconciliation: [],
      allowSeeItemCost: [],

      blindBalanceSheet    : [],
      balanceSheetDetails  : [],
      balanceSheetViewTypeSales: [],
      balanceSheetTransactionTypes: [],
      balanceSheetDisableBank: [],
      balanceSheetDisableCashDrops: [],

      splitItemOverRide: [],
    })
    return fb

  }

  initForm(fb: UntypedFormGroup): UntypedFormGroup {

         fb = this._fb.group({
            id: [],
            name: [],
            pointValue: [],
            dailyCredit: [],
            dailyLimit: [],
            limitGram : [],
            limitSeeds: [],
            limitPlants: [],
            limitLiquid: [],
            limitSolid: [],
            limitConcentrate: [],
            limitExtract: [],
            limitConcentrates: [],
            limitCombinedCategory: [],
            allowStaffUse: [],
            authorizationGroupID: [],
            jsonObject       : [],
          }
        )
        return fb
    }

    async  fillForm(id: number, form: UntypedFormGroup): Promise<any> {

      const site =  this.siteService.getAssignedSite();

      this.clientTypeService.getClientType(site, id).pipe(
        tap(data => {
          form.patchValue(data)
          return  data
        })
      );
    }
  }


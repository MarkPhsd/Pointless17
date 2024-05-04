import { Component,OnInit,
         OnDestroy,
         Inject,
         ViewChild,
         TemplateRef,
   } from '@angular/core';
import { OrdersService } from 'src/app/_services';
import { SitesService} from 'src/app/_services/reporting/sites.service';
import { Subscription, Observable } from 'rxjs';
import { IPOSOrder,  } from 'src/app/_interfaces';
import { IStoreCreditSearchModel, StoreCreditMethodsService, StoreCreditResultsPaged } from 'src/app/_services/storecredit/store-credit-methods.service';
import { MatLegacyDialogRef as MatDialogRef, MAT_LEGACY_DIALOG_DATA as MAT_DIALOG_DATA} from '@angular/material/legacy-dialog';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'app-store-credit-pop-up',
  templateUrl: './store-credit-pop-up.component.html',
  styleUrls: ['./store-credit-pop-up.component.scss'],

})
export class StoreCreditPopUpComponent implements OnInit,OnDestroy {

  @ViewChild('giftCardScan')     giftCardScan: TemplateRef<any>;
  @ViewChild('storeCreditItems') storeCreditItems: TemplateRef<any>;
	@ViewChild('noItems')          noItems         : TemplateRef<any>;
  currentTemplate     : TemplateRef<any>;
  _order              : Subscription;
  order               : IPOSOrder;
  _search             : Subscription;
  storeCreditSearch$  : Observable<StoreCreditResultsPaged>
  storeCreditSearch   : StoreCreditResultsPaged;
  searchModel         : IStoreCreditSearchModel
  search              : IStoreCreditSearchModel
  clientID: number;
  method: string

  initSubscriptions() {
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    public orderMethodsService       : OrderMethodsService,
    private storeCreditMethodsService: StoreCreditMethodsService,
    private dialogRef                : MatDialogRef<StoreCreditPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    if (data) {
      if (data?.method === 'payment') {}
      if (data?.method === 'issue')
      this.method = data?.method;

      if (data.clientID) {
        this.initClientStoreCredit(data.clientID)
        return
      }
    }
    this.currentTemplate = this.noItems
  }

  ngOnInit() {
    this.initSubscriptions()
  }

  ngOnDestroy() {
    if (this._order) {  this._order.unsubscribe();}
  }

  setResults(event) {
    if (!event) {
      this.currentTemplate    = this.noItems
      return
    }
    const search              = event;
    this.searchModel          = search;
    this.search               = search;
    this.storeCreditMethodsService.updateSearchModel(search)
    this.currentTemplate      = null;
    this.currentTemplate      = this.giftCardScan
    // this.templateOption;
  }

  initClientStoreCredit(clientID: number) {
    this.clientID             = clientID
    const search              = {} as IStoreCreditSearchModel;
    search.clientID           = clientID;
    this.searchModel          = search;

    if (!clientID) { return }
    this.currentTemplate      = this.storeCreditItems
  }

  get templateOption(): TemplateRef<any> {
    if (this.clientID && this.clientID != 0)  {
      this.currentTemplate      = this.storeCreditItems
      return  this.currentTemplate
    }
    if (!this.searchModel)     {
      this.currentTemplate = this.noItems
     }
    if (!this.currentTemplate) {
      this.currentTemplate = this.noItems
    }

    if (this.searchModel) {
      // console.log('returning current template, gifcard scan')
    }
    return this.currentTemplate
  }

  cancel() {
    this.dialogRef.close();
  }

  onCancel(event) {
    this.dialogRef.close();
  }

}


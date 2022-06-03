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
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-store-credit-pop-up',
  templateUrl: './store-credit-pop-up.component.html',
  styleUrls: ['./store-credit-pop-up.component.scss'],

})
export class StoreCreditPopUpComponent implements OnInit,OnDestroy {

  @ViewChild('storeCreditItems') storeCreditItems: TemplateRef<any>;
	@ViewChild('noItems')          noItems         : TemplateRef<any>;
  currentTemplate     : TemplateRef<any>;
  _order              : Subscription;
  order               : IPOSOrder;

  storeCreditSearch$  : Observable<StoreCreditResultsPaged>
  storeCreditSearch   : StoreCreditResultsPaged;
  searchModel
  clientID: number;

  initSubscriptions() {
    this._order = this.orderService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private orderService             : OrdersService,
    private dialogRef                : MatDialogRef<StoreCreditPopUpComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any)
  {
    if (data) {
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
    console.log('set events', event)
    if (!event) {
      this.currentTemplate    = this.noItems
      return
    }
    const search              = event;
    this.searchModel          = search;
    this.currentTemplate      = this.storeCreditItems
  }

  initClientStoreCredit(clientID: number) {
    this.clientID             = clientID
    const search              = {} as IStoreCreditSearchModel;
    search.clientID           = clientID;
    this.searchModel          = search;
    this.currentTemplate      = this.storeCreditItems
  }

  get templateOption(): TemplateRef<any> {
    if (this.clientID != 0) {
      this.currentTemplate      = this.storeCreditItems
      return  this.currentTemplate
    }
    if (!this.searchModel)     {
      this.currentTemplate = this.noItems
     }
    if (!this.currentTemplate) {
      this.currentTemplate = this.noItems
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


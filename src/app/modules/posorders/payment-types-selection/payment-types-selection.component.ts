import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { UntypedFormGroup } from '@angular/forms';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, ISite, IUser,  } from 'src/app/_interfaces';
import { AWSBucketService,  } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { IPaymentMethod, PaymentMethodsService } from 'src/app/_services/transactions/payment-methods.service';

@Component({
  selector: 'payment-types-selection',
  templateUrl: './payment-types-selection.component.html',
  styleUrls: ['./payment-types-selection.component.scss']
})
export class PaymentTypesSelectionComponent {

  @Input() bucketName: string;
  bucket$: Observable<string>;
  inputForm            : UntypedFormGroup;
  list$        : Observable<IPaymentMethod[]>;
  order                : IPOSOrder;
  _order               : Subscription;
  @Input() list         : IPaymentMethod[]
  @Output() outPutSelected = new EventEmitter();
  item: any;
  @Input() textLength = 20;
  user: IUser;

  initSubscriptions() {
    this.user = this.userAuthorization.currentUser();
    this._order = this.orderMethodsService.currentOrder$.subscribe( data => {
      this.order = data
    })
  }

  constructor(
    private orderMethodsService: OrderMethodsService,
    private paymentMethodsService: PaymentMethodsService,
    private sitesService      : SitesService,
    private userAuthorization: UserAuthorizationService,
    public platFormService   : PlatformService,
    private awsBucketService : AWSBucketService, ) {
      this.initSubscriptions();
      const site = this.sitesService.getAssignedSite();
      this.getPaymentMethods(site);
      this.bucket$    = this.awsBucketService.awsBucketURLOBS().pipe(switchMap(data => {
        this.bucketName = data
        return of(data)
      }));
    }


  ngOnDestroy(): void {
    //Called once, before the instance is destroyed.
    //Add 'implements OnDestroy' to the class.
    if ( this._order) { this._order.unsubscribe()}
  }

  convertList(data: IPaymentMethod[]) { 
    data.forEach(item => {
      const itemFeatures = JSON.parse(item?.json);
      item.itemFeatures = itemFeatures
    });
    return data
  }

  getPaymentMethods(site: ISite) {

    if (this.list) {
      this.list.forEach(item => {
        const itemFeatures = JSON.parse(item?.json);
        item.itemFeatures = itemFeatures
      });
      return of(this.list)
    }
    const list$ = this.paymentMethodsService.getList(site);

    if (this.platFormService.isApp()) {
      this.list$ = list$.pipe(switchMap(data => {
          return of(this.convertList(data))
        }
      ));
      return
    }

    this.list$ = list$.pipe(
      switchMap(data => {
        if (!data) {  this.list$ = of(data) }

        if (!this.platFormService.isApp()) {
          if (!data) { return of(null)}
          let list = data // data.filter( item => item.enabledOnline  )
          if (!list) { return of(null)}
          if (!this.userAuthorization.isManagement) {
            list = list.filter(item => !item.managerRequired )
          }
          if (!list) { return of(null)}
          return of(this.convertList(data))
        }

        if (!this.userAuthorization.isManagement) {
          data = data.filter(item => !item.managerRequired )
        }
        return of(this.convertList(data))
    }))
  }

  applySelected(item: IPaymentMethod) {
    if (this.order && item) {
      this.outPutSelected.emit(item)
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/placeholderimage.png'; // Angular will resolve this path correctly.
  }

}

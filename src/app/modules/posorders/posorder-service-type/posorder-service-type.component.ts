import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { Observable, of, Subscription, switchMap } from 'rxjs';
import { IPOSOrder, IServiceType, ISite, IUser, ServiceType } from 'src/app/_interfaces';
import { AWSBucketService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { PlatformService } from 'src/app/_services/system/platform.service';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';
import { ServiceTypeService } from 'src/app/_services/transactions/service-type-service.service';
import { AppMaterialModule } from 'src/app/app-material.module';
import { SharedPipesModule } from 'src/app/shared-pipes/shared-pipes.module';

@Component({
  selector: 'posorder-service-type',
  standalone: true,
  imports: [CommonModule,AppMaterialModule,FormsModule,ReactiveFormsModule,

  SharedPipesModule],
  templateUrl: './posorder-service-type.component.html',
  styleUrls: ['./posorder-service-type.component.scss']
})
export class POSOrderServiceTypeComponent implements OnDestroy  {

  @Input() bucketName: string;
  bucket$: Observable<string>;
  inputForm            : UntypedFormGroup;
  serviceTypes$        : Observable<IServiceType[]>;
  order                : IPOSOrder;
  _order               : Subscription;
  serviceTypes         : IServiceType[]
  @Output() outPutSelectServiceType = new EventEmitter();
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
    private orderService      : OrdersService,
    public orderMethodsService: OrderMethodsService,
    private sitesService      : SitesService,
    private userAuthorization: UserAuthorizationService,
    public platFormService   : PlatformService,
    private awsBucketService : AWSBucketService,
    private serviceTypeService: ServiceTypeService, ) {

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

  getPaymentMethods(site: ISite) {
    const serviceTypes$ = this.serviceTypeService.getSaleTypes(site);

    if (this.platFormService.isApp()) {
      this.serviceTypes$ = serviceTypes$
      return
    }

    this.serviceTypes$ = serviceTypes$.pipe(
      switchMap(data => {

        if (!data) {
          this.serviceTypes$ = of(data)
        }

        if (!this.platFormService.isApp()) {

          if (!data) { return of(null)}

          let list = data.filter( item => item.onlineOrder )
          if (!list) { return of(null)}

          if (!this.userAuthorization.isManagement) {
            list = list.filter(item => !item.managerRequired )
          }

          if (!list) { return of(null)}

          // this.serviceTypes$ = of(list)
          this.serviceTypes  = list;
          return of(list)
        }

        if (!this.userAuthorization.isManagement) {
          data = data.filter(item => !item.managerRequired )
        }

        return of(data)

    }))
  }

  applyServiceType(item: IServiceType) {
    // this.item = item
    if (this.order && item) {
      this.outPutSelectServiceType.emit(item)
    }
  }

  onImageError(event: Event) {
    const imgElement = event.target as HTMLImageElement;
    imgElement.src = 'assets/images/placeholderimage.png'; // Angular will resolve this path correctly.
  }

}

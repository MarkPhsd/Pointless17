import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { ContactsService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-order-header-demo-graphics',
  templateUrl: './order-header-demo-graphics.component.html',
  styleUrls: ['./order-header-demo-graphics.component.scss']
})
export class OrderHeaderDemoGraphicsComponent  {

  @Input()  canRemoveClient = false;
  @Input()  order           : IPOSOrder;
  @Input()  disableActions: boolean;
  @Output() outPutOpenClient:   EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutRemoveClient:   EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutAssignCustomer:   EventEmitter<any> = new EventEmitter<any>();


  constructor(private router: Router,
              private siteService: SitesService,
              private contactService: ContactsService,
              private orderService: OrdersService)
               { }

  removeClient() {
    this.outPutRemoveClient.emit(true)
  }

  openClient() {
    if (!this.disableActions) { return }
    if (this.order) {
      if (this.order.clients_POSOrders) {
        this.router.navigate(["/profileEditor", {id: this.order.clientID}]);
        return;
      }
    }
  }

  gotoAddClient(){
    const site = this.siteService.getAssignedSite();
    const user = {} as IUserProfile;
    const client$ = this.contactService.addClient(site,user)
    client$.subscribe( {
        next: (data) => {
          this.editItem(data.id)
        },
        error: (err) =>  {
          console.log('err', err)
        }
      }
    )
  }

  editItem(clientID:number) {
    this.router.navigate(["/profileEditor/", {id:clientID}]);
  }

  async assignCustomer(client) {
    if (client) {
      await this.assignClientID(client)
    }
  }

  async assignClientID(client) {
    if (this.order) {
      const site = this.siteService.getAssignedSite();
      this.order.clientID = client.id;
      this.order.customerName = client?.lastName.substr(0,2) + ', ' + client?.firstName
      console.log(this.order)
      const order = await this.orderService.putOrder(site, this.order).pipe().toPromise()
      this.orderService.updateOrderSubscription(order)
    }
  }

}

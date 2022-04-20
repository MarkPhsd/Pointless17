import { Component, OnInit, EventEmitter, Input, Output, OnChanges } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { IPOSOrder, IUserProfile } from 'src/app/_interfaces';
import { ContactsService, OrdersService } from 'src/app/_services';
import { SitesService } from 'src/app/_services/reporting/sites.service';

@Component({
  selector: 'app-order-header-demo-graphics',
  templateUrl: './order-header-demo-graphics.component.html',
  styleUrls: ['./order-header-demo-graphics.component.scss']
})
export class OrderHeaderDemoGraphicsComponent implements OnInit,OnChanges  {

  orderNameForm: FormGroup;

  @Input()  canRemoveClient = false;
  @Input()  order           : IPOSOrder;
  @Input()  disableActions  = false;
  @Output() outPutOpenClient:   EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutRemoveClient:   EventEmitter<any> = new EventEmitter<any>();
  @Output() outPutAssignCustomer:   EventEmitter<any> = new EventEmitter<any>();
  
  constructor(private router: Router,
              private siteService: SitesService,
              private contactService: ContactsService,
              private fb: FormBuilder,
              private orderService: OrdersService)
               { }

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    const i = 0
  }
  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    this.orderNameForm = this.fb.group({
      name: [''],
    })
    if (this.order) { 
      this.orderNameForm = this.fb.group({
        name: [this.order.customerName],
      })
    }

  }
  removeClient() {
    this.outPutRemoveClient.emit(true)
  }

  openClient() {
    if (this.disableActions) { return }
    if (this.order) {
      if (this.order.clients_POSOrders) {
        this.router.navigate(["/profileEditor", {id: this.order.clientID}]);
        return;
      }
    }
  }

  saveOrderName() { 
    const orderName = this.orderNameForm.controls['name'].value;
    if (this.order) { 
      this.orderService.setOrderName(this.order.id, orderName).subscribe( data=> { 
        
      })
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

import { Component, OnInit,Input } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription, of, switchMap } from 'rxjs';
import { IPOSOrder } from 'src/app/_interfaces';
import { OrdersService } from 'src/app/_services';
import { IUserAuth_Properties } from 'src/app/_services/people/client-type.service';
import { SitesService } from 'src/app/_services/reporting/sites.service';
import { IMenuButtonGroups, IMenuButtonProperties, mb_MenuButton } from 'src/app/_services/system/mb-menu-buttons.service';
import { BalanceSheetMethodsService } from 'src/app/_services/transactions/balance-sheet-methods.service';
import { OrderMethodsService } from 'src/app/_services/transactions/order-methods.service';

@Component({
  selector: 'function-buttons-list',
  templateUrl: './function-buttons-list.component.html',
  styleUrls: ['./function-buttons-list.component.scss']
})
export class FunctionButtonsListComponent implements OnInit {

  @Input() order: IPOSOrder
  @Input() buttonSize : string = 'button-small';
  buttonSizeMenu: string;
  @Input() userAuths: IUserAuth_Properties;
  @Input() isAdmin: boolean;
  @Input() isUser: boolean;
  @Input() isStaff: boolean;

  @Input() list: IMenuButtonGroups;
  _order        :   Subscription;
  action$: Observable<any>;
  //  private mbMenuGroupService: MBMenuButtonsService
  constructor(
    private siteService: SitesService,
    private balanceSheetMethodService: BalanceSheetMethodsService,
    private orderMethodsService: OrderMethodsService,
    private router: Router,
    private ordersService:   OrdersService,
   ) {

  }

  ngOnInit(): void {
      console.log()
      // this.list
      if (this.buttonSize == 'button-small') {
        this.buttonSizeMenu = 'button-small-menu'
      }
      if (this.buttonSize == 'button-medium') {
        this.buttonSizeMenu = 'button-medium-menu'
      }
  }

  functionCall(item:mb_MenuButton) {
    if (!item) { return }
    const props = JSON.parse(item.properties) as IMenuButtonProperties
    const functionName = props?.method
    if (!functionName) { return }
    switch (functionName) {
      case 'openDrawer1':
        this.openDrawer1();
        break;
      case 'openDrawer2':
        this.openDrawer2();
        break;
      case 'openDrawer3':
        this.openDrawer3();
        break;
      case 'suspendOrder':
        this.suspendOrder();
        break;
      case 'emailOrder':
        this.emailOrder();
        break;
      case 'textOrder':
        this.textOrder();
        break;
      case 'qrLink':
          this.qrLink();
          break;
      case 'price1':
        this.price(1);
        break;
      case 'price2':
        this.price(2);
        break;
      case 'price3':
        this.price(3);
        break;
      case 'price':
        this.price(0);
        break;
      default:
        console.log('Function not found');
        break;
    }
  }

  price(value) {
    this.price(value)
  }

  assignPriceColumn(value: number){
    const site = this.siteService.getAssignedSite()
    if (this.order) {
      this.order.priceColumn = value
      // console.log(this.order.id,value)
      this.action$ = this.ordersService.setOrderPriceColumn(this.order.id, value).pipe(
        switchMap(data => {
          // this.siteService.notify(`Price Column Set: ${value}`, 'Result', 2000)
          this.order.priceColumn = data;
          this.orderMethodsService.updateOrder(this.order)
          return of(data)
        })
      )
    }
  }

  async qrLink() {
    console.log('Placeholder for Open Drawer 1');
    this.router.navigate(['/qr-receipt/',  {orderCode: this.order.orderCode}])
    // await this.balanceSheetMethodService.openDrawerOne()
    // Add the actual implementation here
  }

  async openDrawer1() {
    console.log('Placeholder for Open Drawer 1');
    await this.balanceSheetMethodService.openDrawerOne()
    // Add the actual implementation here
  }

 async openDrawer2() {
    console.log('Placeholder for Open Drawer 2');
    await this.balanceSheetMethodService.openDrawerTwo()
    // Add the actual implementation here
  }

  openDrawer3() {
    console.log('Placeholder for Open Drawer 3');
    // Add the actual implementation here
  }

  suspendOrder() {
    console.log('Placeholder for Suspend Order');
    this.action$ = this.orderMethodsService.suspendOrder(this.order).pipe(switchMap(data => {
      this.siteService.notify('Suspended', 'close',3000 )
      return of(data)
    }))
    // Add the actual implementation here
  }

  emailOrder() {
    console.log('Placeholder for Email Order');
    this.action$ = this.orderMethodsService.emailOrder(this.order)
    // Add the actual implementation here
  }

  textOrder() {
    console.log('Placeholder for Text Order');
    // Add the actual implementation here
  }

  isVisible(item:mb_MenuButton) {
    const props = JSON.parse(item.properties)  as IMenuButtonProperties;
    const auth  = this.userAuths;

    let pass = false;

    if ( props?.allowStaff && this.isStaff) { pass = true}
    if (props?.allowUser && this.isUser) { pass = true}
    if (this.isAdmin) { pass = true}

    if (pass) {return true}

  }

}
  // functions = [
  //   {id: 0, name:'OpenDrawer1', icon: 'register', function: 'openDrawer1',group: 'drawer'},
  //   {id: 1, name:'OpenDrawer2', icon: 'register', function: 'openDrawer2',group: 'drawer'},
  //   {id: 2, name:'OpenDrawer3', icon: 'register', function: 'openDrawer3',group: 'drawer'},
  //   {id: 3, name:'SuspendOrder', icon: 'hold', function: 'suspendOrder',group: 'order'},
  //   {id: 4, name:'EmailOrder', icon: '', function: 'emailOrder',group: 'order'},
  //   {id: 5, name:'TextOrder', icon: '', function: 'textOrder',group: 'order'},
  // ]

import { Injectable } from '@angular/core';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { Router } from '@angular/router';
import { IPOSOrder } from 'src/app/_interfaces';
import { AuthenticationService } from '..';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
    private authService       : AuthenticationService,
    private toolbarUIService: ToolBarUIService,
    private router:           Router,
  ) { }

  navHome(){
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/app-main-menu']);
    });
  }

  navPOSOrders() {
    this.toolbarUIService.hidetoolBars(this.authService.deviceInfo);
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigate(['/pos-orders']);
  }

  navProfile() {
    this.toolbarUIService.hidetoolBars(this.authService.deviceInfo);
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigate(['/app-profile']);
  }

  gotoPolicies() {
    this.toolbarUIService.hidetoolBars(this.authService.deviceInfo);
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigate(['/policies']);
  }

  contactUs() {
    this.toolbarUIService.hidetoolBars(this.authService.deviceInfo);
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigate(['/contact-us']);
  }

  navTableService() {
    this.toolbarUIService.hidetoolBars(this.authService.deviceInfo);
    this.router.navigate(['/table-layout']);
  }

  navDashboard(){
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/menu-manager']);
    });
  }

  makePaymentFromSidePanel(openOrderBar: boolean, smallDevice: boolean, isStaff: boolean, order: IPOSOrder) {
    // this.openOrderBar = false
    if (!smallDevice) {
      this.toolbarUIService.updateOrderBar(false,this.authService.deviceInfo);
      this.toolbarUIService.updateSideBar(false)
      this.toolbarUIService.updateToolBarSideBar(false)
    }
    let path = ''
    if (order) {
      if (order.tableName && order.tableName.length>0) {
        path = 'pos-payment'
      }
    }
    this.makePayment(openOrderBar, smallDevice,
                                   isStaff, order.completionDate, path )
  }


  makePayment(openOrderBar: boolean , smallDevive: boolean,
              isStaff: boolean, completionDate: string, path: string) {


    this.toolbarUIService.updateOrderBar(openOrderBar,this.authService.deviceInfo)
    this.toolbarUIService.resetOrderBar(false)
    this.toolbarUIService.updateSearchBarSideBar(false)
    this.toolbarUIService.updateSideBar(false)

    let url = 'pos-order-schedule'

    if (path) {
      this.router.navigate([path])
      return
    }

    if (!isStaff && !completionDate) {
      url = 'pos-order-schedule'
      this.router.navigateByUrl(url)
      return
    }

    if (isStaff || completionDate) {
       url = 'pos-payment'
       this.router.navigateByUrl(url)
      //  console.log('continue')
       return
    }
  }

  toggleOpenOrderBar(isStaff: boolean) {
    let schedule = 'currentorder'
    if (isStaff) { schedule = '/currentorder/' }
    this.router.navigate([ schedule , {mainPanel:true}]);
    this.toolbarUIService.updateOrderBar(false,this.authService.deviceInfo)
    this.toolbarUIService.resetOrderBar(true)
  }

}

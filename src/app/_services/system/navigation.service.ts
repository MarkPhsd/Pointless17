import { Injectable } from '@angular/core';
import { ToolBarUIService } from 'src/app/_services/system/tool-bar-ui.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
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
    this.toolbarUIService.hidetoolBars();
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigate(['/pos-orders']);
  }

  navDashboard(){
    this.toolbarUIService.updateDepartmentMenu(0);
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/menu-manager']);
    });
  }

  makePayment(openOrderBar: boolean , smallDevive: boolean, isStaff: boolean) { 
    this.toolbarUIService.updateOrderBar(openOrderBar)
    this.toolbarUIService.resetOrderBar(false)
    
    let url = 'pos-order-schedule'
    if (!isStaff) {
      url = 'pos-order-schedule'
      this.router.navigateByUrl(url)
      return
    }

    if (isStaff) {
       url = 'pos-payment'
       this.router.navigateByUrl(url)
       return
    }

    this.toolbarUIService.updateOrderBar(false)

  }

  toggleOpenOrderBar(isStaff: boolean) { 
    let schedule = 'currentorder'
    if (isStaff) { schedule = '/currentorder/' }
    this.router.navigate([ schedule , {mainPanel:true}]);
    this.toolbarUIService.updateOrderBar(false)
    this.toolbarUIService.resetOrderBar(true)
  }

}

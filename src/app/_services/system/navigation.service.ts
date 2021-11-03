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
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/app-main-menu']);
    });
  }

  navPOSOrders() {
    this.toolbarUIService.hidetoolBars()
    this.router.navigate(['/pos-orders']);
  }
}

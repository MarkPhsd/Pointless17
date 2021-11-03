import { Directive, ElementRef, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { IUser } from '../_interfaces/people/users';
import { UserAuthorizationService } from '../_services/system/user-authorization.service';

@Directive({
  selector: '[userAuthorized]'
})
export class UserAuthorizedDirective implements OnInit {

  @Input() set userAuthorized(val) {
    console.log('permisions', val)
    this.permissions = val;
    this.updateView();
  }

  private currentUser: IUser;
  private permissions: any;

  constructor(
    private element: ElementRef,
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userService: UserAuthorizationService
  ) {
  }

  ngOnInit() {
    this.currentUser =  this.userService.currentUser();
    this.updateView();
  }

  private updateView() {


    if (this.checkPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }
  // return this.userAuthorizationService.isUserAuthorized(menu.userType)

  private checkPermission() {
    let hasPermission = false;

    if (this.currentUser && this.currentUser.type) {
      const permissions = this.permissions
      console.log('check permissions', this.userService.isUserAuthorized(permissions))
      if (this.userService.isUserAuthorized(permissions))
      {
        console.log('check permissions success')
        return true;
      }
    }
    console.log('check permissions failed')
    return hasPermission;
  }
}

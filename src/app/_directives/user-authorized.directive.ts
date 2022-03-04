import { Directive, Input, OnInit, TemplateRef, ViewContainerRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { IUser } from '../_interfaces/people/users';
import { AuthenticationService } from '../_services';
import { UserAuthorizationService } from '../_services/system/user-authorization.service';

@Directive({
  selector: '[userAuthorized]',
})
export class UserAuthorizedDirective implements OnInit {

  @Input() set userAuthorized(val) {
    this.permissions = val;
    console.log('userAuthorized', val)
    this.updateView();
  }

  private permissions: any;

  user              : IUser;
  _user             : Subscription;

  initSubscription() {
    // this.user = this.userService.currentUser();
    this.user = this.authenticationService.userValue;
    // this._user = this.authenticationService.user$.subscribe( data => {
    //   this.user  = data
    // })
  }

  constructor(
    private templateRef: TemplateRef<any>,
    private viewContainer: ViewContainerRef,
    private userService: UserAuthorizationService,
    private authenticationService: AuthenticationService,
  ) {
  }

  ngOnInit() {
    this.initSubscription();
    this.updateView();
  }

  private updateView() {
    if (this.checkPermission()) {
      this.viewContainer.createEmbeddedView(this.templateRef);
    } else {
      this.viewContainer.clear();
    }
  }

  private checkPermission() {
    let hasPermission = false;
    console.log('has permissions', hasPermission)
    if (!this.user) { return false }
    console.log('has permissions', this.user)
    if (this.user && this.user.roles) {
      const permissions = this.permissions
      if (this.userService.isUserAuthorized(permissions))  {
         hasPermission = true
      }
    }
    console.log('has permissions', hasPermission)
    return hasPermission;
  }
}

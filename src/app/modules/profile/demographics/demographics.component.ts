import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IUserProfile } from 'src/app/_interfaces';
import { AuthenticationService, UserService } from 'src/app/_services';
import { UserAuthorizationService } from 'src/app/_services/system/user-authorization.service';

@Component({
  selector: 'app-demographics',
  templateUrl: './demographics.component.html',
  styleUrls: ['./demographics.component.scss']
})
export class DemographicsComponent implements OnInit {

  constructor(
    private route                  : ActivatedRoute,
    public authenticationService   : AuthenticationService,
    public userAuthorizationService: UserAuthorizationService,
    private userService            : UserService,
    private router                 : Router,)
     { }

  @Input()   user = {} as IUserProfile;

  ngOnInit(): void {
    const user = this.authenticationService.userValue;
    if (user) {
      this.getCurrentUser(user.id)
    }
  }

  getCurrentUser(id: number) {
    const user$ = this.userService.getProfileOfUSerByID(id)
    user$.subscribe(data => {
      this.user = data;
    })
  }

  editProfile() {
    if (this.user) {
      this.router.navigate(["/profileEditor/", {id: this.user.id}]);
    }
  }

}

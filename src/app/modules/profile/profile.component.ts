import { Component, OnInit } from '@angular/core';
import { IUserProfile}  from 'src/app/_interfaces';
import { UserService } from 'src/app/_services';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})

export class ProfileComponent implements OnInit {

  user = {} as IUserProfile;
  showRoles: boolean;
  devModeOn: boolean;

  constructor(private userService: UserService,
            ) {
  }

  ngOnInit(): void {
    this.refreshProfileDetails();
  }

  displayRoles(){
    if (this.user.roles != 'user') {
        this.showRoles = true;
    }
  };

  refreshProfileDetails(){
    this.userService.getProfile().subscribe(data =>
      {
        this.user = data
        this.displayRoles()
      }
    )
  }

}

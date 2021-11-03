import { Component, OnInit } from '@angular/core';
import { IUserProfile}  from 'src/app/_interfaces';
import { OrdersService, UserService } from 'src/app/_services';
import { DevService } from 'src/app/_services/system/dev-service.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
})

export class ProfileComponent implements OnInit {

  constructor(private userService: UserService,
              private devMode: DevService,

              ) {
    }

  user = {} as IUserProfile;
  showRoles: boolean;
  devModeOn: boolean;

  ngOnInit(): void {
    this.refreshProfileDetails();
    this.devModeOn = this.devMode.getdevMode();
  }

  DisplayRoles(){
    if (this.user.roles == 'user')
    {
    }else{
      this.showRoles = true;
    }
  };

  refreshProfileDetails(){

    try {
        this.userService.getProfile().subscribe(data =>
          {
            this.user = data
            this.DisplayRoles()
          }
        )
        } catch (error) {
          console.log('error', error)
        }
  }


}

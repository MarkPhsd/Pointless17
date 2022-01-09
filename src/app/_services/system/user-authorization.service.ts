import { Injectable } from '@angular/core';
import { IUser } from 'src/app/_interfaces';
// https://dev.to/rdegges/please-stop-using-local-storage-1i04
@Injectable({
  providedIn: 'root'
})
export class UserAuthorizationService {

  constructor(
      )
  { }

  currentUser() {
    return JSON.parse(localStorage.getItem('user')) as IUser;
  }

  isUserAuthorized(requiredArray: string): boolean {
    const user = JSON.parse(localStorage.getItem('user')) as IUser;

    if (!user) { return false }

    try {
      if (!user.id) {return false}
    } catch (error) {
      return false;
    }

    const currentRole = user.roles;
    if (!requiredArray) {return false;}

    if (!JSON.stringify(currentRole == '') || currentRole == null) {return false}

    if (currentRole && requiredArray) {
      requiredArray = requiredArray.toLowerCase();
      let result: boolean;
      const rolesArray = requiredArray.split(',')
      rolesArray.forEach( data => {
          if (data === currentRole){
            result = true
          }
          if (data === 'anonymous') {
            result = true
          }
        }
      )
      return result
    }
    return false;

  }

  isCurrentUserStaff(): boolean {
    return  this.isUserAuthorized('admin, manager, employee')
  }

}

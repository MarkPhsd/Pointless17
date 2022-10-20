import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { IUser  } from '../_interfaces';

export const InterceptorSkipHeader = 'X-Skip-Interceptor';


@Injectable()
export class BasicAuthInterceptor implements HttpInterceptor {

  user              : IUser;
  _user             : Subscription;

  initSubscription() {
    this._user = this.authenticationService.user$.subscribe( data => {
      this.user  = data
    })
  }

  constructor(
              private authenticationService: AuthenticationService)
  {
    this.initSubscription();
    
  }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      const user = this.authenticationService.userValue;

      if (request.headers.has(InterceptorSkipHeader)) {
        const headers = request.headers.delete(InterceptorSkipHeader);
        return next.handle(request.clone({ headers }));
      }

      if (user) {
        user.authdata = window.btoa(user.username + ':' + user.token);
        if (  user.authdata) {
          request = request.clone({
            setHeaders: {
              Authorization: `Basic ${user.authdata}`
            }
          });

        }
        return next.handle(request);
      }


      {
        const metrcURL = localStorage.getItem('site.metrcURL')
        if (metrcURL) {
          const ismetrcURL = request.url.startsWith(metrcURL);
          if (ismetrcURL) {
            const metrcKey = 'EBROdy-NDUFhhL6M8xQv9y4gxc6VkGkiOlBSjUG8YBvr6ssm' // localStorage.getItem('user.metrcKey')
            const metrcUser = 'rdh-NDqpGuklR36rQqNkUzSOSU3I95Ey7Go1D0bbYw2O1MI5' // localStorage.getItem('user.metrcUser')
            try {
              const authdata = window.btoa( `${metrcUser}:${metrcKey}`);
              request = request.clone({
                setHeaders: {
                    Authorization: `Basic ${authdata}`
                    }
              });
              this.authenticationService.externalAPI = true
              return next.handle(request);
              // console.log("mectrurl authdata", authdata)
            } catch (error) {
              console.log(error)
            }
          }
      }

        // console.log('resquest', request)
        this.authenticationService.externalAPI = false
        return next.handle(request);
      }

    }
}

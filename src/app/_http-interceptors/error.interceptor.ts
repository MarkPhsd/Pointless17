import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthenticationService } from '../_services';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    debugNotification: boolean;

    constructor(
                private authenticationSerivce: AuthenticationService,
                private _snackBar: MatSnackBar
                ) {
      this.debugNotification = this.getdebugOnThisDevice();
    }

    getdebugOnThisDevice() {
      const value =  localStorage.getItem('debugOnThisDevice')
      if (value === 'true') { return true }
      return false;
    }


    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

        if (request.headers.get('X-Skip-Error-Handling')) {
            // Clone the request to remove the custom header before sending it to the server
            // console.log('error handling ignored')
            const newRequest = request.clone({ headers: request.headers.delete('X-Skip-Error-Handling') });
            return next.handle(newRequest);
        }
        return next.handle(request)
        .pipe(
            retry(3),
          catchError(err => {
            let errorMessage =  err?.status + ' '  + err?.message + err?.messageDetail;

            if (err.status === 303) {
              this.authenticationSerivce.logout(false);
              return;
            }

            if (err.status === 400) {
              if (this.getdebugOnThisDevice()) {

                this.notifyEvent(errorMessage, 'Close.' );
              }
              // console.log(errorMessage)
              return;
            }
            if (err.status === 401) {
              if (this.getdebugOnThisDevice()) {
                this.notifyEvent(errorMessage, 'Close.' );
              }
              // console.log(errorMessage)
              return;
            }
            if (err.status === 500) {
              if (this.getdebugOnThisDevice()) {
                this.notifyEvent(errorMessage, 'Close.'  );
              }
              // console.log(errorMessage)
              return;
            }

            if (this.getdebugOnThisDevice()) {
              this.notifyEvent(`${err?.message + err?.messageDetail}. Status: ${err.status} `, 'Close.' );
              return
            }

            console.log("HttpInterceptor error: Status",  err?.status + ' Message'  + err?.message + ' Detail' + err?.messageDetail )
            return throwError(err?.status + ' '  + err?.message + err?.messageDetail);
      }))
    }

    notifyEvent(message: string, action: string) {
      this._snackBar.open(message, action, {
        duration: 100000,
        verticalPosition: 'top'
      });
    }

  }

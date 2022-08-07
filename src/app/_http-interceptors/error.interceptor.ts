import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    debugNotification: boolean;

    constructor(
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
        return next.handle(request)
        .pipe(
            retry(3),
          catchError(err => {
            let errorMessage =  err?.status + ' '  + err?.message + err?.messageDetail;

            if (err.status === 400) {
              if (this.getdebugOnThisDevice()) {
                this.notifyEvent(errorMessage, 'Some error occured.' );
              }
              console.log(errorMessage)
              return;
            }
            if (err.status === 401) {
              if (this.getdebugOnThisDevice()) {
                this.notifyEvent(errorMessage, 'Some error occured.' );
              }
              console.log(errorMessage)
              return;
            }
            if (err.status === 500) {
              if (this.getdebugOnThisDevice()) {
                this.notifyEvent(errorMessage, 'Some error occured.'  );
              }
              console.log(errorMessage)
              return;
            }

            if (this.getdebugOnThisDevice()) {
              this.notifyEvent(`${err?.message + err?.messageDetail}. Status: ${err.status} `, 'Some error occured.' );
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

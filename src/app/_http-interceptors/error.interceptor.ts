import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

    //private authenticationService: AuthenticationService,
    debugNotification: boolean
    constructor(
                private _snackBar: MatSnackBar
                ) {

      const debug  = localStorage.getItem('debugOn');
      if (debug === 'true') {
      }
      this.debugNotification = true;
    }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
        .pipe(
            retry(3),
          catchError(err => {
            let errorMessage =  err?.status + ' '  + err?.message + err?.messageDetail;

            if (err.status === 400) {
              if (this.debugNotification) {
                this.notifyEvent(errorMessage, 'Some error occured.' );
              }
              console.log(errorMessage)
              return;
            }
            if (err.status === 401) {
              if (this.debugNotification) {
                this.notifyEvent(errorMessage, 'Some error occured.' );
              }
              console.log(errorMessage)
              return;
            }
            if (err.status === 500) {
              if (this.debugNotification) {
                this.notifyEvent(errorMessage, 'Some error occured.' );
              }
              console.log(errorMessage)
              return;
            }
            if (this.debugNotification) {
              this.notifyEvent(errorMessage, 'Some error occured.' );
            }

            console.log("HttpInterceptor error:",  err?.status + ' '  + err?.message + err?.messageDetail )
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

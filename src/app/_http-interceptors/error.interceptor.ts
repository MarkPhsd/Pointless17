import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { AuthenticationService } from 'src/app/_services/system/authentication.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(
                private authenticationService: AuthenticationService,
                private _snackBar: MatSnackBar
                ) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request)
        .pipe(
            retry(3),

            catchError(err => {

                let errorMessage = '';
                if (err.status === 401) {
                  // this.notifyEvent('Oh no!:' + err.message, 'Some error occured.')
                  console.log(err)
                }
                if (err.status = 500) {
                    errorMessage = `Error Code: ${err.status}\nMessage: ${err.message}`;
                    // this.notifyEvent('Oh no!:' + err, 'Some error occured.')
                }
                //const error = err.error.message || err.statusText;
                // console.log("HttpInterceptor error:",  errorMessage )
                return throwError(errorMessage);
        }))
    }

    notifyEvent(message: string, action: string) {
      this._snackBar.open(message, action, {
        duration: 2000,
        verticalPosition: 'top'
      });
    }

  }

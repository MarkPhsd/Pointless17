import { Injectable } from '@angular/core'
import { HttpClient, HttpHeaders,  } from '@angular/common/http';
import { CacheClientService } from './cache-client.service';
import { Observable, of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { MatOptionSelectionChange } from '@angular/material/core';

// https://medium.com/angular-in-depth/top-10-ways-to-use-interceptors-in-angular-db450f8a62d6
export enum Verbs {
	GET = 'GET',
	PUT = 'PUT',
	POST = 'POST',
	DELETE = 'DELETE'
}

@Injectable()
export class HttpClientCacheService {

	constructor(
		private http: HttpClient,
		private _cacheService: CacheClientService,
	) { }

	get<T>(options: HttpOptions): Observable<T> {
		return this.httpCall(Verbs.GET, options)
	}

	delete<T>(options: HttpOptions): Observable<T> {
		return this.httpCall(Verbs.DELETE, options)
	}

	post<T>(options: HttpOptions, model: any): Observable<T> {
    // console.log('post  cache', options)
    options.body = model;
		return this.httpCall(Verbs.POST, options)
	}

	put<T>(options: HttpOptions): Observable<T> {
		return this.httpCall(Verbs.PUT, options)
	}

  getKey(verb: Verbs, options: HttpOptions) {
    let key = ''
    let params = ''

    try {
      if (verb == 'POST') {
        if (options.body != null) {
          params =  JSON.stringify(options.body)
        }
      }
    } catch (error) {
      // console.log(error)
    }

    if (key == '') {
      key =  options.url
    }

    if (verb == 'POST') {
      if (options.body != null) {
        key = options.url + params
      }
    }

    return key
  }

	private httpCall<T>(verb: Verbs, options: HttpOptions): Observable<T> {

    options.body = options.body || null
    options.cacheMins = options.cacheMins || 0
    const  key = this.getKey(verb, options)
    console.log(key)
    console.log(options )

    if (options.cacheMins > 0) {
      const data = this._cacheService.load(key)
      console.log(data )
      // Return data from cache
      if (data !== null) {
        return of<T>(data)
      }
    }

    if (verb == 'POST') {

      return this.http.post<any>( options.url, options.body)
        .pipe(
          switchMap(response => {
            if (options.cacheMins > 0) {
              // Data will be cached
              this._cacheService.save({
                key: key ,
                data: response,
                expirationMins: options.cacheMins
              })
            }
            return of<T>(response)
          })
        )
    }


    return this.http.request<T>(verb, options.url, {observe: 'body'})
      .pipe(
        switchMap(response => {
          if (options.cacheMins > 0) {
            // Data will be cached
            this._cacheService.save({
              key: key ,
              data: response,
              expirationMins: options.cacheMins
            })
          }
          return of<T>(response)
        })
      )
  }

}

export class HttpOptions {
	url: string
	body?: any
	cacheMins?: number
}

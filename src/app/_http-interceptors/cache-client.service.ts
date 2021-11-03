import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CacheClientService {

    constructor() { }

    save(options: LocalStorageSaveOptions) {

      console.log('save cache key', options.key)
      // Set default values for optionals
      options.expirationMins = options.expirationMins || 0

      // Set expiration date in miliseconds
      const expirationMS = options.expirationMins !== 0 ? options.expirationMins * 60 * 1000 : 0

      const record = {
        value: typeof options.data === 'string' ? options.data : JSON.stringify(options.data),
        expiration: expirationMS !== 0 ? new Date().getTime() + expirationMS : null,
        hasExpiration: expirationMS !== 0 ? true : false
      }
      localStorage.setItem(options.key, JSON.stringify(record))
    }

    load(key: string) {
      // Get cached data from localstorage
      // console.log('load cache key', key)

      const item = localStorage.getItem(key)
      if (item !== null) {
        const record = JSON.parse(item)
        const now = new Date().getTime()
        // Expired data will return null
        if (!record || (record.hasExpiration && record.expiration <= now)) {
          return null
        } else {
          return JSON.parse(record.value)
        }
      }
      return null
    }

    remove(key: string) {
      localStorage.removeItem(key)
    }

    cleanLocalStorage() {
      localStorage.clear()
    }
  }

  export class LocalStorageSaveOptions {
    key: string
    data: any
    expirationMins?: number
  }


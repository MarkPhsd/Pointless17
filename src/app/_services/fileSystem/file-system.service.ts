import { Injectable } from '@angular/core';
// import { ElectronService } from 'ngx-electron';

@Injectable({
  providedIn: 'root'
})
export class FileSystemService {

  constructor
      (
        // private electronService: ElectronService
      ) {}

  async makeDirectory(path: string): Promise<any> {
      // const fs = this.electronService.remote.require('./datacap/transactions.js');
      // const response = await fs.makeDirectory(path)
  }

  async makeFile(path: string, name : string): Promise<any> {

    // const pathName = `${path}\\${name}`
    // const fs = this.electronService.remote.require('./datacap/transactions.js');
    // const response = await fs.makeFile(pathName)
}
}

import { Injectable } from '@angular/core';
import { DateHelperService } from 'src/app/_services/reporting/date-helper.service';

@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  constructor(private dateHelper: DateHelperService) { }

  publishObject(type: string, logMessage: any) { 
    try {
      const date = new Date()
      const timeMessage = this.dateHelper.format(date, 'mm/dd/yyyy') + ' ' + this.dateHelper.format(date, 'hh:mm')
      const item = {log: true, time: timeMessage, type: type, message: JSON.stringify(logMessage)}
      const json = JSON.stringify(item)
      localStorage.setItem('logTime' + timeMessage, json) 
    } catch (error) {
      console.log('log error')
      console.log(' Publish Object ', logMessage)
    }

  }

  publishMessage(type: string, logMessage: string) { 
    try {
      const date = new Date()
      const timeMessage = this.dateHelper.format(date, 'mm/dd/yyyy') + ' ' + this.dateHelper.format(date, 'hh:mm')
      const item = {log: true, time: timeMessage, type: type, message: logMessage}
      const json = JSON.stringify(item)
      localStorage.setItem('logTime' + timeMessage, json) 

    } catch (error) {
      console.log('log error')
      console.log(' Publish Object ', logMessage)
    }
  }

  listLogs(): any[] {
    const logs = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('logTime')) {
        const log = JSON.parse(localStorage.getItem(key) || '{}');
        logs.push(log);
      }
    }
    return logs;
  }

  listLogsToConsole() { 
    const list = this.listLogs();
    list.forEach(data => { 
      console.log(data)
    })
  }

  formatLogsForExport(logs: any[]): string {
    return logs.map(log => `${log.time} [${log.type}] ${log.message}`).join('\n');
  }

  exportLogsToTxt() {
    const logs = this.listLogs();
    const logsString = this.formatLogsForExport(logs);
  
    const blob = new Blob([logsString], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
  
    const a = document.createElement('a');
    a.href = url;
    a.download = 'logs.txt';
    a.click();
  
    window.URL.revokeObjectURL(url);
  }
  
  

}

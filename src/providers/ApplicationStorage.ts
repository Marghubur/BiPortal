import { Injectable } from "@angular/core";
import { pairData } from "src/app/util/iautocomplete/iautocomplete.component";
import { CommonService, ErrorToast, UserDetail } from "./common-service/common.service";
import { Master } from "./constants";

@Injectable()
export class ApplicationStorage {
  $master: any = {};
  constructor(private commonService: CommonService) {}

  reinitMaster() {
    let flag = false;
    let LocalData = localStorage.getItem("master");
    if (LocalData != null && LocalData != "" && LocalData != "{}") {
      this.$master = JSON.parse(LocalData);
      flag = true;
    }
    return flag;
  }

  set(Data: any) {
    if (this.commonService.IsValid(Data)) {
      let LocalData = localStorage.getItem("master");
      if (LocalData != "" && LocalData !== null) {
        this.$master = JSON.parse(LocalData);
        let Fields = Object.keys(Data);
        let index = 0;
        while (index < Fields.length) {
          this.$master[Fields[index]] = Data[Fields[index]];
          index++;
        }
      } else {
        this.$master = Data;
      }
      localStorage.setItem(Master, JSON.stringify(this.$master));
    }
  }

  clear() {
    localStorage.clear();
  }

  findRecord(key: string, storageName: string = Master) {
    let ResultingData = null;

    if (!key || key == ''){
      ErrorToast(`key: [${key}] must be not null or empty.`);
      return null;
    }

    let Data: any = localStorage.getItem(storageName);
    if (Data) {
      Data = JSON.parse(Data);
      ResultingData = Data[key];
    }

    return ResultingData;
  }

  remove(key: string) {
    let ResultingData = "";
    if (key !== undefined || key !== null || key !== "") {
      key = key.toLocaleLowerCase();
      let Data = localStorage.removeItem(key);
    }
  }

  get(key: string) {
    let ResultingData = "";
    if (key === undefined || key === null || key === "") {
      key = Master;
    }
    key = key.toLocaleLowerCase();
    let Data: any = localStorage.getItem(key);
    if (this.commonService.IsValid(Data)) {
      Data = JSON.parse(Data);
      if (this.commonService.IsValid(Data)) ResultingData = Data;
    }
    return ResultingData;
  }

  getByKey(key: string): any {
    if (key === undefined || key === null || key === "")
      return null;
    key = key.toLocaleLowerCase();
    let data: any = localStorage.getItem(key);
    if(data === undefined || data === "undefined" || data === null || data === "")
      data = null;
    return data;
  }

  setByKey(Key: string, UserData: any): boolean {
    let flag = false;
    if (Key != null && Key != "") {
      Key = Key.toLocaleLowerCase();
      localStorage.setItem(Key, UserData);
      flag = true;
    }
    return flag;
  }

  removeByKey(Key: string): boolean {
    let flag = false;
    if (Key != null && Key != "") {
      Key = Key.toLocaleLowerCase();
      localStorage.removeItem(Key);
      flag = true;
    }
    return flag;
  }

  getLocal(key: string) {
    let data: any = sessionStorage.getItem(key);
    if(!data || data == '[]')
      data = null;
    return JSON.parse(data);
  }

  setLocal(key: string, data: any): boolean {
    let flag = false;
    if (key != null && key != "") {
      sessionStorage.setItem(key.toLocaleLowerCase(), JSON.stringify(data));
      flag = true;
    }
    return flag;
  }

  //--------------------- Handle employee cache -----------------------------

}

export function GetEmployees(): Array<pairData> {
  let employees: Array<pairData> = [];
  let Data: any = localStorage.getItem(Master);
  if (Data && Data.trim().length > 0) {
    Data = JSON.parse(Data);
    employees = Data['EmployeeList'];      
    if (!employees) {
      ErrorToast("Unable to load employee list. Please contact to admin.");
    }
  }

  return employees;
}

export function GetDepartments(): Array<any> {
  let departments: Array<any> = [];
  let Data: any = localStorage.getItem(Master);
  if (Data && Data.trim().length > 0) {
    Data = JSON.parse(Data);
    departments = Data['Department'];      
    if (!departments) {
      ErrorToast("Unable to load department list. Please contact to admin.");
    }
  }

  return departments;
}

export function GetRoles(): Array<any> {
  let roles: Array<any> = [];
  let Data: any = localStorage.getItem(Master);
  if (Data && Data.trim().length > 0) {
    Data = JSON.parse(Data);
    roles = Data['Roles'];      
    if (!roles) {
      ErrorToast("Unable to load role list. Please contact to admin.");
    }
  }

  return roles;
}
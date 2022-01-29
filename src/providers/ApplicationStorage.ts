import { Injectable } from "@angular/core";
import { CommonService, UserDetail } from "./common-service/common.service";
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

  getSingle(storageName: string, key: string) {
    let ResultingData = null;
    if (
      storageName === undefined ||
      storageName === null ||
      storageName === ""
    ) {
      storageName = Master;
    }
    storageName = storageName.toLocaleLowerCase();
    let Data: any = localStorage.getItem(storageName);
    if (this.commonService.IsValid(Data)) {
      Data = JSON.parse(Data);
      let DataKeys = Object.keys(Data);
      if (DataKeys.length > 0) {
        let index = 0;
        while (index < DataKeys.length) {
          if (DataKeys[index].toLocaleLowerCase() === key.toLocaleLowerCase()) {
            ResultingData = Data[DataKeys[index]];
            break;
          }
          index++;
        }
      }
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

  getByKey(key: string) {
    if (key === undefined || key === null || key === "") 
      return null;
    key = key.toLocaleLowerCase();
    let data: any = localStorage.getItem(key);
    if(data === undefined || data === "undefined" || data === null || data === "")
      data = null;
    return data;
  }

  setByKey(Key: string, ModifiedData: any): boolean {
    let flag = false;
    if (Key != null && Key != "") {
      Key = Key.toLocaleLowerCase();
      localStorage.setItem(Key, ModifiedData);
      flag = true;
    }
    return flag;
  }
}

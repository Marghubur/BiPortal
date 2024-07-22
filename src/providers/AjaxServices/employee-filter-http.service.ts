import { Injectable } from '@angular/core';
import { AjaxService } from './ajax.service';
import { SERVICE } from '../constants';
import { environment } from '../../environments/environment';
import { JwtService, ResponseModel } from '../../auth/jwtService';
import { pairData } from 'src/app/util/iautocomplete/iautocomplete.component';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class EmployeeFilterHttpService extends AjaxService {
  constructor(tokenHelper: JwtService, http: HttpClient) {
    super(tokenHelper, http, `https://www.emstum.com/bot/sb/api/${SERVICE.FILTER}/`);
 }

  private GetUrl(Url: string) {
    if (environment.production) {
      return `${environment.baseSpringUrl}api/${SERVICE.FILTER}/${Url}`;
    } else {
      return `https://www.emstum.com/bot/sb/api/${SERVICE.FILTER}/${Url}`;
      // return `${environment.baseSpringUrl}api/${SERVICE.FILTER}/${Url}`;
    }
  }

  // async login(Url: string, Param: any): Promise<ResponseModel> {
  //   return this.http.login(this.GetUrl(Url), Param);
  // }

  // async post(Url: string, Param: any): Promise<ResponseModel> {
  //   return this.http.post(this.GetUrl(Url), Param);
  // }

  async filter(Param: any) {
    let result: Array<pairData> = [];
    let response: ResponseModel = await this.post(`filter/employeeFilterByName`,Param);
    if (response.ResponseBody && response.ResponseBody instanceof Array) {
      result = response.ResponseBody;
    }

    return result;
  }

  // async put(Url: string, Param: any): Promise<ResponseModel> {
  //   return this.http.put(this.GetUrl(Url), Param);
  // }

  // async delete(Url: string, Param?: any): Promise<ResponseModel> {
  //   return this.http.delete(this.GetUrl(Url), Param);
  // }

  // async upload(Url: string, Param: any): Promise<ResponseModel> {
  //   return this.http.upload(this.GetUrl(Url), Param);
  // }

  // async get(Url: string): Promise<ResponseModel> {
  //   return this.http.get(this.GetUrl(Url));
  // }
}

import { Injectable } from '@angular/core';
import { AjaxService } from './ajax.service';
import { SERVICE } from '../constants';
import { environment } from '../../environments/environment';
import { JwtService, ResponseModel } from '../../auth/jwtService';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CoreHttpService extends AjaxService {
  constructor(tokenHelper: JwtService, http: HttpClient) {
    super(tokenHelper, http, SERVICE.CORE);
 }

  private GetUrl(Url: string) {
    if (environment.production) {
      return `${environment.baseDotNetUrl}api/${SERVICE.CORE}/${Url}`;
    } else {
      //return `https://www.emstum.com/bot/dn/api/${SERVICE.CORE}/${Url}`;
      return `${environment.baseDotNetUrl}api/${SERVICE.CORE}/${Url}`;
    }
  }

  // async login(Url: string, Param: any): Promise<ResponseModel> {
  //   return this.http.login(this.GetUrl(Url), Param);
  // }

  // async post(Url: string, Param: any): Promise<ResponseModel> {
  //   return this.http.post(this.GetUrl(Url), Param);
  // }

  // async put(Url: string, Param: any): Promise<ResponseModel> {
  //   return this.http.put(this.GetUrl(Url), Param);
  // }

  // async delete(Url: string, Param?: any): Promise<ResponseModel> {
  //   return this.http.delete(this.GetUrl(Url), Param);
  // }

  // async upload(Url: string, Param: any): Promise<ResponseModel> {
  //   return this.http.upload(this.GetUrl(Url), Param);
  // }

  // GetImageBasePath(): string {
  //   return this.http.GetImageBasePath();
  // }

  // async get(Url: string): Promise<ResponseModel> {
  //   return this.http.get(this.GetUrl(Url));
  // }
}

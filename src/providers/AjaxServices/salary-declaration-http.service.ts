import { Injectable } from '@angular/core';
import { JwtService, ResponseModel } from 'src/auth/jwtService';
import { environment } from 'src/environments/environment';
import { SERVICE } from '../constants';
import { AjaxService } from './ajax.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalaryDeclarationHttpService extends AjaxService {
  constructor(tokenHelper: JwtService, http: HttpClient) {
    super(tokenHelper, http, SERVICE.SALARYDECLARATION);
 }

  private GetUrl(Url: string) {
    if (environment.production) {
      return `${environment.baseDotNetUrl}api/${SERVICE.SALARYDECLARATION}/${Url}`;
    } else {
      return `https://www.emstum.com/bot/dn/api/${SERVICE.SALARYDECLARATION}/${Url}`;
      // return `${environment.baseDotNetUrl}api/${SERVICE.SALARYDECLARATION}/${Url}`;
    }
  }

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

  // download(Url: string, Param: any) {
  //   return this.http.downloadExcel(this.GetUrl(Url), Param)
  // }

  // GetImageBasePath(): string {
  //   return this.http.GetImageBasePath();
  // }

  // async get(Url: string): Promise<ResponseModel> {
  //   return this.http.get(this.GetUrl(Url));
  // }
}

import {
  HttpClient,
  HttpResponse,
  HttpErrorResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtService, ResponseModel } from 'src/auth/jwtService';
import { environment } from 'src/environments/environment';
import { SERVICE } from '../constants';
import { map, Observable } from 'rxjs';

@Injectable()
export class AjaxService {
  IsTokenByPass: boolean = true;

  constructor(private tokenHelper: JwtService, private http: HttpClient) {
    if (environment.production) {
      console.log(`[Bottomhalf]: BiPortal Running on ${environment.env}`);
    } else {
      console.log('[Bottomhalf]: BiPortal Running on localhost');
    }
  }

  public GetImageBasePath() {
    let ImageBaseUrl = environment.baseDotNetUrl.replace('/core/api', '/Files');
    // let ImageBaseUrl = ("https://www.emstum.com/bot/dn/").replace("/core/api", "/Files");
    ImageBaseUrl = ImageBaseUrl + 'Files/';
    return ImageBaseUrl;
  }

  async login(Url: string, Param: any): Promise<ResponseModel> {
    this.tokenHelper.setCompanyCode(Param.CompanyCode);
    return new Promise((resolve, reject) => {
      this.http
        .post(Url, Param, {
          observe: 'response',
        })
        .subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (this.tokenHelper.IsValidResponse(res.body)) {
                let loginData: ResponseModel = res.body;
                if (this.tokenHelper.setLoginDetail(loginData.ResponseBody)) {
                  resolve(res.body);
                } else {
                  resolve(null);
                }
              } else {
                reject(null);
              }
            } catch (e) {
              reject(e);
            }
            0;
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          },
        });
    });
  }

  async get(Url: string): Promise<ResponseModel> {
    return new Promise((resolve, reject) => {
      return this.http
        .get(Url, {
          observe: 'response',
        })
        .subscribe({
          next: (res: any) => {
            if (this.tokenHelper.IsValidResponse(res.body)) {
              resolve(res.body);
            } else {
              resolve(null);
            }
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          },
        });
    });
  }

  async post(Url: string, Param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(Url, Param, {
          observe: 'response',
        })
        .subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (!this.tokenHelper.IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(null);
            }
            resolve(res.body);
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          },
        });
    });
  }

  async put(Url: string, Param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .put(Url, Param, {
          observe: 'response',
        })
        .subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (!this.tokenHelper.IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(e);
            }
            resolve(res.body);
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          },
        });
    });
  }

  async delete(
    Url: string,
    Param?: any,
    ServiceName: SERVICE = SERVICE.CORE
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .delete(Url, {
          headers: {
            observe: 'response',
          },
          body: Param,
        })
        .subscribe({
          next: (res: any) => {
            try {
              if (!this.tokenHelper.IsValidResponse(res)) {
                reject(null);
              }
            } catch (e) {
              reject(e);
            }
            resolve(res);
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          },
        });
    });
  }

  async upload(
    Url: string,
    Param: any,
    ServiceName: SERVICE = SERVICE.CORE
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(Url, Param, {
          observe: 'response',
        })
        .subscribe({
          next: (res: HttpResponse<any>) => {
            try {
              if (!this.tokenHelper.IsValidResponse(res.body)) {
                reject(null);
              }
            } catch (e) {
              reject(e);
            }
            resolve(res.body);
          },
          error: (e: HttpErrorResponse) => {
            this.tokenHelper.HandleResponseStatus(e);
            reject(e.error);
          },
        });
    });
  }

  async forgotPassword(Url: string, Param: any): Promise<ResponseModel> {
    this.tokenHelper.setCompanyCode(Param.CompanyCode);
    return this.post(Url, Param);
  }

  async postService(Url: string, Param: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .post(Url, Param, {
          observe: 'response',
        })
        .subscribe({
          next: (res: HttpResponse<any>) => {
            resolve(res.body);
          },
          error: (e: HttpErrorResponse) => {
            reject(e.error);
          },
        });
    });
  }

  downloadExcel(Url: string, data: any): Observable<Blob> {
    return this.http.post(Url, data, { responseType: 'blob' }).pipe(
      map((res: Blob) => {
        return res;
      })
    )
  }
}

export interface iconConfig {
  iconName: string;
  fn?: Function;
}

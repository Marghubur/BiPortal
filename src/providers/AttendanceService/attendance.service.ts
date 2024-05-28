import { Injectable } from '@angular/core';
import { CoreHttpService } from '../AjaxServices/core-http.service';
import { ResponseModel } from 'src/auth/jwtService';
import {
  Employee,
  Attendance,
  AttendacePageResponse,
} from 'src/models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private http: CoreHttpService) {}

  private employees: Array<Employee> = [];
  private attendances: Array<Attendance> = [];
  private response: AttendacePageResponse = {
    attendances: [],
    employee: {},
  };

  public async getAttendenceData(data: any): Promise<AttendacePageResponse> {
    var result = await this.http.post(
      'Attendance/GetDailyAttendanceByUserId',
      data
    );

    if (result) {
      if (!result.ResponseBody.EmployeeDetail) {
        throw 'Fail to get employee detail';
      }

      this.response.employee = result.ResponseBody.EmployeeDetail;
      if (result.ResponseBody.DailyAttendances) {
        this.response.attendances = this.getAttendace(
          result.ResponseBody.DailyAttendances
        );
      }
    }

    return this.response;
  }

  private getAttendace(data: Array<Attendance>) {
    if (data && data.length > 0) {
      let index = 0;
      while (index < data.length) {
        data[index].AttendanceDate = new Date(data[index].AttendanceDate);
        if (data[index].IsHoliday) {
          data[index].AttendanceStatus = 4;
          data[index].AttendanceStatus = 4;
        } else if (data[index].IsWeekend) {
          data[index].AttendanceStatus = 3;
          data[index].AttendanceStatus = 3;
        }

        index++;
      }

      return data;
    } else {
      throw 'Unable to bind data';
    }
  }

  public async getAttendaceConfigDetail(employeeId: number): Promise<any> {
    var result = await this.http.get(
      `Attendance/LoadAttendanceConfigData/${employeeId}`
    );

    if (result.ResponseBody) {
    }

    return result.ResponseBody;
  }
}

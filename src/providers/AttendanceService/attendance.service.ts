import { Injectable } from '@angular/core';
import { CoreHttpService } from '../AjaxServices/core-http.service';
import { ResponseModel } from 'src/auth/jwtService';
import {
  Employee,
  Attendance,
  AttendacePageResponse,
  Weeks,
} from 'src/models/interfaces';

@Injectable({
  providedIn: 'root',
})
export class AttendanceService {
  constructor(private http: CoreHttpService) {}

  public async getAttendaceConfigDetail(employeeId: number): Promise<any> {
    var result = await this.http.get(
      `Attendance/LoadAttendanceConfigData/${employeeId}`
    );

    if (result.ResponseBody) {
    }

    return result.ResponseBody;
  }

  public async getSelectedWeekAttendace(week: Weeks): Promise<any> {
    var result = await this.http.post(`Attendance/GetWeeklyAttendanceByUserId`, week);
    if (result.ResponseBody) {
      return result.ResponseBody;
    }
    return null;
  }

  public async saveWeekAttendace(attendances: Array<Attendance>): Promise<any> {
    var result = await this.http.put(`Attendance/SubmitDailyAttendance`, attendances);
    if (result.ResponseBody) {
      return result.ResponseBody;
    }
    return null;
  }
}

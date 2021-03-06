import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private baseUrl: string;
  va_id: any;
  va_tag: any;


  constructor(private http: HttpClient) { 
    this.baseUrl = environment.restApi.uri
   }


  get_all_projects() {
    return this.http.get<any>(
      this.baseUrl + '/project/get_projects'
    );
  }

  get_last_five_projects() {
    return this.http.get<any>(
      this.baseUrl + '/project/get_last_five_projects'
    );
  }

  get_single_project(project_id) {
    return this.http.post<any>(
      this.baseUrl + '/project/get_project', {project_id}
    );
  }

  create_project(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/project/create_project', data
    );
  }

  save_project(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/project/update_project', data
    );
  }



  delete_single_project(project_id) {
    return this.http.post<any>(
      this.baseUrl + '/project/delete_project', {project_id}
    );
  }
}


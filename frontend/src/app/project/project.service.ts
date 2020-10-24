import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment'

@Injectable({
  providedIn: 'root'
})
export class ProjectService {

  private baseUrl: string;
  project_id: any;
  va_tag: any;

  constructor(private http: HttpClient) {
    this.baseUrl = environment.restApi.uri
   }

   get_all_projects() {
    return this.http.get<any>(
      this.baseUrl + '/project/get_projects'
    );
  }

  get_single_project(project_id) {
    return this.http.post<any>(
      this.baseUrl + '/project/get_project', {project_id}
    );
  }

  save_project(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/project/update_project', data
    );
  }

  
   create_project(data: any) {
    return this.http.post<any>(
      this.baseUrl + '/project/create_project', data
    );
  }

  get_vas_for_project(project_id: number) {
    return this.http.post<any>(
      this.baseUrl + '/va/get_vas_for_project', {project_id}
    );
  }

  delete_single_project(project_id) {
    return this.http.post<any>(
      this.baseUrl + '/va/delete_va', {project_id}
    );
  }

//   get_all_vas() {
//     return this.http.get<any>(
//      this.baseUrl + '/va/get_vas'
//    );
//  }

 delete_single_va(va_id, va_tag, project_id) {
  return this.http.post<any>(
    this.baseUrl + '/va/delete_va', {va_id, va_tag, project_id}
  );
 }


//  add_va_tag(va_tag) {
//   this.va_tag = va_tag;
//  //  console.log(va_tag)
// }

// get_va_tag() {
//  return this.va_tag;
// }

add_project_id(va_id) {
 this.project_id = va_id;
}

get_project_id() {
return this.project_id;
}




  
}

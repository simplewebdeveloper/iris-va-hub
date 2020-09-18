import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserLogin } from "../../models/user.model";
import { AuthService } from "../../auth/auth.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userLogin: UserLogin;
  userLoginForm: FormGroup;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
  ) {
    this.userLogin = new UserLogin();
   }

  ngOnInit():void {
    this.initializeUserLoginForm();
  }


  initializeUserLoginForm(): void {
    this.userLoginForm = this.formBuilder.group({
      username: [this.userLogin.username, Validators.required],
      password: [this.userLogin.password, Validators.required],
    })
  }

  userLoginFormSubmit() {
    const data = this.userLoginForm.getRawValue();
    // console.log(data);
    this.authService.login(data);
  }

}

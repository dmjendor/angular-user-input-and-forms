import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  AbstractControl,
  EmailValidator,
  Form,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { debounceTime, Observable, of } from 'rxjs';

function mustContainQuestionMark(control: AbstractControl) {
  if (control.value.includes('?')) {
    return null;
  }
  return { doesNotContainQuestionMark: true };
}

function asyncEmailIsUnique(control: AbstractControl) {
  if (control.value !== 'test@example.com') {
    return of(null);
  }

  return of({ notUnique: true });
}

// Initialize and preload the value  in typescript outside the component
let initialEmailValue = '';
const savedForm = window.localStorage.getItem('saved-login-from');
if (savedForm) {
  const loadedForm = JSON.parse(savedForm);
  initialEmailValue = loadedForm.email;
}
@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrl: './login.component.css',
  imports: [ReactiveFormsModule],
})
export class LoginComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  loginForm = new FormGroup({
    email: new FormControl(initialEmailValue, {
      validators: [Validators.email, Validators.required],
    }),
    password: new FormControl('', {
      validators: [
        Validators.required,
        Validators.minLength(6),
        mustContainQuestionMark,
      ],
      asyncValidators: [asyncEmailIsUnique],
    }),
  });

  get emailIsInvalid() {
    return (
      this.loginForm.controls.email.touched &&
      this.loginForm.controls.email.dirty &&
      this.loginForm.controls.email.invalid
    );
  }

  get passwordIsInvalid() {
    return (
      this.loginForm.controls.password.touched &&
      this.loginForm.controls.password.dirty &&
      this.loginForm.controls.password.invalid
    );
  }

  ngOnInit(): void {
    // const savedForm = window.localStorage.getItem('saved-login-form');
    // if (savedForm) {
    //   const loadedForm = JSON.parse(savedForm);
    //   this.loginForm.patchValue({ email: loadedForm.email });
    // }

    const subscription = this.loginForm.valueChanges
      .pipe(debounceTime(500))
      .subscribe({
        next: (val) => {
          window.localStorage.setItem(
            'saved-login-form',
            JSON.stringify({ email: val.email })
          );
        },
      });
    this.destroyRef.onDestroy(() => subscription.unsubscribe());
  }

  onSubmit() {
    const enteredEmail = this.loginForm.value.email;
    const enteredPassword = this.loginForm.value.password;
    console.log(enteredEmail, enteredPassword);
  }
}

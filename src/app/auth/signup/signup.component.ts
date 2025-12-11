import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  FormArray,
  AbstractControl,
} from '@angular/forms';
import { debounceTime } from 'rxjs';

function equalValues(controlName1: string, controlName2: string) {
  return (control: AbstractControl) => {
    const val1 = control.get(controlName1)?.value;
    const val2 = control.get(controlName2)?.value;
    if (val1 === val2) {
      return null;
    }
    return { valuesNotEqual: true };
  };
}
@Component({
  selector: 'app-signup',
  standalone: true,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css',
  imports: [ReactiveFormsModule],
})
export class SignupComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  signupForm = new FormGroup({
    email: new FormControl('', {
      validators: [Validators.email, Validators.required],
    }),
    passwords: new FormGroup(
      {
        password: new FormControl('', {
          validators: [Validators.required, Validators.minLength(6)],
        }),
        confirmPassword: new FormControl('', {
          validators: [Validators.required, Validators.minLength(6)],
        }),
      },
      {
        validators: [equalValues('password', 'confirmPassword')],
      }
    ),

    firstName: new FormControl('', {
      validators: [Validators.required],
    }),
    lastName: new FormControl('', {
      validators: [Validators.required],
    }),
    address: new FormGroup({
      addressStreet: new FormControl('', {
        validators: [Validators.required],
      }),
      addressNumber: new FormControl('', {
        validators: [Validators.required],
      }),
      addressPostalCode: new FormControl('', {
        validators: [Validators.required],
      }),
      addressCity: new FormControl('', {
        validators: [Validators.required],
      }),
    }),

    role: new FormControl<
      'student' | 'teacher' | 'employee' | 'founder' | 'other'
    >('student', {
      validators: [Validators.required],
    }),
    source: new FormArray([
      new FormControl(false),
      new FormControl(false),
      new FormControl(false),
    ]),
    agree: new FormControl(false, {
      validators: [Validators.required],
    }),
  });

  get emailIsInvalid() {
    return (
      this.signupForm.controls.email.touched &&
      this.signupForm.controls.email.dirty &&
      this.signupForm.controls.email.invalid
    );
  }

  // get passwordIsInvalid() {
  //   return (
  //     this.signupForm.controls.password.touched &&
  //     this.signupForm.controls.password.dirty &&
  //     this.signupForm.controls.password.invalid &&
  //     this.signupForm.controls.password !==
  //       this.signupForm.controls.confirmPassword
  //   );
  // }

  // get passwordsDontMatch() {
  //   return (
  //     this.signupForm.controls.confirmPassword.touched &&
  //     this.signupForm.controls.confirmPassword.dirty &&
  //     this.signupForm.controls.confirmPassword.invalid &&
  //     this.signupForm.controls.password !==
  //       this.signupForm.controls.confirmPassword
  //   );
  // }

  ngOnInit(): void {
    const savedForm = window.localStorage.getItem('saved-login-form');
    if (savedForm) {
      const loadedForm = JSON.parse(savedForm);
      this.signupForm.patchValue({ email: loadedForm.email });
    }

    const subscription = this.signupForm.valueChanges
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
    if (this.signupForm.invalid) {
      console.log('INVALID FORM');
      return;
    }
    // const enteredEmail = this.signupForm.value.email;
    // const enteredPassword = this.signupForm.value.password;
    // console.log(enteredEmail, enteredPassword);
    console.log(this.signupForm);
  }

  onReset() {
    this.signupForm.reset();
  }
}

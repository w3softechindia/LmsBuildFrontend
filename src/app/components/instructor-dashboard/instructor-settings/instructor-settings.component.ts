import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, AbstractControl } from '@angular/forms';
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';
import { Employee } from 'src/app/Models/Employee';
import { AuthService } from 'src/app/auth/auth.service';
import { EmployeeService } from 'src/app/employee.service';

@Component({
  selector: 'app-instructor-settings',
  templateUrl: './instructor-settings.component.html',
  styleUrls: ['./instructor-settings.component.scss']
})
export class InstructorSettingsComponent implements OnInit {
  employeeForm: FormGroup;
  resetPasswordForm: FormGroup;
  employee: Employee;
  employeeId: string;
  textcolor: string;
  popupMessage: string | null = null;
  popupIcon: SafeHtml;
  popupTitle: string = '';
  popupType: string = '';
  tickIcon: SafeHtml;
  errorIcon: SafeHtml;
  isSuccess: boolean;

  constructor(
    private auth: AuthService,
    private employeeService: EmployeeService,
    private fb: FormBuilder,
    private sanitizer: DomSanitizer
  ) {
    this.tickIcon = this.sanitizer.bypassSecurityTrustHtml('&#x2713;');
    this.errorIcon = this.sanitizer.bypassSecurityTrustHtml('&#10008;');
  }

  ngOnInit(): void {
    this.employeeForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      employeeEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', Validators.required],
    });

    this.resetPasswordForm = this.fb.group(
      {
        currentPassword: ['', [Validators.required, Validators.minLength(8)]],
        newPassword: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern('^(?=.*[A-Z])(?=.*\\d).+$'), // Ensure at least one uppercase letter and one numeric digit
          ],
        ],
        confirmPassword: ['', Validators.required],
      },
      { validators: this.passwordMatchValidator }
    );

    this.employeeId = this.auth.getEmployeeId();
    this.getEmployeeDetails();
  }

  getEmployeeDetails() {
    this.employeeService.getEmployeeDetails(this.employeeId).subscribe(
      (res: Employee) => {
        this.employee = res;
        this.employeeForm.patchValue({
          firstName: this.employee.firstName,
          lastName: this.employee.lastName,
          address: this.employee.address,
          employeeEmail: this.employee.employeeEmail,
          phoneNumber: this.employee.phoneNumber,
        });
      },
      (error: any) => {
        console.log(error);
        this.showError('Failed to load employee details.');
      }
    );
  }

  updateEmployee() {
    this.employee = this.employeeForm.value;
    this.employeeService.updateEmployeeDetails(this.employeeId, this.employee).subscribe(
      (res: any) => {
        this.employee = res;
        console.log('admin details', this.employee);
        this.showSuccess('Profile updated successfully..!!');
      },
      (error: any) => {
        console.log(error);
        this.showError('Failed to update profile..!!');
      }
    );
  }

  // Reset password
  resetPassword(): void {
    if (this.resetPasswordForm.valid) {
      const { currentPassword, newPassword, confirmPassword } =
        this.resetPasswordForm.value;
      if (newPassword === confirmPassword) {
        this.employeeService
          .resetPassword(this.employeeId, currentPassword, newPassword)
          .subscribe(
            () => {
              this.showSuccess('Password has been reset successfully.');
            },
            (error) => {
              this.showError(
                'Failed to reset password. Please try again later.'
              );
            }
          );
      } else {
        this.showError('New password and Confirm password must be the same');
      }
    } else {
      this.showError('Reset form values are invalid, please fill out correctly');
    }
  }

  showError(message: string) {
    this.popupType = 'error';
    this.popupIcon = this.errorIcon;
    this.popupTitle = 'Error';
    this.popupMessage = message;
    this.textcolor = 'red';
    this.isSuccess = false;
  }

  showSuccess(message: string) {
    this.popupType = 'success';
    this.popupIcon = this.tickIcon;
    this.popupTitle = 'Success';
    this.popupMessage = message;
    this.textcolor = '#1bbf72';
    this.isSuccess = true;
  }

  closePopup() {
    if (this.popupMessage === 'Your Password has been successfully updated , Thanks!') {
      this.resetPasswordForm.reset();
    }
    if (this.popupMessage === 'Your Details have been successfully updated, Thanks!') {
      this.employeeForm.reset();
    }
    this.popupMessage = null;
  }

  private passwordMatchValidator(control: AbstractControl) {
    const newPassword = control.get('newPassword');
    const confirmPassword = control.get('confirmPassword');
    if (!newPassword || !confirmPassword) {
      return null;
    }
    return newPassword.value === confirmPassword.value
      ? null
      : { mismatch: true };
  }
}

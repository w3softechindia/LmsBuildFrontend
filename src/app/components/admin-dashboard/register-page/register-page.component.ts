import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { EmployeeService } from 'src/app/employee.service';
import { Employee } from 'src/app/Models/Employee';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';



@Component({
  selector: 'app-register-page',
  templateUrl: './register-page.component.html',
  styleUrls: ['./register-page.component.scss']
})
export class RegisterPageComponent implements OnInit {
  registerForm: FormGroup;
  employee:Employee=new Employee();
  roleName:string;
  password:string;
  confirmPassword:string;
  popupMessage:string | null = null;
  textcolor:string;
  popupIcon: SafeHtml;
  popupTitle: string = '';
  popupType: string = '';
  tickIcon: SafeHtml;
  errorIcon:SafeHtml;
  isSuccess:boolean;
  emailStatus:boolean=false;
  webMailStatus:boolean=false;
  phoneNumberStatus:boolean=false;

  existingEmails = ['mailto:test@example.com', 'mailto:example@test.com'];
  existingPhoneNumbers = [911234567890, 919876543210];
  existingWebMails = ['mailto:webmail1@example.com', 'mailto:webmail2@example.com'];
  // existingWebMails: string[];
  // existingPhoneNumbers: number[];
  constructor(
    private fb: FormBuilder,
    private employeeService: EmployeeService,
    private sanitizer: DomSanitizer
  ) {
    this.tickIcon = this.sanitizer.bypassSecurityTrustHtml('&#x2713;'); 
    this.errorIcon = this.sanitizer.bypassSecurityTrustHtml('&#10008;');
    
  }
  

  ngOnInit(): void {
  

    this.getAllEmails();
    this.getAllWebMails();
    this.getAllPhoneNumbers();
    console.log('RegisterPageComponent initialized');
    this.registerForm = this.fb.group({
      employeeId: ['W3S', [Validators.required, Validators.pattern(/^W3S\d{4}$/)]],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      address: ['', Validators.required],
      webMail: ['', [Validators.required, Validators.email]],
      webMailPassword: ['', Validators.required],
      employeeEmail:  ['', [Validators.required, Validators.email]],     
      employeePassword: ['', [Validators.required, Validators.minLength(8), Validators.pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/)]],
      phoneNumber: ['+91', [Validators.required, Validators.pattern(/^\+91\d{10}$/)]],
      role: ['', Validators.required],
      confirmPassword:['',Validators.required]
    }, { validator: this.passwordMatchValidator });
 
  }


  onEmployeeIdInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Ensure "W3S" remains static
    if (!value.startsWith('W3S')) {
      value = 'W3S' + value.replace(/^W3S/, '');
    }

    // Limit the input to 'W3S' followed by 4 digits
    if (value.length > 7) {
      value = value.slice(0, 7);
    }

    input.value = value;
    this.registerForm.get('employeeId')?.setValue(value, { emitEvent: false });
  }

  onEmployeeIdKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;

    // Prevent backspace if the cursor is before or on 'W3S'
    if (event.key === 'Backspace' && input.selectionStart !== null && input.selectionStart <= 3) {
      event.preventDefault();
    }
  }


  onPhoneNumberInput(event: any): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
  
    // Ensure the value starts with +91
    if (!value.startsWith('+91')) {
      value = '+91' + value.replace(/^\+91/, '');
    }
  
    // Restrict the length to 13 characters (+91 and 10 digits)
    if (value.length > 13) {
      value = value.slice(0, 13);
    }
  
    input.value = value;
    this.registerForm.get('phoneNumber')?.setValue(value, { emitEvent: false });
  }
  
  onPhoneNumberKeydown(event: KeyboardEvent): void {
    const input = event.target as HTMLInputElement;
  
    // Prevent backspace if the cursor is at position 3 or less (before or on +91)
    if (event.key === 'Backspace' && input.selectionStart !== null && input.selectionStart <= 3) {
      event.preventDefault();
    }
  }
   
  public hidePassword: boolean[] = [true];
  public togglePassword(index: number) {
    this.hidePassword[index] = !this.hidePassword[index];
  }
  // passwordMatchValidator(form: FormGroup) {
  //   return form.controls['employeePassword'].value === form.controls['confirmPassword'].value ? null : { 'mismatch': true };
  // }

  passwordMatchValidator(form: FormGroup): ValidationErrors | null {
    const password = form.get('employeePassword');
    const confirmPassword = form.get('confirmPassword');
  
    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ mismatch: true });
      return { mismatch: true };
    } else {
      return null;
    }
  }
  
  showError(message: string) {
    this.popupType = 'error';
   this.popupIcon=this.errorIcon;
    this.popupTitle = 'Error';
    this.popupMessage = message;
    this.textcolor= 'red';
    this.isSuccess=false;
  }

  showSuccess(message: string) {
    this.popupType = 'success';
    this.popupIcon=this.tickIcon;
    this.popupTitle = 'Success';
    this.popupMessage = message;
   this.textcolor= '#1bbf72';
   this.isSuccess=true;
  }
  closePopup() {
    this.popupMessage = null;
  }
  
  addEmployee() {
    if (this.registerForm.valid && !this.emailStatus && !this.webMailStatus && !this.phoneNumberStatus) {
      const employee = this.registerForm.value;
      const password = this.registerForm.value.employeePassword;
      const cPassword = this.registerForm.value.confirmPassword;
      console.log(employee);
      const roleName = employee.role;
      console.log(roleName);
      this.employeeService.addEmployee(employee, roleName).subscribe(
        (data) => {
          this.showSuccess("Employee Registered successfully, Thanks!");
          console.log('Employee Registered success..!!!', data);
          this.registerForm.reset();
          this.getAllEmails();
          this.getAllWebMails();
          this.getAllPhoneNumbers();
        },
        (error) => {
          console.log(error);
        }
      );
    } else {
      this.showError("Please fill the RegisterForm with correct values");
      console.log(this.registerForm.errors);
    }
  }
    validatePassword() {
      const passwordControl = this.registerForm.get('employeePassword');
      if (passwordControl) {
        if (passwordControl.dirty || passwordControl.touched) {
          passwordControl.updateValueAndValidity();
        }
      }
    }
      validateEmail():boolean{
        const emailControl = this.registerForm.get('employeeEmail');
        if (emailControl) {
          emailControl.updateValueAndValidity(); // Trigger validation
        }
        const email=this.registerForm?.get('employeeEmail')?.value;
        let result=false; 
        this.employeeService.checkDuplicateEmail(email).subscribe(
            (data:any)=>{
              result=data;
              this.emailStatus=data;
              console.log("validateEmail method",result);
              console.log(this.registerForm.get('email')?.errors);
              return result;
            },
          (error:any)=>{
            console.log(error);
          }
          );
          this.emailStatus=result;
          return result;
      }
      
      validateWebMail():boolean{
        const webMail=this.registerForm?.get('webMail')?.value;
        let result=false; 
        this.employeeService.checkDuplicateWebMail(webMail).subscribe(
            (data:any)=>{
              result=data;
              this.webMailStatus=data;
              console.log("validateWebMail method",result);
              return result;
            },
          (error:any)=>{
            console.log(error);
          }
          );
          this.webMailStatus=result;
          return result;
      }
      validatePhoneNumber():boolean{
        const phoneNumber=this.registerForm?.get('phoneNumber')?.value;
        let result=false; 
        this.employeeService.checkDuplicatePhoneNumber(phoneNumber).subscribe(
            (data:any)=>{
              result=data;
              this.phoneNumberStatus=data;
              console.log("validatePhoneNumber method",result);
              return result;
            },
          (error:any)=>{
            console.log(error);
          }
          );
          this.phoneNumberStatus=result;
          return result;
      }
      
      private getAllEmails(){
        this.employeeService.getAllEmails().subscribe(
          (data:any)=>{
            this.existingEmails=data;
            
             //console.log(this.existingEmails);
          },
          (error:any)=>{
            console.log(error);
          }
        );
      }  
      private getAllWebMails(){
        this.employeeService.getAllWebMails().subscribe(
          (data:any)=>{
            this.existingWebMails=data;
            //console.log(this.existingWebMails);
          },
          (error:any)=>{
            console.log(error);
          }
        );
      }
      private getAllPhoneNumbers(){
        this.employeeService.getAllPhoneNumbers().subscribe(
          (data:any)=>{
            this.existingPhoneNumbers=data;
           // console.log(this.existingPhoneNumbers);
          },
          (error:any)=>{
            console.log(error);
          }
        );
      } 
  get formControls(): { [key: string]: AbstractControl } {
    return this.registerForm.controls;
  }
  }



interface Role {
  roleName: string;
}
function Directive(arg0: { selector: string; }): (target: typeof RegisterPageComponent) => void | typeof RegisterPageComponent {
  throw new Error('Function not implemented.');
}

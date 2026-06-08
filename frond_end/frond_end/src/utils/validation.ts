interface ValidationErrors {
  fullname?: string;
  email?: string;
  password?: string;
}

const Validation = (
  email: string,
  password: string,
  fullname: string = "",
  mode: "register" | "login" = "register"
): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (mode === "register") {
    if (!fullname.trim()) {
      errors.fullname = "Full name is required";
    } else if (!/^[A-Za-z\s]+$/.test(fullname)) {
      errors.fullname = "Name should contain only alphabets";
    }
  }

  // Email Validation
  if (!email.trim()) {
    errors.email = "Email is required";
  } else if (
    !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
  ) {
    errors.email = "Enter a valid email address";
  }

  // Password Validation
  if (!password) {
    errors.password = "Password is required";
  } else if (mode === "register") {
    // Strong password only for register
    if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    } else if (!/[A-Z]/.test(password)) {
      errors.password = "Password must contain at least 1 uppercase letter";
    } else if (!/[a-z]/.test(password)) {
      errors.password = "Password must contain at least 1 lowercase letter";
    } else if (!/[0-9]/.test(password)) {
      errors.password = "Password must contain at least 1 number";
    }
  }

  return errors;
};

export default Validation;
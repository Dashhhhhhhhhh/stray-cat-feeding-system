const { hashPassword, comparePassword } = require("../../utils/password.js");
const {
  normalizeEmail,
  normalizeMiddleInitial,
  cleanString,
} = require("../../helpers.js");

const { generateToken } = require("../../utils/jwt.js");
const { compare } = require("bcrypt");

const {
  createUser,
  findUserByEmail,
  findRoleByName,
  findUserProfile,
} = require("./auth.repository");

async function registerAuthService(userData) {
  const {
    first_name,
    middle_initial,
    last_name,
    password,
    email,
    role_id,
    role_name,
  } = userData;

  const firstName = cleanString(first_name);
  const middleInitial = normalizeMiddleInitial(middle_initial);
  const lastName = cleanString(last_name);
  const emailAdd = normalizeEmail(email);

  if (!firstName || !lastName || !password || !emailAdd || !role_name) {
    return { success: false, message: "All required fields must be provided." };
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  if (!passwordRegex.test(password)) {
    return {
      success: false,
      message:
        "Password must be at least 8 characters and include uppercase, lowercase, number, and special character.",
    };
  }

  const existingUser = await findUserByEmail(emailAdd);
  if (existingUser) {
    return {
      success: false,
      code: "DUPLICATE_EMAIL",
      message: "Email already in use.",
    };
  }

  const existingRoles = await findRoleByName(role_name);
  if (!existingRoles) {
    return {
      success: false,
      code: "ROLE_NOT_FOUND",
      message: "Role not found.",
    };
  }

  const password_hash = await hashPassword(password);

  const user = await createUser({
    first_name: firstName,
    middle_initial: middleInitial,
    last_name: lastName,
    password_hash,
    email: emailAdd,
    role_id: existingRoles.role_id,
  });

  return {
    success: true,
    message: "User registered successfully",
    data: {
      id: user.id,
      email: user.email,
      role: existingRoles.role_name,
    },
  };
}

async function loginAuthService(userData) {
  const { email, password } = userData;

  const emailAdd = normalizeEmail(email);

  if (!emailAdd || !password) {
    return {
      success: false,
      code: "VALIDATION_ERROR",
      message: "Please enter required fields.",
    };
  }

  const user = await findUserByEmail(emailAdd);
  if (!user) {
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  console.log("login user:", user);
  const validPassword = await comparePassword(password, user.password_hash);
  if (!validPassword) {
    return {
      success: false,
      code: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  const token = generateToken({
    id: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    message: "Login Successful",
    data: {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
      token,
    },
  };
}

async function getMeService(id) {
  const user = await findUserProfile(id);
  if (!user) {
    return {
      success: false,
      code: "PROFILE_NOT_FOUND",
      message: "Authenticated user not found.",
    };
  }

  return {
    success: true,
    code: "USER_FOUND",
    message: "User profile retrieved successfully.",
    data: user,
  };
}

module.exports = {
  registerAuthService,
  loginAuthService,
  getMeService,
};

export interface LoginDTO {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "CUSTOMER";
  };
}

export interface RegisterDTO {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "CUSTOMER";
}

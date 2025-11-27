import { User } from "../types";
import jwt from "jsonwebtoken";

export class AuthService {
  async register(data: any) {
    // User model hook handles hashing
    const user = await User.create(data);
    return this.generateToken(user);
  }

  async login(data: any) {
    const user = await User.findOne({ where: { email: data.email } });
    if (!user || !(await user.validatePassword(data.password))) {
      throw new Error("Invalid Credentials");
    }
    return this.generateToken(user);
  }

  private generateToken(user: User) {
    const payload = { id: user.id, role: user.role };
    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET || "super_secret_key_change_me",
      { expiresIn: "1d" }
    );

    return {
      token,
      user: { id: user.id, email: user.email, role: user.role },
    };
  }
}

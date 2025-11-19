// src/middlewares/auth.js
import { verifyAccessToken } from "../utils/jwtUtils.js";
import { UserModel } from "../models/index.js";
import { unauthorized } from "../utils/response.js";

export const protectRoute = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return unauthorized(res, "Không tìm thấy token!");
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    const user = await UserModel.findById(decoded.userId);
    if (!user || user.status !== "active") {
      return unauthorized(res, "Tài khoản không hợp lệ!");
    }

    req.user = {
      id: user.id,
      username: user.username,
      role: user.role,
    };

    next();
  } catch (err) {
    return unauthorized(res, "Token không hợp lệ hoặc đã hết hạn!");
  }
};

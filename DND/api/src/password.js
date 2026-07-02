import bcrypt from "bcryptjs";

export function dndHashPassword(plain) {
  return bcrypt.hashSync(String(plain), 10);
}

export function dndVerifyPassword(plain, hash) {
  return bcrypt.compareSync(String(plain), hash);
}

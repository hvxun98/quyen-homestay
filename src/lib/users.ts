import User from 'models/User';

/** Trả về _id của user theo email. Tuỳ ý: autoCreate = true để tự tạo user nếu chưa có. */
export async function getUserIdByEmail(email: string, name?: string, autoCreate = true) {
  const normalized = email.trim().toLowerCase();
  let u = await User.findOne({ email: normalized }).select('_id');
  if (!u && autoCreate) {
    u = await User.create({ email: normalized, name });
  }
  return u?._id ?? null;
}

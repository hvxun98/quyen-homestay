import Counter from 'models/CounterBase';

/**
 * Lấy số thứ tự tiếp theo cho 1 key
 * @param key string (vd: "booking", "order", "house:123:booking")
 * @returns number (seq mới)
 */
export async function nextSeq(key: string) {
  const doc = await Counter.findOneAndUpdate({ key }, { $inc: { seq: 1 } }, { new: true, upsert: true, setDefaultsOnInsert: true }).lean();

  return doc.seq;
}

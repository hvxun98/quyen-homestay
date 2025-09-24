import Counter from 'models/Counter';

export async function nextSeqByHouse(houseId: string) {
  const doc = await Counter.findOneAndUpdate(
    { houseId },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  ).lean();
  return doc.seq;
}

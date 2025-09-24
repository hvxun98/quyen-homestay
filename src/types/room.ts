export type RoomGroup = {
  houseId: string;
  houseLabel: string; // ví dụ: "690 Lạc Long Quân"
  rooms: { _id: string; label: string }[];
};

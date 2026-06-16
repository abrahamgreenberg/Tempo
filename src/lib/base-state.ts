import { Time } from "./utils"

export const baseInitialState = {
  columns: {
    "1a2b3c4d5e6f7g8h9i0j": {
      id: "1a2b3c4d5e6f7g8h9i0j",
      name: "Morning",
      startTime: new Time(9, 0),
      endTime: new Time(12, 0),
      position: 0,
      date: "2025-01-01",
    },

    "2k3l4m5n6o7p8q9r0s1t": {
      id: "2k3l4m5n6o7p8q9r0s1t",
      name: "Afternoon",
      startTime: new Time(14, 0),
      endTime: new Time(17, 0),
      position: 1,
      date: "2025-01-01",
    },

    "3u4v5w6x7y8z9a0b1c2d": {
      id: "3u4v5w6x7y8z9a0b1c2d",
      name: "Evening",
      startTime: new Time(18, 0),
      endTime: new Time(20, 0),
      position: 2,
      date: "2025-01-01",
    },
  },

  items: {
    abc1def2ghi3jkl4mno5: {
      id: "abc1def2ghi3jkl4mno5",
      name: "Morning Routine",
      durationMinutes: 60,
    },

    ghi2jkl3mno4pqr5stu6: {
      id: "ghi2jkl3mno4pqr5stu6",
      name: "Wrap-up",
      durationMinutes: 30,
    },

    pqr6stu7vwx8yz9abc0def: {
      id: "pqr6stu7vwx8yz9abc0def",
      name: "Study Block",
      durationMinutes: 120,
    },
  },

  itemLinks: {
    abc1def2ghi3jkl4mno5: {
      itemId: "abc1def2ghi3jkl4mno5",
      columnId: "1a2b3c4d5e6f7g8h9i0j",
      position: 0,
    },

    ghi2jkl3mno4pqr5stu6: {
      itemId: "ghi2jkl3mno4pqr5stu6",
      columnId: "2k3l4m5n6o7p8q9r0s1t",
      position: 0,
    },

    pqr6stu7vwx8yz9abc0def: {
      itemId: "pqr6stu7vwx8yz9abc0def",
      columnId: "3u4v5w6x7y8z9a0b1c2d",
      position: 0,
    },
  },
}

export type BaseInitialState = typeof baseInitialState

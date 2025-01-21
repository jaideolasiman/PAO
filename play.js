const user = require("./models/user");

const users = [
  {
    _id: "6767500ef7b3e10b454ead93",
    role: "farmer",
    firstName: "Jaide",
    lastName: "Rian",
    email: "jaideolasiman@gmail.com",
    password: "$2b$10$fnk8.Paq3lmVI7vwYQt8Ie2tWQzlnEFP32deUhKnq98sE5rfxce/O",
    phoneNumber: "09123456789",
    gender: "male",
    isVerified: true,
    createdAt: {
      $date: "2024-12-21T23:32:30.078Z",
    },
    updatedAt: {
      $date: "2024-12-21T23:32:45.074Z",
    },
  },
  { user: "2" },
];

// console.log(a === 'b' ? '1': '2')
// console.log(a ?? 'godoy')
console.log("users", users[0]._id);

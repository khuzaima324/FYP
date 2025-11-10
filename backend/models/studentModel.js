// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const studentSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     rollNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     department: {
//       type: String,
//       required: true,
//     },
//     semester: {
//       type: String,
//       required: true,
//     },
//     section: {
//       type: String,
//       required: true,
//       // enum: ["Morning", "Evening"], // only these two allowed
//     },
//     password: {
//       type: String,
//       required: true,
//       // minlength: 6,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Encrypt password before saving
// studentSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Optional: helper to match passwords (for login later)
// studentSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// const Student = mongoose.model("Student", studentSchema);
// export default Student;

// import mongoose from "mongoose";
// import bcrypt from "bcryptjs";

// const studentSchema = new mongoose.Schema(
//   {
//     name: {
//       type: String,
//       required: true,
//     },
//     rollNumber: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     department: {
//       type: String,
//       required: true,
//     },
//     semester: {
//       type: String,
//       required: true,
//     },
//     section: {
//       type: String,
//       required: true,
//     },
//     password: {
//       type: String,
//       required: true,
//     },

//     // 🧑‍🏫 New field for supervisor assignment
//     supervisor: {
//       type: String,
//       // ref: "Teacher",
//       default: null,
//     },

//     // 👥 New field for group assignment
//     group: {
//       type: String,
//       // ref: "Group",
//       default: null,
//     },
//   },
//   {
//     timestamps: true,
//   }
// );

// // Encrypt password before saving
// studentSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   const salt = await bcrypt.genSalt(10);
//   this.password = await bcrypt.hash(this.password, salt);
//   next();
// });

// // Helper function to match passwords
// studentSchema.methods.matchPassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

// // const Student = mongoose.model("Student", studentSchema);
// const Student = mongoose.models.Student || mongoose.model("Student", studentSchema);
// export default Student;


// models/studentModel.js

import mongoose from "mongoose";

const studentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    department: {
      type: String,
      required: true,
    },
    semester: {
      type: String,
      required: true,
    },
    section: {
      type: String,
      required: true,
    },
    session: {
      type: String,
      required: true,
      trim: true,
    },
    // This links the student profile to their login account (from userModel.js)
    // Your studentController.js *depends* on this field.
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: false,
      ref: "User",
    },

    // Stores the Teacher's ID
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      default: null,
    },

    // Stores the group name as a string
    group: {
      type: String,
      trim: true,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Note: All password hashing logic (pre-save hook, etc.)
// belongs in your 'userModel.js', not here.

// Use this pattern to prevent errors during development (hot-reloading)
const Student =
  mongoose.models.Student || mongoose.model("Student", studentSchema);

export default Student;
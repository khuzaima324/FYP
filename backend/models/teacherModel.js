// import mongoose from "mongoose";

// const teacherSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     department: { type: String, required: true },
//     // subject: { type: String, required: true },
//   },
//   { timestamps: true }
// );

// const Teacher = mongoose.model("Teacher", teacherSchema);
// export default Teacher;
// models/teacherModel.js
// models/teacherModel.js


import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    // ✅ ADD THIS FIELD
    empId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Teacher = mongoose.models.Teacher || mongoose.model("Teacher", teacherSchema);
export default Teacher;
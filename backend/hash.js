import bcrypt from "bcryptjs";

const createHash = async () => {
  const newPassword = "admin123"; // Choose your new temporary password
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(newPassword, salt);

  console.log("Your new hash is:");
  console.log(hash);
};

createHash();
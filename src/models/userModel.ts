import mongoose from 'mongoose'

export interface IUser {
  username: string;
  password: string;
  email: string;
}

const UserSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  email: {
    type : String,
    required: true
  }
});

export const UserModel = mongoose.model('users', UserSchema);
import mongoose from 'mongoose'
import { CompanySchema, ICompany } from './companyModel';

export interface IUser {
  username: string;
  password: string;
  email: string;
  verified: boolean;
  company: ICompany;
}

export const UserSchema = new mongoose.Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type : String, required: true },
  verified: { type: Boolean, default: false },
  company: { type: CompanySchema, required: true }
});

export const UserModel = mongoose.model('users', UserSchema);
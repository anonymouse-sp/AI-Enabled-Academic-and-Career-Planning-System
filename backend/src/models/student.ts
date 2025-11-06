import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IStudent extends Document {
  email: string;
  password: string;
  name: {
    first: string;
    last: string;
  };
  profile: {
    dateOfBirth: Date;
    phone?: string;
    address?: string;
    education: {
      level: string;
      institution: string;
      year: number;
      grade: string;
    }[];
  };
  interests: string[];
  savedColleges: mongoose.Types.ObjectId[];
  applications: {
    college: mongoose.Types.ObjectId;
    status: 'pending' | 'accepted' | 'rejected';
    appliedDate: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const studentSchema = new Schema<IStudent>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    name: {
      first: {
        type: String,
        required: true,
        trim: true,
      },
      last: {
        type: String,
        required: true,
        trim: true,
      },
    },
    profile: {
      dateOfBirth: {
        type: Date,
        required: true,
      },
      phone: String,
      address: String,
      education: [{
        level: {
          type: String,
          required: true,
        },
        institution: {
          type: String,
          required: true,
        },
        year: {
          type: Number,
          required: true,
        },
        grade: {
          type: String,
          required: true,
        },
      }],
    },
    interests: [{
      type: String,
    }],
    savedColleges: [{
      type: Schema.Types.ObjectId,
      ref: 'College',
    }],
    applications: [{
      college: {
        type: Schema.Types.ObjectId,
        ref: 'College',
        required: true,
      },
      status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending',
      },
      appliedDate: {
        type: Date,
        default: Date.now,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
studentSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
studentSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export const Student = mongoose.model<IStudent>('Student', studentSchema);
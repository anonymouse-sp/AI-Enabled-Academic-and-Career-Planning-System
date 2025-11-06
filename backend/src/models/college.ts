import mongoose, { Document, Schema } from 'mongoose';

export interface ICollege extends Document {
  name: string;
  description: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      type: string;
      coordinates: number[];
    };
  };
  established: number;
  website: string;
  contact: {
    email: string;
    phone: string;
  };
  courses: string[];
  facilities: string[];
  accreditation: string[];
  rankings: {
    year: number;
    rank: number;
    organization: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const collegeSchema = new Schema<ICollege>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      coordinates: {
        type: {
          type: String,
          enum: ['Point'],
          default: 'Point',
        },
        coordinates: {
          type: [Number],
          required: true,
        },
      },
    },
    established: {
      type: Number,
      required: true,
    },
    website: {
      type: String,
      required: true,
    },
    contact: {
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    courses: [{
      type: String,
      required: true,
    }],
    facilities: [{
      type: String,
    }],
    accreditation: [{
      type: String,
    }],
    rankings: [{
      year: {
        type: Number,
        required: true,
      },
      rank: {
        type: Number,
        required: true,
      },
      organization: {
        type: String,
        required: true,
      },
    }],
  },
  {
    timestamps: true,
  }
);

// Create geospatial index for location coordinates
collegeSchema.index({ 'location.coordinates': '2dsphere' });

export const College = mongoose.model<ICollege>('College', collegeSchema);
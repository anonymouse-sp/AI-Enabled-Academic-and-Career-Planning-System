export interface College {
  _id: string;
  name: string;
  description?: string;
  type?: string;
  establishedYear?: number;
  isVerified?: boolean;
  profilePicture?: string;
  location: {
    city: string;
    state: string;
    country: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };
  courses: Array<{
    name: string;
    degree: string;
    duration: string;
    seats?: number;
    eligibility?: string;
  }>;
  fees: {
    tuition: number;
    accommodation: number;
    other: number;
  };
  placements: {
    averagePackage: number;
    highestPackage: number;
    placementRate: number;
    topRecruiters: string[];
  };
  facilities: string[];
  infrastructure: {
    campus: {
      area: number;
      description: string;
    };
    library: boolean;
    sports: boolean;
    laboratory: boolean;
    cafeteria: boolean;
    wifi: boolean;
  };
  rankings: {
    national?: number;
  };
  admissionCriteria: {
    minScore: number;
    entranceExams: string[];
  };
  images: string[];
  campusGallery?: Array<{
    url: string;
    caption: string;
    uploadedAt: string;
    filename: string;
    _id?: string;
  }>;
  website: string;
  contactInfo: {
    email: string;
    phone: string;
    address: string;
  };
  socialMedia?: {
    facebook?: string;
    twitter?: string;
    linkedin?: string;
    instagram?: string;
    youtube?: string;
  };
}

export interface CollegeFilters {
  location?: {
    city?: string;
    state?: string;
    country?: string;
    radius?: number;
  };
  courses?: string[];
  fees?: {
    min?: number;
    max?: number;
  };
  placements?: {
    minPackage?: number;
    minPlacementRate?: number;
  };
  facilities?: string[];
  rankings?: {
    maxNationalRank?: number;
  };
}

export interface SearchResponse {
  colleges: College[];
  total: number;
  page: number;
  limit: number;
}
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/database');
const User = require('./models/User');
const StudentProfile = require('./models/StudentProfile');
const College = require('./models/College');
const CollegeProfile = require('./models/CollegeProfile');
const Application = require('./models/Application');

const app = express();

// Connect to MongoDB
connectDB();

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increase payload limit for base64 images
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure multer for profile picture uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'profile-pictures');
    // Ensure directory exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and user ID
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `profile-${req.user.id}-${uniqueSuffix}${ext}`);
  }
});

// File filter for images only
const fileFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter
});

// Configure multer for campus gallery uploads
const galleryStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, 'uploads', 'campus-gallery');
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    cb(null, 'campus-' + uniqueSuffix + extension);
  }
});

const galleryUpload = multer({
  storage: galleryStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for gallery images
  },
  fileFilter: fileFilter
});

const JWT_SECRET = process.env.JWT_SECRET;

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'College Finder API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

// Debug endpoint to check user database (remove in production)
app.get('/api/users/count', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const studentUsers = await User.countDocuments({ role: 'student' });
    const collegeUsers = await User.countDocuments({ role: 'college' });
    const adminUsers = await User.countDocuments({ role: 'admin' });
    
    res.json({
      message: 'User database statistics',
      totalUsers,
      breakdown: {
        students: studentUsers,
        colleges: collegeUsers,
        admins: adminUsers
      }
    });
  } catch (error) {
    console.error('User count error:', error);
    res.status(500).json({ error: 'Failed to fetch user statistics' });
  }
});

// Create default head admin if doesn't exist
const createDefaultAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ 
      email: 'admin@college-finder.com',
      isHeadAdmin: true 
    });
    
    if (!existingAdmin) {
      const headAdmin = new User({
        name: 'Head Admin',
        email: 'admin@college-finder.com',
        password: 'admin123',
        role: 'admin',
        isHeadAdmin: true,
        status: 'approved'
      });
      
      await headAdmin.save();
      console.log('Default head admin created');
    }
  } catch (error) {
    console.error('Error creating default admin:', error);
  }
};

// Create default head admin on startup
createDefaultAdmin();

// Middleware to verify JWT and extract user
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Middleware to check specific roles
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    // Validate role
    if (!['student', 'college', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role. Only student, college, and admin registrations are allowed.' });
    }

    // Create new user
    const newUser = new User({
      name,
      email,
      password,
      role
    });

    await newUser.save();

    // Students are approved automatically, others need approval
    if (role === 'student') {
      res.json({ 
        message: 'Student registration successful! You can now login.',
        status: 'approved',
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        }
      });
    } else if (role === 'college') {
      res.json({ 
        message: 'College registration submitted successfully. Please wait for admin approval before you can login.',
        status: 'pending'
      });
    } else if (role === 'admin') {
      res.json({ 
        message: 'Admin registration submitted successfully. Please wait for head admin approval before you can login.',
        status: 'pending'
      });
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
});

// Admin endpoint to create new admin (only head admin can do this)
app.post('/api/admin/create-admin', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if current user is head admin
    const currentAdmin = await User.findById(req.user.id);
    if (!currentAdmin || !currentAdmin.isHeadAdmin) {
      return res.status(403).json({ error: 'Only head admin can create new admin accounts' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Create new admin
    const newAdmin = new User({
      name,
      email,
      password, // Will be hashed by the User model pre-save hook
      role: 'admin',
      isHeadAdmin: false,
      status: 'approved'
    });

    await newAdmin.save();

    res.json({ 
      message: 'Admin created successfully',
      user: {
        id: newAdmin._id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role
      }
    });
  } catch (error) {
    console.error('Create admin error:', error);
    res.status(500).json({ error: 'Failed to create admin account' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, expectedRole } = req.body;

    // expectedRole is now mandatory for security
    if (!expectedRole) {
      return res.status(400).json({ error: 'Role specification required for login' });
    }

    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ 
        error: 'User not found',
        message: 'No account found with this email address. Please check your email or sign up for a new account.'
      });
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Invalid password',
        message: 'The password you entered is incorrect. Please check your password and try again.'
      });
    }

    // Strict role validation - users must login through their designated role page
    if (user.role !== expectedRole) {
      return res.status(403).json({ 
        error: `Role mismatch`,
        message: `This account is registered as a ${user.role}. Please use the ${user.role} login page to access your account.`
      });
    }

    // Check if user is approved
    if (user.status === 'pending') {
      const roleMessages = {
        student: 'Your student account is pending approval. Please wait for admin approval before you can login.',
        college: 'Your college registration is pending admin approval. You will receive a notification once approved.',
        admin: 'Your admin account is pending approval from the head administrator. Please wait for approval.'
      };
      
      return res.status(403).json({ 
        error: 'Account pending approval',
        message: roleMessages[user.role] || 'Your account is pending approval. Please wait for admin approval before you can login.'
      });
    }

    if (user.status === 'rejected') {
      return res.status(403).json({ 
        error: 'Account rejected',
        message: 'Your account registration has been rejected. Please contact support for more information or register with different details.'
      });
    }

    // Check if user account is active (not disabled by admin)
    if (user.isActive === false) {
      return res.status(403).json({ 
        error: 'Account disabled',
        message: 'Your account has been disabled by an administrator. Please contact support for assistance.'
      });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Create token
    const token = jwt.sign(
      { 
        id: user._id, 
        email: user.email, 
        role: user.role, 
        isHeadAdmin: user.isHeadAdmin || false 
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isHeadAdmin: user.isHeadAdmin || false
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
});

// Get user profile
app.get('/api/user/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isHeadAdmin: user.isHeadAdmin || false,
      status: user.status,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Admin-only endpoint to get all users
app.get('/api/admin/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    
    const sanitizedUsers = users.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isHeadAdmin: user.isHeadAdmin || false,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin
    }));
    
    res.json({ users: sanitizedUsers });
  } catch (error) {
    console.error('Fetch users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Student and College endpoint to get dashboard stats
// College search endpoint for students
app.get('/api/colleges', async (req, res) => {
  try {
    const { search, city, state, type, minFees, maxFees, page = 1, limit = 10 } = req.query;
    
    let query = { isActive: true };
    
    // Add search filters
    if (search) {
      query.$text = { $search: search };
    }
    
    if (city) {
      query['location.city'] = new RegExp(city, 'i');
    }
    
    if (state) {
      query['location.state'] = new RegExp(state, 'i');
    }
    
    if (type) {
      query.type = type;
    }
    
    if (minFees || maxFees) {
      query['fees.tuition'] = {};
      if (minFees) query['fees.tuition'].$gte = parseInt(minFees);
      if (maxFees) query['fees.tuition'].$lte = parseInt(maxFees);
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const colleges = await College.find(query)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ 'rankings.national': 1 });
    
    const total = await College.countDocuments(query);
    
    res.json({
      colleges,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalColleges: total,
        hasNext: skip + colleges.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('College search error:', error);
    res.status(500).json({ error: 'Failed to search colleges' });
  }
});

app.get('/api/dashboard/stats', authenticateToken, requireRole('student', 'college'), async (req, res) => {
  try {
    // Get dashboard stats from database
    // Count both static colleges and registered college profiles that students can find/interact with
    const staticColleges = await College.countDocuments({ isActive: true });
    const registeredColleges = await CollegeProfile.countDocuments({ isActive: true });
    const totalColleges = staticColleges + registeredColleges;
    const totalStudents = await User.countDocuments({ role: 'student', status: 'approved' });
    
    let profileCompletion = 0;
    
    // Calculate profile completion for students
    if (req.user.role === 'student') {
      const profile = await StudentProfile.findOne({ userId: req.user.id });
      if (profile) {
        profileCompletion = profile.calculateCompletionPercentage();
      }
    }
    
    // Calculate profile completion for colleges
    if (req.user.role === 'college') {
      console.log('Calculating profile completion for college user:', req.user.id);
      const profile = await CollegeProfile.findOne({ userId: req.user.id });
      console.log('Found college profile:', !!profile);
      if (profile) {
        profileCompletion = profile.calculateCompletionPercentage();
        console.log('College profile completion percentage:', profileCompletion);
      } else {
        // No profile exists yet, so completion is 0%
        profileCompletion = 0;
        console.log('No college profile found for user:', req.user.id, '- setting completion to 0%');
      }
    }
    
    // Calculate application counts based on user role
    let applicationStats = {};
    
    if (req.user.role === 'student') {
      // For students: count their own applications
      const myApplications = await Application.countDocuments({ studentId: req.user.id });
      const pendingApplications = await Application.countDocuments({ 
        studentId: req.user.id, 
        status: 'pending' 
      });
      const approvedApplications = await Application.countDocuments({ 
        studentId: req.user.id, 
        status: 'approved' 
      });
      const rejectedApplications = await Application.countDocuments({ 
        studentId: req.user.id, 
        status: 'rejected' 
      });
      
      applicationStats = {
        pendingQueries: myApplications, // Total applications by this student
        totalApplications: myApplications,
        pendingApplications,
        approvedApplications,
        rejectedApplications
      };
    } else if (req.user.role === 'college') {
      // For colleges: count applications to their college
      const collegeProfile = await CollegeProfile.findOne({ userId: req.user.id });
      if (collegeProfile) {
        const totalApplications = await Application.countDocuments({ collegeId: collegeProfile._id });
        const pendingApplications = await Application.countDocuments({ 
          collegeId: collegeProfile._id, 
          status: 'pending' 
        });
        const approvedApplications = await Application.countDocuments({ 
          collegeId: collegeProfile._id, 
          status: 'approved' 
        });
        const rejectedApplications = await Application.countDocuments({ 
          collegeId: collegeProfile._id, 
          status: 'rejected' 
        });
        
        applicationStats = {
          totalApplications,
          pendingApplications,
          approvedApplications,
          rejectedApplications,
          activeStudents: approvedApplications // Use approved applications as active students
        };
      } else {
        applicationStats = {
          totalApplications: 0,
          pendingApplications: 0,
          approvedApplications: 0,
          rejectedApplications: 0,
          activeStudents: 0
        };
      }
    }

    const baseStats = {
      totalColleges,
      totalStudents,
      completedQuizzes: 1, // This would come from user's quiz history
      profileCompletion, // Real profile completion percentage
      ...applicationStats
    };

    res.json(baseStats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Student profile endpoints
app.get('/api/student/profile', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    console.log('Profile GET request from user:', req.user.id);
    
    let profile = await StudentProfile.findOne({ userId: req.user.id }).populate('userId', 'name email');
    
    if (!profile) {
      // Return basic profile if none exists
      const user = await User.findById(req.user.id).select('name email');
      console.log('No existing profile found, returning basic profile for user:', req.user.id);
      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        completionPercentage: 0, // Empty profile has 0% completion
        personalDetails: {
          dateOfBirth: '',
          phoneNumber: '',
          address: '',
          city: '',
          state: '',
          pincode: ''
        },
        educationDetails: {
          currentEducation: '',
          institution: '',
          yearOfStudy: '',
          cgpa: '',
          previousEducation: []
        },
        preferences: {
          interestedStreams: [],
          preferredLocation: [],
          budgetRange: '',
          courseType: ''
        },
        familyDetails: {
          fatherName: '',
          motherName: '',
          fatherOccupation: '',
          motherOccupation: '',
          annualIncome: ''
        },
        additionalInfo: {
          hobbies: [],
          achievements: [],
          extracurriculars: []
        }
      });
    }
    
    console.log('Found existing profile for user:', req.user.id);
    
    // Calculate completion percentage
    const completionPercentage = profile.calculateCompletionPercentage();
    
    // Transform the profile to match frontend expectations
    const profileResponse = {
      id: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : '',
      gender: profile.gender,
      address: profile.address?.street,
      city: profile.address?.city,
      state: profile.address?.state,
      pincode: profile.address?.pincode,
      currentClass: profile.currentClass,
      schoolName: profile.schoolName,
      schoolBoard: profile.schoolBoard,
      previousMarks: profile.previousMarks,
      interestedStreams: profile.interestedStreams || [],
      preferredLocation: profile.preferredLocation || [],
      careerGoals: profile.careerGoals,
      hobbies: profile.hobbies || [],
      fatherName: profile.fatherName,
      motherName: profile.motherName,
      parentOccupation: profile.parentOccupation,
      familyIncome: profile.familyIncome,
      profilePicture: profile.profilePicture,
      profilePictureUrl: profile.profilePicture ? `/uploads/profile-pictures/${profile.profilePicture}` : null,
      completionPercentage: completionPercentage
    };
    
    res.json(profileResponse);
  } catch (error) {
    console.error('Error fetching profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch profile',
      details: error.message 
    });
  }
});

app.put('/api/student/profile', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    console.log('Profile update request from user:', req.user.id);
    console.log('Request body:', req.body);
    
    // Transform frontend data to MongoDB schema structure
    const profileData = {
      phone: req.body.phone,
      dateOfBirth: req.body.dateOfBirth ? new Date(req.body.dateOfBirth) : null,
      gender: req.body.gender,
      address: {
        street: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: 'India'
      },
      currentClass: req.body.currentClass,
      schoolName: req.body.schoolName,
      schoolBoard: req.body.schoolBoard,
      previousMarks: req.body.previousMarks,
      fatherName: req.body.fatherName,
      motherName: req.body.motherName,
      parentOccupation: req.body.parentOccupation,
      familyIncome: req.body.familyIncome,
      interestedStreams: req.body.interestedStreams || [],
      preferredLocation: req.body.preferredLocation || [],
      careerGoals: req.body.careerGoals,
      hobbies: req.body.hobbies || [],
      profilePicture: req.body.profilePicture || null
    };
    
    const existingProfile = await StudentProfile.findOne({ userId: req.user.id });
    console.log('Existing profile found:', !!existingProfile);
    
    let profile;
    if (!existingProfile) {
      // Create new profile
      profile = new StudentProfile({
        ...profileData,
        userId: req.user.id
      });
      await profile.save();
      console.log('Created new profile for user:', req.user.id);
    } else {
      // Update existing profile
      Object.assign(existingProfile, profileData);
      profile = await existingProfile.save();
      console.log('Updated existing profile for user:', req.user.id);
    }
    
    // Also update the user's name if changed
    if (req.body.name) {
      await User.findByIdAndUpdate(req.user.id, { name: req.body.name });
      console.log('Updated user name in User collection');
    }
    
    // Populate the user data for response
    await profile.populate('userId', 'name email');
    
    // Calculate completion percentage for updated profile
    const completionPercentage = profile.calculateCompletionPercentage();
    
    console.log('Profile update successful for user:', req.user.id);
    
    // Transform the updated profile to match frontend expectations
    const profileResponse = {
      id: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      phone: profile.phone,
      dateOfBirth: profile.dateOfBirth ? profile.dateOfBirth.toISOString().split('T')[0] : '',
      gender: profile.gender,
      address: profile.address?.street,
      city: profile.address?.city,
      state: profile.address?.state,
      pincode: profile.address?.pincode,
      currentClass: profile.currentClass,
      schoolName: profile.schoolName,
      schoolBoard: profile.schoolBoard,
      previousMarks: profile.previousMarks,
      interestedStreams: profile.interestedStreams || [],
      preferredLocation: profile.preferredLocation || [],
      careerGoals: profile.careerGoals,
      hobbies: profile.hobbies || [],
      fatherName: profile.fatherName,
      motherName: profile.motherName,
      parentOccupation: profile.parentOccupation,
      familyIncome: profile.familyIncome,
      profilePicture: profile.profilePicture,
      profilePictureUrl: profile.profilePicture ? `/uploads/profile-pictures/${profile.profilePicture}` : null,
      completionPercentage: completionPercentage
    };
    
    res.json({
      message: 'Profile updated successfully',
      profile: profileResponse
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ 
      error: 'Failed to update profile',
      details: error.message 
    });
  }
});

// Upload profile picture endpoint
app.post('/api/student/profile-picture', authenticateToken, requireRole('student'), upload.single('profilePicture'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Profile picture upload request from user:', req.user.id);
    console.log('Uploaded file:', req.file);

    // Find or create student profile
    let profile = await StudentProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      // Create new profile if doesn't exist
      profile = new StudentProfile({
        userId: req.user.id,
        profilePicture: req.file.filename
      });
    } else {
      // Delete old profile picture if exists
      if (profile.profilePicture) {
        const oldPicturePath = path.join(__dirname, 'uploads', 'profile-pictures', profile.profilePicture);
        if (fs.existsSync(oldPicturePath)) {
          fs.unlinkSync(oldPicturePath);
          console.log('Deleted old profile picture:', profile.profilePicture);
        }
      }
      
      // Update with new profile picture
      profile.profilePicture = req.file.filename;
    }

    await profile.save();
    console.log('Profile picture updated successfully for user:', req.user.id);

    // Return the profile picture URL
    const profilePictureUrl = `/uploads/profile-pictures/${req.file.filename}`;
    
    res.json({
      message: 'Profile picture uploaded successfully',
      profilePicture: req.file.filename,
      profilePictureUrl: profilePictureUrl
    });

  } catch (error) {
    console.error('Error uploading profile picture:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({ 
      error: 'Failed to upload profile picture',
      details: error.message 
    });
  }
});

// Delete profile picture endpoint
app.delete('/api/student/profile-picture', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    console.log('Profile picture deletion request from user:', req.user.id);

    // Find student profile
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    
    if (!profile || !profile.profilePicture) {
      return res.status(404).json({ error: 'No profile picture found to delete' });
    }

    // Delete the physical file
    const profilePicturePath = path.join(__dirname, 'uploads', 'profile-pictures', profile.profilePicture);
    try {
      if (fs.existsSync(profilePicturePath)) {
        fs.unlinkSync(profilePicturePath);
        console.log('Deleted profile picture file:', profile.profilePicture);
      }
    } catch (fileError) {
      console.log('Warning: Could not delete profile picture file:', fileError.message);
      // Continue with database update even if file deletion fails
    }

    // Remove profile picture from database
    profile.profilePicture = null;
    await profile.save();

    console.log('Profile picture removed successfully for user:', req.user.id);

    res.json({
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting profile picture:', error);
    res.status(500).json({ 
      error: 'Failed to delete profile picture',
      details: error.message 
    });
  }
});

// Admin-only routes
app.get('/api/admin/pending-registrations', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    console.log(`Admin ${req.user.email} (isHeadAdmin: ${req.user.isHeadAdmin}) fetching pending registrations`);
    const pendingUsers = await User.find({ status: 'pending' }, '-password').sort({ createdAt: -1 });
    
    console.log(`Found ${pendingUsers.length} pending registrations:`);
    pendingUsers.forEach(user => {
      console.log(`  - ${user.name} (${user.email}), role: ${user.role}, created: ${user.createdAt}`);
    });
    
    const pendingRegistrations = pendingUsers.map(user => ({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt
    }));
    
    res.json({ pendingRegistrations });
  } catch (error) {
    console.error('Fetch pending registrations error:', error);
    res.status(500).json({ error: 'Failed to fetch pending registrations' });
  }
});

app.post('/api/admin/approve-registration/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pendingId = req.params.id;
    console.log(`Admin ${req.user.email} attempting to approve registration: ${pendingId}`);
    console.log(`Current admin isHeadAdmin status: ${req.user.isHeadAdmin}`);
    
    const pendingUser = await User.findById(pendingId);

    if (!pendingUser) {
      console.log(`Pending registration not found: ${pendingId}`);
      return res.status(404).json({ error: 'Pending registration not found' });
    }

    console.log(`Found pending user: ${pendingUser.name} (${pendingUser.email}), role: ${pendingUser.role}, status: ${pendingUser.status}`);

    if (pendingUser.status !== 'pending') {
      console.log(`User status is not pending: ${pendingUser.status}`);
      return res.status(400).json({ error: 'User is not pending approval' });
    }
    
    // Check if trying to approve an admin registration - only head admin can do this
    if (pendingUser.role === 'admin' && !req.user.isHeadAdmin) {
      console.log(`Non-head admin ${req.user.email} tried to approve admin registration`);
      return res.status(403).json({ 
        error: 'Only the head admin can approve admin registrations' 
      });
    }
    
    // Update user status to approved
    pendingUser.status = 'approved';
    pendingUser.approvedBy = req.user.id;
    pendingUser.approvedAt = new Date();
    await pendingUser.save();

    // If it's a college user, create a basic college profile so they appear in search
    if (pendingUser.role === 'college') {
      try {
        const existingProfile = await CollegeProfile.findOne({ userId: pendingUser._id });
        if (!existingProfile) {
          console.log('Creating basic college profile for user:', pendingUser.name);
          const basicProfile = new CollegeProfile({
            userId: pendingUser._id,
            collegeName: pendingUser.name,
            description: 'Welcome to our college! We are committed to providing quality education.',
            location: {
              address: 'College Campus Address (Please update in profile)',
              city: 'City Name (Please update)',
              state: 'State Name (Please update)',
              pincode: '000000',
              country: 'India'
            },
            contact: {
              email: pendingUser.email,
              phone: '+91-0000000000',
              website: ''
            },
            type: 'Private',
            courses: [],
            fees: {
              tuition: 0,
              accommodation: 0,
              other: 0
            },
            facilities: [],
            placements: {
              averagePackage: 0,
              highestPackage: 0,
              placementRate: 0,
              topRecruiters: []
            },
            accreditation: [],
            socialMedia: {},
            isActive: true
          });
          await basicProfile.save();
          console.log('✅ Successfully created basic college profile for approved user:', pendingUser.name);
        } else {
          console.log('College profile already exists for user:', pendingUser.name);
        }
      } catch (profileError) {
        console.error('❌ Failed to create college profile for user:', pendingUser.name, 'Error:', profileError);
      }
    }

    const approvedUser = {
      id: pendingUser._id,
      name: pendingUser.name,
      email: pendingUser.email,
      role: pendingUser.role,
      status: pendingUser.status,
      approvedBy: pendingUser.approvedBy,
      approvedAt: pendingUser.approvedAt
    };

    res.json({ message: 'Registration approved successfully', user: approvedUser });
  } catch (error) {
    console.error('Approve registration error:', error);
    res.status(500).json({ error: 'Failed to approve registration' });
  }
});

app.post('/api/admin/reject-registration/:id', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const pendingId = req.params.id;
    console.log(`Admin ${req.user.email} attempting to reject registration: ${pendingId}`);
    console.log(`Current admin isHeadAdmin status: ${req.user.isHeadAdmin}`);
    
    const pendingUser = await User.findById(pendingId);

    if (!pendingUser) {
      console.log(`Pending registration not found: ${pendingId}`);
      return res.status(404).json({ error: 'Pending registration not found' });
    }

    console.log(`Found pending user: ${pendingUser.name} (${pendingUser.email}), role: ${pendingUser.role}, status: ${pendingUser.status}`);

    if (pendingUser.status !== 'pending') {
      console.log(`User status is not pending: ${pendingUser.status}`);
      return res.status(400).json({ error: 'User is not pending approval' });
    }
    
    // Check if trying to reject an admin registration - only head admin can do this
    if (pendingUser.role === 'admin' && !req.user.isHeadAdmin) {
      console.log(`Non-head admin ${req.user.email} tried to reject admin registration`);
      return res.status(403).json({ 
        error: 'Only the head admin can reject admin registrations' 
      });
    }
    
    // Update user status to rejected
    pendingUser.status = 'rejected';
    pendingUser.rejectedBy = req.user.id;
    pendingUser.rejectedAt = new Date();
    await pendingUser.save();

    const rejectedUser = {
      id: pendingUser._id,
      name: pendingUser.name,
      email: pendingUser.email,
      role: pendingUser.role,
      status: pendingUser.status,
      rejectedBy: pendingUser.rejectedBy,
      rejectedAt: pendingUser.rejectedAt
    };

    res.json({ message: 'Registration rejected successfully', rejectedUser });
  } catch (error) {
    console.error('Reject registration error:', error);
    res.status(500).json({ error: 'Failed to reject registration' });
  }
});

// Admin dashboard stats - Enhanced with complete system data
app.get('/api/admin/dashboard/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalColleges = await User.countDocuments({ role: 'college' });
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    const pendingRegistrations = await User.countDocuments({ status: 'pending' });
    const approvedUsers = await User.countDocuments({ status: 'approved' });
    const rejectedUsers = await User.countDocuments({ status: 'rejected' });
    
    // Add total applications count for complete admin visibility
    const totalApplications = await Application.countDocuments();
    const pendingApplications = await Application.countDocuments({ status: 'pending' });
    const approvedApplications = await Application.countDocuments({ status: 'approved' });
    const rejectedApplications = await Application.countDocuments({ status: 'rejected' });
    
    res.json({
      totalUsers,
      totalStudents,
      totalColleges,
      totalAdmins,
      pendingRegistrations,
      approvedUsers,
      rejectedUsers,
      totalApplications,
      pendingApplications,
      approvedApplications,
      rejectedApplications,
      systemHealth: 'Good',
      message: 'Admin has complete access to all system data'
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
  }
});

// Admin endpoint to export user data
app.get('/api/admin/export/users', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { role, format = 'csv' } = req.query;
    console.log(`📊 Admin exporting user data - Role: ${role || 'all'}, Format: ${format}`);
    
    // Build query based on role filter
    let query = {};
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Fetch users with selected fields
    const users = await User.find(query)
      .select('name email role status isActive createdAt collegeName phone location')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // Generate CSV content
      const headers = [
        'Name',
        'Email', 
        'Role',
        'Status',
        'Active',
        'Created Date',
        'College Name',
        'Phone',
        'Location'
      ];
      
      const csvRows = [headers.join(',')];
      
      users.forEach(user => {
        const row = [
          `"${user.name || ''}"`,
          `"${user.email || ''}"`,
          `"${user.role || ''}"`,
          `"${user.status || ''}"`,
          `"${user.isActive ? 'Yes' : 'No'}"`,
          `"${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : ''}"`,
          `"${user.collegeName || ''}"`,
          `"${user.phone || ''}"`,
          `"${user.location || ''}"`
        ];
        csvRows.push(row.join(','));
      });
      
      const csvContent = csvRows.join('\n');
      const filename = `users_export_${role || 'all'}_${new Date().toISOString().split('T')[0]}.csv`;
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.send(csvContent);
      
      console.log(`✅ CSV export completed: ${users.length} users exported`);
    } else {
      // Return JSON format
      res.json({
        exportDate: new Date().toISOString(),
        totalRecords: users.length,
        filter: role || 'all',
        data: users
      });
    }
    
  } catch (error) {
    console.error('❌ Export error:', error);
    res.status(500).json({ error: 'Failed to export user data' });
  }
});

// Admin endpoint to get export summary stats
app.get('/api/admin/export/stats', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const [totalUsers, totalStudents, totalColleges, totalAdmins] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'college' }),
      User.countDocuments({ role: 'admin' })
    ]);
    
    res.json({
      totalUsers,
      totalStudents,
      totalColleges,
      totalAdmins,
      lastExportDate: new Date().toISOString()
    });
  } catch (error) {
    console.error('Export stats error:', error);
    res.status(500).json({ error: 'Failed to fetch export statistics' });
  }
});

// Admin endpoint to create profiles for approved colleges without profiles
app.post('/api/admin/create-college-profiles', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    console.log('Admin request to create profiles for colleges without profiles');
    
    // Find all approved college users
    const approvedColleges = await User.find({ 
      role: 'college', 
      status: 'approved' 
    });
    
    let created = 0;
    let skipped = 0;
    let errors = 0;
    
    for (const college of approvedColleges) {
      try {
        // Check if profile already exists
        const existingProfile = await CollegeProfile.findOne({ userId: college._id });
        
        if (existingProfile) {
          console.log(`Profile already exists for ${college.name}, skipping`);
          skipped++;
          continue;
        }
        
        // Create basic profile
        const basicProfile = new CollegeProfile({
          userId: college._id,
          collegeName: college.name,
          description: 'Welcome to our college! We are committed to providing quality education.',
          location: {
            address: 'College Campus Address (Please update in profile)',
            city: 'City Name (Please update)',
            state: 'State Name (Please update)',
            pincode: '000000',
            country: 'India'
          },
          contact: {
            email: college.email,
            phone: '+91-0000000000',
            website: ''
          },
          type: 'Private',
          courses: [],
          fees: {
            tuition: 0,
            accommodation: 0,
            other: 0
          },
          facilities: [],
          placements: {
            averagePackage: 0,
            highestPackage: 0,
            placementRate: 0,
            topRecruiters: []
          },
          accreditation: [],
          socialMedia: {},
          isActive: true
        });
        
        await basicProfile.save();
        console.log(`✅ Created profile for ${college.name}`);
        created++;
        
      } catch (profileError) {
        console.error(`❌ Failed to create profile for ${college.name}:`, profileError);
        errors++;
      }
    }
    
    res.json({
      message: 'Profile creation process completed',
      results: {
        total: approvedColleges.length,
        created,
        skipped,
        errors
      }
    });
    
  } catch (error) {
    console.error('Create college profiles error:', error);
    res.status(500).json({ error: 'Failed to create college profiles' });
  }
});

// College Profile API endpoints

// Get college profile
app.get('/api/college/profile', authenticateToken, requireRole('college'), async (req, res) => {
  try {
    console.log('College profile GET request from user:', req.user.id);
    
    let profile = await CollegeProfile.findOne({ userId: req.user.id }).populate('userId', 'name email');
    
    if (!profile) {
      // Return basic profile if none exists
      const user = await User.findById(req.user.id).select('name email');
      console.log('No existing college profile found, returning basic profile for user:', req.user.id);
      return res.json({
        id: user._id,
        name: user.name,
        email: user.email,
        completionPercentage: 0,
        collegeName: '',
        description: '',
        location: {
          address: '',
          city: '',
          state: '',
          pincode: '',
          country: 'India'
        },
        contact: {
          phone: '',
          email: user.email,
          website: ''
        },
        establishedYear: '',
        type: '',
        courses: [],
        fees: {
          tuition: 0,
          accommodation: 0,
          other: 0
        },
        facilities: [],
        placements: {
          averagePackage: 0,
          highestPackage: 0,
          placementRate: 0,
          topRecruiters: []
        },
        rankings: {
          national: '',
          international: ''
        },
        accreditation: [],
        images: [],
        profilePicture: '',
        socialMedia: {},
        isVerified: false,
        isActive: true
      });
    }
    
    console.log('Found existing college profile for user:', req.user.id);
    
    // Calculate completion percentage
    const completionPercentage = profile.calculateCompletionPercentage();
    
    // Transform the profile to match frontend expectations
    const profileResponse = {
      id: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      collegeName: profile.collegeName,
      description: profile.description,
      location: profile.location,
      contact: profile.contact,
      establishedYear: profile.establishedYear,
      affiliatedTo: profile.affiliatedTo,
      type: profile.type,
      courses: profile.courses,
      fees: profile.fees,
      facilities: profile.facilities,
      placements: profile.placements,
      rankings: profile.rankings,
      accreditation: profile.accreditation,
      images: profile.images,
      campusGallery: profile.campusGallery || [],
      logo: profile.logo,
      profilePicture: profile.profilePicture,
      socialMedia: profile.socialMedia,
      isVerified: profile.isVerified,
      isActive: profile.isActive,
      completionPercentage: completionPercentage
    };
    
    res.json(profileResponse);
  } catch (error) {
    console.error('Error fetching college profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch college profile',
      details: error.message 
    });
  }
});

// Update college profile
app.put('/api/college/profile', authenticateToken, requireRole('college'), async (req, res) => {
  try {
    console.log('College profile update request from user:', req.user.id);
    console.log('Request body:', req.body);
    
    const profileData = {
      collegeName: req.body.collegeName,
      description: req.body.description,
      location: {
        address: req.body.address,
        city: req.body.city,
        state: req.body.state,
        pincode: req.body.pincode,
        country: req.body.country || 'India'
      },
      contact: {
        phone: req.body.phone,
        email: req.body.email,
        website: req.body.website
      },
      establishedYear: req.body.establishedYear,
      affiliatedTo: req.body.affiliatedTo,
      type: req.body.type,
      courses: req.body.courses || [],
      fees: {
        tuition: req.body.tuition || 0,
        accommodation: req.body.accommodation || 0,
        other: req.body.otherFees || 0
      },
      facilities: req.body.facilities || [],
      placements: {
        averagePackage: req.body.averagePackage || 0,
        highestPackage: req.body.highestPackage || 0,
        placementRate: req.body.placementRate || 0,
        topRecruiters: req.body.topRecruiters || []
      },
      rankings: {
        national: req.body.nationalRanking
      },
      accreditation: req.body.accreditation || [],
      socialMedia: {
        facebook: req.body.facebook,
        twitter: req.body.twitter,
        linkedin: req.body.linkedin,
        instagram: req.body.instagram,
        youtube: req.body.youtube
      },
      profilePicture: req.body.profilePicture
    };
    
    const existingProfile = await CollegeProfile.findOne({ userId: req.user.id });
    console.log('Existing college profile found:', !!existingProfile);
    
    let profile;
    if (!existingProfile) {
      // Create new profile
      console.log('Creating new college profile with data:', profileData);
      profile = new CollegeProfile({
        ...profileData,
        userId: req.user.id
      });
      await profile.save();
      console.log('Successfully created new college profile for user:', req.user.id);
    } else {
      // Update existing profile
      console.log('Updating existing college profile with data:', profileData);
      Object.assign(existingProfile, profileData);
      profile = await existingProfile.save();
      console.log('Successfully updated existing college profile for user:', req.user.id);
    }
    
    // Populate the user data for response
    await profile.populate('userId', 'name email');
    
    // Calculate completion percentage for updated profile
    const completionPercentage = profile.calculateCompletionPercentage();
    
    console.log('College profile update successful for user:', req.user.id);
    
    // Transform the updated profile to match frontend expectations
    const profileResponse = {
      id: profile.userId._id,
      name: profile.userId.name,
      email: profile.userId.email,
      collegeName: profile.collegeName,
      description: profile.description,
      location: profile.location,
      contact: profile.contact,
      establishedYear: profile.establishedYear,
      affiliatedTo: profile.affiliatedTo,
      type: profile.type,
      courses: profile.courses,
      fees: profile.fees,
      facilities: profile.facilities,
      placements: profile.placements,
      rankings: profile.rankings,
      accreditation: profile.accreditation,
      images: profile.images,
      logo: profile.logo,
      profilePicture: profile.profilePicture,
      socialMedia: profile.socialMedia,
      isVerified: profile.isVerified,
      isActive: profile.isActive,
      completionPercentage: completionPercentage
    };
    
    res.json({
      message: 'College profile updated successfully',
      profile: profileResponse
    });
  } catch (error) {
    console.error('Error updating college profile:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
      errors: error.errors // Mongoose validation errors
    });
    
    // Handle specific error types
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        details: validationErrors.join(', ')
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to update college profile',
      details: error.message 
    });
  }
});

// Delete college profile picture endpoint
app.delete('/api/college/profile-picture', authenticateToken, requireRole('college'), async (req, res) => {
  try {
    console.log('College profile picture deletion request from user:', req.user.id);

    // Find college profile
    const profile = await CollegeProfile.findOne({ userId: req.user.id });
    
    if (!profile || !profile.profilePicture) {
      return res.status(404).json({ error: 'No profile picture found to delete' });
    }

    // Since college profile pictures are base64 data URLs, we just clear the field
    // No physical file to delete in this case
    profile.profilePicture = '';
    await profile.save();

    console.log('College profile picture removed successfully for user:', req.user.id);

    res.json({
      message: 'Profile picture deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting college profile picture:', error);
    res.status(500).json({ 
      error: 'Failed to delete profile picture',
      details: error.message 
    });
  }
});

// Campus Gallery Management Endpoints

// Upload campus gallery images
app.post('/api/college/campus-gallery', authenticateToken, requireRole('college'), galleryUpload.array('galleryImages', 10), async (req, res) => {
  try {
    console.log('Campus gallery upload request from user:', req.user.id);
    console.log('Files uploaded:', req.files ? req.files.length : 0);

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    // Find college profile
    let profile = await CollegeProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ error: 'College profile not found' });
    }

    // Create gallery image objects
    const newGalleryImages = req.files.map(file => ({
      url: `/uploads/campus-gallery/${file.filename}`,
      caption: req.body.caption || '',
      filename: file.filename,
      uploadedAt: new Date()
    }));

    // Add to campus gallery
    if (!profile.campusGallery) {
      profile.campusGallery = [];
    }
    profile.campusGallery.push(...newGalleryImages);

    await profile.save();

    console.log(`Successfully uploaded ${newGalleryImages.length} images to campus gallery for user:`, req.user.id);

    res.json({
      message: `Successfully uploaded ${newGalleryImages.length} images`,
      images: newGalleryImages
    });

  } catch (error) {
    console.error('Error uploading campus gallery images:', error);
    res.status(500).json({ 
      error: 'Failed to upload images',
      details: error.message 
    });
  }
});

// Get campus gallery images
app.get('/api/college/campus-gallery', authenticateToken, requireRole('college'), async (req, res) => {
  try {
    console.log('Campus gallery fetch request from user:', req.user.id);

    const profile = await CollegeProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ error: 'College profile not found' });
    }

    res.json({
      campusGallery: profile.campusGallery || []
    });

  } catch (error) {
    console.error('Error fetching campus gallery:', error);
    res.status(500).json({ 
      error: 'Failed to fetch campus gallery',
      details: error.message 
    });
  }
});

// Update campus gallery image caption
app.put('/api/college/campus-gallery/:imageId', authenticateToken, requireRole('college'), async (req, res) => {
  try {
    console.log('Campus gallery update request from user:', req.user.id, 'for image:', req.params.imageId);

    const { caption } = req.body;
    const imageId = req.params.imageId;

    const profile = await CollegeProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ error: 'College profile not found' });
    }

    const imageIndex = profile.campusGallery.findIndex(img => img._id.toString() === imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }

    profile.campusGallery[imageIndex].caption = caption || '';
    await profile.save();

    console.log('Successfully updated campus gallery image caption for user:', req.user.id);

    res.json({
      message: 'Image caption updated successfully',
      image: profile.campusGallery[imageIndex]
    });

  } catch (error) {
    console.error('Error updating campus gallery image:', error);
    res.status(500).json({ 
      error: 'Failed to update image',
      details: error.message 
    });
  }
});

// Delete campus gallery image
app.delete('/api/college/campus-gallery/:imageId', authenticateToken, requireRole('college'), async (req, res) => {
  try {
    console.log('Campus gallery delete request from user:', req.user.id, 'for image:', req.params.imageId);

    const imageId = req.params.imageId;

    const profile = await CollegeProfile.findOne({ userId: req.user.id });
    
    if (!profile) {
      return res.status(404).json({ error: 'College profile not found' });
    }

    const imageIndex = profile.campusGallery.findIndex(img => img._id.toString() === imageId);
    
    if (imageIndex === -1) {
      return res.status(404).json({ error: 'Image not found' });
    }

    const imageToDelete = profile.campusGallery[imageIndex];

    // Delete physical file
    const filePath = path.join(__dirname, 'uploads', 'campus-gallery', imageToDelete.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log('Deleted physical file:', filePath);
    }

    // Remove from database
    profile.campusGallery.splice(imageIndex, 1);
    await profile.save();

    console.log('Successfully deleted campus gallery image for user:', req.user.id);

    res.json({
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting campus gallery image:', error);
    res.status(500).json({ 
      error: 'Failed to delete image',
      details: error.message 
    });
  }
});

// Get all registered colleges (for student college search)
app.get('/api/colleges/search', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;
    const search = req.query.search || '';
    const state = req.query.state;
    const city = req.query.city;
    const sortBy = req.query.sortBy || 'collegeName';
    
    // Build search query
    let searchQuery = { isActive: true };
    
    // Text search across multiple fields
    if (search) {
      searchQuery.$or = [
        { collegeName: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { 'location.city': { $regex: search, $options: 'i' } },
        { 'location.state': { $regex: search, $options: 'i' } },
        { 'courses.name': { $regex: search, $options: 'i' } },
        { type: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Location filters
    if (state) {
      searchQuery['location.state'] = { $regex: state, $options: 'i' };
    }
    if (city) {
      searchQuery['location.city'] = { $regex: city, $options: 'i' };
    }
    
    // Build sort options
    let sortOptions = {};
    switch (sortBy) {
      case 'fees':
        sortOptions = { 'fees.tuition': 1 };
        break;
      case 'ranking':
        sortOptions = { 'rankings.national': 1 };
        break;
      case 'placement':
        sortOptions = { 'placements.placementRate': -1 };
        break;
      default:
        sortOptions = { collegeName: 1 };
    }
    
    // Execute query with pagination
    const [colleges, total] = await Promise.all([
      CollegeProfile.find(searchQuery)
        .populate('userId', 'name email')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      CollegeProfile.countDocuments(searchQuery)
    ]);
    
    // Transform colleges for frontend
    const transformedColleges = colleges.map(college => ({
      id: college._id,
      name: college.collegeName,
      description: college.description,
      location: {
        city: college.location?.city,
        state: college.location?.state,
        country: college.location?.country || 'India'
      },
      established: college.establishedYear,
      type: college.type,
      courses: college.courses,
      fees: college.fees,
      facilities: college.facilities,
      infrastructure: {
        campus: {
          area: 100, // Default campus area
          description: college.description || 'Beautiful campus with modern facilities'
        },
        library: college.facilities?.includes('Library') || false,
        sports: college.facilities?.includes('Sports Complex') || false,
        laboratory: college.facilities?.includes('Laboratory') || false,
        cafeteria: college.facilities?.includes('Cafeteria') || false,
        wifi: college.facilities?.includes('Wi-Fi Campus') || false,
      },
      placements: college.placements,
      rankings: college.rankings,
      admissionCriteria: {
        minScore: 60, // Default minimum score
        entranceExams: ['JEE Main', 'State CET'] // Default entrance exams
      },
      contact: college.contact,
      website: college.contact?.website || '',
      contactInfo: {
        email: college.contact?.email || '',
        phone: college.contact?.phone || '',
        address: college.location?.address || ''
      },
      images: college.images,
      campusGallery: college.campusGallery || [],
      logo: college.logo,
      profilePicture: college.profilePicture,
      isVerified: college.isVerified,
      lastUpdated: college.updatedAt
    }));

    console.log('Transformed colleges for search response:');
    transformedColleges.forEach(college => {
      console.log(`- ID: ${college.id}, Name: ${college.name}`);
    });
    
    res.json({
      colleges: transformedColleges,
      total: total,
      page: page,
      totalPages: Math.ceil(total / limit),
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalColleges: total,
        hasNext: skip + colleges.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('College search error:', error);
    res.status(500).json({ error: 'Failed to search colleges' });
  }
});

// Test endpoint to debug college data
app.get('/api/colleges/test/list', async (req, res) => {
  try {
    const colleges = await CollegeProfile.find({}).select('_id collegeName').limit(10);
    console.log('All colleges in database:');
    colleges.forEach(college => {
      console.log(`- ID: ${college._id}, Name: ${college.collegeName}`);
    });
    res.json({
      count: colleges.length,
      colleges: colleges.map(c => ({
        id: c._id.toString(),
        name: c.collegeName
      }))
    });
  } catch (error) {
    console.error('Error listing colleges:', error);
    res.status(500).json({ error: 'Failed to list colleges' });
  }
});

// Get individual college details by ID
app.get('/api/colleges/:id', async (req, res) => {
  try {
    const collegeId = req.params.id;
    console.log('Fetching college details for ID:', collegeId);
    console.log('ID type:', typeof collegeId);
    console.log('ID length:', collegeId.length);

    // Find college by ID - try both ObjectId and string
    let college;
    try {
      college = await CollegeProfile.findById(collegeId)
        .populate('userId', 'name email')
        .lean();
    } catch (err) {
      console.log('Error with findById, trying alternative search:', err.message);
      // If ObjectId fails, try finding by string ID
      college = await CollegeProfile.findOne({ _id: collegeId })
        .populate('userId', 'name email')
        .lean();
    }

    if (!college) {
      console.log('College not found with ID:', collegeId);
      
      // Try to find ANY college as a fallback for debugging
      const anyCollege = await CollegeProfile.findOne({}).populate('userId', 'name email').lean();
      if (anyCollege) {
        console.log('However, found this college in database:', anyCollege._id, anyCollege.collegeName);
      } else {
        console.log('No colleges exist in the database at all');
      }
      
      return res.status(404).json({ 
        error: 'College not found',
        message: 'The requested college does not exist or has been removed.',
        requestedId: collegeId,
        debug: anyCollege ? 'Database has colleges but ID mismatch' : 'No colleges in database'
      });
    }

    // Transform college data for frontend
    const transformedCollege = {
      id: college._id,
      name: college.collegeName,
      description: college.description,
      type: college.type,
      established: college.establishedYear,
      isVerified: college.isVerified,
      location: {
        address: college.location?.address,
        city: college.location?.city,
        state: college.location?.state,
        country: college.location?.country || 'India',
        coordinates: {
          latitude: 0, // Add actual coordinates if available
          longitude: 0
        }
      },
      courses: college.courses,
      fees: college.fees,
      facilities: college.facilities,
      infrastructure: {
        campus: {
          area: 100, // Default campus area - could be made dynamic
          description: college.description || 'Beautiful campus with modern facilities'
        },
        library: college.facilities?.includes('Library') || false,
        sports: college.facilities?.includes('Sports Complex') || false,
        laboratory: college.facilities?.includes('Laboratory') || false,
        cafeteria: college.facilities?.includes('Cafeteria') || false,
        wifi: college.facilities?.includes('Wi-Fi Campus') || false,
      },
      placements: college.placements,
      rankings: college.rankings,
      admissionCriteria: {
        minScore: 60, // Default minimum score
        entranceExams: ['JEE Main', 'State CET'] // Default entrance exams
      },
      contact: college.contact,
      website: college.contact?.website || '',
      contactInfo: {
        email: college.contact?.email || '',
        phone: college.contact?.phone || '',
        address: college.location?.address || ''
      },
      images: college.images,
      campusGallery: college.campusGallery || [],
      logo: college.logo,
      profilePicture: college.profilePicture,
      affiliatedTo: college.affiliatedTo,
      accreditation: college.accreditation,
      socialMedia: college.socialMedia,
      isActive: college.isActive,
      lastUpdated: college.updatedAt
    };

    console.log('College details fetched successfully for:', college.collegeName);
    res.json(transformedCollege);
  } catch (error) {
    console.error('Error fetching college details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch college details',
      message: 'An error occurred while retrieving college information. Please try again later.'
    });
  }
});

// Quiz API endpoints
const { QuizQuestion, QuizResponse } = require('./models/Quiz');
const QuizAnalyzer = require('./utils/QuizAnalyzer');

// Get all quiz questions
app.get('/api/quiz/questions', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const questions = await QuizQuestion.find({ isActive: true })
      .sort({ order: 1 })
      .select('-__v');
    
    res.json({
      questions,
      totalQuestions: questions.length
    });
  } catch (error) {
    console.error('Error fetching quiz questions:', error);
    res.status(500).json({ error: 'Failed to fetch quiz questions' });
  }
});

// Submit quiz responses and get recommendations
app.post('/api/quiz/submit', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { responses } = req.body;
    
    if (!responses || !Array.isArray(responses) || responses.length === 0) {
      return res.status(400).json({ error: 'Responses are required' });
    }

    // Get all questions for scoring
    const questions = await QuizQuestion.find({ isActive: true });
    
    // Initialize quiz analyzer
    const analyzer = new QuizAnalyzer();
    
    // Calculate scores
    const scores = analyzer.calculateScores(responses, questions);
    
    // Generate recommendations
    const recommendations = analyzer.generateRecommendations(scores);
    
    // Generate detailed analysis
    const analysis = analyzer.generateDetailedAnalysis(scores, recommendations);
    
    // Save quiz response to database
    const quizResponse = new QuizResponse({
      userId: req.user.id,
      responses,
      scores,
      recommendations
    });
    
    await quizResponse.save();
    
    console.log(`Quiz completed for user: ${req.user.id}`);
    
    res.json({
      message: 'Quiz completed successfully!',
      scores,
      recommendations,
      analysis,
      quizId: quizResponse._id
    });
  } catch (error) {
    console.error('Error submitting quiz:', error);
    res.status(500).json({ error: 'Failed to submit quiz responses' });
  }
});

// Get user's quiz history
app.get('/api/quiz/history', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const quizHistory = await QuizResponse.find({ userId: req.user.id })
      .sort({ completedAt: -1 })
      .select('-responses') // Don't include detailed responses for history
      .limit(10);
    
    res.json({
      quizHistory,
      totalQuizzes: quizHistory.length
    });
  } catch (error) {
    console.error('Error fetching quiz history:', error);
    res.status(500).json({ error: 'Failed to fetch quiz history' });
  }
});

// Get specific quiz result details
app.get('/api/quiz/result/:quizId', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const quizResult = await QuizResponse.findOne({
      _id: quizId,
      userId: req.user.id
    });
    
    if (!quizResult) {
      return res.status(404).json({ error: 'Quiz result not found' });
    }
    
    // Generate fresh analysis
    const analyzer = new QuizAnalyzer();
    const analysis = analyzer.generateDetailedAnalysis(quizResult.scores, quizResult.recommendations);
    
    res.json({
      quizResult,
      analysis
    });
  } catch (error) {
    console.error('Error fetching quiz result:', error);
    res.status(500).json({ error: 'Failed to fetch quiz result' });
  }
});

// Update student profile with quiz recommendations
app.post('/api/quiz/update-profile/:quizId', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    const { quizId } = req.params;
    
    // Get quiz result
    const quizResult = await QuizResponse.findOne({
      _id: quizId,
      userId: req.user.id
    });
    
    if (!quizResult) {
      return res.status(404).json({ error: 'Quiz result not found' });
    }
    
    // Extract recommended streams
    const recommendedStreams = quizResult.recommendations
      .filter(rec => rec.percentage >= 15) // Lower threshold for better profile updates
      .map(rec => {
        // Map full stream names back to profile field names
        const streamMappings = {
          'Engineering': 'Engineering',
          'Medical & Health Sciences': 'Medical',
          'Commerce & Finance': 'Commerce',
          'Arts & Humanities': 'Arts',
          'Pure Sciences': 'Science',
          'Law & Legal Studies': 'Law',
          'Management & Business Administration': 'Management',
          'Design & Creative Arts': 'Design',
          'Architecture & Planning': 'Architecture',
          'Agriculture & Life Sciences': 'Agriculture'
        };
        return streamMappings[rec.stream] || rec.stream;
      })
      .slice(0, 3); // Top 3 recommendations
    
    console.log('Recommended streams to add:', recommendedStreams);

    // Update student profile
    const profile = await StudentProfile.findOne({ userId: req.user.id });
    if (profile) {
      console.log('Current interested streams:', profile.interestedStreams);
      
      // Merge existing streams with new recommendations
      const existingStreams = profile.interestedStreams || [];
      profile.interestedStreams = [...new Set([...existingStreams, ...recommendedStreams])];
      
      // Store detailed quiz results
      profile.careerQuizResults = {
        lastTaken: new Date(),
        recommendations: quizResult.recommendations.map(rec => ({
          stream: rec.stream,
          streamName: rec.stream,
          percentage: rec.percentage,
          reason: rec.reason,
          suggestedCourses: rec.suggestedCourses || [],
          careerPaths: rec.careerPaths || []
        })),
        topRecommendation: {
          stream: quizResult.recommendations[0]?.stream || '',
          percentage: quizResult.recommendations[0]?.percentage || 0
        },
        quizId: quizResult._id
      };
      
      await profile.save();
      console.log('Updated interested streams:', profile.interestedStreams);
      console.log('Updated quiz results:', profile.careerQuizResults);
      
      res.json({
        message: 'Profile updated with quiz recommendations',
        updatedStreams: profile.interestedStreams,
        addedStreams: recommendedStreams,
        quizResults: profile.careerQuizResults
      });
    } else {
      console.log('Student profile not found for user:', req.user.id);
      res.status(404).json({ error: 'Student profile not found' });
    }
  } catch (error) {
    console.error('Error updating profile with quiz results:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Application Management API Endpoints

// Submit college application
app.post('/api/applications/submit', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    console.log('Application submission from user:', req.user.id);
    console.log('Application data:', req.body);

    const {
      collegeId,
      collegeName,
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      gender,
      nationality,
      currentEducation,
      institution,
      percentage,
      graduationYear,
      preferredCourse,
      alternativeCourse,
      extracurriculars,
      achievements,
      statement,
      applicationDate,
      status
    } = req.body;

    // Validate required fields
    if (!collegeId || !collegeName || !firstName || !lastName || !email || !phone || !preferredCourse) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Please fill in all required fields to submit your application.'
      });
    }

    // Create new application
    const application = new Application({
      studentId: req.user.id,
      collegeId,
      collegeName,
      applicationDate: applicationDate || new Date(),
      status: status || 'pending',
      studentInfo: {
        firstName,
        lastName,
        email,
        phone,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        gender,
        nationality: nationality || 'Indian'
      },
      academicInfo: {
        currentEducation,
        institution,
        percentage: parseFloat(percentage) || 0,
        graduationYear: parseInt(graduationYear) || new Date().getFullYear()
      },
      courseInfo: {
        preferredCourse,
        alternativeCourse
      },
      additionalInfo: {
        extracurriculars,
        achievements,
        statement
      }
    });

    await application.save();

    console.log('Application submitted successfully:', application._id);

    res.json({
      message: 'Application submitted successfully!',
      applicationId: application._id,
      status: application.status,
      submittedAt: application.submittedAt
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    
    // Handle validation errors
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({ 
        error: 'Validation failed',
        message: validationErrors.join(', ')
      });
    }
    
    // Handle custom validation errors from pre-save middleware
    if (error.message && (
        error.message.includes('Personal statement') ||
        error.message.includes('required') ||
        error.message.includes('must be')
    )) {
      return res.status(400).json({ 
        error: 'Validation failed',
        message: error.message
      });
    }
    
    res.status(500).json({ 
      error: 'Failed to submit application',
      message: 'An error occurred while submitting your application. Please try again later.'
    });
  }
});

// Get student's applications
app.get('/api/applications/my-applications', authenticateToken, requireRole('student'), async (req, res) => {
  try {
    console.log('Fetching applications for user:', req.user.id);

    const applications = await Application.getByStudent(req.user.id);

    // Transform applications for frontend
    const transformedApplications = applications.map(app => ({
      id: app._id,
      collegeName: app.collegeName,
      course: app.courseInfo.preferredCourse,
      applicationDate: app.applicationDate,
      status: app.status,
      college: {
        profilePicture: null, // Could be enhanced to fetch from college profile
        collegeName: app.collegeName,
        location: 'Location TBD' // Could be enhanced to fetch from college profile
      }
    }));

    console.log(`Found ${applications.length} applications for user:`, req.user.id);

    res.json({
      applications: transformedApplications,
      total: applications.length
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch applications',
      message: 'An error occurred while retrieving your applications.'
    });
  }
});

// Get applications for a specific college (for college dashboard)
app.get('/api/applications/college-applications', authenticateToken, requireRole('college'), async (req, res) => {
  try {
    console.log('Fetching applications for college user:', req.user.id);

    // First, get the college profile to find the college ID
    const collegeProfile = await CollegeProfile.findOne({ userId: req.user.id });
    if (!collegeProfile) {
      return res.status(404).json({ 
        error: 'College profile not found',
        message: 'Please complete your college profile first.'
      });
    }

    const applications = await Application.getByCollege(collegeProfile._id);

    console.log(`Found ${applications.length} applications for college:`, collegeProfile.collegeName);

    // Return full application data for detailed view
    res.json({
      applications: applications,
      total: applications.length,
      collegeName: collegeProfile.collegeName
    });

  } catch (error) {
    console.error('Error fetching college applications:', error);
    res.status(500).json({ 
      error: 'Failed to fetch applications',
      message: 'An error occurred while retrieving applications for your college.'
    });
  }
});

// Update application status
app.put('/api/applications/:applicationId/status', authenticateToken, requireRole('college'), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, message } = req.body;
    const collegeUserId = req.user.id;

    console.log(`Updating application ${applicationId} status to ${status} by college user:`, collegeUserId);

    // Validate status
    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        error: 'Invalid status',
        message: 'Status must be pending, approved, or rejected'
      });
    }

    // Find the college profile
    const collegeProfile = await CollegeProfile.findOne({ userId: collegeUserId });
    if (!collegeProfile) {
      return res.status(404).json({
        error: 'College not found',
        message: 'College profile not found'
      });
    }

    // Find and update the application
    const application = await Application.findOneAndUpdate(
      { 
        _id: applicationId,
        collegeId: collegeProfile._id 
      },
      { 
        status,
        updatedAt: new Date(),
        ...(message && { statusMessage: message })
      },
      { new: true }
    ).populate('studentId', 'email name');

    if (!application) {
      return res.status(404).json({
        error: 'Application not found',
        message: 'Application not found or you do not have permission to update it'
      });
    }

    console.log(`Application ${applicationId} status updated to ${status}`);

    // TODO: Send email notification to student
    if (message) {
      console.log(`Status message for student: ${message}`);
    }

    res.json({
      message: 'Application status updated successfully',
      application: {
        id: application._id,
        status: application.status,
        updatedAt: application.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ 
      error: 'Failed to update application status',
      message: 'An error occurred while updating the application status. Please try again later.'
    });
  }
});

// =======================
// COMPREHENSIVE ADMIN MANAGEMENT
// =======================

// User Management Endpoints
app.get('/api/admin/users/detailed', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, role, status, search } = req.query;
    
    let query = {};
    
    // Filter by role
    if (role && role !== 'all') {
      query.role = role;
    }
    
    // Filter by status
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    // Search functionality
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { collegeName: { $regex: search, $options: 'i' } }
      ];
    }
    
    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await User.countDocuments(query);
    
    res.json({
      users,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching detailed users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.put('/api/admin/users/:userId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Prevent admin from changing their own role
    if (userId === req.user.id && updates.role !== req.user.role) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }
    
    // Hash password if being updated
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }
    
    const user = await User.findByIdAndUpdate(
      userId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({
      message: 'User updated successfully',
      user
    });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Admin endpoint to change user password
app.put('/api/admin/users/:userId/change-password', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { newPassword } = req.body;
    
    // Validate input
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters long' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    // Update the user's password
    await User.findByIdAndUpdate(
      userId,
      { 
        password: hashedPassword, 
        updatedAt: new Date()
      }
    );
    
    console.log(`Admin ${req.user.email} changed password for user ${user.email}`);
    
    res.json({
      message: 'Password changed successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Admin endpoint to toggle user access (enable/disable)
app.put('/api/admin/users/:userId/toggle-access', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    const { isActive } = req.body;
    
    // Prevent admin from disabling their own account
    if (userId === req.user.id && !isActive) {
      return res.status(400).json({ error: 'Cannot disable your own account' });
    }
    
    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Update the user's active status
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        isActive: isActive,
        updatedAt: new Date()
      },
      { new: true }
    ).select('-password');
    
    const action = isActive ? 'enabled' : 'disabled';
    console.log(`Admin ${req.user.email} ${action} access for user ${user.email}`);
    
    res.json({
      message: `User access ${action} successfully`,
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        isActive: updatedUser.isActive
      }
    });
  } catch (error) {
    console.error('Error toggling user access:', error);
    res.status(500).json({ error: 'Failed to update user access' });
  }
});

app.delete('/api/admin/users/:userId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    // Find the user first to get details for logging
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Store user details for logging
    const userDetails = {
      name: user.name,
      email: user.email,
      role: user.role
    };
    
    console.log(`Admin ${req.user.email} initiating deletion of user: ${userDetails.name} (${userDetails.email}, ${userDetails.role})`);
    
    // Start comprehensive data cleanup based on user role
    let deletedRecords = {
      user: 0,
      profile: 0,
      applications: 0,
      quizResponses: 0
    };
    
    try {
      // 1. Delete user-specific profile data
      if (user.role === 'student') {
        // Delete student profile
        const studentProfileResult = await StudentProfile.deleteOne({ userId: userId });
        deletedRecords.profile = studentProfileResult.deletedCount;
        console.log(`Deleted ${studentProfileResult.deletedCount} student profile(s) for user ${userId}`);
        
        // Delete student's applications
        const applicationResult = await Application.deleteMany({ studentId: userId });
        deletedRecords.applications = applicationResult.deletedCount;
        console.log(`Deleted ${applicationResult.deletedCount} application(s) submitted by student ${userId}`);
        
      } else if (user.role === 'college') {
        // Delete college profile
        const collegeProfileResult = await CollegeProfile.deleteOne({ userId: userId });
        deletedRecords.profile = collegeProfileResult.deletedCount;
        console.log(`Deleted ${collegeProfileResult.deletedCount} college profile(s) for user ${userId}`);
        
        // Find college profile to get collegeId for application cleanup
        const collegeProfile = await CollegeProfile.findOne({ userId: userId });
        if (collegeProfile) {
          // Delete applications submitted TO this college
          const applicationResult = await Application.deleteMany({ collegeId: collegeProfile._id });
          deletedRecords.applications = applicationResult.deletedCount;
          console.log(`Deleted ${applicationResult.deletedCount} application(s) submitted to college ${userId}`);
        }
      }
      
      // 2. Delete quiz responses (applicable to students)
      if (user.role === 'student') {
        try {
          const { QuizResponse } = require('./models/Quiz');
          if (QuizResponse) {
            const quizResult = await QuizResponse.deleteMany({ userId: userId });
            deletedRecords.quizResponses = quizResult.deletedCount;
            console.log(`Deleted ${quizResult.deletedCount} quiz response(s) for user ${userId}`);
          }
        } catch (quizError) {
          console.log('Quiz model not available or error deleting quiz responses:', quizError.message);
        }
      }
      
      // 3. Finally, delete the user record
      await User.findByIdAndDelete(userId);
      deletedRecords.user = 1;
      
      // Log the successful deletion action
      console.log(`✅ Admin ${req.user.email} successfully deleted user: ${userDetails.name} (${userDetails.email}, ${userDetails.role})`);
      console.log(`📊 Cleanup summary:`, deletedRecords);
      
      res.json({ 
        message: 'User and all associated data deleted successfully',
        deletedUser: userDetails,
        cleanupSummary: {
          userRecord: deletedRecords.user,
          profileData: deletedRecords.profile,
          applications: deletedRecords.applications,
          quizResponses: deletedRecords.quizResponses,
          totalRecordsDeleted: Object.values(deletedRecords).reduce((sum, count) => sum + count, 0)
        }
      });
      
    } catch (cleanupError) {
      console.error('Error during data cleanup:', cleanupError);
      // If cleanup fails, we should not delete the user to maintain data integrity
      throw new Error(`Data cleanup failed: ${cleanupError.message}`);
    }
    
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ 
      error: 'Failed to delete user', 
      details: error.message 
    });
  }
});

app.post('/api/admin/users/:userId/toggle-status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Prevent admin from deactivating themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Cannot change your own status' });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    user.isActive = !user.isActive;
    await user.save();
    
    res.json({
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`,
      user: { id: user._id, isActive: user.isActive }
    });
  } catch (error) {
    console.error('Error toggling user status:', error);
    res.status(500).json({ error: 'Failed to toggle user status' });
  }
});

// College Management Endpoints
app.get('/api/admin/colleges/detailed', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.isActive = status === 'active';
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    
    const colleges = await CollegeProfile.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await CollegeProfile.countDocuments(query);
    
    res.json({
      colleges,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching detailed colleges:', error);
    res.status(500).json({ error: 'Failed to fetch colleges' });
  }
});

app.put('/api/admin/colleges/:collegeId', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { collegeId } = req.params;
    const updates = req.body;
    
    const college = await CollegeProfile.findByIdAndUpdate(
      collegeId,
      { ...updates, updatedAt: new Date() },
      { new: true, runValidators: true }
    );
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    res.json({
      message: 'College updated successfully',
      college
    });
  } catch (error) {
    console.error('Error updating college:', error);
    res.status(500).json({ error: 'Failed to update college' });
  }
});

app.delete('/api/admin/colleges/:collegeId', requireRole('admin'), async (req, res) => {
  try {
    const { collegeId } = req.params;
    
    // First, find the college profile to get associated data
    const college = await CollegeProfile.findById(collegeId);
    
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }

    const deletionResults = {
      collegeProfile: 0,
      staticCollege: 0,
      userAccount: 0,
      applications: 0,
      uploadedFiles: 0
    };

    console.log(`Starting cascading deletion for college: ${college.collegeName}`);

    // 1. Delete uploaded files (profile picture, logo, images)
    const fs = require('fs');
    const path = require('path');
    
    // Delete profile picture
    if (college.profilePicture) {
      const profilePicPath = path.join(__dirname, 'uploads', 'profile-pictures', college.profilePicture);
      try {
        if (fs.existsSync(profilePicPath)) {
          fs.unlinkSync(profilePicPath);
          deletionResults.uploadedFiles++;
          console.log(`✅ Deleted profile picture: ${college.profilePicture}`);
        }
      } catch (fileError) {
        console.log(`⚠️ Could not delete profile picture: ${college.profilePicture}`, fileError.message);
      }
    }

    // Delete logo
    if (college.logo) {
      const logoPath = path.join(__dirname, 'uploads', 'profile-pictures', college.logo);
      try {
        if (fs.existsSync(logoPath)) {
          fs.unlinkSync(logoPath);
          deletionResults.uploadedFiles++;
          console.log(`✅ Deleted logo: ${college.logo}`);
        }
      } catch (fileError) {
        console.log(`⚠️ Could not delete logo: ${college.logo}`, fileError.message);
      }
    }

    // Delete college images
    if (college.images && college.images.length > 0) {
      college.images.forEach(image => {
        if (image.url) {
          const imagePath = path.join(__dirname, 'uploads', 'profile-pictures', image.url);
          try {
            if (fs.existsSync(imagePath)) {
              fs.unlinkSync(imagePath);
              deletionResults.uploadedFiles++;
              console.log(`✅ Deleted image: ${image.url}`);
            }
          } catch (fileError) {
            console.log(`⚠️ Could not delete image: ${image.url}`, fileError.message);
          }
        }
      });
    }

    // 2. Delete the college profile
    const profileResult = await CollegeProfile.findByIdAndDelete(collegeId);
    if (profileResult) {
      deletionResults.collegeProfile = 1;
      console.log(`✅ Deleted college profile: ${college.collegeName}`);
    }

    // 3. Delete the corresponding static College entry if it exists
    const staticCollegeResult = await College.findOneAndDelete({ name: college.collegeName });
    if (staticCollegeResult) {
      deletionResults.staticCollege = 1;
      console.log(`✅ Deleted static college entry: ${college.collegeName}`);
    }

    // 4. Delete the associated user account
    if (college.userId) {
      const userResult = await User.findByIdAndDelete(college.userId);
      if (userResult) {
        deletionResults.userAccount = 1;
        console.log(`✅ Deleted associated user account: ${userResult.email}`);
      }
    }

    // 5. Delete all applications submitted TO this college
    const applicationResult = await Application.deleteMany({ collegeId: collegeId });
    if (applicationResult.deletedCount > 0) {
      deletionResults.applications = applicationResult.deletedCount;
      console.log(`✅ Deleted ${applicationResult.deletedCount} application(s) submitted to college`);
    }

    console.log('Cascading deletion completed:', deletionResults);

    res.json({ 
      message: 'College and all associated data deleted successfully',
      deletionResults: deletionResults
    });
  } catch (error) {
    console.error('Error deleting college:', error);
    res.status(500).json({ error: 'Failed to delete college and associated data' });
  }
});

app.post('/api/admin/colleges/:collegeId/toggle-status', requireRole('admin'), async (req, res) => {
  try {
    const { collegeId } = req.params;
    
    const college = await CollegeProfile.findById(collegeId);
    if (!college) {
      return res.status(404).json({ error: 'College not found' });
    }
    
    college.isActive = !college.isActive;
    await college.save();
    
    res.json({
      message: `College ${college.isActive ? 'activated' : 'deactivated'} successfully`,
      college: { id: college._id, isActive: college.isActive }
    });
  } catch (error) {
    console.error('Error toggling college status:', error);
    res.status(500).json({ error: 'Failed to toggle college status' });
  }
});

// Application Management Endpoints
app.get('/api/admin/applications', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    let query = {};
    
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const applications = await Application.find(query)
      .populate('studentId', 'name email')
      .populate('collegeId', 'name location')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
    
    const total = await Application.countDocuments(query);
    
    res.json({
      applications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ error: 'Failed to fetch applications' });
  }
});

app.put('/api/admin/applications/:applicationId/status', authenticateToken, requireRole('admin'), async (req, res) => {
  try {
    const { applicationId } = req.params;
    const { status, message } = req.body;
    
    const application = await Application.findByIdAndUpdate(
      applicationId,
      { 
        status,
        statusMessage: message,
        updatedAt: new Date()
      },
      { new: true }
    ).populate('studentId', 'name email')
     .populate('collegeId', 'name');
    
    if (!application) {
      return res.status(404).json({ error: 'Application not found' });
    }
    
    res.json({
      message: 'Application status updated successfully',
      application
    });
  } catch (error) {
    console.error('Error updating application status:', error);
    res.status(500).json({ error: 'Failed to update application status' });
  }
});

// System Management Endpoints
app.get('/api/admin/system/stats', requireRole('admin'), async (req, res) => {
  try {
    const [
      totalUsers,
      totalColleges,
      totalApplications,
      activeUsers,
      pendingApplications,
      recentUsers,
      recentApplications
    ] = await Promise.all([
      User.countDocuments(),
      CollegeProfile.countDocuments(),
      Application.countDocuments(),
      User.countDocuments({ isActive: true }),
      Application.countDocuments({ status: 'pending' }),
      User.find().sort({ createdAt: -1 }).limit(5).select('name email role createdAt'),
      Application.find().populate('studentId', 'name').populate('collegeId', 'name').sort({ createdAt: -1 }).limit(5)
    ]);
    
    res.json({
      overview: {
        totalUsers,
        totalColleges,
        totalApplications,
        activeUsers,
        pendingApplications
      },
      recent: {
        users: recentUsers,
        applications: recentApplications
      }
    });
  } catch (error) {
    console.error('Error fetching system stats:', error);
    res.status(500).json({ error: 'Failed to fetch system statistics' });
  }
});

app.get('/api/admin/analytics/overview', requireRole('admin'), async (req, res) => {
  try {
    const { timeframe = '30' } = req.query;
    const days = parseInt(timeframe);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const [
      userGrowth,
      applicationTrends,
      collegeStats,
      userRoleDistribution
    ] = await Promise.all([
      User.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { 
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ]),
      Application.aggregate([
        { $match: { createdAt: { $gte: startDate } } },
        { 
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
              status: "$status"
            },
            count: { $sum: 1 }
          }
        },
        { $sort: { "_id.date": 1 } }
      ]),
      CollegeProfile.aggregate([
        {
          $group: {
            _id: "$isActive",
            count: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 }
          }
        }
      ])
    ]);
    
    res.json({
      userGrowth,
      applicationTrends,
      collegeStats,
      userRoleDistribution,
      timeframe: `${days} days`
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

// Content Management Endpoints
app.get('/api/admin/announcements', requireRole('admin'), async (req, res) => {
  try {
    // This would typically come from a database, but for now we'll use a simple structure
    res.json({
      announcements: [
        {
          id: 1,
          title: "System Maintenance",
          content: "Scheduled maintenance on Sunday",
          type: "info",
          active: true,
          createdAt: new Date()
        }
      ]
    });
  } catch (error) {
    console.error('Error fetching announcements:', error);
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

app.post('/api/admin/announcements', requireRole('admin'), async (req, res) => {
  try {
    const { title, content, type, active } = req.body;
    
    // This would typically save to database
    const announcement = {
      id: Date.now(),
      title,
      content,
      type,
      active,
      createdAt: new Date()
    };
    
    res.json({
      message: 'Announcement created successfully',
      announcement
    });
  } catch (error) {
    console.error('Error creating announcement:', error);
    res.status(500).json({ error: 'Failed to create announcement' });
  }
});

// Bulk Operations
app.post('/api/admin/users/bulk-action', requireRole('admin'), async (req, res) => {
  try {
    const { userIds, action } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({ error: 'User IDs are required' });
    }
    
    // Prevent admin from affecting themselves
    const filteredIds = userIds.filter(id => id !== req.user.id);
    
    let result;
    switch (action) {
      case 'activate':
        result = await User.updateMany(
          { _id: { $in: filteredIds } },
          { isActive: true, updatedAt: new Date() }
        );
        break;
      case 'deactivate':
        result = await User.updateMany(
          { _id: { $in: filteredIds } },
          { isActive: false, updatedAt: new Date() }
        );
        break;
      case 'delete':
        // Comprehensive bulk delete with cleanup
        console.log(`Admin ${req.user.email} initiating bulk deletion of ${filteredIds.length} users`);
        
        let totalDeleted = {
          users: 0,
          profiles: 0,
          applications: 0,
          quizResponses: 0
        };
        
        // Get user details for proper cleanup
        const usersToDelete = await User.find({ _id: { $in: filteredIds } });
        
        for (const user of usersToDelete) {
          try {
            // Delete role-specific data
            if (user.role === 'student') {
              const profileResult = await StudentProfile.deleteMany({ userId: user._id });
              totalDeleted.profiles += profileResult.deletedCount;
              
              const appResult = await Application.deleteMany({ studentId: user._id });
              totalDeleted.applications += appResult.deletedCount;
              
              // Delete quiz responses
              try {
                const { QuizResponse } = require('./models/Quiz');
                if (QuizResponse) {
                  const quizResult = await QuizResponse.deleteMany({ userId: user._id });
                  totalDeleted.quizResponses += quizResult.deletedCount;
                }
              } catch (quizError) {
                console.log(`Quiz cleanup failed for user ${user._id}:`, quizError.message);
              }
            } else if (user.role === 'college') {
              const profileResult = await CollegeProfile.deleteMany({ userId: user._id });
              totalDeleted.profiles += profileResult.deletedCount;
              
              // Find college profiles to clean up applications
              const collegeProfiles = await CollegeProfile.find({ userId: user._id });
              for (const profile of collegeProfiles) {
                const appResult = await Application.deleteMany({ collegeId: profile._id });
                totalDeleted.applications += appResult.deletedCount;
              }
            }
          } catch (cleanupError) {
            console.error(`Cleanup failed for user ${user._id}:`, cleanupError);
          }
        }
        
        // Finally delete the users
        result = await User.deleteMany({ _id: { $in: filteredIds } });
        totalDeleted.users = result.deletedCount;
        
        console.log(`✅ Bulk deletion completed:`, totalDeleted);
        
        // Update result to include cleanup summary
        result.cleanupSummary = totalDeleted;
        break;
      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    const response = {
      message: `Bulk ${action} completed successfully`,
      affected: result.modifiedCount || result.deletedCount
    };
    
    // Add cleanup summary for delete operations
    if (action === 'delete' && result.cleanupSummary) {
      response.cleanupSummary = result.cleanupSummary;
      response.message = `Bulk deletion completed successfully. Deleted ${result.cleanupSummary.users} users and cleaned up associated data.`;
    }
    
    res.json(response);
  } catch (error) {
    console.error('Error performing bulk action:', error);
    res.status(500).json({ error: 'Failed to perform bulk action' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Default admin credentials: admin@college-finder.com / admin123');
});
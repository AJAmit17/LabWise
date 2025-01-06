# LabWise - Academic Lab & Attendance Management System 📱

[![React Native](https://img.shields.io/badge/React%20Native-v0.76-blue.svg)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-SDK%2052-black.svg)](https://expo.dev)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20-green.svg)](https://docs.expo.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Overview 🎯

LabWise is a comprehensive mobile application designed for academic institutions, focusing on lab management, attendance tracking, and academic resource organization. Built with React Native and Expo, it provides a seamless cross-platform experience for students and faculty.

## Key Features 🌟

### 1. Attendance Management
- Digital attendance tracking for each class
- Support for regular and extra classes
- Visual attendance statistics and analytics
- Automatic percentage calculations
- Export functionality for attendance data
- Smart predictions for maintaining target attendance

### 2. Course Management
- Easy course registration with schedule setup
- Flexible time slot management
- Multiple section support (A & B sections)
- Course-wise attendance tracking
- Customizable minimum attendance targets

### 3. Time Table
- Interactive weekly schedule viewer
- Section-wise timetable display
- Detailed class information including:
  - Subject name and code
  - Professor details
  - Time slots
  - Room information

### 4. Lab Resources
- Digital lab manual access
- Secure file storage and sharing
- Support for multiple file formats
- Search functionality
- Download tracking
- Integration with Pinata IPFS

### 5. User Interface
- Modern Material Design implementation
- Dark/Light theme support
- Responsive layouts
- Intuitive navigation
- Interactive statistics visualization

## Technical Implementation 🛠️

### Frontend Architecture
- **UI Framework**: React Native Paper
- **Navigation**: Expo Router with deep linking
- **State Management**: React Hooks & Context API
- **Storage**: AsyncStorage for persistent data
- **File Handling**: Expo FileSystem & Sharing

### Key Components
1. **Attendance Tracker**
   - Calendar integration
   - Status tracking (Present/Absent/No Class)
   - Extra class management
   - Statistical analysis

2. **Course Manager**
   - Schedule configuration
   - Time slot management
   - Section handling
   - Attendance rules

3. **Resource Manager**
   - IPFS integration via Pinata
   - File type handling
   - Search functionality
   - Download management

## Getting Started 🚀

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. Clone the repository
```bash
git clone https://github.com/AJAmit17/LabWise.git
cd LabWise
```

2. Install dependencies
```bash
npm install
```

3. Create environment variables
```bash
# Create .env file with:
CLERK_PUBLISHER_KEY = "pk_key..."
PINATA_JWT=your_pinata_jwt_token
```

4. Start the development server
```bash
npx expo start
```

### Running the App

Choose your preferred method:
- Scan QR code with Expo Go app
- Press 'a' for Android emulator
- Press 'i' for iOS simulator
- Press 'w' for web browser

## Development 👨‍💻

### Project Structure
```
LabWise/
├── app/
│   ├── (tabs)/
│   │   ├── two.tsx        # Lab Experiments
│   │   ├── three.tsx      # Time Table
│   │   └── four.tsx       # Resources
│   └── attendance/
│       ├── addCourse/     # Course Management
│       ├── calendar/      # Attendance Tracking
│       ├── listCourse/    # Course List
│       └── stats/         # Attendance Statistics
├── components/
├── types/
└── assets/
```

### Available Scripts
- `npx expo start`: Start development server
- `npx expo build:android`: Build Android app
- `npx expo build:ios`: Build iOS app
- `npm run test`: Run tests

## Contributing 🤝

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License 📄

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments 🙏

- React Native Paper for UI components
- Expo team for the development tools
- Pinata for IPFS storage solutions

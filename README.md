# LabWise - Academic Lab Management System 📱

[![Expo](https://img.shields.io/badge/Expo-v13.2.3-blue.svg)](https://expo.dev)
[![Platform](https://img.shields.io/badge/Platform-Android%20%7C%20iOS%20%7C%20Web-green.svg)](https://docs.expo.dev)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

## Project Overview

LabWise is a comprehensive mobile application designed to streamline laboratory management for academic institutions. Built using React Native and Expo, it provides a unified platform for students and faculty to access lab materials, schedules, and resources.

## Project Objectives

- Simplify access to lab manuals and procedures
- Provide organized storage of lab solutions and materials
- Enable easy navigation through course schedules
- Create a seamless cross-platform experience

## Technology Stack

- **Frontend Framework**: React Native with Expo
- **UI Components**: React Native Paper
- **Navigation**: Expo Router
- **Icons**: Material Icons & SF Symbols
- **State Management**: React Hooks
- **Build System**: EAS (Expo Application Services)

## Core Features

### 1. Lab Management
- Digital lab manual access
- Step-by-step experiment guides
- Integrated solutions repository
- Resource documentation

### 2. Academic Tools
- Interactive timetable viewer
- Course material organization
- Subject-wise categorization
- Quick reference guides

### 3. User Interface
- Modern, intuitive design
- Cross-platform consistency
- Dark/Light mode support
- Responsive layouts

### 4. Technical Implementation

#### Routing System
- File-based routing using Expo Router
- Deep linking support
- Tab-based navigation
- Stack navigation for detailed views

#### Data Management
- Efficient state management
- Async storage implementation
- Secure data handling
- Optimized content delivery

## Project Structure

## 📋 Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

## 🛠 Installation

1. Clone the repository
   ```bash
   git clone [your-repository-url]
   cd ccapp
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

## 🏗 Development

### Available Scripts

- `npx expo start` - Start the development server
- `npm run reset-project` - Reset the project to a fresh state
- `eas build` - Build the application using EAS

### Environment Setup

The project uses different configurations for various environments:

- Development: Uses development client with internal distribution
- Preview: Internal distribution build
- Production: Automated versioning with auto-increment

## 📱 Running the App

You can run the app in multiple ways:
- Using Expo Go
- On iOS Simulator
- On Android Emulator
- Through development builds

## 🚀 Deployment

This project uses EAS (Expo Application Services) for building and deployment. Configure your builds in `eas.json`:

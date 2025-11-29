<div id="top">

<div align="center">

# FP-GRAFKOM-THREEJS

_"Hidden Gem" - Interactive 3D Room Exploration_

<img src="https://img.shields.io/github/last-commit/qyqystilllearning/FP-Grafkom-ThreeJS?style=flat&logo=git&logoColor=white&color=0080ff" alt="last-commit">
<img src="https://img.shields.io/github/languages/top/qyqystilllearning/FP-Grafkom-ThreeJS?style=flat&color=0080ff" alt="repo-top-language">
<img src="https://img.shields.io/github/languages/count/qyqystilllearning/FP-Grafkom-ThreeJS?style=flat&color=0080ff" alt="repo-language-count">

<br>

_Built with the tools and technologies:_

<p>
  <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5">
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3">
</p>

</div>

</div>

---

## Table of Contents

* [Overview](#overview)
* [Features](#features)
* [Technologies Used](#technologies-used)
* [Project Structure](#project-structure)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
  * [Usage](#usage)
* [Asset Requirements](#asset-requirements)
* [How to Contribute](#how-to-contribute)
* [License](#license)

---

## Overview

**FP-Grafkom-ThreeJS** is a Final Project for the Computer Graphics course. This web application renders an interactive 3D room ("Hidden Gem") using WebGL. The project demonstrates 3D object rendering capabilities, realistic lighting, and camera navigation within a browser environment.

It is designed to load external 3D models (`.glb`) and applies modern rendering techniques such as *Shadow Mapping* and *Tone Mapping* for aesthetic visual results.

---

## Features

* 🎥 **Interactive Camera:** Uses `OrbitControls` to allow users to rotate, zoom, and pan around the room.
* 🏠 **3D Model Loading:** Integrates `GLTFLoader` to load complex room model assets from `.glb` format.
* 💡 **Realistic Lighting:**
  * Implementation of *Soft Shadows* (`PCFSoftShadowMap`).
  * *Tone Mapping* settings (`ACESFilmicToneMapping`) for color accuracy and light exposure.
  * Automatic handling of material properties (`castShadow`, `receiveShadow`, `DoubleSide`).
* ⚡ **Performance Optimized:** Uses Vite for super-fast hot-module replacement (HMR) during development.
* 📱 **Responsive Design:** The 3D Canvas automatically adjusts when the browser window is resized.

---

## Technologies Used

This project is built using the following modern web technologies:

* **Three.js** (v0.181.2) - Main library for 3D graphics rendering.
* **Vite** (v7.2.4) - Lightweight and fast build tool and development server.
* **JavaScript (ES6+)** - Interaction logic and scene initialization.
* **HTML5/CSS3** - Basic web page structure.

---

## Project Structure

The main folder structure in this repository:

```text
FP-Grafkom-ThreeJS/
├── public/
│   ├── models/
│   │   └── ruanganfix.glb  # (Main 3D Model File)
│   └── vite.svg
├── .gitignore              # Git ignore configuration
├── index.html              # Application entry point
├── main.js                 # Main Three.js logic (Scene, Camera, Renderer)
├── package.json            # List of dependencies and npm scripts
└── package-lock.json
```

# Getting Started

Follow these steps to run this project on your local machine.

## Prerequisites

* Node.js (Version 18+ recommended)
* npm (Built-in with Node.js)
* Modern Web Browser with WebGL support (Chrome, Firefox, Edge, Safari).

## Installation

1. Clone this repository:
```bash
git clone https://github.com/qyqystilllearning/FP-Grafkom-ThreeJS.git
```

2. Navigate to the project directory:
```bash
cd FP-Grafkom-ThreeJS
```

3. Install dependencies:
```bash
npm install
```

## Usage

1. Run the development server:
```bash
npm run dev
```

2. Open in browser: Usually access the local link shown in the terminal, for example: `http://localhost:5173`.

3. Build for production:
```bash
npm run build
```

## Asset Requirements

⚠️ **Important:** Based on the `.gitignore` file, the 3D model file might not be included in the repository if it is too large.

For the application to run correctly, ensure you have the 3D model file:
1. **File Name:** `ruanganfix.glb`
2. **Location:** Save inside the `public/models/` folder.

If this file is missing, the screen will display an empty gray background without the room object.

## How to Contribute

Contributions are highly welcome! Please open an issue or pull request for bug fixes, new features, or code optimizations.

1. Fork this project.
2. Create a new feature branch (`git checkout -b cool-feature`).
3. Commit your changes (`git commit -m 'Add cool feature'`).
4. Push to the branch (`git push origin cool-feature`).
5. Create a Pull Request.

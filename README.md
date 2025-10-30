# ✨ GenieIMG - AI Image Generator App

Unleash your creativity and generate stunning images with a simple text prompt!  
**GenieIMG** is a modern, full-stack mobile application that transforms your imagination into high-quality visual art using the power of **Generative AI**.

---

## 📸 Visual Showcase

| App Overview | Signup | Login |
|---------------|---------|--------|
| <img src="./screenshots/0 GenieIMG Overview.jpg" width="250" /> | <img src="./screenshots/1 Signup.png" width="250" /> | <img src="./screenshots/2 Login.png" width="250" /> |

| Generate Home | Generate with Keyboard | History |
|----------------|------------------------|----------|
| <img src="./screenshots/Generate Home Page.png" width="250" /> | <img src="./screenshots/Generate with keyboard.png" width="250" /> | <img src="./screenshots/a History.png" width="250" /> |

| Output 1 | Output 2 | Output 3 |
|-----------|-----------|-----------|
| <img src="./screenshots/Output 1.png" width="250" /> | <img src="./screenshots/Output 2.png" width="250" /> | <img src="./screenshots/Output 3.png" width="250" /> |

| Output 4 | Output 5 | Profile |
|-----------|-----------|----------|
| <img src="./screenshots/Output 4.png" width="250" /> | <img src="./screenshots/Output 5.png" width="250" /> | <img src="./screenshots/Profile.png" width="250" /> |


---

## 🎨 Features

| Feature | Description |
|----------|-------------|
| 🧠 **Prompt-to-Image Generation** | Generate unique, high-quality images simply by typing a descriptive text prompt. |
| 🔐 **User Authentication** | Secure **Signup** and **Login** for managing user sessions. |
| 🕓 **Personalized History** | Stores and displays previously generated images for quick access. |
| 🖼️ **Image Details View** | Tap on any history image to view full-screen, see the prompt, and download/share it. |
| 👤 **User Profile** | Displays user info (Name, Email, Member Since) with a Logout option. |
| 🌈 **Sleek & Intuitive UI** | Blue-gradient theme with smooth **Reanimated transitions** for a polished user experience. |

---

## 💻 Technical Stack & Architecture

### 🪄 Frontend (Mobile App)
- ⚛️ **React Native (Expo)** — Cross-platform app for iOS & Android  
- 🎞️ **React Native Reanimated** — For fluid animations and transitions  
- 💅 **Tailwind CSS / NativeWind** — Utility-first and consistent styling  
- 🎨 **Custom Blue Gradient Theme** — Modern and appealing visual design  

### ⚙️ Backend (API & Database)
- 🧩 **MERN Stack** — Powering backend and data storage  
  - 🗄️ **MongoDB** — For storing user data and generated image history  
  - 🚀 **Express.js** — For API routes and middleware  
  - 🧠 **Node.js** — For server-side logic and API handling  

### 🤖 AI / Generative Engine
- 🪶 **Stability AI (or similar API)** — Converts text prompts into high-quality AI-generated images  

---

## ⚙️ Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/Deepak-9988/GenieIMG.git
cd GenieIMG

# 2. Install dependencies
npm install

# 3. Add environment variables
# Create a .env file in the root directory and add:
MONGO_URI=your_mongo_connection_string
AI_API_KEY=your_stability_ai_api_key

# 4. Start the development server (Expo)
npx expo start

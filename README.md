# Cryptonaire App (Mobile)

> **Note:** This repository contains the Mobile App (React Native/Expo) codebase for Cryptonaire.
> The backend repository can be found here: [https://github.com/greatonical/cryptonaire-app-backend](https://github.com/greatonical/cryptonaire-app-backend)

---

## 📱 App Summary

**Cryptonaire** is an interactive mobile game built for crypto enthusiasts and trivia lovers alike. It offers an engaging gameplay loop where users answer questions to earn points, level up, and compete on a global leaderboard. Integrated with the Solana blockchain, the app seamlessly marries web3 concepts with modern mobile app development, providing a premium and responsive user experience.

Through its captivating UI, players navigate a level map, track their progress in real-time, and unlock new challenges based on their trivia performance.

## ✨ Key Features

- **Engaging Gameplay:** Answer diverse questions to earn points and advance through progressively challenging levels.
- **Level Progression System:** A mathematical progression model where the required questions to advance increase per level (e.g., `level * 10`). Visual level maps indicate completed and current levels.
- **Real-time Leaderboard:** Compete against other players globally. The leaderboard dynamically updates as points are accumulated.
- **Player Stats Screen:** Dedicated stats view showing level progress bar, total points, $SKR tokens, questions answered, and current level in a visual stat grid.
- **Token Withdrawal:** Players can withdraw earned $SKR tokens directly to their connected Solana wallet. The backend treasury signs and funds the on-chain SPL transfer — no SOL balance required in the user's wallet.
- **Web3 Integration:** Integrated with Solana (`@solana/web3.js`), enabling crypto-native functionalities like wallet connectivity and on-chain token transfers.
- **Dynamic Theming:** Comprehensive dark mode and system theme support, fully adaptable across all app screens and customized UI components.
- **Offline & Caching Support:** Powered by React Query to efficiently cache user data and leaderboard stats.

---

## 🛠 Technical Stack

This project is built using modern mobile development tools, heavily utilizing the Expo ecosystem to ensure a robust, cross-platform experience (iOS & Android).

- **Framework:** [React Native](https://reactnative.dev/) & [Expo](https://expo.dev/) (SDK 54)
- **Routing:** [Expo Router](https://docs.expo.dev/router/introduction/) (File-based routing)
- **Styling:** [NativeWind](https://www.nativewind.dev/) (Tailwind CSS for React Native)
- **State Management:** [Zustand](https://github.com/pmndrs/zustand)
- **Data Fetching:** [TanStack React Query](https://tanstack.com/query/latest)
- **Blockchain/Web3:** `@solana/web3.js` & `@wallet-ui/react-native-web3js`
- **Animations:** `react-native-reanimated` & `lottie-react-native`
- **Icons:** `lucide-react-native` & `@expo/vector-icons`

---

## 📂 Project Structure

```text
cryptonaire-app/
├── app/                  # Expo Router based navigation structure
│   ├── (tabs)/           # Main application tabs (Gameplay, Leaderboard, Menu)
│   ├── stats.tsx         # Player stats modal screen
│   ├── withdraw.tsx      # Token withdrawal modal screen
│   ├── _layout.tsx       # Root layout
│   └── ...
├── assets/               # Static assets (images, fonts, Lottie animations)
├── components/           # Reusable UI components
│   └── ui/               # Core UI elements (Buttons, Cards, Maps)
├── constants/            # Global constants and configuration
├── docs/                 # Internal API and module documentation
│   └── USER-API.md       # User module API reference
├── hooks/                # Custom React hooks (e.g., useTheme, useAuth)
├── lib/                  # Core utility libraries
│   ├── api/              # API clients and endpoints configurations
│   └── store/            # Zustand state stores (auth, user, game state)
├── scripts/              # Project maintenance and utility scripts
├── global.css            # Global Tailwind/NativeWind CSS classes
├── app.json              # Expo configuration file
└── tailwind.config.js    # Tailwind configuration and theme specs
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer recommended)
- [Bun](https://bun.sh/) (Used as the package manager in this project)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator (Mac only) or Android Studio Emulator.
- Expo Go App (for testing on a physical device)

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone <repository-url>
   cd cryptonaire-app
   ```

2. **Install dependencies:**

   ```bash
   bun install
   ```

3. **Environment Setup:**

   Duplicate the `.env.example` file to create a `.env` file and configure your local or production backend URLs appropriately.

   ```bash
   cp .env.example .env
   ```

   *Note: Ensure your `EXPO_PUBLIC_API_URL` points to the correct backend endpoint (e.g., `https://cryptonaire-app-backend.onrender.com` for production).*

4. **Start the development server:**

   ```bash
   bun start
   # or
   npx expo start
   ```

5. **Run the App:**
   - Press `i` to open in iOS simulator
   - Press `a` to open in Android emulator
   - Scan the QR code with the Expo Go app on your physical device.

---

## 🧠 State & Data Management

- **Zustand (`/lib/store`)**: Used for global, synchronous state such as Authentication state, User Preferences, and persistent app states like current level or game progress.
- **React Query (`/lib/api`)**: Used for all asynchronous server state (fetching leaderboards, updating user progress, validating questions). It abstracts away caching, background refetching, and error handling for remote data.

## 🎨 Styling & Theming

The application fully implements the **NativeWind (v4)** paradigm, allowing us to write standard Tailwind CSS utility classes directly on React Native core components.

A unified theme token system provides fully dynamic dark/light mode switching, deeply integrated into `tailwind.config.js` and custom hooks (`use-color-scheme.ts`). Ensure to use CSS variables defined in `global.css` if you are extending the theme colors.

---

## 🖥️ Screens

| Screen | Route | Description |
| :--- | :--- | :--- |
| Gameplay | `/(tabs)/index` | Main trivia gameplay loop |
| Leaderboard | `/(tabs)/leaderboard` | Global real-time rankings |
| Menu | `/(tabs)/menu` | Profile, stats, withdraw, settings |
| Stats | `/stats` | Level progress bar + Points, SKR Tokens, Questions Answered, and Current Level stat grid |
| Withdraw | `/withdraw` | Withdraw earned $SKR tokens to a connected Solana wallet; treasury signs the on-chain SPL transfer |
| Change Username | `/change-username` | Update display username (3–30 chars, unique) |
| Game | `/game` | Active question/answer session |

---

## 💸 Token Withdrawal

Players accumulate `$SKR` tokens through gameplay. The withdrawal flow works as follows:

1. From the **Menu** tab, tap **Withdraw Tokens**.
2. The **Withdraw** screen displays the current `$SKR` balance.
3. Enter an amount (or tap **Max**) and confirm.
4. The app calls `POST /user/me/withdraw` via the `useWithdrawMutation` hook.
5. The backend atomically deducts the balance, then transfers SPL tokens from the treasury to the user's Solana wallet on **devnet**.
6. The treasury wallet covers the transaction fee — users do **not** need SOL in their wallet.
7. If the on-chain transfer fails, the in-app balance is automatically restored.

> See [`docs/USER-API.md`](docs/USER-API.md) for the full API reference.

---

## 📄 Scripts

- `bun run start` - Starts the Expo bundler
- `bun run android` - Runs the app on Android
- `bun run ios` - Runs the app on iOS
- `bun run web` - Runs the app on Web
- `bun run lint` - Runs Expo linter to check code quality

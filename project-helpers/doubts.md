# Auth Service Concepts: Refresh Token & Get Current User (`/me`) Explained

**Date & Time:** 2026-08-30 07:05:29 IST  
**Target File:** `project-helpers/doubts.md`  
**Purpose:** Detailed beginner-friendly breakdown of why `refreshToken` (`/api/auth/refresh`) and `getCurrentUser` (`/api/auth/me`) exist and how they work behind the scenes.

---

## Part 1: Refresh Token (`POST /api/auth/refresh`)

### 1. Zaroorat Kyu Hai? (Why do we need it?)

System security me ek fundamental tradeoff hota hai: **Security vs. User Experience (UX)**.

- **Access Token (JWT)** bohot short-lived hota hai (e.g. 15 mins se 24 hours).
  - *Kyu?* Kyuki Access Token stateless hota hai (DB me store nahi hota). Agar koi hacker user ka Access Token chura le, toh hacker life time tak system access kar sakta hai. Isliye iski expiration time kam rakhi jaati hai.
- **Problem:** Agar sirf Access Token ho aur wo 24 ghante me expire ho jaye, toh user jab bhi website use kar raha hoga, use har 24 ghante me suddenly logout kar diya jayega aur password dobara dalna padega. Yeh bohot hi bekar User Experience (UX) hai.
- **Solution (Refresh Token):**
  - **Refresh Token** ek long-lived token hota hai (e.g. 7 days ya 30 days) jo server ki **MySQL database (`refresh_tokens` table)** me store hota hai.
  - Jab Access Token expire ho jaata hai, toh React frontend background me chupchap (silently) `POST /api/auth/refresh` API ko Refresh Token bhejta hai.
  - Server naya Access Token issue kar deta hai. User ko pata bhi nahi chalta aur wo bina kisi disturbance ke app use karta rehta hai!

---

### 2. Kaise Kaam Karta Hai? (Step-by-Step Working Flow)

```text
[ React Frontend ]                                          [ Auth Service & MySQL ]
        |                                                              |
        |--- 1. Login Request (email, password) ---------------------->|
        |<-- 2. Returns Access Token (24h) + Refresh Token (7 days) ---| (Save RefreshToken in DB)
        |                                                              |
        |~~~ (After 24 hours: Access Token Expired) ~~~~~~~~~~~~~~~~~~~|
        |                                                              |
        |--- 3. GET /api/files (with Expired Access Token) ----------->|
        |<-- 4. Returns 401 Unauthorized ------------------------------|
        |                                                              |
        |--- 5. POST /api/auth/refresh (with Refresh Token) ---------->|
        |                                                              |--- Verify in DB
        |                                                              |--- Check if expired?
        |<-- 6. Returns New Access Token ------------------------------|
        |                                                              |
        |--- 7. Retry GET /api/files (with New Access Token) --------->|
        |<-- 8. Returns 200 OK (Files Data) ---------------------------|
```

#### Code Implementation Steps in Backend:
1. **Request Body:** Client sends `{ "refreshToken": "a1b2c3d4-..." }`.
2. **`AuthServiceImpl.refreshToken()` Method:**
   - Database me find karta hai: `refreshTokenRepository.findByToken(token)`.
   - Verify karta hai: Kya expiry date nikal chuki hai? (`token.getExpiryDate().isBefore(Instant.now())`).
   - Agar expire ho gaya hai -> DB se token delete karta hai aur Exception phenkta hai (User ko login screen par bhejta hai).
   - Agar valid hai -> `JwtService.generateToken(userDetails)` se ek Naya Access Token banakar client ko return kar deta hai.

---

## Part 2: Get Current User / Me (`GET /api/auth/me`)

### 1. Zaroorat Kyu Hai? (Why do we need it?)

Is API ki zaroorat teen main reasons se padti hai:

1. **Browser Refresh / App Reload (F5 Problem):**
   - React application me jab user F5 press karta hai ya browser reload karta hai, toh React ki JavaScript memory (Redux/Context API state) wipe-out (reset) ho jaati hai.
   - Page load hote hi React app dekhta hai: *"Kya mere pass LocalStorage/Cookie me Access Token hai?"*
   - Agar token hai, toh React sabse pehle `GET /api/auth/me` ko call karta hai taaki authenticated user ka naam, email, role aur profile info fetch karke UI me navbar/profile widget par dikha sake.

2. **Security & Session Validation:**
   - Token valid hone ke sath-sath yeh check hota hai ki kya User Account abhi bhi Active hai? (Pata chale user DB se delete ya block ho gaya ho par token valid ho).

3. **Decoupled Architecture (Microservices):**
   - Microservices architecture me frontend ko direct database ka access nahi hota. Identity verify karne ke liye `/api/auth/me` standard endpoint hai.

---

### 2. Kaise Kaam Karta Hai? (Step-by-Step Working Flow)

```text
[ React App Load ] ---> GET /api/auth/me (Header: Bearer <AccessToken>)
                                 │
                                 ▼
                   [ JwtAuthenticationFilter ]
                   - Validates JWT signature
                   - Extracts email from JWT
                   - Sets SecurityContextHolder Authentication
                                 │
                                 ▼
                     [ AuthController.java ]
                   - Receives Authentication principal
                   - String email = authentication.getName();
                                 │
                                 ▼
                     [ AuthServiceImpl.java ]
                   - userRepository.findByEmail(email)
                   - UserMapper.toUserProfileResponse(user)
                                 │
                                 ▼
               Returns 200 OK + User Profile JSON Envelope
```

#### Backend Code Breakdown (`AuthController.java`):

```java
@GetMapping("/me")
public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(Authentication authentication) {
    // Spring Security automatically passes the logged-in user's email inside `authentication.getName()`
    String email = authentication.getName();
    
    // Fetch profile from database
    UserProfileResponse userProfile = authService.getUserProfile(email);
    
    // Return standard response envelope
    return ResponseEntity.ok(ApiResponse.success("User profile retrieved successfully", userProfile));
}
```

---

## Summary Comparison Table

| Feature | `POST /api/auth/refresh` | `GET /api/auth/me` |
| :--- | :--- | :--- |
| **Primary Goal** | Expired Access Token ko bina relogin ke naya karna. | Active user ka complete profile data fetch karna. |
| **Authentication** | Public Endpoint (bhejta hai `refreshToken` in JSON body). | Protected Endpoint (chahiye `Bearer <accessToken>` in Header). |
| **Database Usage** | `refresh_tokens` table se token check & delete karta hai. | `users` table se user info fetch karta hai. |
| **When React Calls It** | Jab koi API call `401 Unauthorized` fail ho jati hai. | Page reload (F5) hone par ya navbar/profile render karte waqt. |

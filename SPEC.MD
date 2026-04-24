# V1 Product Specification: Screenlog: A Modern Watch Tracker for TV Shows and Movies of all kinds.

## 1. Product Overview

Build Screenlog, a modern, mobile-first watch tracker for TV shows, movies, and anime. The product helps users organise what they watch, track episode progress, manage watchlists, see what to watch next, and discover new content.

This is not a streaming app. Users do not watch videos inside the platform. The product is a personal entertainment tracker.

The V1 must feel like a polished product, not a technical prototype. The core experience should be fast, clean, visual, and easy to use on mobile and desktop.

## 2. V1 Product Goal

The goal of V1 is to deliver a complete, usable entertainment tracking experience where users can:

- Create an account and sign in securely.
- Search for TV shows, movies, and anime.
- Add content to their watchlist.
- Track show progress by season and episode.
- Mark episodes and movies as watched.
- See what to watch next.
- View upcoming episodes from tracked shows.
- Discover trending and recommended content.
- View a personal profile with basic watching stats.
- Use the product comfortably in both dark mode and light mode.

The product should focus on the core habit loop:

Search content → Add to watchlist → Track progress → See what to watch next → Mark watched → Check upcoming releases → Discover more content.

## 3. V1 Technology Stack

Use the following stack:

- SvelteKit
- TypeScript
- Better Auth
- Neon PostgreSQL
- Prisma
- TMDB API
- TVmaze API
- Tailwind CSS
- shadcn-svelte
- Bits UI
- Lucide Svelte
- Motion (Previously Framer Motion for Svelte)
- Dark and light mode support

The app should be built as a proper full-stack web application, with a clean backend/API layer. The frontend should not directly rely on raw TMDB or TVmaze response structures. External API data should be normalised by the backend before reaching the UI.

## 4. Product Positioning

A beautifully simple tracker for every show, movie, and anime on your watchlist.

The product should feel premium, fast, and personal. It should not feel like a generic admin dashboard or a plain database browser.

The product should prioritise:

- Tracking clarity
- Fast actions
- Mobile-first usability
- Clean discovery
- Cinematic visual presentation
- Personal ownership through stats and progress

## 5. Core User Types

### 5.1 New User

A user who has not added anything yet. Their experience must guide them quickly into adding their first shows or movies.

Needs:

- Clear onboarding
- Fast search
- Easy content adding
- Simple progress setup
- Immediate watchlist value

### 5.2 Active Tracker

A user who watches multiple shows and films regularly.

Needs:

- Quick access to next episodes
- Clear progress tracking
- Upcoming episode visibility
- Easy watched/unwatched actions
- Fast search and discovery

### 5.3 Casual Movie/Series User

A user who wants a clean place to store future watch ideas.

Needs:

- Simple watchlist
- Movie tracking
- Discover page
- Minimal friction

## 6. Core V1 Modules

V1 includes only the following modules:

1. Authentication
2. Onboarding
3. Home / Watchlist
4. Search
5. Show Detail
6. Season and Episode Tracking
7. Movie Detail
8. Calendar / Upcoming
9. Discover
10. Profile and Stats
11. Settings
12. Theme System
13. Basic Error, Empty, and Loading States

## 7. Authentication

Authentication must use Better Auth.

### 7.1 Required Auth Features

- Sign up
- Sign in
- Sign out
- Forgot password flow
- Session handling
- Protected authenticated pages
- Basic account settings

### 7.2 Auth Methods for V1

Include:

- Email and password authentication
- Google login if straightforward to configure within V1

If Google login causes unnecessary setup complexity, email and password can be completed first, but the system should be structured cleanly enough to add Google login without rework.

### 7.3 Auth UX Requirements

- Authentication screens must look polished and match the app’s brand style.
- Users should be redirected back to the correct protected page after login where relevant.
- Auth errors must be shown clearly in plain human language.
- Forms must include validation.
- Loading states must prevent double submissions.

## 8. Onboarding

Onboarding is required because the app has little value until the user adds content.

### 8.1 Onboarding Goal

Help users add their first titles and set initial tracking progress as quickly as possible.

### 8.2 Onboarding Flow

Recommended flow:

1. Welcome screen
2. Choose content interests
3. Search and add first titles
4. Set initial progress for selected shows
5. Land on Home / Watchlist

### 8.3 Welcome Screen

Purpose: explain the product quickly.

Content direction:

- One strong headline
- One short supporting line
- Primary CTA to start

The page should not be text-heavy.

### 8.4 Choose Content Interests

Allow users to select from:

- TV Shows
- Movies
- Anime

Optional genre chips:

- Action
- Adventure
- Anime
- Comedy
- Crime
- Drama
- Fantasy
- Horror
- Mystery
- Romance
- Sci-Fi
- Thriller

This helps personalise the early discovery experience.

### 8.5 Add First Titles

Users should be encouraged to add at least 3 titles, but they should be allowed to skip.

Search should support:

- Shows
- Movies
- Anime where available through metadata

Each search result should have:

- Poster
- Title
- Year
- Type label
- Short overview if available
- Add button

### 8.6 Initial Progress Setup

For each show added during onboarding, allow quick status selection:

- Not started
- Watching
- Caught up
- Completed

If user selects Watching, allow them to choose the last watched season and episode in a simple way.

Do not force users to manually tick every episode during onboarding.

### 8.7 Onboarding Completion

After onboarding, users should land on the Home / Watchlist page and immediately see useful sections based on what they added.

If the user skipped adding content, show a strong empty state with search and discovery CTAs.

## 9. Home / Watchlist

Home is the most important authenticated page.

### 9.1 Purpose

Tell users what to watch next and give them quick control over their watch progress.

### 9.2 Required Sections

Home should include these sections when relevant:

1. Continue Watching
2. Up Next / Watch Next
3. New or Upcoming Episodes
4. Movies Watchlist
5. Recently Watched
6. Completed / Finished Shows, collapsed or secondary

Sections with no content should be hidden or replaced with helpful empty states.

### 9.3 Continue Watching

Shows where the user has started watching but has not completed all available episodes.

Each item should show:

- Poster thumbnail
- Show title
- Next episode number
- Next episode title
- Progress indicator
- Quick Mark Watched button
- Link to show detail

### 9.4 Watch Next Logic

For each active show, the app should identify the next unwatched episode based on the user’s progress.

The next episode should be calculated from watched episode state and episode order.

The UI should make this obvious:

Example display format:

S02E04 · Episode Title

### 9.5 Movies Watchlist

Movies added but not yet watched.

Each item should show:

- Poster
- Movie title
- Year
- Runtime if available
- Main genres if available
- Mark Watched button

### 9.6 Recently Watched

Shows recently watched episodes and movies recently marked watched.

This section helps users feel progress and continuity.

### 9.7 Home Empty State

If the user has no watchlist content:

- Show a friendly empty state.
- Explain that they can start by searching for favourite shows or movies.
- Include primary button: Search Content
- Include secondary button: Explore Trending

### 9.8 Home UX Requirements

- Marking an episode watched should feel instant.
- The UI should update without full page reloads where possible.
- Undo should be considered after marking watched if easy to implement.
- Mobile layout must be excellent.
- Poster images should load gracefully with placeholders.

## 10. Search

### 10.1 Purpose

Allow users to quickly find shows and movies and add them to their watchlist.

### 10.2 Search Sources

Use:

- TMDB for movies and shows
- TVmaze where needed for TV-specific data and episode structure

Backend should control API calls and response normalisation.

### 10.3 Search Page Features

Required:

- Search input
- Debounced results
- Filter by All, Shows, Movies
- Result cards
- Add to watchlist action
- Open detail page action
- Recent searches if easy
- Empty state for no results
- Loading state while searching

### 10.4 Search Result Card

Each result should show:

- Poster
- Title
- Year
- Type label: Show or Movie
- Short overview
- Genre chips if available
- Add button or Added state

### 10.5 Search Behaviour

- Do not search on every keystroke immediately. Use debounce.
- Handle missing posters gracefully.
- Avoid duplicate content in results where possible.
- If an item is already in the user’s watchlist, show Added instead of Add.
- Clicking the card opens the detail page.

## 11. Show Detail Page

### 11.1 Purpose

Show detailed information about a series and allow users to manage tracking progress.

### 11.2 Required Sections

1. Hero section
2. Main actions
3. Metadata
4. Overview
5. Progress summary
6. Season selector
7. Episode list

### 11.3 Hero Section

Should include:

- Backdrop image if available
- Poster
- Show title
- Year or first air date
- Status if available
- Genre chips

The hero should feel cinematic and premium, especially in dark mode.

### 11.4 Main Actions

Actions should include:

- Add to Watchlist
- Remove from Watchlist
- Change status
- Mark as Caught Up
- Mark as Completed where appropriate

Status options:

- Plan to Watch
- Watching
- Caught Up
- Completed
- Paused
- Dropped

### 11.5 Metadata

Show useful metadata where available:

- Genres
- First air date
- Runtime
- Language
- Status
- Network or web channel where available

Do not clutter the page with too much data.

### 11.6 Progress Summary

Show:

- Episodes watched
- Total episodes available
- Percentage progress
- Current status
- Next unwatched episode if available

### 11.7 Seasons and Episodes

Users should be able to choose a season and view its episodes.

Each episode row should show:

- Watched checkbox/state
- Season and episode number
- Episode title
- Air date
- Runtime if available
- Short overview expandable if available

### 11.8 Bulk Actions

V1 must include at least some bulk progress actions because manually tracking long shows is painful.

Recommended actions:

- Mark selected season as watched
- Mark previous episodes as watched
- Mark show as caught up
- Reset show progress

These actions should ask for confirmation if they affect many episodes.

### 11.9 Show Detail Empty/Data Missing States

Handle:

- Missing poster
- Missing backdrop
- Missing overview
- Missing episode data
- API errors

The page should not break if metadata is incomplete.

## 12. Episode Tracking

### 12.1 Episode Watched State

Users must be able to:

- Mark an episode as watched
- Mark an episode as unwatched
- See watched state clearly

### 12.2 Episode Detail

V1 can include a simple episode detail screen or drawer.

It should show:

- Episode title
- Season/episode number
- Air date
- Overview
- Still image if available
- Mark watched/unwatched button
- Previous/next episode navigation if easy

### 12.3 Episode Tracking Behaviour

When an episode is marked watched:

- Progress should update.
- Watch Next should update.
- Recently Watched should update.
- If the last available episode is watched, show status should become Caught Up or Completed depending on show status.

Do not overcomplicate this, but the behaviour should feel sensible.

## 13. Movie Detail Page

### 13.1 Purpose

Allow users to view movie details, add to watchlist, and mark as watched.

### 13.2 Required Sections

1. Hero section
2. Main actions
3. Metadata
4. Overview
5. Optional related content if simple

### 13.3 Hero Section

Include:

- Backdrop image if available
- Poster
- Movie title
- Release year
- Genre chips

### 13.4 Movie Actions

Actions:

- Add to Watchlist
- Mark as Watched
- Remove from Watchlist
- Mark as Favourite if simple

Movie statuses:

- Plan to Watch
- Watched
- Favourite
- Dropped / Not Interested

### 13.5 Movie Metadata

Show where available:

- Release date
- Runtime
- Genres
- Language
- Overview

## 14. Calendar / Upcoming

### 14.1 Purpose

Show upcoming episodes from shows the user tracks.

This is a key retention feature.

### 14.2 Required View

Use a clean grouped list view for V1.

Group by:

- Today
- Tomorrow
- This Week
- Next Week
- Later

A full monthly calendar is not required for V1.

### 14.3 Calendar Item

Each item should show:

- Poster thumbnail
- Show title
- Season and episode number
- Episode title
- Release date
- Status label

Example labels:

- Airing today
- Coming tomorrow
- Coming in 5 days
- Available now
- Season premiere
- Finale, if known

### 14.4 Calendar Data Rules

Only show upcoming episodes from shows the user has added to their watchlist or is tracking.

Do not flood this page with unrelated trending releases.

### 14.5 Calendar Empty State

If no upcoming episodes are available:

- Show a simple empty state.
- Suggest adding currently airing shows.
- Provide a Discover CTA.

## 15. Discover

### 15.1 Purpose

Help users find new shows and movies.

The Discover page should be simple but useful. Avoid making it noisy.

### 15.2 Required Sections

Use TMDB-driven sections where available:

- Trending Shows
- Trending Movies
- Popular Shows
- Popular Movies
- Top Rated Shows
- Top Rated Movies
- New or Recently Released

### 15.3 Personalised Section

Add a simple personalised section if enough user data exists:

- Based on genres in the user’s watchlist
- Based on similar titles
- Based on popular titles in watched genres

This does not require AI or machine learning in V1. A simple rules-based recommendation system is enough.

### 15.4 Discover Card

Each card should show:

- Poster
- Title
- Year
- Type label
- Genre if available
- Add button

### 15.5 Discover UX

- Poster grid on desktop
- Horizontally scrollable rows or grid on mobile
- Clear section headings
- Quick add buttons
- Detail page access

## 16. Profile and Stats

### 16.1 Purpose

Give users a sense of ownership and progress.

### 16.2 Profile Page Sections

Required:

- User avatar or initials
- Name / username
- Basic watch stats
- Currently watching
- Completed shows
- Movies watched
- Recently watched

### 16.3 Basic Stats

Show:

- Shows tracked
- Shows completed
- Episodes watched
- Movies watched
- Total watch time estimate
- Favourite/top genres if available

The total watch time estimate can be calculated from available runtime data. If runtime is missing, skip or estimate only from known data.

### 16.4 Profile UX

The page should feel personal and rewarding, not like a settings page.

Use cards and clean visual hierarchy.

## 17. Settings

### 17.1 Required Settings

Include:

- Account details
- Theme selection
- Region selection if useful for metadata
- Language preference if simple
- Notification preferences placeholder
- Delete account option
- Sign out

### 17.2 Theme Selection

Options:

- System
- Dark
- Light

Theme selection should persist.

### 17.3 Delete Account

If included, it must require confirmation.

## 18. Theme System

V1 must support both dark mode and light mode.

### 18.1 Default Theme

The app should use system preference by default.

### 18.2 Dark Mode Direction

Dark mode should feel cinematic and premium.

Use:

- Deep backgrounds
- Soft surfaces
- Clear poster emphasis
- Strong but not harsh contrast
- Elegant accent colour

### 18.3 Light Mode Direction

Light mode should feel clean, modern, and readable.

Use:

- Soft neutral backgrounds
- Clear cards
- Strong typography
- Subtle borders
- Accessible contrast

### 18.4 Theme Requirements

- No broken colours in either mode.
- All components must work in both themes.
- Poster placeholders must work in both themes.
- Forms must be readable in both themes.

## 19. UI Design Direction

### 19.1 Overall Style

The app should feel:

- Premium
- Mobile-first
- Cinematic
- Clean
- Fast
- Personal
- Modern

Avoid making it look like:

- A generic SaaS dashboard
- A plain table-based admin panel
- A direct clone of another tracker
- A cluttered social feed

### 19.2 Visual System

Recommended direction:

- Dark-first design with strong light mode support
- Poster-heavy interface
- Rounded cards
- Smooth spacing
- Strong content hierarchy
- Minimal but expressive icons
- Clean motion, not excessive animation

### 19.3 Core UI Components to Build

Use shadcn-svelte and Bits UI for foundations, but custom-build the entertainment-specific components.

Required custom components:

- PosterCard
- SearchResultCard
- WatchNextCard
- MovieWatchlistCard
- ShowHero
- MovieHero
- EpisodeRow
- SeasonSelector
- ProgressBar
- StatusPill
- CalendarReleaseCard
- StatsCard
- EmptyState
- BottomNavigation
- ThemeToggle
- LoadingSkeleton

### 19.4 Navigation

Mobile bottom navigation:

- Home
- Search
- Calendar
- Discover
- Profile

Desktop navigation:

- Home
- Search
- Calendar
- Discover
- Profile
- Settings

Settings can be accessed from Profile on mobile.

## 20. External API Usage

### 20.1 TMDB

Use TMDB for:

- Search movies
- Search shows
- Movie details
- Show details
- Posters
- Backdrops
- Genres
- Trending content
- Popular content
- Top-rated content
- Similar/recommended titles where useful

### 20.2 TVmaze

Use TVmaze for:

- TV-specific episode data
- Air dates
- Episode schedules
- Season/episode structure where useful

### 20.3 API Normalisation

The app should not expose raw TMDB/TVmaze structures directly to the UI.

Create a clean internal content format for:

- Show summary
- Show detail
- Season
- Episode
- Movie summary
- Movie detail
- Search result
- Discovery item
- Calendar item

### 20.4 Caching

Use sensible caching for external API data to avoid unnecessary API calls.

At minimum:

- Cache content details after first fetch.
- Avoid refetching unchanged show/movie metadata on every page load.
- Refresh time-sensitive episode data when needed.

The implementation can choose the best caching approach.

## 21. API / Backend Expectations

The app should have a clean backend layer that supports the web frontend and future clients.

### 21.1 Required API Areas

- Auth/session handling
- Current user profile
- Search
- Shows
- Movies
- Watchlist
- Episode progress
- Movie progress
- Calendar/upcoming
- Discover
- Stats
- Settings

### 21.2 API Design Principles

- Keep responses consistent.
- Use clear error messages.
- Validate inputs.
- Protect authenticated actions.
- Do not expose external API keys to the browser.
- Keep frontend models clean and predictable.

### 21.3 Important Backend Behaviour

When users add content:

- Store enough normalised metadata to show the item quickly later.
- Preserve the relationship between the user and the content.
- Ensure progress can be calculated reliably.

When users mark watched:

- Update progress.
- Update recently watched activity.
- Recalculate next episode.
- Keep the UI state consistent.

## 22. Page List

### 22.1 Public Pages

- Landing page
- Sign in
- Sign up
- Forgot password
- Public show detail if easy
- Public movie detail if easy

Public show/movie pages are useful but not essential if they slow down V1. Authenticated functionality is more important.

### 22.2 Authenticated Pages

- Onboarding
- Home / Watchlist
- Search
- Discover
- Calendar / Upcoming
- Show Detail
- Movie Detail
- Profile
- Settings

### 22.3 Optional Lightweight Pages

- Not Found page
- Error page
- Terms page
- Privacy page

Terms and Privacy can be basic placeholders during development but should exist before any public launch.

## 23. Key User Flows

### 23.1 New User First Use

1. User signs up.
2. User enters onboarding.
3. User selects interests.
4. User searches for favourite shows/movies.
5. User adds first titles.
6. User sets show progress.
7. User lands on Home.
8. User sees next episode/watchlist value immediately.

### 23.2 Add a Show

1. User searches for a show.
2. User opens show detail or clicks Add.
3. App fetches and stores normalised show data.
4. User chooses status.
5. Show appears in Home / Watchlist.
6. If watching, next episode is shown.

### 23.3 Track Episode Progress

1. User opens Home or Show Detail.
2. User marks an episode watched.
3. Progress updates.
4. Next episode updates.
5. Recently Watched updates.
6. Calendar remains consistent.

### 23.4 Add a Movie

1. User searches for a movie.
2. User adds it to watchlist.
3. Movie appears in Movies Watchlist.
4. User marks it watched later.
5. Profile stats update.

### 23.5 Check Upcoming Releases

1. User opens Calendar.
2. App shows upcoming episodes from tracked shows.
3. User sees grouped release list.
4. User can open show or episode details.

### 23.6 Discover New Content

1. User opens Discover.
2. User browses trending/popular/recommended sections.
3. User adds content directly or opens details.
4. Added content appears in Watchlist.

## 24. Loading, Empty, and Error States

Every major page must handle:

- Loading state
- Empty state
- Error state
- Missing image state
- Missing metadata state

### 24.1 Loading States

Use skeletons for poster cards, list rows, and detail pages.

### 24.2 Empty States

Empty states should guide action, not just say there is nothing.

Example:

No shows yet. Start by adding your favourite series and we’ll show you what to watch next.

### 24.3 Error States

Errors should be human-friendly.

Avoid raw technical errors on the frontend.

Example:

We couldn’t load this show right now. Please try again.

## 25. Performance Requirements

The app should feel fast.

### 25.1 Requirements

- Optimise poster image loading.
- Use lazy loading for image-heavy grids.
- Avoid unnecessary external API calls.
- Use skeleton loading states.
- Keep interactions fast, especially marking watched.
- Avoid huge client-side bundles where possible.
- Use pagination or limited sections for large lists.

### 25.2 Mobile Performance

Mobile performance is critical.

The Home, Search, and Show Detail pages should feel smooth on a normal mid-range phone.

## 26. Accessibility Requirements

V1 should follow basic accessibility standards.

Required:

- Keyboard navigable forms and controls
- Proper button labels
- Sufficient colour contrast in both themes
- Visible focus states
- Semantic headings
- Alt text or sensible fallback for images
- Accessible dialogs/dropdowns via Bits UI/shadcn-svelte foundations

## 27. SEO Requirements

SEO is not the primary product goal, but public pages should be clean.

If public show/movie pages are included:

- Use proper titles
- Use meta descriptions
- Use structured headings
- Use clean URLs
- Use server-side rendering where appropriate

Authenticated pages do not need SEO focus.

## 28. Content and Copy Tone

The product copy should be simple, clear, and modern.

Avoid:

- Overly corporate wording
- Long explanations
- Technical language
- Cringe entertainment slang

Use concise, helpful copy.

Examples:

- Continue Watching
- Watch Next
- Added to Watchlist
- Mark Watched
- Coming Tomorrow
- No upcoming episodes yet
- Start tracking your first show

## 29. Acceptance Criteria

V1 can be considered complete when the following are true:

### 29.1 Auth

- A user can sign up.
- A user can sign in.
- A user can sign out.
- Protected pages cannot be accessed without authentication.

### 29.2 Onboarding

- A new user can complete onboarding.
- A new user can add at least one show or movie during onboarding.
- A new user can skip onboarding and still use the app.

### 29.3 Search

- Users can search shows and movies.
- Users can add content from search.
- Search handles loading, empty, and error states.

### 29.4 Show Tracking

- Users can add a show.
- Users can view show details.
- Users can view seasons and episodes.
- Users can mark episodes watched/unwatched.
- Progress updates correctly.
- Next episode updates correctly.

### 29.5 Movie Tracking

- Users can add a movie.
- Users can view movie details.
- Users can mark a movie watched.
- Movie stats update correctly.

### 29.6 Home / Watchlist

- Home shows user’s active tracking state.
- Continue Watching works.
- Movies Watchlist works.
- Recently Watched works.
- Empty state works for new users.

### 29.7 Calendar

- Calendar shows upcoming episodes from tracked shows.
- Calendar groups items clearly.
- Calendar handles no upcoming content.

### 29.8 Discover

- Discover shows trending/popular content.
- Users can add content from Discover.
- Discover handles loading and errors.

### 29.9 Profile

- Profile shows basic user identity.
- Profile shows basic stats.
- Stats update after tracking actions.

### 29.10 Theme

- App supports dark mode.
- App supports light mode.
- App supports system theme preference.
- Theme persists.

### 29.11 UI Quality

- App works well on mobile.
- App works well on desktop.
- Core pages are visually polished.
- No obvious broken layouts.
- Missing posters/metadata do not break the UI.

## 30. V1 Build Priority

Recommended implementation order:

1. Project setup and design system
2. Auth
3. Base layout and navigation
4. Theme system
5. External API service layer
6. Search
7. Add to watchlist
8. Show detail and episode tracking
9. Movie detail and movie tracking
10. Home / Watchlist
11. Calendar / Upcoming
12. Discover
13. Profile and stats
14. Settings
15. Loading/empty/error polish
16. Final responsive and UI polish

## 31. Final V1 Summary

Build a polished, mobile-first web app for tracking shows, movies, and anime.

The V1 must deliver the full core tracking experience:

- Search content
- Add to watchlist
- Track episodes and movies
- See what to watch next
- View upcoming releases
- Discover new content
- View personal progress and stats
- Use the app in dark and light mode

The product should be simple, fast, visual, and genuinely useful from the first session.

The success of V1 is not measured by feature count. It is measured by whether users can open the app and instantly understand what they should watch next, what they have already watched, and what is coming soon.

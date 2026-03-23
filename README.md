# Closerr - AI Sales Coach

An AI-powered voice training platform for sales professionals. Practice objection handling against realistic buyer personas, get real-time performance metrics, and improve your closing rate.

## 🚀 Features

✅ **Three Buyer Personas**
- Skeptical CFO (Financial rigor, ROI-focused)
- Busy Founder (Speed, direct, no small talk)
- Price-Sensitive SMB Owner (Cost-conscious, pragmatic)

✅ **Real-Time Metrics During Calls**
- Talk-to-listen ratio
- Speaking pace (WPM)
- Question frequency & quality levels
- Sentiment analysis

✅ **Comprehensive Scoring (0-100)**
- Conversational Metrics (25 pts) - pacing, talk ratio, question count
- Discovery Depth (25 pts) - question sophistication (Level 1/2/3)
- Tactical Empathy (20 pts) - labeling, mirroring, calibrated questions
- Persona Alignment (10 pts) - persona-specific value drivers
- Objection Handling (10 pts) - recovery rate
- Closing Execution (10 pts) - next steps confirmation

✅ **Call History & Dashboard**
- Track all training sessions with scores
- View stats: avg score, best score, total calls
- Sort by date or score
- Full call transcripts saved
- All data in browser localStorage (MVP)

✅ **Mobile Responsive**
- Full responsive design
- Works on phone, tablet, desktop
- Touch-friendly controls

## 🏗️ Tech Stack

- **Framework**: Next.js 16.2.1 (App Router)
- **Frontend**: React 19, TypeScript, Tailwind CSS
- **State**: Zustand
- **Speech-to-Text**: Deepgram (nova-2 model)
- **Text-to-Speech**: ElevenLabs
- **AI Personas**: OpenAI GPT-4o
- **Storage**: Browser localStorage

## ⚙️ Getting Started

### Prerequisites
- Node.js 18+
- API keys for:
  - Deepgram (free tier available)
  - OpenAI (GPT-4o)
  - ElevenLabs (free tier available)

### Setup

1. **Clone and install**
```bash
npm install
```

2. **Create `.env.local` with your API keys:**
```env
DEEPGRAM_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
ELEVENLABS_API_KEY=your_key_here
```

3. **Run dev server**
```bash
npm run dev
```

4. **Open** http://localhost:3000

### Build for production:
```bash
npm run build
npm start
```

## 📝 Usage

1. **Home Page**: Select a buyer persona you want to practice with
2. **Simulation**:
   - Press "Start" to begin recording
   - Deliver your sales pitch
   - AI responds with realistic objections
   - Watch real-time metrics update
   - Continue the conversation naturally
3. **Results Page**:
   - View your complete scorecard
   - See breakdown by all 6 scoring categories
   - Review full conversation transcript
   - Option to start another call
4. **Dashboard**:
   - View all past calls and scores
   - Track improvement over time
   - Sort and filter sessions

## 📊 Scoring System

Based on Gong.io methodology and "Never Split the Difference" (Chris Voss):

### Conversational Metrics (25 pts)
- Talk ratio: 43-57% optimal (penalty if >65% or <35%)
- Speaking pace: 140-170 WPM (penalty if >180 or <120)
- Questions: 8-25 per call optimal

### Discovery Depth (25 pts)
- Level 1 (surface): +1 pt each
- Level 2 (problem exploration): +3 pts each
- Level 3 (gap/impact): +7 pts each

### Tactical Empathy (20 pts)
- Labeling ("It seems like...") +5 pts each
- Mirroring key words +3 pts each
- Calibrated questions +5 pts each
- Penalty phrases ("Does that make sense?") -5 pts each
- Severe violations ("We're the best", "Trust me") -10 pts each

### Persona Alignment (10 pts)
- CFO: ROI mentioned = +10 pts
- Founder: Speed/implementation mentioned = +5 pts
- SMB: Cost/budget mentioned = +5 pts

### Objection Handling (10 pts)
- Based on % of raised objections successfully addressed

### Closing (10 pts)
- Next step confirmed: +4 pts
- Calendar invite accepted: +3 pts
- Mutual action plan: +3 pts

## 📁 Project Structure

```
app/
├── page.tsx                      # Home & persona selection
├── (dashboard)/
│   ├── dashboard/page.tsx        # Call history & stats
│   ├── results/[callId]/page.tsx # Detailed scorecard
│   └── layout.tsx
├── api/
│   ├── chat/route.ts             # Persona AI + metrics
│   ├── transcribe/route.ts       # Speech-to-text
│   └── tts/route.ts              # Text-to-speech
└── layout.tsx                    # Root layout

components/
├── simulation/
│   ├── VoiceInterface.tsx        # Main call experience
│   ├── Transcript.tsx            # Conversation display
│   ├── CallTimer.tsx             # Duration timer
│   └── PersonaDisplay.tsx        # Persona info
└── ui/                           # Shadcn/ui components

hooks/
├── useCallHistory.ts             # localStorage manager
└── useSimpleTranscription.ts     # Browser recording

lib/
├── state/callStore.ts            # Zustand state + scoring logic
```

## 🔌 API Endpoints

- `POST /api/transcribe` - Audio blob → transcript (Deepgram)
- `POST /api/chat` - User transcript → AI response + metrics (GPT-4o)
- `POST /api/tts` - Text → audio blob (ElevenLabs)

## 🎯 What's Included (MVP)

✅ Full voice interface with real-time metrics
✅ Three realistic buyer personas with system prompts
✅ Comprehensive scoring algorithm (0-100)
✅ Call history with localStorage
✅ Dashboard with stats and filtering
✅ Mobile responsive design
✅ Error handling and recovery

## 📝 What's Next (Future)

- [ ] Backend database (Supabase/Firebase) for production
- [ ] User authentication & teams
- [ ] Advanced analytics dashboard
- [ ] Custom persona builder
- [ ] Export transcripts & scores
- [ ] Performance trends & recommendations
- [ ] Coach feedback on video calls
- [ ] API-based integrations

## ⚠️ Known Limitations (MVP)

- Call history in browser only (~5-10MB localStorage limit)
- No multi-user support or teams
- Persona responses are best-effort (not perfect)
- Audio-only (no video)
- No persistence after browser clear

## 🐛 Troubleshooting

**Microphone not working?**
- Check browser permissions (Settings > Privacy > Microphone)
- Ensure HTTPS (or localhost)
- Try a different browser

**API errors?**
- Verify all env vars are set in `.env.local`
- Check API key validity and usage limits
- Check browser console for specific errors

**Audio playback issues?**
- Check speaker/audio output settings
- Ensure browser audio isn't muted
- Try refreshing the page

**Performance issues?**
- Clear localStorage: `localStorage.clear()`
- Try on a newer device
- Reduce browser extensions

## 📄 License

Proprietary - Closerr 2026

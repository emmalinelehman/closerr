# **Product Requirements Document: Closerr**

**Project Title:** Closerr: AI Sales Coach and Objection Simulator

**Date:** March 22, 2026

**Document Status:** Version 1.1 (Comprehensive Specification)

## **1\. Executive Summary**

Closerr is a voice-first AI sales training platform designed for early-career sales professionals. It simulates high-stakes sales conversations with varied buyer personas and provides detailed post-call analysis. Unlike generic voice bots, Closerr focuses on objective delivery metrics (pacing, clarity) and strategic performance (objection handling), making high-quality coaching repeatable and data-driven.

---

## 

## **2\. Core Features & Functional Requirements**

## 

## **2.1 Voice-Based Simulation Engine**

* **The Interaction:** Real-time, voice-to-voice communication.  
* **Technical Flow:** User Speech $\\rightarrow$ STT $\\rightarrow$ Persona-Driven LLM $\\rightarrow$ TTS $\\rightarrow$ User Audio.  
* **Barge-In:** The AI must stop speaking immediately if the user interrupts, mimicking a natural sales rhythm.

## **2.2 Persona and Scenario System**

* **Dynamic Behavior:** AI personas must simulate distinct personality types:  
  * **The Skeptical CFO:** Requests hard ROI; dismissive of emotional appeals.  
  * **The Busy Founder:** High speed; skips small talk; looks for "the bottom line."  
  * **The Price-Sensitive SMB Owner:** Fixated on cost and immediate overhead impact.  
* **Context Consistency:** While personas change, the product being sold remains consistent to allow for progress tracking over time.

## 

## **2.3 Detailed Feedback & Metrics Engine (The "Coach")**

The system must generate a **Post-Call Performance Report** based on the following metrics:

| Category | Metric | Description |
| :---- | :---- | :---- |
| **Vocal Delivery** | **Pacing (WPM)** | Identifies if the user talked too fast (nervous) or too slow (monotonous). |
| **Vocal Delivery** | **Filler Word Count** | Tracks "um," "uh," "like," "actually," and "you know." |
| **Vocal Delivery** | **Clarity/Pausing** | Detects the use of "dead air" vs. "strategic silence." |
| **Strategy** | **Objection Recognition** | Did the user correctly identify the type of objection raised? |
| **Strategy** | **Resolution Effectiveness** | Did the user acknowledge, explore, and resolve the concern? |
| **Engagement** | **Talk-to-Listen Ratio** | Percentage of the call where the user was speaking vs. listening. |
| **Confidence** | **Sentiment Analysis** | Analysis of sentence structure and vocal signals to estimate confidence levels. |

## 

## **2.4 Call Recording and Replay**

* **Visual Transcript:** A timestamped transcript with "Key Moments" highlighted (e.g., "Objection raised here").  
* **Audio Playback:** Users can replay the specific audio segments to hear their own tone and delivery.


---

## **3\. Technical Requirements**

## **3.1 Stack Specification**

* **Frontend:** Next.js 15 (App Router), Tailwind CSS, Shadcn/UI.  
* **State Management:** Zustand (for handling simulation states and real-time audio buffers).  
* **AI/Voice:** OpenAI Realtime API (for minimal latency) OR Deepgram (STT) \+ ElevenLabs (TTS) \+ GPT-4o.  
* **Database:** Supabase for Auth, Session History, and Metrics tracking.

## **3.2 Security**

* **Relay Architecture:** All API communication must be handled via a server-side relay to prevent exposure of AI service keys.

---

## **4\. User Flow**

1. **Persona Selection:** User chooses a "Buyer" and reads the scenario brief.  
2. **Simulation:** User enters the "War Room" and engages in the voice call.  
3. **Analysis:** Upon completion, the system processes the transcript and audio metadata.  
4. **Dashboard:** User reviews the **Session Results Page**, seeing their overall score and breakdown of metrics.  
5. **Progress Tracking:** User views the **History** tab to see improvement across their last 10 calls.

---

## **5\. Timeline & Milestones**

* **Week 1:** Scaffolding, Supabase setup, and "Push-to-Talk" UI.  
* **Week 2:** Integration of Voice APIs (STT/TTS/LLM) and Persona logic.  
* **Week 3:** **Development of Scoring Engine.** Implementing logic for filler word detection and pacing analysis.  
* **Week 4:** Session persistence, history dashboard, and final UX polish.


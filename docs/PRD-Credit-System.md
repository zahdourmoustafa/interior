# Product Requirements Document (PRD)
## Credit System & Subscription Management

**Version:** 1.0  
**Date:** July 26, 2025  
**Product Manager:** Senior PM  
**Engineering Lead:** Senior Software Engineer  

---

## 1. Executive Summary

### 1.1 Overview
Implement a comprehensive credit-based system for ArchiCassoAI that provides new users with 6 free credits to experience all platform features, with seamless upgrade paths to paid subscriptions when credits are exhausted.

### 1.2 Business Objectives
- **User Acquisition**: Reduce friction for new users with generous free tier
- **Feature Discovery**: Enable users to explore all features with flexible credit allocation
- **Conversion Optimization**: Strategic credit depletion triggers subscription upgrades
- **Revenue Growth**: Clear path from free trial to paid subscriptions

---

## 2. Problem Statement

### 2.1 Current State
- New users may hesitate to try the platform without understanding value
- No flexible way for users to experience different features
- Missing clear upgrade path when users want to continue using the platform

### 2.2 User Pain Points
- Uncertainty about platform capabilities before committing
- Rigid feature limitations without trial flexibility
- Unclear value proposition for subscription tiers

---

## 3. Solution Overview

### 3.1 Core Components
1. **Credit Allocation System**: 6 credits for new users
2. **Flexible Credit Usage**: Credits work across all features
3. **Real-time Credit Tracking**: Visible credit counter in sidebar
4. **Upgrade Flow**: Seamless transition to subscription when credits depleted
5. **Subscription Integration**: Existing pricing tiers from landing page

### 3.2 User Journey
```
New User Registration → 6 Credits Granted → Feature Exploration → 
Credit Depletion → Upgrade Prompt → Subscription Selection → Unlimited Usage
```

---

## 4. Detailed Requirements

### 4.1 Credit System

#### 4.1.1 Credit Allocation
- **New Users**: Automatically receive 6 credits upon account creation
- **Credit Universality**: 1 credit = 1 generation across any feature
- **Feature Parity**: All features consume credits equally

#### 4.1.2 Supported Features (1 credit each)
- Interior Design Generation
- Exterior Design Generation  
- Sketch to Reality
- Furnish Empty Space
- Remove Object
- Generate Video

#### 4.1.3 Credit Flexibility
- Users can allocate credits freely across features
- Examples:
  - 6 interior generations
  - 4 interior + 1 sketch + 1 video
  - 2 of each feature type
  - Any combination totaling 6 credits

### 4.2 User Interface Requirements

#### 4.2.1 Sidebar Credit Display
- **Default State**: Show "3/6" format (remaining/total)
- **Hover State**: Expanded view showing:
  - "3/6 credits remaining"
  - "Upgrade to Pro" call-to-action
- **Visual Design**: Clean, non-intrusive integration
- **Real-time Updates**: Immediate credit deduction after generation

#### 4.2.2 Credit Depletion Flow
- **Trigger**: When user attempts generation with 0 credits
- **Modal Display**: Professional upgrade prompt
- **Content**: 
  - "You've used all your free credits!"
  - Feature benefits summary
  - Clear subscription options
- **Actions**: 
  - Primary: "Upgrade Now" → Subscription page
  - Secondary: "Maybe Later" → Close modal

### 4.3 Subscription Integration

#### 4.3.1 Pricing Tiers (from landing page)
- **Basic Plan**: $19/month - Limited generations
- **Pro Plan**: $39/month - Unlimited generations  
- **Expert Plan**: $79/month - Unlimited + premium features

#### 4.3.2 Upgrade Experience
- **Seamless Transition**: Direct link to subscription page
- **Context Preservation**: Remember user's preferred features
- **Immediate Access**: Credits become unlimited post-subscription

### 4.4 Technical Requirements

#### 4.4.1 Database Schema
```sql
users table:
- credits_remaining (integer, default: 6)
- credits_total (integer, default: 6)
- subscription_status (enum: free, basic, pro, expert)
- created_at (timestamp)

credit_transactions table:
- user_id (foreign key)
- feature_used (enum: interior, exterior, sketch, furnish, remove, video)
- credits_consumed (integer, default: 1)
- timestamp (datetime)
```

#### 4.4.2 API Endpoints
- `GET /api/user/credits` - Fetch current credit status
- `POST /api/user/credits/consume` - Deduct credit for generation
- `GET /api/user/subscription/status` - Check subscription level
- `POST /api/user/subscription/upgrade` - Handle subscription upgrade

#### 4.4.3 Real-time Updates
- WebSocket connection for live credit updates
- Optimistic UI updates with rollback on failure
- Credit validation before generation processing

---

## 5. User Experience Flow

### 5.1 New User Onboarding
1. **Account Creation** → 6 credits automatically granted
2. **Welcome Message** → "You have 6 free credits to explore all features!"
3. **Feature Tour** → Highlight credit usage across different tools
4. **First Generation** → Success + credit deduction notification

### 5.2 Credit Usage Flow
1. **Feature Selection** → User chooses generation type
2. **Credit Check** → Validate sufficient credits available
3. **Generation Process** → Process request + deduct 1 credit
4. **UI Update** → Real-time credit counter update
5. **Result Display** → Show generation + updated credit status

### 5.3 Credit Depletion Flow
1. **Zero Credits** → User attempts generation
2. **Upgrade Modal** → Professional, compelling upgrade prompt
3. **Subscription Page** → Redirect to pricing/subscription
4. **Payment Process** → Handle subscription signup
5. **Unlimited Access** → Remove credit restrictions

---

## 6. Success Metrics

### 6.1 User Engagement
- **Credit Utilization Rate**: % of users who use all 6 credits
- **Feature Distribution**: Which features consume most credits
- **Time to Credit Depletion**: Average time to use all credits
- **Feature Exploration**: % of users trying multiple features

### 6.2 Conversion Metrics
- **Free-to-Paid Conversion**: % of users upgrading after credit depletion
- **Upgrade Modal CTR**: Click-through rate on upgrade prompts
- **Subscription Completion**: % completing payment after clicking upgrade
- **Revenue per User**: Average revenue from converted users

### 6.3 Technical Performance
- **Credit System Reliability**: 99.9% uptime for credit operations
- **Real-time Update Latency**: <100ms for credit counter updates
- **Generation Success Rate**: >95% successful generations with credit deduction

---

## 7. Implementation Phases

### 7.1 Phase 1: Core Credit System (Week 1-2)
- Database schema implementation
- Basic credit allocation and consumption
- API endpoints for credit management
- Unit tests for credit operations

### 7.2 Phase 2: UI Integration (Week 3)
- Sidebar credit display implementation
- Real-time credit counter updates
- Credit depletion modal design
- Integration with existing generation flows

### 7.3 Phase 3: Subscription Integration (Week 4)
- Upgrade flow implementation
- Subscription page integration
- Payment processing connection
- Credit bypass for paid users

### 7.4 Phase 4: Testing & Optimization (Week 5)
- End-to-end testing
- Performance optimization
- A/B testing for upgrade messaging
- Analytics implementation

---

## 8. Risk Assessment

### 8.1 Technical Risks
- **Credit Synchronization**: Race conditions in concurrent usage
- **Mitigation**: Atomic database operations with proper locking

### 8.2 Business Risks
- **Low Conversion Rate**: Users may not upgrade after free credits
- **Mitigation**: Compelling upgrade messaging and strategic credit allocation

### 8.3 User Experience Risks
- **Frustration with Limitations**: Users upset when credits run out
- **Mitigation**: Clear communication about credit system from onboarding

---

## 9. Future Enhancements

### 9.1 Credit Bonuses
- Referral credits for bringing new users
- Social sharing bonuses
- Daily login rewards

### 9.2 Advanced Analytics
- Predictive modeling for conversion likelihood
- Personalized upgrade timing
- Feature recommendation based on credit usage

### 9.3 Flexible Credit Packages
- Credit top-ups without full subscription
- Feature-specific credit bundles
- Seasonal credit promotions

---

## 10. Conclusion

This credit system provides a strategic balance between user acquisition and revenue generation. By offering generous free credits with flexible usage, we reduce barriers to entry while creating natural upgrade opportunities. The implementation focuses on seamless user experience with clear value communication throughout the journey.

**Next Steps:**
1. Technical architecture review
2. UI/UX design mockups
3. Development sprint planning
4. Stakeholder approval for implementation

---

*This PRD serves as the foundation for implementing a user-friendly, conversion-optimized credit system that aligns with ArchiCassoAI's growth objectives.*

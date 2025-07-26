# Implementation Tasks & Phases
## Credit System & Subscription Management

**Based on:** PRD-Credit-System.md  
**Version:** 1.0  
**Date:** July 26, 2025  
**Engineering Lead:** Senior Software Engineer  

---

## 📋 Overview

This document breaks down the Credit System implementation into actionable tasks across 4 development phases. Each task includes technical specifications, acceptance criteria, and dependencies.

---

## 🚀 Phase 1: Core Credit System (Week 1-2)

### 1.1 Database Schema Implementation

#### Task 1.1.1: Extend User Schema
**Priority:** High | **Estimate:** 4 hours | **Assignee:** Backend Engineer

**Description:** Add credit-related fields to existing users table

**Technical Requirements:**
```sql
ALTER TABLE users ADD COLUMN credits_remaining INTEGER DEFAULT 6;
ALTER TABLE users ADD COLUMN credits_total INTEGER DEFAULT 6;
ALTER TABLE users ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'free';
ALTER TABLE users ADD COLUMN credits_granted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
```

**Acceptance Criteria:**
- [ ] Migration script created and tested
- [ ] Default values properly set for existing users
- [ ] Database indexes added for performance
- [ ] Rollback script prepared

**Dependencies:** None

---

#### Task 1.1.2: Create Credit Transactions Table
**Priority:** High | **Estimate:** 3 hours | **Assignee:** Backend Engineer

**Description:** Create audit trail for credit usage

**Technical Requirements:**
```sql
CREATE TABLE credit_transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  feature_used VARCHAR(20) NOT NULL,
  credits_consumed INTEGER DEFAULT 1,
  generation_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  metadata JSONB
);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
```

**Acceptance Criteria:**
- [ ] Table created with proper constraints
- [ ] Foreign key relationships established
- [ ] Indexes optimized for queries
- [ ] Sample data insertion tested

**Dependencies:** Task 1.1.1

---

### 1.2 Core Credit Management System

#### Task 1.2.1: Credit Service Implementation
**Priority:** High | **Estimate:** 8 hours | **Assignee:** Backend Engineer

**Description:** Core service for credit operations

**Technical Requirements:**
```typescript
// src/lib/services/credit-service.ts
class CreditService {
  async getUserCredits(userId: string): Promise<UserCredits>
  async consumeCredit(userId: string, feature: FeatureType): Promise<boolean>
  async grantCredits(userId: string, amount: number): Promise<void>
  async getCreditHistory(userId: string): Promise<CreditTransaction[]>
  async validateCreditUsage(userId: string): Promise<boolean>
}
```

**Acceptance Criteria:**
- [ ] All methods implemented with proper error handling
- [ ] Atomic operations for credit consumption
- [ ] Race condition protection with database locks
- [ ] Comprehensive unit tests (>90% coverage)
- [ ] Integration tests with database

**Dependencies:** Task 1.1.1, Task 1.1.2

---

#### Task 1.2.2: Credit API Endpoints
**Priority:** High | **Estimate:** 6 hours | **Assignee:** Backend Engineer

**Description:** REST API endpoints for credit management

**Technical Requirements:**
```typescript
// API Routes
GET    /api/user/credits           // Get current credit status
POST   /api/user/credits/consume   // Consume credit for generation
GET    /api/user/credits/history   // Get credit usage history
POST   /api/user/credits/grant     // Admin: Grant credits
```

**API Specifications:**
```typescript
// GET /api/user/credits
Response: {
  remaining: number;
  total: number;
  subscription_status: string;
  last_updated: string;
}

// POST /api/user/credits/consume
Request: {
  feature: 'interior' | 'exterior' | 'sketch' | 'furnish' | 'remove' | 'video';
  generation_id?: string;
}
Response: {
  success: boolean;
  remaining_credits: number;
  message: string;
}
```

**Acceptance Criteria:**
- [ ] All endpoints implemented with proper validation
- [ ] Authentication middleware integrated
- [ ] Rate limiting applied
- [ ] API documentation generated
- [ ] Postman collection created

**Dependencies:** Task 1.2.1

---

#### Task 1.2.3: Credit Middleware Integration
**Priority:** Medium | **Estimate:** 4 hours | **Assignee:** Backend Engineer

**Description:** Middleware to check credits before generation

**Technical Requirements:**
```typescript
// src/middleware/credit-check.ts
export async function creditCheckMiddleware(
  req: NextRequest,
  feature: FeatureType
): Promise<NextResponse | null>
```

**Acceptance Criteria:**
- [ ] Middleware blocks requests when credits insufficient
- [ ] Proper error responses with upgrade prompts
- [ ] Integration with existing generation endpoints
- [ ] Performance optimized (<50ms overhead)

**Dependencies:** Task 1.2.1

---

### 1.3 User Registration Credit Grant

#### Task 1.3.1: Registration Hook Implementation
**Priority:** High | **Estimate:** 3 hours | **Assignee:** Backend Engineer

**Description:** Automatically grant 6 credits on user registration

**Technical Requirements:**
```typescript
// src/lib/auth/registration-hooks.ts
export async function onUserRegistration(user: User): Promise<void> {
  await CreditService.grantCredits(user.id, 6);
  await logCreditGrant(user.id, 'registration', 6);
}
```

**Acceptance Criteria:**
- [ ] Credits granted immediately after successful registration
- [ ] Transaction logged in credit_transactions table
- [ ] Error handling for failed credit grants
- [ ] Integration with Better Auth registration flow

**Dependencies:** Task 1.2.1, Better Auth integration

---

## 🎨 Phase 2: UI Integration (Week 3)

### 2.1 Sidebar Credit Display

#### Task 2.1.1: Credit Counter Component
**Priority:** High | **Estimate:** 6 hours | **Assignee:** Frontend Engineer

**Description:** Create credit display component for sidebar

**Technical Requirements:**
```typescript
// src/components/sidebar/credit-counter.tsx
interface CreditCounterProps {
  isExpanded: boolean;
  credits: {
    remaining: number;
    total: number;
  };
  onUpgradeClick: () => void;
}
```

**Design Specifications:**
- **Collapsed State:** "3/6" format
- **Expanded State:** "3/6 credits remaining" + "Upgrade to Pro" button
- **Real-time Updates:** WebSocket or polling integration
- **Visual Design:** Clean, non-intrusive styling

**Acceptance Criteria:**
- [ ] Component renders correctly in both states
- [ ] Real-time credit updates working
- [ ] Hover interactions smooth and responsive
- [ ] Accessibility compliance (ARIA labels)
- [ ] Mobile responsive design

**Dependencies:** Task 1.2.2

---

#### Task 2.1.2: Credit Context Provider
**Priority:** High | **Estimate:** 4 hours | **Assignee:** Frontend Engineer

**Description:** Global state management for credits

**Technical Requirements:**
```typescript
// src/providers/credit-provider.tsx
interface CreditContextType {
  credits: UserCredits | null;
  loading: boolean;
  error: string | null;
  consumeCredit: (feature: FeatureType) => Promise<boolean>;
  refreshCredits: () => Promise<void>;
}
```

**Acceptance Criteria:**
- [ ] Context provides credit data globally
- [ ] Optimistic updates with rollback on failure
- [ ] Error handling and retry logic
- [ ] Integration with auth context

**Dependencies:** Task 1.2.2

---

#### Task 2.1.3: Sidebar Integration
**Priority:** Medium | **Estimate:** 3 hours | **Assignee:** Frontend Engineer

**Description:** Integrate credit counter into existing sidebar

**Technical Requirements:**
- Add credit counter above user profile section
- Maintain existing sidebar animations and responsiveness
- Ensure proper spacing and alignment

**Acceptance Criteria:**
- [ ] Credit counter positioned correctly
- [ ] No layout shifts or visual regressions
- [ ] Animations work smoothly
- [ ] Mobile sidebar includes credit display

**Dependencies:** Task 2.1.1, Task 2.1.2

---

### 2.2 Credit Depletion Modal

#### Task 2.2.1: Upgrade Modal Component
**Priority:** High | **Estimate:** 8 hours | **Assignee:** Frontend Engineer

**Description:** Professional upgrade prompt when credits depleted

**Technical Requirements:**
```typescript
// src/components/modals/upgrade-modal.tsx
interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
  feature?: FeatureType;
}
```

**Design Specifications:**
- **Header:** "You've used all your free credits!"
- **Content:** Feature benefits summary
- **Actions:** "Upgrade Now" (primary), "Maybe Later" (secondary)
- **Visual:** Professional, compelling design

**Acceptance Criteria:**
- [ ] Modal displays on credit depletion
- [ ] Compelling copy and visual design
- [ ] Proper modal accessibility
- [ ] Mobile-responsive layout
- [ ] Analytics tracking integrated

**Dependencies:** Task 2.1.2

---

#### Task 2.2.2: Generation Flow Integration
**Priority:** High | **Estimate:** 6 hours | **Assignee:** Frontend Engineer

**Description:** Integrate credit checks into all generation flows

**Technical Requirements:**
- Check credits before starting generation
- Show upgrade modal when credits insufficient
- Handle credit consumption after successful generation

**Files to Modify:**
- `/src/app/dashboard/redecorate-room/page.tsx`
- `/src/app/dashboard/redesign-exterior/page.tsx`
- `/src/app/dashboard/sketch-to-reality/page.tsx`
- `/src/app/dashboard/furnish-empty-space/page.tsx`
- `/src/app/dashboard/remove-object/page.tsx`
- `/src/app/dashboard/generate-videos/page.tsx`

**Acceptance Criteria:**
- [ ] All generation features check credits first
- [ ] Upgrade modal triggers correctly
- [ ] Credits consumed after successful generation
- [ ] Error handling for failed credit consumption
- [ ] Consistent UX across all features

**Dependencies:** Task 2.2.1, Task 2.1.2

---

### 2.3 Real-time Updates

#### Task 2.3.1: WebSocket Credit Updates
**Priority:** Medium | **Estimate:** 5 hours | **Assignee:** Full-stack Engineer

**Description:** Real-time credit counter updates

**Technical Requirements:**
```typescript
// src/lib/websocket/credit-updates.ts
interface CreditUpdateMessage {
  type: 'CREDIT_CONSUMED' | 'CREDIT_GRANTED';
  user_id: string;
  remaining_credits: number;
  feature?: FeatureType;
}
```

**Acceptance Criteria:**
- [ ] WebSocket connection established
- [ ] Credit updates broadcast in real-time
- [ ] Fallback to polling if WebSocket fails
- [ ] Connection management and reconnection

**Dependencies:** Task 2.1.2

---

## 💳 Phase 3: Subscription Integration (Week 4)

### 3.1 Subscription Status Management

#### Task 3.1.1: Subscription Service Integration
**Priority:** High | **Estimate:** 6 hours | **Assignee:** Backend Engineer

**Description:** Integrate with existing Creem.io subscription system

**Technical Requirements:**
```typescript
// src/lib/services/subscription-service.ts
class SubscriptionService {
  async getSubscriptionStatus(userId: string): Promise<SubscriptionStatus>
  async upgradeSubscription(userId: string, plan: PlanType): Promise<boolean>
  async cancelSubscription(userId: string): Promise<boolean>
  async handleWebhook(event: CreemWebhookEvent): Promise<void>
}
```

**Acceptance Criteria:**
- [ ] Integration with existing Creem.io setup
- [ ] Subscription status properly tracked
- [ ] Webhook handling for status changes
- [ ] Credit bypass for paid subscribers

**Dependencies:** Existing Creem.io integration

---

#### Task 3.1.2: Credit Bypass Logic
**Priority:** High | **Estimate:** 4 hours | **Assignee:** Backend Engineer

**Description:** Bypass credit checks for paid subscribers

**Technical Requirements:**
- Modify credit middleware to check subscription status
- Allow unlimited generations for paid users
- Maintain credit tracking for analytics

**Acceptance Criteria:**
- [ ] Paid users bypass credit restrictions
- [ ] Free users still subject to credit limits
- [ ] Analytics continue tracking usage
- [ ] Proper error handling

**Dependencies:** Task 3.1.1, Task 1.2.3

---

### 3.2 Upgrade Flow Implementation

#### Task 3.2.1: Subscription Page Integration
**Priority:** High | **Estimate:** 5 hours | **Assignee:** Frontend Engineer

**Description:** Connect upgrade flow to subscription page

**Technical Requirements:**
- Create subscription page route if not exists
- Implement upgrade button functionality
- Handle post-subscription redirect

**Acceptance Criteria:**
- [ ] Upgrade button redirects to subscription page
- [ ] Context preserved (which feature triggered upgrade)
- [ ] Post-payment redirect back to original feature
- [ ] Success messaging after subscription

**Dependencies:** Task 2.2.1, existing subscription page

---

#### Task 3.2.2: Post-Subscription Experience
**Priority:** Medium | **Estimate:** 4 hours | **Assignee:** Frontend Engineer

**Description:** Handle user experience after subscription

**Technical Requirements:**
- Remove credit restrictions from UI
- Update sidebar to show unlimited status
- Success messaging and onboarding

**Acceptance Criteria:**
- [ ] Credit counter hidden for paid users
- [ ] "Unlimited" status displayed
- [ ] Smooth transition from free to paid
- [ ] Welcome message for new subscribers

**Dependencies:** Task 3.1.2, Task 2.1.1

---

## 🧪 Phase 4: Testing & Optimization (Week 5)

### 4.1 End-to-End Testing

#### Task 4.1.1: Credit System E2E Tests
**Priority:** High | **Estimate:** 8 hours | **Assignee:** QA Engineer + Frontend Engineer

**Description:** Comprehensive testing of credit system

**Test Scenarios:**
```typescript
// tests/e2e/credit-system.spec.ts
describe('Credit System E2E', () => {
  test('New user receives 6 credits')
  test('Credit consumption across all features')
  test('Upgrade modal triggers at 0 credits')
  test('Subscription upgrade removes restrictions')
  test('Real-time credit updates')
  test('Error handling and edge cases')
})
```

**Acceptance Criteria:**
- [ ] All user flows tested end-to-end
- [ ] Cross-browser compatibility verified
- [ ] Mobile responsiveness tested
- [ ] Performance benchmarks met
- [ ] Accessibility compliance verified

**Dependencies:** All previous tasks

---

#### Task 4.1.2: Load Testing
**Priority:** Medium | **Estimate:** 4 hours | **Assignee:** DevOps Engineer

**Description:** Performance testing under load

**Technical Requirements:**
- Test credit consumption under concurrent load
- Database performance with credit operations
- API response times under stress

**Acceptance Criteria:**
- [ ] System handles 1000+ concurrent users
- [ ] Credit operations complete <100ms
- [ ] No race conditions under load
- [ ] Database performance optimized

**Dependencies:** Task 4.1.1

---

### 4.2 Analytics Implementation

#### Task 4.2.1: Credit Analytics Tracking
**Priority:** Medium | **Estimate:** 6 hours | **Assignee:** Full-stack Engineer

**Description:** Implement analytics for credit system metrics

**Technical Requirements:**
```typescript
// src/lib/analytics/credit-events.ts
interface CreditAnalyticsEvent {
  event_type: 'credit_consumed' | 'credit_depleted' | 'upgrade_modal_shown' | 'subscription_upgraded';
  user_id: string;
  feature?: FeatureType;
  credits_remaining?: number;
  timestamp: Date;
}
```

**Metrics to Track:**
- Credit utilization rate
- Feature distribution
- Time to credit depletion
- Conversion rates
- Upgrade modal interactions

**Acceptance Criteria:**
- [ ] All key events tracked
- [ ] Analytics dashboard created
- [ ] Real-time metrics available
- [ ] Privacy compliance maintained

**Dependencies:** Task 4.1.1

---

### 4.3 Performance Optimization

#### Task 4.3.1: Database Optimization
**Priority:** Medium | **Estimate:** 4 hours | **Assignee:** Backend Engineer

**Description:** Optimize database queries and indexes

**Technical Requirements:**
- Analyze slow queries
- Add missing indexes
- Optimize credit check queries
- Implement query caching

**Acceptance Criteria:**
- [ ] All queries execute <50ms
- [ ] Proper indexes on all foreign keys
- [ ] Query caching implemented
- [ ] Database monitoring setup

**Dependencies:** Task 4.1.2

---

#### Task 4.3.2: Frontend Performance
**Priority:** Medium | **Estimate:** 3 hours | **Assignee:** Frontend Engineer

**Description:** Optimize frontend credit system performance

**Technical Requirements:**
- Implement credit data caching
- Optimize re-renders
- Lazy load upgrade modal
- Bundle size optimization

**Acceptance Criteria:**
- [ ] Credit counter updates <100ms
- [ ] No unnecessary re-renders
- [ ] Bundle size impact <10KB
- [ ] Lighthouse scores maintained

**Dependencies:** Task 4.1.1

---

## 📊 Success Criteria & Definition of Done

### Overall Success Criteria
- [ ] New users automatically receive 6 credits
- [ ] Credits work across all 6 features
- [ ] Sidebar displays credit counter correctly
- [ ] Upgrade modal triggers when credits depleted
- [ ] Subscription integration works seamlessly
- [ ] Real-time updates function properly
- [ ] Performance benchmarks met
- [ ] All tests passing (unit, integration, E2E)
- [ ] Analytics tracking implemented
- [ ] Documentation updated

### Performance Benchmarks
- Credit check operations: <50ms
- Real-time updates: <100ms
- Database queries: <50ms
- Page load impact: <200ms
- API response times: <200ms

### Quality Gates
- Unit test coverage: >90%
- Integration test coverage: >80%
- E2E test coverage: 100% of user flows
- Accessibility: WCAG 2.1 AA compliance
- Security: No vulnerabilities in credit system
- Performance: Lighthouse score >90

---

## 🔄 Dependencies & Risks

### External Dependencies
- Better Auth system integration
- Creem.io subscription system
- Existing database schema
- Current UI component library

### Technical Risks & Mitigations
1. **Race Conditions in Credit Consumption**
   - Risk: Multiple simultaneous requests consuming credits
   - Mitigation: Database locks and atomic operations

2. **Real-time Update Performance**
   - Risk: WebSocket connections impacting performance
   - Mitigation: Fallback to polling, connection pooling

3. **Subscription Integration Complexity**
   - Risk: Complex integration with existing payment system
   - Mitigation: Thorough testing, gradual rollout

### Timeline Risks
- Phase 1-2 are critical path
- Phase 3 depends on existing subscription system
- Phase 4 can run parallel with Phase 3

---

## 🚀 Deployment Strategy

### Rollout Plan
1. **Phase 1**: Backend deployment with feature flags
2. **Phase 2**: Frontend deployment to staging
3. **Phase 3**: Gradual rollout to 10% of users
4. **Phase 4**: Full rollout after monitoring

### Monitoring & Alerts
- Credit system uptime monitoring
- Database performance alerts
- Conversion rate tracking
- Error rate monitoring

---

*This implementation plan provides a comprehensive roadmap for delivering the credit system feature with high quality and minimal risk.*

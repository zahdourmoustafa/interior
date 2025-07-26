# Complete Phase 2 Integration Guide

## 🎯 **Integration Status**

### ✅ **Completed:**
1. **Interior Design** (`/dashboard/redecorate-room`) - INTEGRATED ✅

### 🔄 **To Be Integrated:**
2. **Exterior Design** (`/dashboard/redesign-exterior`)
3. **Sketch to Reality** (`/dashboard/sketch-to-reality`)
4. **Furnish Empty Space** (`/dashboard/furnish-empty-space`)
5. **Remove Object** (`/dashboard/remove-object`)
6. **Generate Video** (`/dashboard/generate-videos`)

## 📋 **Integration Instructions**

For each remaining feature, follow these steps:

### **Step 1: Add Import**
Add this import to the top of each page:
```typescript
import { useCreditCheck } from '@/hooks/use-credit-check';
```

### **Step 2: Add Credit Hook**
Add this after your state declarations:
```typescript
// Credit system integration
const { checkAndConsumeCredit, UpgradeModalComponent } = useCreditCheck({
  feature: 'FEATURE_NAME', // exterior, sketch, furnish, remove, video
  onSuccess: () => {
    console.log('✅ Credit consumed successfully for FEATURE_NAME');
  },
  onError: (error) => {
    console.error('❌ Credit error:', error);
    setIsGenerating(false);
    // Add any other cleanup needed for this specific feature
  }
});
```

### **Step 3: Update Generation Handler**
Find the `handleGenerate` function and add credit check:
```typescript
const handleGenerate = async () => {
  // Your existing validation...
  
  // Set loading state
  setIsGenerating(true);
  
  // Generate unique ID
  const generationId = `FEATURE_NAME_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Check and consume credit
  const hasCredits = await checkAndConsumeCredit(generationId, {
    // Add relevant metadata
  });

  if (!hasCredits) {
    return; // Credit check failed
  }

  // Your existing generation logic...
};
```

### **Step 4: Add Modal Component**
Add this before the closing tag of your return statement:
```typescript
{/* Credit System Modal */}
<UpgradeModalComponent />
```

## 🎯 **Feature-Specific Details**

### **2. Exterior Design**
- **Feature:** `'exterior'`
- **File:** `/src/app/dashboard/redesign-exterior/page.tsx`
- **Metadata:** `{ designStyle: selectedStyle, imageUrl: selectedImage }`

### **3. Sketch to Reality**
- **Feature:** `'sketch'`
- **File:** `/src/app/dashboard/sketch-to-reality/page.tsx`
- **Metadata:** `{ designStyle: selectedStyle, sketchUrl: selectedImage }`

### **4. Furnish Empty Space**
- **Feature:** `'furnish'`
- **File:** `/src/app/dashboard/furnish-empty-space/page.tsx`
- **Metadata:** `{ roomType: selectedRoomType, furnishingStyle: selectedStyle, imageUrl: selectedImage }`

### **5. Remove Object**
- **Feature:** `'remove'`
- **File:** `/src/app/dashboard/remove-object/page.tsx`
- **Metadata:** `{ imageUrl: selectedImage, objectsToRemove: selectedObjects }`

### **6. Generate Video**
- **Feature:** `'video'`
- **File:** `/src/app/dashboard/generate-videos/page.tsx`
- **Metadata:** `{ imageUrl: selectedImage, videoEffect: selectedEffect }`

## 🧪 **Testing Checklist**

After integrating each feature:

1. **Test with Credits:**
   - [ ] Generation works normally
   - [ ] Credit counter decreases
   - [ ] Success toast appears

2. **Test without Credits:**
   - [ ] Upgrade modal appears
   - [ ] Generation is blocked
   - [ ] Loading state is cleared

3. **Test Modal:**
   - [ ] Modal shows correct plan options
   - [ ] "Upgrade Now" redirects to checkout
   - [ ] "Maybe Later" closes modal

4. **Test Error Handling:**
   - [ ] Network errors handled gracefully
   - [ ] Loading states reset properly
   - [ ] User feedback is clear

## 🚀 **Quick Integration Commands**

You can integrate all features quickly by:

1. **Copy the pattern** from interior design
2. **Change the feature name** in the hook
3. **Update the metadata** for tracking
4. **Add the modal component**
5. **Test the integration**

## 📊 **Expected Results**

After complete integration:

- ✅ All 6 features check credits before generation
- ✅ Users see upgrade modal when credits depleted
- ✅ Credit counter updates in real-time
- ✅ Smooth user experience across all features
- ✅ Proper error handling and feedback
- ✅ Analytics tracking for all generations

## 🎉 **Phase 2 Completion**

Once all features are integrated:

1. **Test end-to-end user journey**
2. **Verify credit system works across all features**
3. **Check upgrade flow works properly**
4. **Confirm UI/UX is consistent**
5. **Move to Phase 3: Subscription Integration**

---

**Current Status: 1/6 features integrated (17%)**  
**Target: 6/6 features integrated (100%)**  
**Estimated time per feature: 10-15 minutes**  
**Total remaining time: ~1 hour**

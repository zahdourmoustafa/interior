# Credit System Integration Template

This template shows how to integrate the credit system into any generation feature.

## 📋 **Integration Steps**

### **Step 1: Import Required Hooks**
```typescript
import { useCreditCheck } from '@/hooks/use-credit-check';
```

### **Step 2: Add Credit Hook to Component**
```typescript
// Add this inside your component, after state declarations
const { checkAndConsumeCredit, UpgradeModalComponent } = useCreditCheck({
  feature: 'FEATURE_NAME', // Replace with: 'interior', 'exterior', 'sketch', 'furnish', 'remove', 'video'
  onSuccess: () => {
    console.log('✅ Credit consumed successfully for FEATURE_NAME');
  },
  onError: (error) => {
    console.error('❌ Credit error:', error);
    // Reset any loading states here
    setIsGenerating(false);
    // Add any other cleanup needed
  }
});
```

### **Step 3: Update Generation Handler**
```typescript
const handleGenerate = async () => {
  // Your existing validation logic here...
  if (!someRequiredField) {
    toast.error('Please fill required fields');
    return;
  }

  // Set loading state
  setIsGenerating(true);
  
  // Generate unique ID for this generation
  const generationId = `FEATURE_NAME_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  // Check and consume credit before proceeding
  const hasCredits = await checkAndConsumeCredit(generationId, {
    // Add relevant metadata for tracking
    param1: value1,
    param2: value2,
    // ... other generation parameters
  });

  if (!hasCredits) {
    // Credit check failed, loading state already cleared by onError callback
    return;
  }

  // Credit consumed successfully, proceed with generation
  toast.loading('🎨 Generating... This may take 30-60 seconds');
  
  console.log('🎨 Starting generation with:', {
    generationId,
    // ... your generation parameters
  });

  // Your existing generation logic here...
  generateMutation.mutate({
    // ... your mutation parameters
  });
};
```

### **Step 4: Add Modal Component to JSX**
```typescript
return (
  <YourExistingLayout>
    {/* Your existing components */}
    
    {/* Credit System Modal - Add this before closing tag */}
    <UpgradeModalComponent />
  </YourExistingLayout>
);
```

## 🎯 **Feature-Specific Configurations**

### **Interior Design** ✅ COMPLETED
```typescript
feature: 'interior'
metadata: { roomType, designStyle, imageUrl, slot }
```

### **Exterior Design**
```typescript
feature: 'exterior'
metadata: { designStyle, imageUrl, buildingType }
```

### **Sketch to Reality**
```typescript
feature: 'sketch'
metadata: { designStyle, sketchUrl, targetStyle }
```

### **Furnish Empty Space**
```typescript
feature: 'furnish'
metadata: { roomType, furnishingStyle, imageUrl }
```

### **Remove Object**
```typescript
feature: 'remove'
metadata: { imageUrl, objectsToRemove, maskData }
```

### **Generate Video**
```typescript
feature: 'video'
metadata: { imageUrl, videoEffect, duration }
```

## 🔧 **Complete Example Implementation**

Here's a complete example for any generation feature:

```typescript
'use client';

import { useState } from 'react';
import { useCreditCheck } from '@/hooks/use-credit-check';
import toast from 'react-hot-toast';

export default function YourGenerationPage() {
  const [isGenerating, setIsGenerating] = useState(false);
  // ... other state

  // Credit system integration
  const { checkAndConsumeCredit, UpgradeModalComponent } = useCreditCheck({
    feature: 'YOUR_FEATURE_NAME',
    onSuccess: () => {
      console.log('✅ Credit consumed successfully');
    },
    onError: (error) => {
      console.error('❌ Credit error:', error);
      setIsGenerating(false);
    }
  });

  const handleGenerate = async () => {
    // Validation
    if (!requiredField) {
      toast.error('Please complete all required fields');
      return;
    }

    // Set loading
    setIsGenerating(true);
    
    // Generate ID
    const generationId = `feature_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Check credits
    const hasCredits = await checkAndConsumeCredit(generationId, {
      // Your metadata
    });

    if (!hasCredits) return;

    // Proceed with generation
    toast.loading('🎨 Generating...');
    
    // Your generation logic
    try {
      const result = await generateSomething();
      toast.success('✅ Generation completed!');
    } catch (error) {
      toast.error('❌ Generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      {/* Your UI */}
      <button onClick={handleGenerate} disabled={isGenerating}>
        {isGenerating ? 'Generating...' : 'Generate'}
      </button>
      
      {/* Credit Modal */}
      <UpgradeModalComponent />
    </div>
  );
}
```

## ✅ **Integration Checklist**

For each feature, ensure:

- [ ] Import `useCreditCheck` hook
- [ ] Add credit hook with correct feature name
- [ ] Update generation handler to check credits first
- [ ] Add unique generation ID
- [ ] Include relevant metadata
- [ ] Add `<UpgradeModalComponent />` to JSX
- [ ] Test credit consumption
- [ ] Test upgrade modal appearance
- [ ] Verify loading states work correctly

## 🧪 **Testing Each Integration**

1. **Test with Credits**: Verify generation works normally
2. **Test without Credits**: Verify upgrade modal appears
3. **Test Modal**: Verify modal redirects to checkout
4. **Test Loading States**: Verify UI updates correctly
5. **Test Error Handling**: Verify graceful error handling

## 📊 **Metadata Tracking**

Each feature should track relevant metadata for analytics:

- **Generation ID**: Unique identifier
- **Feature Parameters**: Style, type, settings used
- **User Context**: What led to this generation
- **Performance Data**: Generation time, success/failure

This data helps with:
- Usage analytics
- Feature optimization
- User behavior insights
- Credit system improvements

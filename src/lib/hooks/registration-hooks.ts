import { CreditService } from '../services/credit-service';
import { User } from '../db/schema';

/**
 * Hook called after successful user registration
 * Automatically grants initial credits to new users
 */
export async function onUserRegistration(user: User): Promise<void> {
  try {
    console.log(`Initializing credits for new user: ${user.id}`);
    
    // Initialize credits for the new user
    await CreditService.initializeUserCredits(user.id);
    
    console.log(`Successfully granted 6 credits to user: ${user.id}`);
  } catch (error) {
    console.error('Error in registration hook:', error);
    // Don't throw error to prevent registration failure
    // Credits can be manually granted later if needed
  }
}

/**
 * Hook to handle user login
 * Can be used for analytics or credit system updates
 */
export async function onUserLogin(user: User): Promise<void> {
  try {
    // Could be used for daily login bonuses, analytics, etc.
    console.log(`User logged in: ${user.id}`);
  } catch (error) {
    console.error('Error in login hook:', error);
  }
}

/**
 * Hook to handle subscription changes
 * Updates user's credit system status
 */
export async function onSubscriptionChange(
  userId: string, 
  newStatus: 'free' | 'basic' | 'pro' | 'expert'
): Promise<void> {
  try {
    console.log(`Updating subscription status for user ${userId} to ${newStatus}`);
    
    await CreditService.updateSubscriptionStatus(userId, newStatus);
    
    console.log(`Successfully updated subscription status for user: ${userId}`);
  } catch (error) {
    console.error('Error updating subscription status:', error);
    throw error; // This should fail the subscription update
  }
}

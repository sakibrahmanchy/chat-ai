import { supabase } from '@/lib/supabase/client';

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  imageUrl?: string;
  metadata?: Record<string, string | number | boolean | Date>;
  createdAt?: string;
  updatedAt?: string;
  preferences?: {
    theme?: string;
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
  };
}

export class UserService {
  async createOrUpdateUser(userData: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    imageUrl?: string;
    metadata?: Record<string, string | number | boolean | Date>;
  }): Promise<User> {
    try {
      // Insert or update user
      const { data: user, error: userError } = await supabase
        .from('users')
        .upsert({
          id: userData.id,
          email: userData.email,
          first_name: userData.firstName,
          last_name: userData.lastName,
          image_url: userData.imageUrl,
          metadata: userData.metadata
        })
        .select()
        .single();

      if (userError) throw userError;

      // Create or update preferences
      const { error: prefError } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: userData.id
        });

      if (prefError) throw prefError;

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        metadata: user.metadata,
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Error in createOrUpdateUser:', error);
      throw error;
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const { data: user, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          user_preferences (
            theme,
            notifications_enabled,
            email_notifications
          )
        `)
        .eq('id', id)
        .single();

      if (userError) throw userError;
      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        imageUrl: user.image_url,
        metadata: user.metadata,
        preferences: {
          theme: user.user_preferences?.theme,
          notificationsEnabled: user.user_preferences?.notifications_enabled,
          emailNotifications: user.user_preferences?.email_notifications
        },
        createdAt: user.created_at,
        updatedAt: user.updated_at
      };
    } catch (error) {
      console.error('Error in getUserById:', error);
      throw error;
    }
  }

  async updateUserMetadata(userId: string, metadata: Record<string, string | number | boolean | Date>): Promise<void> {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          metadata: metadata
        })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in updateUserMetadata:', error);
      throw error;
    }
  }

  async updateUserPreferences(userId: string, preferences: {
    theme?: string;
    notificationsEnabled?: boolean;
    emailNotifications?: boolean;
  }): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .update({
          theme: preferences.theme,
          notifications_enabled: preferences.notificationsEnabled,
          email_notifications: preferences.emailNotifications
        })
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error in updateUserPreferences:', error);
      throw error;
    }
  }
}

export const userService = new UserService(); 